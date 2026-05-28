import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PLANS } from '@/lib/plan-limits';
import { getCurrentMonth } from '@/lib/utils';

export async function GET() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const month = getCurrentMonth();
  const [profileRes, usageRes, accountsRes] = await Promise.all([
    supabase.from('profiles').select('plan').eq('id', user.id).maybeSingle(),
    supabase.from('usage').select('posts_generated, sequences_created').eq('user_id', user.id).eq('month', month).maybeSingle(),
    supabase.from('linkedin_accounts').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_active', true),
  ]);

  const plan = (profileRes.data?.plan ?? 'free') as 'free' | 'pro' | 'agency';
  const limits = PLANS[plan];
  const used = usageRes.data ?? { posts_generated: 0, sequences_created: 0 };

  return NextResponse.json({
    plan,
    limits,
    usage: {
      posts: used.posts_generated,
      sequences: used.sequences_created,
      accounts: accountsRes.count ?? 0,
    },
  });
}
