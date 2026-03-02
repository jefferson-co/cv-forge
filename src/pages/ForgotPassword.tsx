import { useState } from "react";
import { Codepen, Mail, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success("Check your email for a reset link");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 surface-dark relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 dot-grid dot-grid-fade pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-8 shadow-glow animate-float">
            <Codepen className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-[hsl(var(--surface-dark-foreground))] mb-4 font-display">
            Don't worry
          </h2>
          <p className="text-lg text-[hsl(var(--surface-dark-muted))]">
            It happens to the best of us. We'll help you get back in.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-up">
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2 mb-12">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Codepen className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground font-display">Modiq</span>
            </Link>

            <h1 className="text-3xl font-bold text-foreground mb-2 font-display">
              Reset your password
            </h1>
            <p className="text-muted-foreground">
              {sent
                ? "We've sent a password reset link to your email"
                : "Enter your email and we'll send you a reset link"}
            </p>
          </div>

          {sent ? (
            <div className="space-y-6">
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm text-foreground">
                A reset link has been sent to <span className="font-semibold">{email}</span>. 
                Check your inbox and click the link to set a new password.
              </div>
              <Button variant="outline" size="lg" className="w-full h-11" onClick={() => setSent(false)}>
                Try a different email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10 h-11"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full h-11" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send reset link"}
                {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground mt-8">
            <Link to="/login" className="text-primary hover:underline font-medium inline-flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" />
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
