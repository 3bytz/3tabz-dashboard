"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [partialToken, setPartialToken] = useState("");
  const [showTotp, setShowTotp] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    if (!showTotp) {
      if (!email || !password) return;
      setLoading(true);
      try {
        const res = (await api.adminLogin(email, password)) as any;
        if (res?.totpRequired && res?.partialToken) {
          setPartialToken(res.partialToken);
          setShowTotp(true);
        } else if (res?.accessToken) {
          const expires = new Date(Date.now() + 8 * 60 * 60 * 1000).toUTCString()
          document.cookie = `admin_token=${res.accessToken}; expires=${expires}; path=/; SameSite=Lax`
          router.push("/");
        }
      } catch (e: any) {
        const msg = e?.message ?? "";
        if (
          msg.toLowerCase().includes("invalid") ||
          msg.toLowerCase().includes("credentials")
        ) {
          setError("Invalid email or password.");
        } else if (
          msg.toLowerCase().includes("suspended") ||
          msg.toLowerCase().includes("banned")
        ) {
          setError("This account has been suspended.");
        } else {
          setError(msg || "Sign in failed. Please try again.");
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    if (totp.length < 6) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setLoading(true);
    try {
      const totpRes = (await api.adminLogin(email, password, totp, partialToken)) as any;
      if (totpRes?.accessToken) {
        const expires = new Date(Date.now() + 8 * 60 * 60 * 1000).toUTCString()
        document.cookie = `admin_token=${totpRes.accessToken}; expires=${expires}; path=/; SameSite=Lax`
      }
      router.push("/");
    } catch (e: any) {
      const msg = e?.message ?? "";
      if (
        msg.toLowerCase().includes("totp") ||
        msg.toLowerCase().includes("code") ||
        msg.toLowerCase().includes("invalid")
      ) {
        setError("Invalid authenticator code. Please try again.");
        setTotp("");
      } else if (msg.toLowerCase().includes("expired")) {
        setError("Session expired. Please start again.");
        setShowTotp(false);
        setPartialToken("");
        setTotp("");
      } else {
        setError(msg || "Verification failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setShowTotp(false);
    setPartialToken("");
    setTotp("");
    setError("");
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center p-6">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(200,241,53,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(200,241,53,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 justify-center">
          <span className="font-display font-bold text-2xl tracking-tight text-white">
            3TAB<span className="text-[#C8F135]">Z</span>
          </span>
          <span className="text-xs text-[#525252] border border-white/8 px-1.5 py-0.5 ml-1">
            ADMIN
          </span>
        </div>

        {/* Card */}
        <div className="border border-white/8 bg-[#111] p-7">
          <h1 className="font-display font-bold text-lg text-white mb-1">
            {showTotp ? "Two-factor verification" : "Sign in to dashboard"}
          </h1>
          <p className="text-xs text-[#525252] mb-6">
            {showTotp
              ? "Enter the 6-digit code from your authenticator app."
              : "Admin access only. All sessions are logged."}
          </p>

          {!showTotp ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-[#525252]">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@3tabz.app"
                  autoComplete="email"
                  className="w-full bg-[#0a0a0a] border border-white/10 text-white text-sm px-3 py-2.5 outline-none focus:border-white/30 transition-colors placeholder:text-[#404040]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[#525252]">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    className="w-full bg-[#0a0a0a] border border-white/10 text-white text-sm px-3 py-2.5 pr-10 outline-none focus:border-white/30 transition-colors placeholder:text-[#404040]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#525252] hover:text-white transition-colors"
                  >
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-[#737373] bg-[#0a0a0a] border border-white/6 px-3 py-2 mb-4">
                <ShieldCheck
                  size={13}
                  className="text-[#C8F135] flex-shrink-0"
                />
                Signed in as {email}
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[#525252]">
                  Authenticator code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={totp}
                  onChange={(e) => setTotp(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) =>
                    e.key === "Enter" && totp.length === 6 && handleSubmit()
                  }
                  placeholder="000000"
                  autoFocus
                  autoComplete="one-time-code"
                  className="w-full bg-[#0a0a0a] border border-white/10 text-white text-2xl font-display font-bold tracking-[0.5em] px-3 py-3 outline-none focus:border-[#C8F135] transition-colors placeholder:text-[#333] text-center"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="mt-3 text-xs text-red-400 border border-red-900 bg-red-950/30 px-3 py-2">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={
              loading || !email || !password || (showTotp && totp.length < 6)
            }
            className="w-full mt-5 bg-[#C8F135] text-black text-sm font-bold py-2.5 hover:bg-[#A8D015] transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-display tracking-wide"
          >
            {loading
              ? "Verifying…"
              : showTotp
                ? "Verify & sign in"
                : "Continue →"}
          </button>

          {showTotp && (
            <button
              onClick={goBack}
              className="w-full mt-2 text-xs text-[#525252] hover:text-white py-1 transition-colors"
            >
              ← Back to login
            </button>
          )}
        </div>

        <p className="text-center text-xs text-[#333] mt-5">
          3TABZ Admin · Authorised access only
        </p>
      </div>
    </div>
  );
}