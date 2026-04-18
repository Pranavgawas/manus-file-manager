import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cloud, ShieldCheck, Zap, Loader2, Eye, EyeOff } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();

  const loginMutation = trpc.simpleAuth.login.useMutation({
    onSuccess: () => {
      toast.success("Signed in successfully!");
      // Small delay to allow cookie to settle
      setTimeout(() => {
        window.location.href = "/files";
      }, 150);
    },
    onError: (error) => {
      toast.error(error.message || "Invalid username or password");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Please enter both username and password");
      return;
    }
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-primary/5 rounded-full blur-[180px]" />

      <div className="w-full max-w-[1100px] grid md:grid-cols-2 gap-8 items-center relative z-10 animate-fade-in">
        {/* Left Side: Branding */}
        <div className="hidden md:flex flex-col gap-8 p-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary rounded-2xl shadow-lg shadow-primary/30">
              <Cloud className="h-8 w-8 text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight">Manus Storage</span>
          </div>

          <div className="space-y-5">
            <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight text-foreground">
              Your files,{" "}
              <span className="text-primary italic">always within reach.</span>
            </h1>
            <p className="text-xl text-subtle leading-relaxed max-w-md">
              Manage photos, videos, documents and more — powered by Manus cloud storage.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-2">
            <div className="flex flex-col gap-2 p-4 rounded-2xl bg-muted/30 border border-border/40">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <ShieldCheck className="h-5 w-5" />
                <span>Secure</span>
              </div>
              <p className="text-sm text-subtle">S3-backed storage with encrypted sessions.</p>
            </div>
            <div className="flex flex-col gap-2 p-4 rounded-2xl bg-muted/30 border border-border/40">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Zap className="h-5 w-5" />
                <span>Fast</span>
              </div>
              <p className="text-sm text-subtle">Lightning-fast uploads and instant previews.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex justify-center">
          <Card className="w-full max-w-md shadow-2xl bg-card/90 backdrop-blur-xl border-border/60 animate-scale-in">
            <CardHeader className="text-center pb-4 pt-8">
              <div className="md:hidden flex justify-center mb-5">
                <div className="p-2.5 bg-primary rounded-xl shadow-lg shadow-primary/30">
                  <Cloud className="h-6 w-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl font-extrabold tracking-tight">Welcome Back</CardTitle>
              <CardDescription className="text-subtle text-sm mt-2">
                Sign in to access your secure storage
              </CardDescription>
            </CardHeader>

            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-semibold">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    autoFocus
                    disabled={loginMutation.isPending}
                    className="h-12 bg-background/60 border-border/60 focus:border-primary/60 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      disabled={loginMutation.isPending}
                      className="h-12 bg-background/60 border-border/60 focus:border-primary/60 transition-colors pr-12"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full h-13 text-base font-bold mt-2 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5 gap-2"
                  style={{ height: "52px" }}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <p className="text-center text-xs text-muted-foreground mt-6 leading-relaxed">
                Access is restricted to authorized users only.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
