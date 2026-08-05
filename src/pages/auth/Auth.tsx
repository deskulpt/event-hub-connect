import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Sparkles, Mail, Phone } from "lucide-react";
import { readPendingBrief } from "@/lib/pendingBrief";

type AuthStep = "main" | "email-link" | "phone" | "password";

const redirectTo = (path: string) => `${window.location.origin}${path}`;

export default function Auth() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") ?? "/onboarding";
  const [step, setStep] = useState<AuthStep>("main");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "facebook" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isSignUp, setIsSignUp] = useState(params.get("mode") === "signup");

  const afterSignedIn = () => {
    const hasBrief = !!readPendingBrief();
    navigate(hasBrief ? "/onboarding" : next);
  };

  const handleGoogle = async () => {
    setOauthLoading("google");
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: redirectTo("/onboarding"),
      });
      if (result.error) {
        toast.error(result.error instanceof Error ? result.error.message : String(result.error));
        return;
      }
      if (!result.redirected) afterSignedIn();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Google sign-in failed");
    } finally {
      setOauthLoading(null);
    }
  };

  const handleFacebook = async () => {
    setOauthLoading("facebook");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: { redirectTo: redirectTo("/onboarding") },
    });
    setOauthLoading(null);
    if (error) toast.error(error.message);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Enter your email");
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo("/onboarding"),
        data: fullName ? { full_name: fullName } : undefined,
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Check your email for a login link — no password needed");
  };

  const handleSendPhoneCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = phone.replace(/\s+/g, "");
    if (!normalized.startsWith("+") || normalized.length < 10) {
      return toast.error("Enter phone with country code, e.g. +91…");
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: normalized });
    setLoading(false);
    if (error) {
      toast.error(
        error.message.includes("Phone") || error.message.includes("provider")
          ? "Phone login isn’t enabled on this project yet. Try Google, Facebook, or an email link."
          : error.message,
      );
      return;
    }
    setOtpSent(true);
    toast.success("Code sent to your phone");
  };

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: phone.replace(/\s+/g, ""),
      token: otp,
      type: "sms",
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    afterSignedIn();
  };

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    afterSignedIn();
  };

  const handlePasswordSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo("/onboarding"),
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
      redirectTo: redirectTo("/reset-password"),
    });
    if (error) return toast.error(error.message);
    toast.success("Password reset email sent");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-mesh px-4 py-12">
      <div className="orb left-[-10%] top-[-10%] h-96 w-96 bg-gradient-sunset opacity-40" />
      <div className="orb bottom-[-15%] right-[-10%] h-96 w-96 bg-gradient-aurora opacity-30" />

      <Card className="relative w-full max-w-md shadow-elevated glass-strong">
        <CardHeader className="text-center space-y-2">
          <Link
            to="/"
            className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-sunset shadow-soft"
          >
            <Sparkles className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
          </Link>
          <CardTitle className="font-display text-3xl">Vibely</CardTitle>
          <CardDescription className="text-base">
            Sign in without remembering a password — use Google, Facebook, email link, or phone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === "main" && (
            <>
              <Button
                type="button"
                size="lg"
                className="h-14 w-full rounded-2xl text-base font-semibold"
                variant="outline"
                disabled={!!oauthLoading}
                onClick={handleGoogle}
              >
                {oauthLoading === "google" ? "Opening Google…" : "Continue with Google"}
              </Button>
              <Button
                type="button"
                size="lg"
                className="h-14 w-full rounded-2xl text-base font-semibold"
                variant="outline"
                disabled={!!oauthLoading}
                onClick={handleFacebook}
              >
                {oauthLoading === "facebook" ? "Opening Facebook…" : "Continue with Facebook"}
              </Button>
              <Button
                type="button"
                size="lg"
                className="h-14 w-full rounded-2xl bg-[#25D366] text-base font-semibold text-white hover:bg-[#1ebe5d]"
                onClick={() => setStep("phone")}
              >
                <Phone className="h-5 w-5" /> Continue with phone / WhatsApp
              </Button>
              <Button
                type="button"
                size="lg"
                className="h-14 w-full rounded-2xl bg-gradient-sunset text-base font-semibold text-primary-foreground hover:opacity-95"
                onClick={() => setStep("email-link")}
              >
                <Mail className="h-5 w-5" /> Email me a login link
              </Button>
              <button
                type="button"
                className="block w-full pt-2 text-center text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                onClick={() => setStep("password")}
              >
                Use email and password instead
              </button>
            </>
          )}

          {step === "email-link" && (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We’ll email a one-tap link. No password to remember.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="ml-name">Your name (optional)</Label>
                <Input
                  id="ml-name"
                  className="h-12 text-base"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ml-email">Email</Label>
                <Input
                  id="ml-email"
                  type="email"
                  required
                  className="h-12 text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-14 w-full rounded-2xl bg-gradient-sunset text-base text-primary-foreground"
                disabled={loading}
              >
                {loading ? "Sending…" : "Send login link"}
              </Button>
              <button type="button" className="w-full text-sm text-muted-foreground" onClick={() => setStep("main")}>
                ← Back
              </button>
            </form>
          )}

          {step === "phone" && (
            <form onSubmit={otpSent ? handleVerifyPhone : handleSendPhoneCode} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Get a short code by SMS. Works with the same number you use for WhatsApp.
                (True one-tap WhatsApp login needs WhatsApp Business setup on the project.)
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="ph">Mobile number</Label>
                <Input
                  id="ph"
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  className="h-12 text-base"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={otpSent}
                />
              </div>
              {otpSent && (
                <div className="space-y-1.5">
                  <Label htmlFor="otp">Code from your phone</Label>
                  <Input
                    id="otp"
                    inputMode="numeric"
                    required
                    className="h-12 text-base tracking-widest"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
              )}
              <Button
                type="submit"
                size="lg"
                className="h-14 w-full rounded-2xl bg-[#25D366] text-base text-white hover:bg-[#1ebe5d]"
                disabled={loading}
              >
                {loading ? "Please wait…" : otpSent ? "Verify and continue" : "Send code"}
              </Button>
              {otpSent && (
                <button
                  type="button"
                  className="w-full text-sm text-muted-foreground"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                  }}
                >
                  Use a different number
                </button>
              )}
              <button type="button" className="w-full text-sm text-muted-foreground" onClick={() => setStep("main")}>
                ← Back
              </button>
            </form>
          )}

          {step === "password" && (
            <form
              onSubmit={isSignUp ? handlePasswordSignUp : handlePasswordSignIn}
              className="space-y-3"
            >
              <p className="text-sm text-muted-foreground">
                Passwords are easy to forget — prefer Google or an email link if you can.
              </p>
              {isSignUp && (
                <div className="space-y-1.5">
                  <Label htmlFor="su-name">Full name</Label>
                  <Input
                    id="su-name"
                    required
                    className="h-12 text-base"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="pw-email">Email</Label>
                <Input
                  id="pw-email"
                  type="email"
                  required
                  className="h-12 text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pw">Password</Label>
                <Input
                  id="pw"
                  type="password"
                  required
                  minLength={6}
                  className="h-12 text-base"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-14 w-full rounded-2xl bg-gradient-sunset text-base text-primary-foreground"
                disabled={loading}
              >
                {loading ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
              </Button>
              <div className="flex flex-col gap-2 text-center text-sm">
                <button type="button" className="text-muted-foreground hover:text-primary" onClick={() => setIsSignUp((v) => !v)}>
                  {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
                </button>
                {!isSignUp && (
                  <button type="button" className="text-muted-foreground hover:text-primary" onClick={handleReset}>
                    Forgot password?
                  </button>
                )}
                <button type="button" className="text-muted-foreground" onClick={() => setStep("main")}>
                  ← Back to easy sign-in
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
