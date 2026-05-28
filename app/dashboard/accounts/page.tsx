'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Users, Plus, Loader2, Trash2, ExternalLink, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import { PLANS } from '@/lib/plan-limits';
import { formatDate } from '@/lib/utils';

interface Account {
  id: string;
  account_name: string;
  profile_url: string | null;
  is_active: boolean;
  created_at: string;
}

export default function AccountsPage() {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [plan, setPlan] = useState<'free' | 'pro' | 'agency'>('free');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const supabase = createClient();
    const [{ data: profileData }, { data: accountsData }] = await Promise.all([
      supabase.from('profiles').select('plan').maybeSingle(),
      supabase.from('linkedin_accounts').select('*').eq('is_active', true).order('created_at', { ascending: false }),
    ]);
    setPlan((profileData?.plan ?? 'free') as 'free' | 'pro' | 'agency');
    setAccounts(accountsData ?? []);
    setLoading(false);
  };

  const limit = PLANS[plan].accounts;
  const atLimit = accounts.length >= limit;

  const handleAdd = async () => {
    if (!accountName.trim()) {
      toast({ title: 'Name required', variant: 'destructive' });
      return;
    }
    if (atLimit) {
      toast({ title: 'Account limit reached', description: `Upgrade your plan to add more accounts.`, variant: 'destructive' });
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('linkedin_accounts')
      .insert({ user_id: user!.id, account_name: accountName.trim(), profile_url: profileUrl.trim() || null })
      .select()
      .single();
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setAccounts((prev) => [data, ...prev]);
      setOpen(false);
      setAccountName('');
      setProfileUrl('');
      toast({ title: 'Account added!' });
    }
    setSaving(false);
  };

  const handleRemove = async (id: string) => {
    const supabase = createClient();
    await supabase.from('linkedin_accounts').update({ is_active: false }).eq('id', id);
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    toast({ title: 'Account removed' });
  };

  const planColor = { free: 'bg-slate-100 text-slate-600', pro: 'bg-blue-100 text-blue-700', agency: 'bg-purple-100 text-purple-700' }[plan];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Account Manager</h1>
          <p className="text-slate-500 mt-1">Manage your LinkedIn profiles from one place.</p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          disabled={atLimit}
          className="bg-[#0077B5] hover:bg-[#006097] text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Account
        </Button>
      </div>

      {/* Usage */}
      <Card className="border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50">
        <CardContent className="flex items-center justify-between p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
              <Users className="h-6 w-6 text-[#0077B5]" />
            </div>
            <div>
              <div className="font-semibold text-slate-900">{accounts.length} / {limit} accounts</div>
              <div className="text-sm text-slate-500">
                {atLimit ? 'Account limit reached' : `${limit - accounts.length} slots remaining`}
              </div>
            </div>
          </div>
          <Badge className={`text-xs capitalize ${planColor}`}>{plan} plan</Badge>
        </CardContent>
      </Card>

      {atLimit && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            You've reached the {limit}-account limit on the <strong>{plan}</strong> plan.{' '}
            <a href="/pricing" className="font-semibold underline hover:no-underline">Upgrade</a> to add more.
          </div>
        </div>
      )}

      {/* Account list */}
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading accounts…
        </div>
      ) : accounts.length === 0 ? (
        <Card className="border-dashed border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
            <Users className="mb-3 h-10 w-10 opacity-20" />
            <p className="text-sm font-medium">No accounts yet</p>
            <p className="text-xs mt-1">Add your first LinkedIn account to get started.</p>
            <Button
              onClick={() => setOpen(true)}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <Card key={account.id} className="border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#0077B5] to-blue-400 text-white font-bold text-lg shadow-sm">
                    {account.account_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex items-center gap-1">
                    {account.profile_url && (
                      <a href={account.profile_url} target="_blank" rel="noreferrer">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-[#0077B5]">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-500"
                      onClick={() => handleRemove(account.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="font-semibold text-slate-900 mb-1 truncate">{account.account_name}</div>
                {account.profile_url ? (
                  <div className="text-xs text-slate-400 truncate">{account.profile_url}</div>
                ) : (
                  <div className="text-xs text-slate-300 italic">No profile URL</div>
                )}
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-xs text-slate-500">Active · Added {formatDate(account.created_at)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add LinkedIn Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="accName">Account Name *</Label>
              <Input
                id="accName"
                placeholder="e.g. John Smith — Main Account"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accUrl">LinkedIn Profile URL <span className="text-slate-400 text-xs">(optional)</span></Label>
              <Input
                id="accUrl"
                type="url"
                placeholder="https://www.linkedin.com/in/yourprofile"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={saving} className="bg-[#0077B5] hover:bg-[#006097] text-white">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Add Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
