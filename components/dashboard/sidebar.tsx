'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { PLANS } from '@/lib/plan-limits';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, Sparkles, Target, MessageSquare, Users,
  LogOut, CreditCard, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/dashboard',           label: 'Overview',       icon: LayoutDashboard },
  { href: '/dashboard/posts',     label: 'Post Generator', icon: Sparkles },
  { href: '/dashboard/lead-magnet', label: 'Lead Magnets', icon: Target },
  { href: '/dashboard/sequences', label: 'DM Sequences',   icon: MessageSquare },
  { href: '/dashboard/accounts',  label: 'Accounts',       icon: Users },
];

interface Props {
  user: { email: string; name: string };
  plan: 'free' | 'pro' | 'agency';
  usage: { posts: number; sequences: number };
}

export function DashboardSidebar({ user, plan, usage }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const planMeta = PLANS[plan];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const initials = (user.name || user.email).slice(0, 2).toUpperCase();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-100 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0077B5]">
          <span className="text-sm font-bold text-white">G</span>
        </div>
        <span className="text-lg font-bold text-slate-900">GhostIn</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === '/dashboard' ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-[#0077B5]/10 text-[#0077B5]'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {active && <ChevronRight className="ml-auto h-3.5 w-3.5" />}
            </Link>
          );
        })}
      </nav>

      {/* Usage meters */}
      <div className="border-t border-slate-100 px-4 py-4 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Usage this month</span>
          <Badge variant="secondary" className="text-xs capitalize">{plan}</Badge>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Posts</span>
            <span>{usage.posts} / {planMeta.posts}</span>
          </div>
          <Progress value={(usage.posts / planMeta.posts) * 100} className="h-1.5" />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Sequences</span>
            <span>{usage.sequences} / {planMeta.sequences}</span>
          </div>
          <Progress value={(usage.sequences / planMeta.sequences) * 100} className="h-1.5" />
        </div>
        {plan === 'free' && (
          <Link href="/pricing">
            <Button size="sm" className="w-full mt-1 bg-gradient-to-r from-[#0077B5] to-purple-600 text-white text-xs">
              Upgrade Plan
            </Button>
          </Link>
        )}
      </div>

      {/* User section */}
      <div className="border-t border-slate-100 px-3 py-3 flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0077B5] to-purple-500 text-xs font-semibold text-white">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="truncate text-sm font-medium text-slate-900">{user.name || 'User'}</div>
          <div className="truncate text-xs text-slate-400">{user.email}</div>
        </div>
        <button
          onClick={handleLogout}
          title="Sign out"
          className="rounded p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
