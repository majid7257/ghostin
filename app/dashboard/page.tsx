import { createClient } from '@/lib/supabase/server';
import { PLANS } from '@/lib/plan-limits';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Target, MessageSquare, Users, ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const month = new Date().toISOString().slice(0, 7);

  const [profileRes, usageRes, postsRes, accountsRes] = await Promise.all([
    supabase.from('profiles').select('full_name, plan').eq('id', user.id).maybeSingle(),
    supabase.from('usage').select('posts_generated, sequences_created').eq('user_id', user.id).eq('month', month).maybeSingle(),
    supabase.from('posts').select('id, topic, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('linkedin_accounts').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_active', true),
  ]);

  const plan = (profileRes.data?.plan ?? 'free') as 'free' | 'pro' | 'agency';
  const planMeta = PLANS[plan];
  const firstName = (profileRes.data?.full_name ?? 'there').split(' ')[0];
  const usage = usageRes.data ?? { posts_generated: 0, sequences_created: 0 };
  const recentPosts = postsRes.data ?? [];
  const accountCount = accountsRes.count ?? 0;

  const quickLinks = [
    { href: '/dashboard/posts',       icon: Sparkles,       label: 'Generate a Post',    desc: 'Create viral content in seconds',    color: 'text-blue-500',   bg: 'bg-blue-50'   },
    { href: '/dashboard/lead-magnet', icon: Target,         label: 'Build Lead Magnet',  desc: 'Turn offers into landing pages',     color: 'text-purple-500', bg: 'bg-purple-50' },
    { href: '/dashboard/sequences',   icon: MessageSquare,  label: 'New DM Sequence',    desc: 'Automate your follow-ups',           color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { href: '/dashboard/accounts',    icon: Users,          label: 'Add Account',        desc: `${accountCount}/${planMeta.accounts} accounts`, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Good morning, {firstName} 👋</h1>
        <p className="mt-1 text-slate-500">Here's your GhostIn dashboard for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.</p>
      </div>

      {/* Plan banner if free */}
      {plan === 'free' && (
        <div className="rounded-xl bg-gradient-to-r from-[#0077B5] to-purple-600 p-5 text-white flex items-center justify-between">
          <div>
            <div className="font-semibold text-lg">Unlock your full potential</div>
            <div className="text-blue-100 text-sm mt-0.5">Upgrade to Pro for 100 posts and 50 sequences per month.</div>
          </div>
          <Link href="/pricing">
            <Button className="shrink-0 bg-white text-[#0077B5] hover:bg-blue-50 font-semibold">
              Upgrade <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* Usage cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Posts Generated', value: usage.posts_generated, limit: planMeta.posts, icon: Sparkles, color: 'text-blue-500' },
          { label: 'DM Sequences', value: usage.sequences_created, limit: planMeta.sequences, icon: MessageSquare, color: 'text-emerald-500' },
          { label: 'Accounts', value: accountCount, limit: planMeta.accounts, icon: Users, color: 'text-orange-500' },
          { label: 'Plan', value: plan.charAt(0).toUpperCase() + plan.slice(1), limit: null, icon: TrendingUp, color: 'text-purple-500' },
        ].map((stat) => (
          <Card key={stat.label} className="border-slate-100">
            <CardContent className="p-5">
              <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {stat.value}{stat.limit !== null ? <span className="text-sm text-slate-400 font-normal">/{stat.limit}</span> : ''}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-slate-900">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((q) => (
            <Link key={q.href} href={q.href}>
              <Card className="border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-200 cursor-pointer h-full">
                <CardContent className="p-5">
                  <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${q.bg}`}>
                    <q.icon className={`h-5 w-5 ${q.color}`} />
                  </div>
                  <div className="font-semibold text-slate-900 text-sm">{q.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{q.desc}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent posts */}
      {recentPosts.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Recent Posts</h2>
            <Link href="/dashboard/posts" className="text-sm text-[#0077B5] hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <Card className="border-slate-100">
            <CardContent className="p-0">
              <ul className="divide-y divide-slate-50">
                {recentPosts.map((post) => (
                  <li key={post.id} className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                        <Sparkles className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="truncate text-sm font-medium text-slate-800">{post.topic}</div>
                    </div>
                    <div className="ml-4 shrink-0 text-xs text-slate-400">{formatDate(post.created_at)}</div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
