import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CheckCircle, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase
    .from('lead_magnets')
    .select('title')
    .eq('slug', params.slug)
    .eq('published', true)
    .maybeSingle();
  return { title: data?.title ?? 'Free Resource' };
}

export default async function LeadMagnetPublicPage({ params }: Props) {
  const supabase = createClient();
  const { data: lm } = await supabase
    .from('lead_magnets')
    .select('title, niche, content')
    .eq('slug', params.slug)
    .eq('published', true)
    .maybeSingle();

  if (!lm) notFound();

  const content = lm.content as {
    subtitle: string;
    bullets: string[];
    cta: string;
    about: string;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        {/* Badge */}
        <div className="mb-6 flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 px-4 py-1.5 text-sm font-medium text-blue-300">
            Free Resource for {lm.niche}
          </span>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm p-8 sm:p-10 shadow-2xl">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-3">
            {lm.title}
          </h1>
          <p className="text-blue-200 text-base mb-8 leading-relaxed">{content.subtitle}</p>

          <div className="mb-8 space-y-3">
            {content.bullets.map((b: string, i: number) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
                <span className="text-slate-200 text-sm">{b}</span>
              </div>
            ))}
          </div>

          {/* CTA form */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="space-y-3"
          >
            <input
              type="text"
              placeholder="Your first name"
              required
              className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all"
            />
            <input
              type="email"
              placeholder="Your email address"
              required
              className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-semibold py-3.5 text-sm transition-all shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2"
            >
              {content.cta} <ArrowRight className="h-4 w-4" />
            </button>
            <p className="text-xs text-slate-500 text-center">No spam. Unsubscribe anytime.</p>
          </form>
        </div>

        {/* About */}
        {content.about && (
          <p className="mt-6 text-center text-sm text-slate-500">{content.about}</p>
        )}

        <p className="mt-4 text-center text-xs text-slate-600">
          Built with{' '}
          <a href="/" className="text-blue-500 hover:underline">GhostIn</a>
        </p>
      </div>
    </div>
  );
}
