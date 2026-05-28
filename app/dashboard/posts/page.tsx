'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Copy, Check, Loader2, RefreshCw, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatDate } from '@/lib/utils';

const TONES = [
  { value: 'thought-leader', label: 'Thought Leader' },
  { value: 'storyteller',    label: 'Storyteller' },
  { value: 'educator',       label: 'Educator' },
  { value: 'provocateur',    label: 'Provocateur' },
  { value: 'motivational',   label: 'Motivational' },
  { value: 'casual',         label: 'Casual & Relatable' },
];

interface Post {
  id: string;
  topic: string;
  tone: string;
  content: string;
  created_at: string;
}

export default function PostsPage() {
  const { toast } = useToast();
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('thought-leader');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [copied, setCopied] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('posts')
      .select('id, topic, tone, content, created_at')
      .order('created_at', { ascending: false })
      .limit(20);
    setPosts(data ?? []);
    setLoadingHistory(false);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({ title: 'Topic required', description: 'Enter a topic for your post.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/posts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim(), tone, additionalContext: context.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      } else {
        setGenerated(data.post);
        setPosts((prev) => [data.post, ...prev]);
        toast({ title: 'Post generated!', description: 'Your LinkedIn post is ready.' });
      }
    } catch {
      toast({ title: 'Network error', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Copied to clipboard!' });
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Post Generator</h1>
        <p className="text-slate-500 mt-1">Turn any topic into a viral LinkedIn post in seconds.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Generator form */}
        <Card className="border-slate-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              Generate Post
            </CardTitle>
            <CardDescription>Describe your topic and pick a tone — we'll handle the rest.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic or Idea *</Label>
              <Input
                id="topic"
                placeholder="e.g. Why most people fail at morning routines"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger id="tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="context">Additional Context <span className="text-slate-400 text-xs">(optional)</span></Label>
              <Textarea
                id="context"
                placeholder="Personal story, specific insight, or data point to include…"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={3}
              />
            </div>
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-[#0077B5] hover:bg-[#006097] text-white"
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Writing post…</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" /> Generate Post</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output */}
        <Card className={`border-slate-100 transition-all duration-300 ${generated ? '' : 'border-dashed'}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Generated Post</CardTitle>
              {generated && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleGenerate}
                    disabled={loading}
                    title="Regenerate"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(generated.content)}
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!generated && !loading && (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <Sparkles className="mb-3 h-10 w-10 opacity-20" />
                <p className="text-sm">Your post will appear here</p>
              </div>
            )}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#0077B5]" />
                <p className="text-sm text-slate-500">Claude is writing your post…</p>
              </div>
            )}
            {generated && !loading && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Badge variant="secondary" className="capitalize">{generated.tone.replace('-', ' ')}</Badge>
                </div>
                <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-mono text-xs">
                  {generated.content}
                </div>
                <Button
                  onClick={() => handleCopy(generated.content)}
                  variant="outline"
                  className="w-full"
                >
                  {copied ? (
                    <><Check className="mr-2 h-4 w-4 text-emerald-500" /> Copied!</>
                  ) : (
                    <><Copy className="mr-2 h-4 w-4" /> Copy Post</>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* History */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-slate-900">Post History</h2>
        {loadingHistory ? (
          <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : posts.length === 0 ? (
          <Card className="border-dashed border-slate-200">
            <CardContent className="py-12 text-center text-slate-400">
              <Sparkles className="mx-auto mb-3 h-8 w-8 opacity-20" />
              <p className="text-sm">No posts yet. Generate your first one above!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <Card key={post.id} className="border-slate-100 hover:border-slate-200 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-slate-900 truncate">{post.topic}</span>
                        <Badge variant="secondary" className="text-xs capitalize shrink-0">{post.tone.replace('-', ' ')}</Badge>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">{post.content}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="h-3 w-3" />
                        {formatDate(post.created_at)}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(post.content)}
                        className="h-8 w-8"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
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
