import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardSidebar } from '@/components/dashboard/sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, plan')
    .eq('id', user.id)
    .maybeSingle();

  const { data: usageData } = await supabase
    .from('usage')
    .select('posts_generated, sequences_created')
    .eq('user_id', user.id)
    .eq('month', new Date().toISOString().slice(0, 7))
    .maybeSingle();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <DashboardSidebar
        user={{ email: user.email ?? '', name: profile?.full_name ?? '' }}
        plan={(profile?.plan ?? 'free') as 'free' | 'pro' | 'agency'}
        usage={{ posts: usageData?.posts_generated ?? 0, sequences: usageData?.sequences_created ?? 0 }}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
