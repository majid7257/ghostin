import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { checkPostLimit, incrementPostUsage } from '@/lib/plan-limits';

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
  const limitCheck = await checkPostLimit(supabase, user.id, plan);

  if (!limitCheck.allowed) {
    return NextResponse.json(
      { error: `Monthly post limit reached (${limitCheck.used}/${limitCheck.limit}). Upgrade your plan to generate more.` },
      { status: 429 }
    );
  }

  let body: { topic?: string; tone?: string; additionalContext?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { topic, tone, additionalContext } = body;
  if (!topic?.trim() || !tone?.trim()) {
    return NextResponse.json({ error: 'topic and tone are required' }, { status: 400 });
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `You are an expert LinkedIn ghostwriter who creates viral, high-engagement posts.

Write a LinkedIn post about: ${topic}
Tone: ${tone}
${additionalContext ? `Additional context/story: ${additionalContext}` : ''}

Rules:
- First line must be a scroll-stopping hook (bold claim, surprising stat, or strong opinion)
- Short paragraphs — maximum 2 sentences each
- Add one key insight or actionable takeaway
- End with an engaging question or soft CTA
- 150–280 words
- Strategic whitespace — blank lines between paragraphs
- 1–2 relevant emojis max
- No hashtags

Output ONLY the post content. No preamble, no explanation.`,
      }],
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : '';

    const { data: post } = await supabase
      .from('posts')
      .insert({ user_id: user.id, topic: topic.trim(), tone: tone.trim(), content })
      .select()
      .single();

    await incrementPostUsage(supabase, user.id);
    return NextResponse.json({ post });
  } catch (err: any) {
    console.error('[posts/generate]', err);
    return NextResponse.json({ error: 'Failed to generate post. Please try again.' }, { status: 500 });
  }
}
