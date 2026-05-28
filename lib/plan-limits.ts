import { SupabaseClient } from '@supabase/supabase-js';
import { getCurrentMonth } from './utils';

export const PLANS = {
  free:   { posts: 10,  sequences: 5,   accounts: 1, label: 'Free',   price: 0   },
  pro:    { posts: 100, sequences: 50,  accounts: 3, label: 'Pro',    price: 49  },
  agency: { posts: 200, sequences: 100, accounts: 5, label: 'Agency', price: 149 },
} as const;

export type Plan = keyof typeof PLANS;

interface LimitResult {
  allowed: boolean;
  used: number;
  limit: number;
}

export async function checkPostLimit(
  supabase: SupabaseClient,
  userId: string,
  plan: Plan
): Promise<LimitResult> {
  const month = getCurrentMonth();
  const limit = PLANS[plan].posts;
  const { data } = await supabase
    .from('usage')
    .select('posts_generated')
    .eq('user_id', userId)
    .eq('month', month)
    .maybeSingle();
  const used = data?.posts_generated ?? 0;
  return { allowed: used < limit, used, limit };
}

export async function checkSequenceLimit(
  supabase: SupabaseClient,
  userId: string,
  plan: Plan
): Promise<LimitResult> {
  const month = getCurrentMonth();
  const limit = PLANS[plan].sequences;
  const { data } = await supabase
    .from('usage')
    .select('sequences_created')
    .eq('user_id', userId)
    .eq('month', month)
    .maybeSingle();
  const used = data?.sequences_created ?? 0;
  return { allowed: used < limit, used, limit };
}

export async function checkAccountLimit(
  supabase: SupabaseClient,
  userId: string,
  plan: Plan
): Promise<{ allowed: boolean; count: number; limit: number }> {
  const limit = PLANS[plan].accounts;
  const { count } = await supabase
    .from('linkedin_accounts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_active', true);
  return { allowed: (count ?? 0) < limit, count: count ?? 0, limit };
}

export async function incrementPostUsage(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const month = getCurrentMonth();
  await supabase.rpc('increment_post_usage', { p_user_id: userId, p_month: month });
}

export async function incrementSequenceUsage(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const month = getCurrentMonth();
  await supabase.rpc('increment_sequence_usage', { p_user_id: userId, p_month: month });
}
