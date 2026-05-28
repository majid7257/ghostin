import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { niche?: string; offer?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { niche, offer } = body;
  if (!niche?.trim() || !offer?.trim()) {
    return NextResponse.json({ error: 'niche and offer are required' }, { status: 400 });
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `You are a conversion copywriter specialising in LinkedIn lead magnets.

Create a landing page for the following:
Niche: ${niche}
Free Offer: ${offer}

Return a JSON object with exactly these keys:
{
  "title": "compelling headline (max 10 words)",
  "subtitle": "one-sentence hook that explains the transformation (max 20 words)",
  "bullets": ["what they'll get/learn — 5 concise bullet points"],
  "cta": "action-oriented CTA button text (max 6 words)",
  "about": "one sentence about the creator's authority"
}

Return ONLY the JSON. No markdown, no preamble.`,
      }],
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : '{}';
    let parsed: { title: string; subtitle: string; bullets: string[]; cta: string; about: string };
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'AI returned invalid JSON. Please try again.' }, { status: 500 });
    }

    const baseSlug = slugify(parsed.title || offer);
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const { data: leadMagnet } = await supabase
      .from('lead_magnets')
      .insert({
        user_id: user.id,
        niche: niche.trim(),
        offer: offer.trim(),
        title: parsed.title,
        content: { subtitle: parsed.subtitle, bullets: parsed.bullets, cta: parsed.cta, about: parsed.about },
        slug,
        published: true,
      })
      .select()
      .single();

    return NextResponse.json({ leadMagnet });
  } catch (err: any) {
    console.error('[lead-magnet/generate]', err);
    return NextResponse.json({ error: 'Failed to generate lead magnet. Please try again.' }, { status: 500 });
  }
}
