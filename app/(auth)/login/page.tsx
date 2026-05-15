"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { LogIn, Shield, Users, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "member" | "">("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!role) {
      setError("Please select a role");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in relative min-h-[400px]">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
        <p className="text-muted-foreground text-sm">
          {step === 1 ? "Choose your role to sign in" : "Enter your credentials to continue"}
        </p>
      </div>

      {error && (
        <div className="p-3 mb-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
          {error}
        </div>
      )}

      {step === 1 ? (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 gap-4">
            <button
              type="button"
              onClick={() => {
                setRole("admin");
                setStep(2);
                setError("");
              }}
              className="p-5 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer border-border hover:border-primary hover:bg-primary/5 group"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">Admin</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Manage projects, teams, and analytics.</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole("member");
                setStep(2);
                setError("");
              }}
              className="p-5 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer border-border hover:border-accent hover:bg-accent/5 group"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors">Member</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">View your tasks and project progress.</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="p-1.5 -ml-1.5 rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium">
              Signing in as <strong className={role === "admin" ? "text-primary" : "text-accent capitalize"}>{role}</strong>
            </span>
          </div>

          <Input
            id="login-email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            id="login-password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            loading={loading}
            className="w-full"
            size="lg"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-muted-foreground mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
