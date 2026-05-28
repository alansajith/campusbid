"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  GraduationCap,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Flame,
  RefreshCw,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { isEduEmail, extractUniversityFromEmail } from "@/lib/utils";

// ─── Math CAPTCHA Generator ──────────────────────────────────────────────────
function generateCaptcha() {
  const a = Math.floor(Math.random() * 15) + 3;
  const b = Math.floor(Math.random() * 10) + 2;
  const ops = ["+", "-", "×"] as const;
  const op = ops[Math.floor(Math.random() * ops.length)];
  let answer: number;
  if (op === "+") answer = a + b;
  else if (op === "-") answer = a - b;
  else answer = a * b;
  return { question: `${a} ${op} ${b} = ?`, answer };
}

// ─── Types ───────────────────────────────────────────────────────────────────
type Stage = "form" | "otp";

export default function RegisterPage() {
  const router = useRouter();

  // Stage control
  const [stage, setStage] = useState<Stage>("form");

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [detectedUniversity, setDetectedUniversity] = useState<string | null>(null);

  // CAPTCHA state — initialized client-side only to avoid SSR hydration mismatch
  const [captcha, setCaptcha] = useState<{ question: string; answer: number } | null>(null);
  const [captchaInput, setCaptchaInput] = useState("");

  // Generate CAPTCHA after mount (client-only, avoids hydration mismatch)
  useEffect(() => {
    setCaptcha(generateCaptcha());
  }, []);

  // OTP state
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);

  // Shared state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [bypassOtp, setBypassOtp] = useState<string | null>(null);

  // Refresh CAPTCHA
  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
  };

  // Email detection
  function handleEmailChange(value: string) {
    setEmail(value);
    if (isEduEmail(value) && value.includes("@")) {
      setDetectedUniversity(extractUniversityFromEmail(value));
    } else {
      setDetectedUniversity(null);
    }
  }

  // Resend cooldown countdown
  const startCooldown = useCallback(() => {
    setResendCooldown(60);
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // ─── Stage 1: submit form, verify captcha, send OTP ──────────────────────
  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isEduEmail(email)) {
      setError("Please use a valid college email (.edu, .ac.in, etc.) to verify student status.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!captcha) {
      setError("Security check not loaded. Please wait or refresh.");
      return;
    }
    if (parseInt(captchaInput) !== captcha.answer) {
      setError("Incorrect CAPTCHA answer. Please try again.");
      refreshCaptcha();
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send verification email.");
        return;
      }
      startCooldown();
      setStage("otp");
      if (data.devBypass && data.otp) {
        setOtpDigits(data.otp.split(""));
        setBypassOtp(data.otp);
        setSuccessMsg(null);
      } else {
        setBypassOtp(null);
        setSuccessMsg(`Verification code sent to ${email}`);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // ─── OTP digit input handling ─────────────────────────────────────────────
  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return; // digits only
    const updated = [...otpDigits];
    updated[index] = value.slice(-1); // only last char
    setOtpDigits(updated);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtpDigits(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
    e.preventDefault();
  }

  // ─── Stage 2: verify OTP then register ───────────────────────────────────
  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const otp = otpDigits.join("");
    if (otp.length < 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }

    setIsVerifying(true);
    try {
      // Verify OTP
      const verifyRes = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        setError(verifyData.error || "Invalid verification code.");
        return;
      }

      // Register account
      const regRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const regData = await regRes.json();
      if (!regRes.ok) {
        setError(regData.error || "Registration failed.");
        return;
      }

      // Auto sign-in
      const { signIn } = await import("next-auth/react");
      await signIn("credentials", {
        email,
        password,
        callbackUrl: "/auctions",
        redirect: true,
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  }

  // ─── Resend OTP ───────────────────────────────────────────────────────────
  async function handleResend() {
    if (resendCooldown > 0) return;
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to resend code.");
        return;
      }
      startCooldown();
      if (data.devBypass && data.otp) {
        setOtpDigits(data.otp.split(""));
        setBypassOtp(data.otp);
        setSuccessMsg(null);
      } else {
        setBypassOtp(null);
        setOtpDigits(["", "", "", "", "", ""]);
        setSuccessMsg("New code sent! Check your inbox.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
  }

  // ─── Shared style vars ────────────────────────────────────────────────────
  const labelStyle = {
    color: "hsl(213 31% 80%)",
    fontFamily: "var(--font-baskerville), serif",
    fontSize: "1rem",
    fontWeight: 700,
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // OTP Stage
  // ═══════════════════════════════════════════════════════════════════════════
  if (stage === "otp") {
    return (
      <div>
        {/* Header */}
        <div className="mb-7">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)" }}
          >
            <ShieldCheck className="w-3.5 h-3.5" style={{ color: "hsl(142 71% 50%)" }} />
            <span style={{ color: "hsl(142 71% 60%)", fontFamily: "var(--font-sans)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Step 2 of 2 — Email Verification
            </span>
          </div>
          <h1 style={{ fontFamily: "var(--font-bodoni), serif", fontSize: "2.2rem", fontWeight: 800, color: "hsl(213 31% 92%)", lineHeight: 1.15 }}>
            Check Your Inbox
          </h1>
          <p className="mt-2" style={{ color: "hsl(215 20% 50%)", fontFamily: "var(--font-baskerville), serif", fontSize: "1rem", fontStyle: "italic" }}>
            We sent a 6-digit code to{" "}
            <span style={{ color: "hsl(42 95% 60%)", fontStyle: "normal", fontWeight: 700 }}>
              {email}
            </span>
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl mb-5 animate-slide-up"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "hsl(0 84% 60%)" }} />
            <p style={{ color: "hsl(0 84% 70%)", fontFamily: "var(--font-sans), sans-serif", fontSize: "0.9rem" }}>{error}</p>
          </div>
        )}

        {/* Bypass OTP Banner — shown when email delivery is simulated */}
        {bypassOtp && (
          <div className="p-4 rounded-xl mb-5 animate-slide-up"
            style={{ background: "rgba(245,167,30,0.08)", border: "1.5px solid rgba(245,167,30,0.35)" }}>
            <p style={{ color: "hsl(42 95% 70%)", fontFamily: "var(--font-sans), sans-serif", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>
              ⚠ Email delivery unavailable — your code is shown below
            </p>
            <p style={{ color: "hsl(42 95% 90%)", fontFamily: "'Courier New', monospace", fontSize: "2rem", fontWeight: 900, letterSpacing: "0.3em", margin: 0 }}>
              {bypassOtp}
            </p>
            <p style={{ color: "hsl(42 80% 55%)", fontFamily: "var(--font-sans), sans-serif", fontSize: "0.78rem", marginTop: "6px" }}>
              The boxes above are already filled — just click Verify &amp; Create Account.
            </p>
          </div>
        )}

        {/* Success */}
        {successMsg && (
          <div className="flex items-start gap-3 p-4 rounded-xl mb-5 animate-slide-up"
            style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "hsl(142 71% 50%)" }} />
            <p style={{ color: "hsl(142 71% 60%)", fontFamily: "var(--font-sans), sans-serif", fontSize: "0.9rem" }}>{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleOtpSubmit} className="space-y-6">
          {/* 6-digit OTP input boxes */}
          <div>
            <label className="block mb-3" style={labelStyle}>Verification Code</label>
            <div className="flex gap-3 justify-center" onPaste={handleOtpPaste}>
              {otpDigits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold rounded-xl outline-none transition-all duration-150"
                  style={{
                    background: "hsl(222 40% 8%)",
                    border: digit ? "2px solid hsl(42 95% 55%)" : "1.5px solid rgba(255,255,255,0.1)",
                    color: "hsl(213 31% 92%)",
                    fontFamily: "var(--font-bodoni), serif",
                    boxShadow: digit ? "0 0 0 3px rgba(245,167,30,0.15)" : "none",
                  }}
                />
              ))}
            </div>
            <p className="text-center mt-3" style={{ color: "hsl(215 20% 40%)", fontFamily: "var(--font-sans)", fontSize: "0.85rem" }}>
              Code expires in 10 minutes
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isVerifying || otpDigits.join("").length < 6}
            className="btn btn-primary w-full"
            style={{ padding: "0.9rem 1.5rem", fontSize: "1.1rem" }}
          >
            {isVerifying ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Verifying…</>
            ) : (
              <><ShieldCheck className="w-5 h-5" /> Verify & Create Account <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        {/* Resend */}
        <div className="flex items-center justify-center gap-2 mt-5">
          <p style={{ color: "hsl(215 20% 48%)", fontFamily: "var(--font-sans)", fontSize: "0.9rem" }}>
            Didn&apos;t receive it?
          </p>
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="flex items-center gap-1 transition-colors"
            style={{
              color: resendCooldown > 0 ? "hsl(215 20% 35%)" : "hsl(42 95% 55%)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.9rem",
              fontWeight: 700,
              background: "none",
              border: "none",
              cursor: resendCooldown > 0 ? "not-allowed" : "pointer",
            }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
          </button>
        </div>

        {/* Back */}
        <p className="text-center mt-4" style={{ color: "hsl(215 20% 38%)", fontFamily: "var(--font-sans)", fontSize: "0.85rem" }}>
          <button onClick={() => { setStage("form"); setError(null); setSuccessMsg(null); }}
            style={{ color: "hsl(215 20% 50%)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
            ← Back to form
          </button>
        </p>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Stage 1: Registration Form
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div>
      {/* Header */}
      <div className="mb-7">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
          style={{ background: "rgba(245,167,30,0.08)", border: "1px solid rgba(245,167,30,0.2)" }}
        >
          <span style={{ color: "hsl(42 95% 55%)", fontFamily: "var(--font-sans)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Step 1 of 2 — Your Details
          </span>
        </div>
        <h1 style={{ fontFamily: "var(--font-bodoni), serif", fontSize: "2.4rem", fontWeight: 800, color: "hsl(213 31% 92%)", lineHeight: 1.15 }}>
          Create Account
        </h1>
        <p className="mt-2" style={{ color: "hsl(215 20% 50%)", fontFamily: "var(--font-baskerville), serif", fontSize: "1rem", fontStyle: "italic" }}>
          College email required. OTP will be sent for verification.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl mb-5 animate-slide-up"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "hsl(0 84% 60%)" }} />
          <p style={{ color: "hsl(0 84% 70%)", fontFamily: "var(--font-sans), sans-serif", fontSize: "0.9rem", lineHeight: 1.5 }}>{error}</p>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-4">

        {/* Full Name */}
        <div>
          <label htmlFor="name" className="block mb-2" style={labelStyle}>Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(215 20% 40%)" }} />
            <input
              id="name"
              type="text"
              required
              placeholder="Jordan Smith"
              className="input-base pl-11"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>
        </div>

        {/* College Email */}
        <div>
          <label htmlFor="email" className="block mb-2" style={labelStyle}>
            College Email{" "}
            <span style={{ color: "hsl(215 20% 42%)", fontFamily: "var(--font-sans)", fontSize: "0.8rem", fontWeight: 400 }}>
              (.edu, .ac.in)
            </span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(215 20% 40%)" }} />
            <input
              id="email"
              type="email"
              required
              placeholder="you@university.edu"
              className="input-base pl-11 pr-11"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              autoComplete="email"
            />
            {isEduEmail(email) && email.includes("@") && (
              <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(142 71% 50%)" }} />
            )}
          </div>
          {detectedUniversity && (
            <div className="flex items-center gap-2.5 mt-2.5 px-3.5 py-2.5 rounded-lg animate-slide-up"
              style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
              <GraduationCap className="w-4 h-4 flex-shrink-0" style={{ color: "hsl(142 71% 50%)" }} />
              <span style={{ color: "hsl(142 71% 60%)", fontFamily: "var(--font-sans)", fontSize: "0.9rem", fontWeight: 600 }}>
                Detected: {detectedUniversity}
              </span>
            </div>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block mb-2" style={labelStyle}>Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(215 20% 40%)" }} />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              placeholder="Min. 8 characters"
              className="input-base pl-11 pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded transition-colors hover:bg-white/5"
              style={{ color: "hsl(215 20% 40%)" }} aria-label="Toggle password">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block mb-2" style={labelStyle}>Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(215 20% 40%)" }} />
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              required
              placeholder="Repeat your password"
              className="input-base pl-11"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </div>

        {/* ── CAPTCHA ─────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="captcha" style={labelStyle}>Security Check</label>
            <button type="button" onClick={refreshCaptcha}
              className="flex items-center gap-1 text-xs transition-colors hover:opacity-80"
              style={{ color: "hsl(215 20% 40%)", fontFamily: "var(--font-sans)", background: "none", border: "none", cursor: "pointer" }}>
              <RefreshCw className="w-3 h-3" /> New question
            </button>
          </div>
          <div
            className="flex items-center gap-4 p-4 rounded-xl mb-3"
            style={{ background: "rgba(245,167,30,0.05)", border: "1px solid rgba(245,167,30,0.15)" }}
          >
            <div className="flex-1">
              <p style={{ fontFamily: "var(--font-bodoni), serif", fontSize: "1.4rem", fontWeight: 800, color: "hsl(42 95% 60%)", letterSpacing: "0.05em" }}>
                {captcha ? captcha.question : "Loading..."}
              </p>
              <p style={{ color: "hsl(215 20% 40%)", fontFamily: "var(--font-sans)", fontSize: "0.75rem", marginTop: "2px" }}>
                Prove you&apos;re human
              </p>
            </div>
            <input
              id="captcha"
              type="number"
              required
              placeholder="Answer"
              className="input-base"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              style={{ width: "100px", textAlign: "center", fontFamily: "var(--font-bodoni), serif", fontSize: "1.2rem" }}
            />
          </div>
        </div>

        {/* Terms */}
        <p style={{ color: "hsl(215 20% 42%)", fontFamily: "var(--font-sans)", fontSize: "0.88rem", lineHeight: 1.5 }}>
          By creating an account, you agree to our{" "}
          <Link href="#" className="underline" style={{ color: "hsl(42 95% 50%)" }}>Terms of Service</Link>
          {" "}and{" "}
          <Link href="#" className="underline" style={{ color: "hsl(42 95% 50%)" }}>Privacy Policy</Link>.
        </p>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full"
          style={{ padding: "0.9rem 1.5rem", fontSize: "1.1rem" }}
        >
          {isLoading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Sending code…</>
          ) : (
            <><Flame className="w-5 h-5" /> Send Verification Code <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>

      <p className="text-center mt-7" style={{ color: "hsl(215 20% 48%)", fontFamily: "var(--font-baskerville)", fontSize: "1rem" }}>
        Already have an account?{" "}
        <Link href="/login" className="font-bold" style={{ color: "hsl(42 95% 55%)" }}>Sign in</Link>
      </p>
    </div>
  );
}
