"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle, Flame } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin mb-3" style={{ color: "hsl(42 95% 55%)" }} />
          <p style={{ color: "hsl(215 20% 55%)", fontFamily: "var(--font-sans)", fontSize: "1rem" }}>
            Loading...
          </p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/auctions";

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p
          className="mb-2 uppercase tracking-widest"
          style={{
            color: "hsl(42 95% 55%)",
            fontFamily: "var(--font-sans), sans-serif",
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.15em",
          }}
        >
          Welcome Back
        </p>
        <h1
          style={{
            fontFamily: "var(--font-bodoni), serif",
            fontSize: "2.6rem",
            fontWeight: 800,
            color: "hsl(213 31% 92%)",
            lineHeight: 1.15,
          }}
        >
          Sign In
        </h1>
        <p
          className="mt-2"
          style={{
            color: "hsl(215 20% 50%)",
            fontFamily: "var(--font-baskerville), serif",
            fontSize: "1.05rem",
            fontStyle: "italic",
          }}
        >
          Access your CampusBid account.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div
          className="flex items-start gap-3 p-4 rounded-xl mb-6 animate-slide-up"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
          }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "hsl(0 84% 60%)" }} />
          <p
            style={{
              color: "hsl(0 84% 70%)",
              fontFamily: "var(--font-sans), sans-serif",
              fontSize: "0.95rem",
            }}
          >
            {error}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block mb-2"
            style={{
              color: "hsl(213 31% 80%)",
              fontFamily: "var(--font-baskerville), serif",
              fontSize: "1rem",
              fontWeight: 700,
            }}
          >
            College Email
          </label>
          <div className="relative">
            <Mail
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "hsl(215 20% 40%)" }}
            />
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@university.edu"
              className="input-base pl-11"
              autoComplete="email"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="password"
              style={{
                color: "hsl(213 31% 80%)",
                fontFamily: "var(--font-baskerville), serif",
                fontSize: "1rem",
                fontWeight: 700,
              }}
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="transition-colors"
              style={{
                color: "hsl(215 20% 45%)",
                fontFamily: "var(--font-sans), sans-serif",
                fontSize: "0.85rem",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "hsl(42 95% 55%)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "hsl(215 20% 45%)";
              }}
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "hsl(215 20% 40%)" }}
            />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className="input-base pl-11 pr-12"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded transition-colors hover:bg-white/5"
              style={{ color: "hsl(215 20% 40%)" }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          id="login-submit"
          disabled={isLoading}
          className="btn btn-primary w-full mt-2"
          style={{ padding: "0.9rem 1.5rem", fontSize: "1.1rem" }}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              <Flame className="w-5 h-5" />
              Sign In
            </>
          )}
        </button>
      </form>

      <p
        className="text-center mt-7"
        style={{
          color: "hsl(215 20% 48%)",
          fontFamily: "var(--font-baskerville), serif",
          fontSize: "1rem",
        }}
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-bold transition-colors"
          style={{ color: "hsl(42 95% 55%)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "hsl(42 95% 70%)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "hsl(42 95% 55%)";
          }}
        >
          Create one free
        </Link>
      </p>
    </div>
  );
}
