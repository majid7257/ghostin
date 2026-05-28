import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles, Target, MessageSquare, LayoutDashboard,
  CheckCircle, ArrowRight, Zap, Users, TrendingUp, Star,
} from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI Post Generator',
    description: 'Turn any topic or idea into a scroll-stopping LinkedIn post in seconds. Choose your tone — thought leader, storyteller, provocateur — and watch the engagement roll in.',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    icon: Target,
    title: 'Lead Magnet Builder',
    description: 'Create hosted landing pages for your freebies, guides, and templates instantly. Your niche + your offer = a conversion-ready page with its own shareable link.',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
  },
  {
    icon: MessageSquare,
    title: 'DM Follow-up Sequences',
    description: 'Convert post commenters into booked calls automatically. Build personalised multi-step DM sequences that nurture leads while you sleep.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
  },
  {
    icon: LayoutDashboard,
    title: 'Multi-Account Manager',
    description: 'Manage multiple LinkedIn profiles from one dashboard. Perfect for agencies running ghostwriting for several clients at once.',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
];

const stats = [
  { value: '50K+', label: 'Posts Generated' },
  { value: '12K+', label: 'Leads Captured' },
  { value: '3.2K+', label: 'Calls Booked' },
  { value: '98%', label: 'Satisfaction Rate' },
];

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '',
    description: 'Try GhostIn risk-free',
    features: ['10 posts / month', '5 DM sequences / month', '1 LinkedIn account', 'AI post generator', 'Lead magnet builder'],
    cta: 'Get Started Free',
    href: '/signup',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/mo',
    description: 'For serious solopreneurs',
    features: ['100 posts / month', '50 DM sequences / month', '3 LinkedIn accounts', 'Everything in Free', 'Priority AI generation', 'Advanced analytics'],
    cta: 'Start Pro Trial',
    href: '/signup?plan=pro',
    highlight: true,
  },
  {
    name: 'Agency',
    price: '$149',
    period: '/mo',
    description: 'For ghostwriting agencies',
    features: ['200 posts / month', '100 DM sequences / month', '5 LinkedIn accounts', 'Everything in Pro', 'White-label ready', 'Dedicated support'],
    cta: 'Start Agency Trial',
    href: '/signup?plan=agency',
    highlight: false,
  },
];

const testimonials = [
  {
    quote: 'GhostIn 10x\'d my LinkedIn output. I went from posting once a week to every day — and my inbound leads tripled in 30 days.',
    name: 'Sarah K.',
    role: 'B2B SaaS Founder',
    avatar: 'SK',
  },
  {
    quote: 'The DM sequences are insane. I set up a commenter flow once and it books 3-5 calls a week on autopilot. Game changer.',
    name: 'Marcus T.',
    role: 'Executive Coach',
    avatar: 'MT',
  },
  {
    quote: 'Managing 8 clients\' LinkedIn accounts used to take my whole team. Now one person handles it all in GhostIn.',
    name: 'Priya R.',
    role: 'Agency Owner',
    avatar: 'PR',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0077B5]">
                <span className="text-sm font-bold text-white">G</span>
              </div>
              <span className="text-lg font-bold text-slate-900">GhostIn</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Features</a>
              <a href="#pricing" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
              <a href="#testimonials" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Reviews</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-[#0077B5] hover:bg-[#006097] text-white">
                  Start Free <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-gradient-to-r from-blue-50 to-purple-50 blur-3xl opacity-60" />
        </div>
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6 inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            Powered by Claude AI
          </Badge>
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            The AI LinkedIn Ghostwriter{' '}
            <span className="bg-gradient-to-r from-[#0077B5] to-purple-600 bg-clip-text text-transparent">
              That Books You Calls
            </span>{' '}
            While You Sleep
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-600 leading-relaxed">
            Generate viral LinkedIn posts, build lead magnet pages, automate DM follow-ups, and manage multiple accounts — all from one sleek dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-[#0077B5] hover:bg-[#006097] text-white px-8 h-12 text-base font-semibold shadow-lg shadow-blue-200">
                Start for Free — No Card Needed
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="px-8 h-12 text-base">
                See How It Works
              </Button>
            </a>
          </div>
          <p className="mt-4 text-sm text-slate-400">10 posts free every month. Upgrade anytime.</p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-slate-100 bg-slate-50 py-10">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-extrabold text-slate-900">{s.value}</div>
                <div className="mt-1 text-sm text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Everything you need to dominate LinkedIn</h2>
            <p className="mt-4 text-lg text-slate-600">Four powerful modules. One subscription. Infinite leverage.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="group rounded-2xl border border-slate-100 p-8 hover:border-slate-200 hover:shadow-lg transition-all duration-300">
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.bg}`}>
                  <f.icon className={`h-6 w-6 ${f.color}`} />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-slate-900">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 py-24 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">From idea to inbound in 3 steps</h2>
          <p className="mb-16 text-lg text-slate-600">The fastest path from content creation to booked calls.</p>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: '01', icon: Sparkles, title: 'Create content', desc: 'Type a topic, pick a tone, and get a polished LinkedIn post in under 10 seconds.' },
              { step: '02', icon: Target,   title: 'Capture leads',  desc: 'Share your AI-generated lead magnet. Collect emails. Grow your list.' },
              { step: '03', icon: MessageSquare, title: 'Book calls', desc: 'Automated DM sequences turn commenters and leads into calendar bookings.' },
            ].map((item) => (
              <div key={item.step} className="relative rounded-2xl bg-white p-8 shadow-sm">
                <div className="mb-4 text-5xl font-extrabold text-slate-100">{item.step}</div>
                <item.icon className="mb-3 h-7 w-7 text-[#0077B5]" />
                <h3 className="mb-2 font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900 sm:text-4xl">Loved by creators & agencies</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-2xl border border-slate-100 p-8">
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mb-6 text-slate-700 leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#0077B5] to-purple-500 text-sm font-semibold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{t.name}</div>
                    <div className="text-sm text-slate-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-slate-50 py-24 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Simple, transparent pricing</h2>
            <p className="mt-4 text-lg text-slate-600">Start free. Upgrade when you're ready to scale.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 ${
                  plan.highlight
                    ? 'bg-[#0077B5] text-white shadow-2xl shadow-blue-200 scale-105'
                    : 'bg-white border border-slate-200'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1 text-xs font-bold text-slate-900">
                    MOST POPULAR
                  </div>
                )}
                <div className={`mb-2 text-sm font-semibold ${plan.highlight ? 'text-blue-100' : 'text-slate-500'}`}>
                  {plan.name}
                </div>
                <div className="mb-1 flex items-end gap-1">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  <span className={`mb-1 text-sm ${plan.highlight ? 'text-blue-200' : 'text-slate-400'}`}>{plan.period}</span>
                </div>
                <p className={`mb-6 text-sm ${plan.highlight ? 'text-blue-100' : 'text-slate-500'}`}>{plan.description}</p>
                <ul className="mb-8 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`h-4 w-4 shrink-0 ${plan.highlight ? 'text-blue-200' : 'text-emerald-500'}`} />
                      <span className={plan.highlight ? 'text-blue-50' : 'text-slate-700'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.href}>
                  <Button
                    className={`w-full font-semibold ${
                      plan.highlight
                        ? 'bg-white text-[#0077B5] hover:bg-blue-50'
                        : 'bg-[#0077B5] text-white hover:bg-[#006097]'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
            Ready to become the{' '}
            <span className="bg-gradient-to-r from-[#0077B5] to-purple-600 bg-clip-text text-transparent">
              LinkedIn authority
            </span>{' '}
            in your niche?
          </h2>
          <p className="mb-8 text-lg text-slate-600">
            Join thousands of founders, coaches, and agencies using GhostIn to grow their LinkedIn presence on autopilot.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-[#0077B5] hover:bg-[#006097] text-white px-10 h-12 text-base font-semibold shadow-lg shadow-blue-200">
              Start Free Today <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-slate-50 py-10 px-4">
        <div className="mx-auto max-w-6xl flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0077B5]">
              <span className="text-xs font-bold text-white">G</span>
            </div>
            <span className="font-semibold text-slate-800">GhostIn</span>
          </div>
          <p className="text-sm text-slate-400">© 2025 GhostIn. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
            <Link href="/login" className="hover:text-slate-900 transition-colors">Log in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
