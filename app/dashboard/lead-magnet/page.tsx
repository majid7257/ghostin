'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Loader2, ExternalLink, Copy, Check, Globe } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';

interface LeadMagnet {
  id: string;
  niche: string;
  offer: string;
  title: string;
  slug: string;
  published: boolean;
  created_at: string;
  content: {
    subtitle: string;
    bullets: string[];
    cta: string;
    about: string;
  };
}

export default function LeadMagnetPage() {
  const { toast } = useToast();
  const [niche, setNiche] = useState('');
  const [offer, setOffer] = useState('');
  const [loading, setLoading] = useState(false);
  const [magnets, setMagnets] = useState<LeadMagnet[]>([]);
  const [generated, setGenerated] = useState<LeadMagnet | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => { fetchMagnets(); }, []);

  const fetchMagnets = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('lead_magnets')
      .select('id, niche, offer, title, slug, published, created_at, content')
      .order('created_at', { ascending: false })
      .limit(20);
    setMagnets(data ?? []);
    setLoadingList(false);
  };

  const handleGenerate = async () => {
    if (!niche.trim() || !offer.trim()) {
      toast({ title: 'Required fields', description: 'Enter both niche and offer.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/lead-magnet/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche: niche.trim(), offer: offer.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      } else {
        setGenerated(data.leadMagnet);
        setMagnets((prev) => [data.leadMagnet, ...prev]);
        toast({ title: 'Lead magnet created!', description: 'Your landing page is live.' });
      }
    } catch {
      toast({ title: 'Network error', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/lm/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: 'Link copied!' });
  };

  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Lead Magnet Builder</h1>
        <p className="text-slate-500 mt-1">Turn your niche and offer into a hosted landing page instantly.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Form */}
        <Card className="border-slate-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              Create Lead Magnet
            </CardTitle>
            <CardDescription>Describe who you help and what you're offering.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="niche">Your Niche *</Label>
              <Input
                id="niche"
                placeholder="e.g. B2B SaaS founders, executive coaches, freelance designers"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="offer">Your Free Offer *</Label>
              <Textarea
                id="offer"
                placeholder="e.g. A 5-step guide to closing enterprise deals without cold calling"
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
                rows={3}
              />
            </div>
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Building page…</>
              ) : (
                <><Target className="mr-2 h-4 w-4" /> Build Landing Page</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className={`border-slate-100 ${!generated ? 'border-dashed' : ''}`}>
          <CardHeader>
            <CardTitle className="text-base">Landing Page Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {!generated && !loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <Globe className="mb-3 h-10 w-10 opacity-20" />
                <p className="text-sm">Your landing page preview will appear here</p>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Loader2 className="mb-3 h-8 w-8 animate-spin text-purple-500" />
                <p className="text-sm text-slate-500">Claude is building your page…</p>
              </div>
            ) : generated ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 to-blue-50 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{generated.title}</h3>
                  <p className="text-sm text-slate-600 mb-4">{generated.content.subtitle}</p>
                  <ul className="space-y-2 mb-4">
                    {generated.content.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="mt-0.5 text-purple-500">✓</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div className="rounded-lg bg-purple-600 px-4 py-2 text-center text-sm font-semibold text-white">
                    {generated.content.cta}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => copyLink(generated.slug)}
                  >
                    {copied === generated.slug ? (
                      <><Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" /> Copied!</>
                    ) : (
                      <><Copy className="mr-1.5 h-3.5 w-3.5" /> Copy Link</>
                    )}
                  </Button>
                  <a href={`/lm/${generated.slug}`} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* List */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-slate-900">Your Lead Magnets</h2>
        {loadingList ? (
          <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : magnets.length === 0 ? (
          <Card className="border-dashed border-slate-200">
            <CardContent className="py-12 text-center text-slate-400">
              <Target className="mx-auto mb-3 h-8 w-8 opacity-20" />
              <p className="text-sm">No lead magnets yet. Create your first one above!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {magnets.map((m) => (
              <Card key={m.id} className="border-slate-100">
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-slate-900 truncate">{m.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>{m.niche}</span>
                      <span>·</span>
                      <span>{formatDate(m.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={m.published ? 'success' : 'secondary'} className="text-xs">
                      {m.published ? 'Live' : 'Draft'}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => copyLink(m.slug)} className="h-8 w-8">
                      {copied === m.slug ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                    <a href={`/lm/${m.slug}`} target="_blank" rel="noreferrer">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
