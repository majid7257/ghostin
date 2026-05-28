'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle, Loader2 } from 'lucide-react';

const perks = [
  '10 AI-generated posts every month — free',
  'Lead magnet builder included',
  'No credit card required',
];

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-0 shadow-xl text-center p-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Check your inbox!</h2>
          <p className="text-slate-600 mb-6">
            We've sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
          </p>
          <Link href="/login">
            <Button className="bg-[#0077B5] hover:bg-[#006097] text-white">Go to Login</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0077B5]">
              <span className="font-bold text-white">G</span>
            </div>
            <span className="text-xl font-bold text-slate-900">GhostIn</span>
          </Link>
          <ul className="mt-4 space-y-1.5">
            {perks.map((p) => (
              <li key={p} className="flex items-center justify-center gap-2 text-sm text-slate-600">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>Start ghostwriting on LinkedIn today</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Jane Smith"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0077B5] hover:bg-[#006097] text-white"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Account <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <p className="text-center text-xs text-slate-400">
                By signing up you agree to our{' '}
                <a href="#" className="underline hover:text-slate-600">Terms</a> and{' '}
                <a href="#" className="underline hover:text-slate-600">Privacy Policy</a>.
              </p>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-slate-500">
            Already have an account?&nbsp;
            <Link href="/login" className="font-medium text-[#0077B5] hover:underline">Sign in</Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
