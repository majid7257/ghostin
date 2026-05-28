'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Loader2, ChevronDown, ChevronUp, Clock, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';

interface DmMessage {
  day: number;
  message: string;
}

interface Sequence {
  id: string;
  name: string;
  trigger_type: string;
  messages: DmMessage[];
  is_active: boolean;
  created_at: string;
}

const TRIGGER_TYPES = [
  { value: 'commenter',   label: 'Post Commenter' },
  { value: 'liker',       label: 'Post Liker' },
  { value: 'connection',  label: 'New Connection' },
  { value: 'profile',     label: 'Profile Visitor' },
];

export default function SequencesPage() {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState('commenter');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => { fetchSequences(); }, []);

  const fetchSequences = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('sequences')
      .select('id, name, trigger_type, messages, is_active, created_at')
      .order('created_at', { ascending: false });
    setSequences(data ?? []);
    setLoadingList(false);
  };

  const handleGenerate = async () => {
    if (!name.trim()) {
      toast({ title: 'Name required', description: 'Give your sequence a name.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/sequences/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), triggerType, context: context.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      } else {
        setSequences((prev) => [data.sequence, ...prev]);
        setExpanded(data.sequence.id);
        setName('');
        setContext('');
        toast({ title: 'Sequence created!', description: `${data.sequence.messages.length} messages ready.` });
      }
    } catch {
      toast({ title: 'Network error', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    const supabase = createClient();
    await supabase.from('sequences').update({ is_active: !isActive }).eq('id', id);
    setSequences((prev) => prev.map((s) => s.id === id ? { ...s, is_active: !isActive } : s));
    toast({ title: `Sequence ${!isActive ? 'activated' : 'paused'}` });
  };

  const deleteSequence = async (id: string) => {
    const supabase = createClient();
    await supabase.from('sequences').delete().eq('id', id);
    setSequences((prev) => prev.filter((s) => s.id !== id));
    toast({ title: 'Sequence deleted' });
  };

  const triggerLabel = (type: string) =>
    TRIGGER_TYPES.find((t) => t.value === type)?.label ?? type;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">DM Follow-up Sequences</h1>
        <p className="text-slate-500 mt-1">Convert commenters and connections into booked calls automatically.</p>
      </div>

      {/* Create form */}
      <Card className="border-slate-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-emerald-500" />
            Create Sequence
          </CardTitle>
          <CardDescription>AI will write a multi-step DM campaign to nurture your leads.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="seqName">Sequence Name *</Label>
            <Input
              id="seqName"
              placeholder="e.g. Post commenter → free call"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trigger">Trigger</Label>
            <Select value={triggerType} onValueChange={setTriggerType}>
              <SelectTrigger id="trigger">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRIGGER_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="seqContext">What you offer / Goal of the sequence</Label>
            <Textarea
              id="seqContext"
              placeholder="e.g. I'm an executive coach offering a free 30-min strategy session to help B2B founders close more enterprise deals"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={3}
            />
          </div>
          <div className="sm:col-span-2">
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Writing sequence…</>
              ) : (
                <><MessageSquare className="mr-2 h-4 w-4" /> Generate Sequence</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-slate-900">Your Sequences</h2>
        {loadingList ? (
          <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : sequences.length === 0 ? (
          <Card className="border-dashed border-slate-200">
            <CardContent className="py-12 text-center text-slate-400">
              <MessageSquare className="mx-auto mb-3 h-8 w-8 opacity-20" />
              <p className="text-sm">No sequences yet. Create your first one above!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sequences.map((seq) => (
              <Card key={seq.id} className="border-slate-100 overflow-hidden">
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpanded(expanded === seq.id ? null : seq.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${seq.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <div>
                      <div className="font-medium text-sm text-slate-900">{seq.name}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-xs">{triggerLabel(seq.trigger_type)}</Badge>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {seq.messages.length} messages · {formatDate(seq.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <Button
                      variant={seq.is_active ? 'secondary' : 'outline'}
                      size="sm"
                      className="text-xs"
                      onClick={(e) => { e.stopPropagation(); toggleActive(seq.id, seq.is_active); }}
                    >
                      {seq.is_active ? 'Pause' : 'Activate'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-500"
                      onClick={(e) => { e.stopPropagation(); deleteSequence(seq.id); }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    {expanded === seq.id ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </div>
                {expanded === seq.id && (
                  <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/50 space-y-3">
                    {seq.messages.map((msg, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                            {idx + 1}
                          </div>
                          {idx < seq.messages.length - 1 && <div className="w-px flex-1 bg-emerald-100 mt-1" />}
                        </div>
                        <div className="flex-1 pb-3">
                          <div className="text-xs text-slate-400 mb-1">
                            {msg.day === 0 ? 'Immediately' : `Day ${msg.day}`}
                          </div>
                          <div className="rounded-lg bg-white border border-slate-100 px-4 py-3 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {msg.message}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
