import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Seo } from "@/components/Seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { readPendingBrief } from "@/lib/pendingBrief";

export default function Auth() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialMode = params.get("mode") === "signup" ? "signup" : "signin";
  const next = params.get("next") ?? "/onboarding";
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const afterSignedIn = () => {
    const hasBrief = !!readPendingBrief();
    navigate(hasBrief ? "/onboarding" : next);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    afterSignedIn();
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding`,
        data: { full_name: fullName },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome to Vibely!");
    navigate("/onboarding");
  };

  const handleReset = async () => {
    if (!email) return toast.error("Enter your email first");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return toast.error(error.message);
    toast.success("Password reset email sent");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-mesh px-4 py-12">
      <Seo
        title="Sign in or create an account — Evntr"
        description="Log in to Evntr or create a free account to plan events, send inquiries to venues and pros, and manage bookings in one place."
        path="/auth"
        noindex
      />
      <div className="orb left-[-10%] top-[-10%] h-96 w-96 bg-gradient-sunset opacity-40" />
      <div className="orb bottom-[-15%] right-[-10%] h-96 w-96 bg-gradient-aurora opacity-30" />

      <Card className="relative w-full max-w-md shadow-elevated glass-strong">
        <CardHeader className="text-center">
          <Link to="/" className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-sunset shadow-soft">
            <Sparkles className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </Link>
          <h1 className="font-display text-2xl font-semibold leading-none tracking-tight">Welcome to Vibely</h1>
          <CardDescription>Plan, book, and run events in one place.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={initialMode}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-3 pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="si-email">Email</Label>
                  <Input id="si-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="si-pw">Password</Label>
                  <Input id="si-pw" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full bg-gradient-sunset text-primary-foreground hover:opacity-95" disabled={loading}>
                  {loading ? "Signing in…" : "Sign in"}
                </Button>
                <button type="button" onClick={handleReset} className="block w-full text-center text-xs text-muted-foreground hover:text-primary">
                  Forgot password?
                </button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-3 pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="su-name">Full name</Label>
                  <Input id="su-name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="su-email">Email</Label>
                  <Input id="su-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="su-pw">Password</Label>
                  <Input id="su-pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full bg-gradient-sunset text-primary-foreground hover:opacity-95" disabled={loading}>
                  {loading ? "Creating…" : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
