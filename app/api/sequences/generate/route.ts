import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { checkSequenceLimit, incrementSequenceUsage } from '@/lib/plan-limits';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .maybeSingle();

  const plan = (profile?.plan ?? 'free') as 'free' | 'pro' | 'agency';
  const limitCheck = await checkSequenceLimit(supabase, user.id, plan);

  if (!limitCheck.allowed) {
    return NextResponse.json(
      { error: `Monthly sequence limit reached (${limitCheck.used}/${limitCheck.limit}). Upgrade your plan.` },
      { status: 429 }
    );
  }

  let body: { name?: string; triggerType?: string; context?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, triggerType, context } = body;
  if (!name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  const triggerDesc: Record<string, string> = {
    commenter:   'someone who commented on one of your LinkedIn posts',
    liker:       'someone who liked one of your LinkedIn posts',
    connection:  'a new LinkedIn connection',
    profile:     'someone who visited your LinkedIn profile',
  };
  const triggerText = triggerDesc[triggerType ?? 'commenter'] ?? 'a LinkedIn lead';

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `You are an expert in LinkedIn DM copywriting and sales sequencing.

Create a 4-message DM follow-up sequence for ${triggerText}.
${context ? `Context about the sender: ${context}` : ''}

Rules for each message:
- Conversational, warm, not salesy
- Reference the trigger naturally
- Build rapport before pitching
- Message 1 (day 0): Warm intro / genuine compliment
- Message 2 (day 2): Value-add — share a quick tip or insight
- Message 3 (day 5): Soft ask — invite to a free resource or conversation
- Message 4 (day 9): Final follow-up / close

Return a JSON array with exactly this structure:
[
  { "day": 0, "message": "..." },
  { "day": 2, "message": "..." },
  { "day": 5, "message": "..." },
  { "day": 9, "message": "..." }
]

Return ONLY the JSON array. No markdown, no preamble.`,
      }],
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : '[]';
    let messages: { day: number; message: string }[];
    try {
      messages = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'AI returned invalid JSON. Please try again.' }, { status: 500 });
    }

    const { data: sequence } = await supabase
      .from('sequences')
      .insert({
        user_id: user.id,
        name: name.trim(),
        trigger_type: triggerType ?? 'commenter',
        messages,
        is_active: true,
      })
      .select()
      .single();

    await incrementSequenceUsage(supabase, user.id);
    return NextResponse.json({ sequence });
  } catch (err: any) {
    console.error('[sequences/generate]', err);
    return NextResponse.json({ error: 'Failed to generate sequence. Please try again.' }, { status: 500 });
  }
}
