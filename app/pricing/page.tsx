import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft, ArrowRight, Zap } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '',
    description: 'Perfect to get started',
    features: [
      '10 AI posts per month',
      '5 DM sequences per month',
      '1 LinkedIn account',
      'Lead magnet builder',
      'Public landing pages',
    ],
    notIncluded: ['Priority AI', 'Analytics', 'White-label'],
    cta: 'Start Free',
    href: '/signup',
    highlight: false,
    plan: null,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/mo',
    description: 'For serious creators & coaches',
    features: [
      '100 AI posts per month',
      '50 DM sequences per month',
      '3 LinkedIn accounts',
      'Everything in Free',
      'Priority AI generation',
      'Post analytics',
    ],
    notIncluded: ['White-label'],
    cta: 'Start Pro',
    href: null,
    highlight: true,
    plan: 'pro',
  },
  {
    name: 'Agency',
    price: '$149',
    period: '/mo',
    description: 'For ghostwriting agencies',
    features: [
      '200 AI posts per month',
      '100 DM sequences per month',
      '5 LinkedIn accounts',
      'Everything in Pro',
      'White-label landing pages',
      'Priority support',
    ],
    notIncluded: [],
    cta: 'Start Agency',
    href: null,
    highlight: false,
    plan: 'agency',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0077B5]">
            <span className="text-sm font-bold text-white">G</span>
          </div>
          <span className="text-lg font-bold text-slate-900">GhostIn</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="bg-[#0077B5] hover:bg-[#006097] text-white">
              Get Started Free
            </Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 mb-4">
            <Zap className="h-3.5 w-3.5" />
            Simple pricing
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Plans that grow with you</h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Start free, upgrade when you're ready to scale. No contracts, cancel anytime.
          </p>
        </div>

        {/* Plans */}
        <div className="grid gap-8 md:grid-cols-3 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 ${
                plan.highlight
                  ? 'bg-[#0077B5] text-white shadow-2xl shadow-blue-200 ring-2 ring-[#0077B5]'
                  : 'bg-white border border-slate-200 shadow-sm'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1 text-xs font-bold text-slate-900 whitespace-nowrap">
                  MOST POPULAR
                </div>
              )}
              <div className={`text-sm font-semibold mb-1 ${plan.highlight ? 'text-blue-200' : 'text-slate-500'}`}>
                {plan.name}
              </div>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                {plan.period && (
                  <span className={`mb-1.5 text-sm ${plan.highlight ? 'text-blue-200' : 'text-slate-400'}`}>{plan.period}</span>
                )}
              </div>
              <p className={`text-sm mb-6 ${plan.highlight ? 'text-blue-100' : 'text-slate-500'}`}>{plan.description}</p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle className={`h-4 w-4 shrink-0 mt-0.5 ${plan.highlight ? 'text-blue-200' : 'text-emerald-500'}`} />
                    <span className={plan.highlight ? 'text-blue-50' : 'text-slate-700'}>{f}</span>
                  </li>
                ))}
              </ul>

              {plan.href ? (
                <Link href={plan.href}>
                  <Button className={`w-full font-semibold ${plan.highlight ? 'bg-white text-[#0077B5] hover:bg-blue-50' : 'bg-[#0077B5] text-white hover:bg-[#006097]'}`}>
                    {plan.cta} <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <form action="/api/stripe/checkout" method="POST">
                  <input type="hidden" name="plan" value={plan.plan ?? ''} />
                  <Link href={`/signup?plan=${plan.plan}`}>
                    <Button className={`w-full font-semibold ${plan.highlight ? 'bg-white text-[#0077B5] hover:bg-blue-50' : 'bg-[#0077B5] text-white hover:bg-[#006097]'}`}>
                      {plan.cta} <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Button>
                  </Link>
                </form>
              )}
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">Frequently asked questions</h2>
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {[
              { q: 'Can I cancel anytime?', a: 'Yes, cancel at any time from your billing settings. Your plan stays active until the end of the billing period.' },
              { q: 'Do unused posts carry over?', a: 'No, the monthly allowance resets at the start of each billing cycle.' },
              { q: 'Is there a free trial for paid plans?', a: 'Your Free plan is a permanent trial. Upgrade when you need more volume.' },
              { q: 'Do you store my generated posts?', a: 'Yes — all posts are saved to your dashboard so you can copy or reuse them anytime.' },
            ].map((faq) => (
              <div key={faq.q} className="rounded-xl bg-white border border-slate-100 p-6">
                <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-sm text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
