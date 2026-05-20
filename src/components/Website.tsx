"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Eye, EyeOff, X, Check, Lock, IdCard, HelpCircle, Mail } from "lucide-react";
import norbielinkLogoDark from "@/assets/norbielink-logo-dark.png";
import btisLogoDark from "@/assets/btislogo-dark.png";
import loginN from "@/assets/login-n.svg";

const FONT = "var(--font-montserrat), Montserrat, sans-serif";

type Step = "login" | "verify" | "create" | "reset";

interface WebsiteProps {
  isDark?: boolean;
}

export default function Website({ isDark = false }: WebsiteProps) {
  const [step, setStep] = useState<Step>("login");
  const [toast, setToast] = useState<{ title: string; description: string } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  const c = {
    text:    isDark ? "#F9FAFB" : "#1F2937",
    muted:   isDark ? "#8B8FA8" : "#6B7280",
    cardBg:  isDark ? "#191D35" : "#fff",
    border:  isDark ? "rgba(255,255,255,0.22)" : "#D1D5DB",
    inputBg: isDark ? "rgba(255,255,255,0.05)" : "#fff",
  };
  const font = { fontFamily: FONT } as React.CSSProperties;
  const btnGrad = isDark
    ? "radial-gradient(171.32% 99.33% at 33.13% -9%, #282550 0%, #191735 55.82%, rgba(0,0,0,0.3) 74%, rgba(0,0,0,0) 100%), linear-gradient(88.34deg, #5C2ED4 0.11%, #A614C3 63.8%)"
    : "linear-gradient(90deg,#5C2ED4 0%,#A614C3 65%)";

  const inputStyle: React.CSSProperties = {
    fontFamily: FONT,
    background: c.inputBg,
    border: `1px solid ${c.border}`,
    color: c.text,
    padding: "10px 14px",
    borderRadius: 10,
    fontSize: 13,
    width: "100%",
    outline: "none",
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: FONT,
    color: "#6B7280",
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 6,
    display: "block",
  };

  const primaryBtnStyle = (enabled: boolean): React.CSSProperties => ({
    fontFamily: FONT,
    background: btnGrad,
    padding: "12px 28px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    border: "none",
    color: "#fff",
    width: "100%",
    opacity: enabled ? 1 : 0.5,
    cursor: enabled ? "pointer" : "not-allowed",
    boxShadow: enabled ? "0 4px 14px rgba(166,20,195,0.25)" : "none",
    transition: "all 0.15s",
  });

  const topBarBg     = "linear-gradient(180deg, #26125A 0%, #29125C 100%)";
  const leftPanelBg  = "linear-gradient(180.36deg, #231258 0.33%, #A720C1 99.29%)";

  return (
    <div className="flex w-full overflow-hidden relative" style={{ ...font, height: "100%" }}>
      {/* LEFT brand panel — full height purple. Logo + powered-by at top, N graphic at bottom. */}
      <div
        className="relative flex-shrink-0 overflow-hidden flex flex-col"
        style={{ width: "33.3333%", maxWidth: 460, background: leftPanelBg }}
      >
        {/* Brand block */}
        <div className="relative z-20 px-10 pt-10 flex-shrink-0">
          <div className="flex flex-col" style={{ width: "fit-content" }}>
            <Image src={norbielinkLogoDark} alt="Norbielink" className="w-auto" style={{ height: 57.6 }} priority />
            <div
              className="flex items-center gap-3 justify-end mt-4 w-full"
              style={{ paddingRight: 10 }}
            >
              <span
                className="text-[12px] tracking-[0.22em] uppercase font-medium"
                style={{ color: "rgba(255,255,255,0.78)" }}
              >
                POWERED BY
              </span>
              <Image src={btisLogoDark} alt="btis" className="h-9 w-auto" />
            </div>
          </div>
        </div>

        {/* N graphic anchored bottom-left */}
        <Image
          src={loginN}
          alt="N Logo"
          className="absolute pointer-events-none select-none"
          sizes="33vw"
          style={{ left: 0, bottom: 0, width: "100%", height: "auto", maxHeight: "70%" }}
        />
      </div>

      {/* RIGHT side — top purple bar over white form */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Top bar (only over the right side, not across the left) */}
        <header
          className="flex-shrink-0"
          style={{ height: 52, background: topBarBg }}
        />

        {/* White form panel */}
        <div
          className="flex-1 flex flex-col items-center justify-center overflow-y-auto relative"
          style={{ background: c.cardBg, padding: "48px" }}
        >
        {/* Step indicator (top-right) — clickable for demo navigation */}
        <div className="absolute top-6 right-8 flex items-center gap-2">
          {(["login", "reset", "verify", "create"] as Step[]).map((s, i) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              className="rounded-full transition-all"
              style={{
                width: step === s ? 22 : 8,
                height: 8,
                background: step === s ? btnGrad : c.border,
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
              aria-label={`Step ${i + 1}`}
            />
          ))}
        </div>

          <div className="w-full" style={{ maxWidth: 520 }}>
            {step === "login"  && <LoginView  c={c} font={font} inputStyle={inputStyle} labelStyle={labelStyle} primaryBtnStyle={primaryBtnStyle} btnGrad={btnGrad}
              onContinue={() => setStep("verify")}
              onResetLinkClicked={() => setStep("reset")}
              onResetEmailSent={(email, mode) => {
                if (mode === "userId") {
                  setToast({ title: "Email sent", description: `Your User ID has been sent to ${email || "your inbox"}.` });
                } else {
                  setToast({ title: "Email sent", description: `We sent a password reset link to ${email || "your inbox"}. Open it to set a new password.` });
                  setStep("reset");
                }
              }}
            />}
            {step === "verify" && <VerifyView c={c} font={font} primaryBtnStyle={primaryBtnStyle} btnGrad={btnGrad} onVerify={() => setStep("create")} />}
            {step === "create" && <CreateView c={c} font={font} inputStyle={inputStyle} labelStyle={labelStyle} primaryBtnStyle={primaryBtnStyle} btnGrad={btnGrad} isDark={isDark} onContinue={() => setStep("login")} />}
            {step === "reset"  && <ResetPasswordView c={c} font={font} inputStyle={inputStyle} labelStyle={labelStyle} primaryBtnStyle={primaryBtnStyle} btnGrad={btnGrad} isDark={isDark} onContinue={() => setStep("login")} />}
          </div>

          {/* Toast — top-right of the form panel, below the step indicator */}
          {toast && (
            <div className="absolute z-50"
              style={{
                top: 56, right: 32, maxWidth: 360,
                fontFamily: FONT,
                background: c.cardBg,
                border: `1px solid ${c.border}`,
                borderRadius: 12,
                boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                padding: "12px 14px",
                animation: "slideInRight 0.25s ease-out",
              }}>
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center flex-shrink-0"
                  style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(166,20,195,0.08)" }}>
                  <Mail className="w-4 h-4" style={{ color: "#A614C3" }} strokeWidth={1.75} />
                </span>
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{toast.title}</div>
                  <div style={{ fontSize: 12, color: c.muted, marginTop: 2, lineHeight: "16px" }}>{toast.description}</div>
                </div>
                <button onClick={() => setToast(null)}
                  className="flex-shrink-0 transition-colors"
                  style={{ background: "transparent", border: "none", color: c.muted, cursor: "pointer", padding: 2 }}
                  aria-label="Dismiss">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────── LOGIN ──────────────────────────── */
function LoginView({ c, font, inputStyle, labelStyle, primaryBtnStyle, btnGrad, onContinue, onResetLinkClicked, onResetEmailSent }: {
  c: Record<string, string>;
  font: React.CSSProperties;
  inputStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
  primaryBtnStyle: (enabled: boolean) => React.CSSProperties;
  btnGrad: string;
  onContinue: () => void;
  onResetLinkClicked: () => void;
  onResetEmailSent: (email: string, mode: "password" | "userId" | "both") => void;
}) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  // Demo: always allow Continue. Production would require identifier + password.
  const enabled = true;

  return (
    <>
      <h1 className="mb-3" style={{ ...font, fontSize: 32, fontWeight: 600, lineHeight: "38px", color: c.text }}>
        Welcome to{" "}
        <span
          style={{
            background: btnGrad,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          NorbieLink!
        </span>
      </h1>
      <p className="mb-8" style={{ ...font, fontSize: 14, color: c.muted }}>
        Sign in to continue to your account.
      </p>

      <div className="mb-5">
        <label style={labelStyle}>User ID</label>
        <input type="text" value={identifier} onChange={e => setIdentifier(e.target.value)}
          placeholder="Enter your email or User ID"
          style={inputStyle} />
      </div>

      <div className="mb-5">
        <label style={labelStyle}>Password</label>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ ...inputStyle, paddingRight: 40 }}
          />
          <button
            type="button"
            onClick={() => setShowPw(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            style={{ color: c.muted, background: "transparent", border: "none", padding: 0, lineHeight: 0 }}
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <label className="flex items-center gap-2 mb-7 cursor-pointer select-none" style={{ ...font, fontSize: 13, color: c.muted }}>
        <input
          type="checkbox"
          checked={remember}
          onChange={e => setRemember(e.target.checked)}
          className="sr-only"
        />
        <span
          className="flex-shrink-0 flex items-center justify-center"
          style={{
            width: 16,
            height: 16,
            borderRadius: 4,
            border: `1.5px solid ${remember ? "transparent" : c.border}`,
            background: remember ? btnGrad : "transparent",
          }}
        >
          {remember && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
        </span>
        Remember me
      </label>

      <button type="button" disabled={!enabled} onClick={onContinue} style={primaryBtnStyle(enabled)}>
        Continue
      </button>

      <div className="mt-5" style={{ ...font, fontSize: 13, color: c.muted }}>
        Forgot your User ID or password?{" "}
        <button
          type="button"
          onClick={() => setResetOpen(true)}
          className="underline cursor-pointer"
          style={{
            background: btnGrad,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            border: "none",
            padding: 0,
            fontWeight: 700,
            fontFamily: FONT,
            fontSize: 13,
            textUnderlineOffset: 3,
          }}
        >
          Reset
        </button>
      </div>

      {resetOpen && (
        <ResetModal
          c={c}
          font={font}
          inputStyle={inputStyle}
          labelStyle={labelStyle}
          btnGrad={btnGrad}
          onClose={() => setResetOpen(false)}
          onSimulateEmailClick={() => { setResetOpen(false); onResetLinkClicked(); }}
          onEmailSent={(email, mode) => { setResetOpen(false); onResetEmailSent(email, mode); }}
        />
      )}
    </>
  );
}

/* ──────────────────────────── RESET MODAL (3-step wizard) ──────────────────────────── */
type ResetMode = "password" | "userId" | "both";
type ResetStep = "choose" | "form" | "done";

function ResetModal({ c, font, inputStyle, labelStyle, btnGrad, onClose, onSimulateEmailClick, onEmailSent }: {
  c: Record<string, string>;
  font: React.CSSProperties;
  inputStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
  btnGrad: string;
  onClose: () => void;
  onSimulateEmailClick: () => void;
  onEmailSent: (email: string, mode: ResetMode) => void;
}) {
  const [step, setStep] = useState<ResetStep>("choose");
  const [mode, setMode] = useState<ResetMode>("password");
  const [userIdValue, setUserIdValue] = useState("");
  const [emailValue, setEmailValue] = useState("");

  const handleContinue = () => {
    if (step === "choose") { setStep("form"); return; }
    if (step === "form")   {
      // Submitting the form "sends the email" — close the modal and toast at the page level.
      onEmailSent(emailValue, mode);
      return;
    }
  };
  const handleBack = () => {
    if (step === "form") { setStep("choose"); return; }
  };

  // Mode-specific copy for the form step.
  const formCopy = {
    password: {
      title: "Reset Your Password",
      body:  "Enter your User ID and the email associated with your account. We'll send you a reset link.",
      fields: "both",
    },
    userId: {
      title: "Retrieve Your User ID",
      body:  "Enter the email associated with your account. If your email is on record, we'll email you your User ID.",
      fields: "emailOnly",
    },
    both: {
      title: "Recover Your Account",
      body:  "Enter the email associated with your account. We'll email you your User ID plus a password reset link in one message.",
      fields: "emailOnly",
    },
  } as const;

  // Demo: always allow Continue. Production would gate on filled / valid email & User ID.
  const formValid = true;

  // Per-mode done-step description.
  const doneDescription = mode === "userId"
    ? `If ${emailValue || "your email"} is on record, we've sent your User ID.`
    : mode === "both"
      ? `If ${emailValue || "your email"} is on record, we've sent your User ID and a password reset link.`
      : `If ${emailValue || "your email"} is on record, we've sent a password reset link.`;

  // Refined tile picker: small leading icon chip + label/sub + trailing radio dot.
  // Matches the visual weight of other modals (Book Roll, Doc Upload).
  const tile = (key: ResetMode, label: string, sub: string, Icon: typeof Lock) => {
    const active = mode === key;
    return (
      <button
        key={key}
        type="button"
        onClick={() => setMode(key)}
        className="flex items-center gap-3 w-full text-left transition-colors"
        style={{
          ...font,
          padding: "12px 14px",
          borderRadius: 12,
          border: `1px solid ${active ? "#A614C3" : c.border}`,
          background: active ? "rgba(166,20,195,0.04)" : "transparent",
          cursor: "pointer",
        }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(0,0,0,0.025)"; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
      >
        <span className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 34, height: 34, borderRadius: 9,
            background: "rgba(166,20,195,0.08)",
          }}>
          <Icon className="w-[18px] h-[18px]" style={{ color: "#A614C3" }} strokeWidth={1.75} />
        </span>
        <div className="flex-1 min-w-0">
          <div style={{ fontSize: 13, fontWeight: 600, color: c.text, lineHeight: "18px" }}>{label}</div>
          <div style={{ fontSize: 12, color: c.muted, marginTop: 2, lineHeight: "16px" }}>{sub}</div>
        </div>
        <span className="flex-shrink-0 flex items-center justify-center"
          style={{
            width: 16, height: 16, borderRadius: 9999,
            border: `1.5px solid ${active ? "#A614C3" : c.border}`,
            background: "transparent",
          }}>
          {active && <span style={{ width: 8, height: 8, borderRadius: 9999, background: "#A614C3" }} />}
        </span>
      </button>
    );
  };

  const titleNode = step === "choose"
    ? <>Reset Your <span style={{
        background: btnGrad,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}>Account</span></>
    : step === "form" ? formCopy[mode].title
    : "Check Your Inbox";

  const subhead = step === "choose" ? "What do you need help with?"
                 : step === "form" ? formCopy[mode].body
                 : doneDescription;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl flex flex-col"
        style={{
          fontFamily: FONT,
          background: c.cardBg,
          border: `1px solid ${c.border}`,
          width: "min(520px, 92vw)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.20)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header — compact, matches the Book Roll / Doc Upload pattern */}
        <div className="flex items-start justify-between px-6 pt-5 pb-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-[16px] font-bold" style={{ color: c.text, lineHeight: "22px" }}>
              {titleNode}
            </h3>
            <p style={{ ...font, fontSize: 13, color: c.muted, marginTop: 4, lineHeight: "18px" }}>{subhead}</p>
          </div>
          <button type="button" onClick={onClose}
            className="flex-shrink-0 transition-colors"
            style={{ background: "transparent", border: "none", color: c.muted, cursor: "pointer", marginLeft: 12, padding: 2 }}
            aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-4">
          {step === "choose" && (
            <div className="flex flex-col gap-2">
              {tile("password", "I forgot my password", "I know my User ID — just set a new password.",         Lock)}
              {tile("userId",   "I forgot my User ID",  "I know my email — send me my User ID.",                IdCard)}
              {tile("both",     "I forgot both",        "Send me my User ID and a password reset link.",        HelpCircle)}
            </div>
          )}

          {step === "form" && formCopy[mode].fields === "both" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>User ID</label>
                <input type="text" value={userIdValue} onChange={e => setUserIdValue(e.target.value)}
                  autoFocus style={inputStyle} placeholder="firstname.lastname" />
              </div>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input type="email" value={emailValue} onChange={e => setEmailValue(e.target.value)}
                  style={inputStyle} placeholder="you@company.com" />
              </div>
            </div>
          )}

          {step === "form" && formCopy[mode].fields === "emailOnly" && (
            <div>
              <label style={labelStyle}>Email Address</label>
              <input type="email" value={emailValue} onChange={e => setEmailValue(e.target.value)}
                autoFocus style={inputStyle} placeholder="you@company.com" />
            </div>
          )}

          {step === "done" && (
            <div className="flex flex-col items-center text-center py-4">
              <div className="flex items-center justify-center"
                style={{ width: 56, height: 56, borderRadius: 28, background: "rgba(166,20,195,0.08)", marginBottom: 14 }}>
                <Mail className="w-6 h-6" style={{ color: "#A614C3" }} strokeWidth={2} />
              </div>
              <div style={{ ...font, fontSize: 12, color: c.muted, maxWidth: 360, marginBottom: 10 }}>
                Didn&apos;t get it? Check spam, or try again in a minute.
              </div>
              {mode !== "userId" && (
                <div style={{ ...font, fontSize: 11, color: c.muted, maxWidth: 360, fontStyle: "italic" }}>
                  Demo: click <span style={{ fontWeight: 600 }}>Open Reset Link</span> below to simulate clicking the link from the email.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer — secondary action on the left, primary on the right */}
        <div className="flex items-center justify-between gap-2 px-6 pb-5 pt-2">
          {step === "choose" && (
            <>
              <button onClick={onClose}
                className="px-4 py-2 rounded-lg text-[12px] font-medium transition-all"
                style={{ ...font, border: `1px solid ${c.border}`, color: c.text, background: "transparent", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleContinue}
                className="px-4 py-2 rounded-lg text-[12px] font-semibold text-white transition-all"
                style={{ ...font, background: btnGrad, border: "none", cursor: "pointer" }}>
                Continue
              </button>
            </>
          )}
          {step === "form" && (
            <>
              <button onClick={handleBack}
                className="px-4 py-2 rounded-lg text-[12px] font-medium transition-all"
                style={{ ...font, border: `1px solid ${c.border}`, color: c.text, background: "transparent", cursor: "pointer" }}>
                Back
              </button>
              <button onClick={handleContinue} disabled={!formValid}
                className="px-4 py-2 rounded-lg text-[12px] font-semibold text-white transition-all"
                style={{ ...font, background: btnGrad, border: "none",
                  opacity: formValid ? 1 : 0.5,
                  cursor: formValid ? "pointer" : "not-allowed" }}>
                Continue
              </button>
            </>
          )}
          {step === "done" && (
            <>
              {mode === "userId" ? (
                <>
                  <span />
                  <button onClick={onClose}
                    className="px-4 py-2 rounded-lg text-[12px] font-semibold text-white transition-all"
                    style={{ ...font, background: btnGrad, border: "none", cursor: "pointer" }}>
                    Done
                  </button>
                </>
              ) : (
                <>
                  <button onClick={onClose}
                    className="px-4 py-2 rounded-lg text-[12px] font-medium transition-all"
                    style={{ ...font, border: `1px solid ${c.border}`, color: c.text, background: "transparent", cursor: "pointer" }}>
                    Close
                  </button>
                  <button onClick={onSimulateEmailClick}
                    className="px-4 py-2 rounded-lg text-[12px] font-semibold text-white transition-all"
                    style={{ ...font, background: btnGrad, border: "none", cursor: "pointer" }}>
                    Open Reset Link
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────── VERIFY ──────────────────────────── */
function VerifyView({ c, font, primaryBtnStyle, btnGrad, onVerify }: {
  c: Record<string, string>;
  font: React.CSSProperties;
  primaryBtnStyle: (enabled: boolean) => React.CSSProperties;
  btnGrad: string;
  onVerify: () => void;
}) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [seconds, setSeconds] = useState(594); // 9:54 like original
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  // Demo: always allow continue regardless of input. Production would require all 6 digits.
  const enabled = true;

  const updateDigit = (i: number, v: string) => {
    const ch = v.replace(/\D/g, "").slice(-1);
    setDigits(prev => { const next = [...prev]; next[i] = ch; return next; });
    if (ch && i < 5) inputs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  return (
    <>
      <h1 className="mb-3" style={{ ...font, fontSize: 32, fontWeight: 600, lineHeight: "38px", color: c.text }}>
        Verify Your{" "}
        <span
          style={{
            background: btnGrad,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Code
        </span>
      </h1>
      <p className="mb-8" style={{ ...font, fontSize: 14, color: c.muted }}>
        We sent a 6-digit code to{" "}
        <span style={{ fontWeight: 600, color: c.text }}>l***********e@amyntagroup.com</span>
      </p>

      <div className="flex gap-2 mb-3 w-full">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={el => { inputs.current[i] = el; }}
            value={d}
            onChange={e => updateDigit(i, e.target.value)}
            onKeyDown={e => onKeyDown(i, e)}
            inputMode="numeric"
            maxLength={1}
            className="text-center transition-all flex-1 min-w-0"
            style={{
              fontFamily: FONT,
              aspectRatio: "1 / 1",
              borderRadius: 10,
              border: `1px solid ${c.border}`,
              background: c.cardBg,
              color: c.text,
              fontSize: 22,
              fontWeight: 600,
              outline: "none",
              padding: 0,
            }}
            onFocus={e => {
              e.currentTarget.style.border = "1px solid transparent";
              e.currentTarget.style.background = `linear-gradient(${c.cardBg},${c.cardBg}) padding-box, ${btnGrad} border-box`;
            }}
            onBlur={e => {
              e.currentTarget.style.border = `1px solid ${c.border}`;
              e.currentTarget.style.background = c.cardBg;
            }}
          />
        ))}
      </div>

      <p className="mb-7" style={{ ...font, fontSize: 12, color: c.muted }}>
        Code expires in <span style={{ fontWeight: 600, color: c.text }}>{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}</span>
      </p>

      <button type="button" disabled={!enabled} onClick={onVerify} style={primaryBtnStyle(enabled)}>
        Verify
      </button>

      <div className="mt-5" style={{ ...font, fontSize: 13, color: c.muted }}>
        Didn&apos;t get the code?{" "}
        <button
          type="button"
          onClick={() => setSeconds(594)}
          className="underline cursor-pointer"
          style={{
            background: btnGrad,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            border: "none",
            padding: 0,
            fontWeight: 700,
            fontFamily: FONT,
            fontSize: 13,
            textUnderlineOffset: 3,
          }}
        >
          Resend
        </button>
      </div>
    </>
  );
}

/* ──────────────────────────── CREATE PASSWORD ──────────────────────────── */
function CreateView({ c, font, inputStyle, labelStyle, primaryBtnStyle, btnGrad, isDark, onContinue }: {
  c: Record<string, string>;
  font: React.CSSProperties;
  inputStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
  primaryBtnStyle: (enabled: boolean) => React.CSSProperties;
  btnGrad: string;
  isDark: boolean;
  onContinue: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const rules = [
    { label: "Minimum 8 characters",        ok: password.length >= 8 },
    { label: "At least 1 uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "At least 1 lowercase letter", ok: /[a-z]/.test(password) },
    { label: "At least 1 number",           ok: /\d/.test(password) },
    { label: "At least 1 special character", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  // Demo: always allow Continue. Production would require all rules + matching passwords + email.
  const allValid = true;

  return (
    <>
      <h1 className="mb-3" style={{ ...font, fontSize: 32, fontWeight: 600, lineHeight: "38px", color: c.text }}>
        Create{" "}
        <span
          style={{
            background: btnGrad,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Password
        </span>
      </h1>
      <p className="mb-8" style={{ ...font, fontSize: 14, color: c.muted }}>
        Set a password to finish activating your account.
      </p>

      <div className="mb-5">
        <label style={labelStyle}>Email Address</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="name@example.com"
          style={inputStyle}
        />
      </div>

      <div className="mb-5">
        <label style={labelStyle}>Password</label>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ ...inputStyle, paddingRight: 40 }}
          />
          <button
            type="button"
            onClick={() => setShowPw(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            style={{ color: c.muted, background: "transparent", border: "none", padding: 0, lineHeight: 0 }}
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="mb-5">
        <label style={labelStyle}>Confirm Password</label>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            style={{ ...inputStyle, paddingRight: 40 }}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            style={{ color: c.muted, background: "transparent", border: "none", padding: 0, lineHeight: 0 }}
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Password rules — inline, matches the Reset Password view */}
      <div className="mb-6 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {rules.map(r => (
          <div key={r.label} className="flex items-center gap-2"
            style={{ ...font, fontSize: 12, color: r.ok ? "#10B981" : c.muted }}>
            <span className="flex items-center justify-center flex-shrink-0"
              style={{ width: 14, height: 14, borderRadius: 9999,
                background: r.ok ? "rgba(16,185,129,0.12)" : (isDark ? "rgba(255,255,255,0.06)" : "#F3F4F6") }}>
              {r.ok && <Check className="w-2.5 h-2.5" style={{ color: "#10B981" }} strokeWidth={3} />}
            </span>
            {r.label}
          </div>
        ))}
      </div>

      <button type="button" disabled={!allValid} onClick={onContinue} style={primaryBtnStyle(allValid)}>
        Continue
      </button>

      <div className="mt-5" style={{ ...font, fontSize: 13, color: c.muted }}>
        Already have an account?{" "}
        <button
          type="button"
          className="underline cursor-pointer"
          style={{
            background: btnGrad,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            border: "none",
            padding: 0,
            fontWeight: 700,
            fontFamily: FONT,
            fontSize: 13,
            textUnderlineOffset: 3,
          }}
        >
          Sign in
        </button>
      </div>
    </>
  );
}

/* ──────────────────────────── RESET PASSWORD (landing page from email link) ──────────────────────────── */
function ResetPasswordView({ c, font, inputStyle, labelStyle, primaryBtnStyle, btnGrad, isDark, onContinue }: {
  c: Record<string, string>;
  font: React.CSSProperties;
  inputStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
  primaryBtnStyle: (enabled: boolean) => React.CSSProperties;
  btnGrad: string;
  isDark: boolean;
  onContinue: () => void;
}) {
  // These would come from the URL token in production. Hard-coded here so the dev can see the layout.
  const accountUserId = "lisa.armitage";
  const accountEmail  = "lisa.armitage@amyntagroup.com";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);

  const rules = [
    { label: "Minimum 8 characters",         ok: password.length >= 8 },
    { label: "At least 1 uppercase letter",  ok: /[A-Z]/.test(password) },
    { label: "At least 1 lowercase letter",  ok: /[a-z]/.test(password) },
    { label: "At least 1 number",            ok: /\d/.test(password) },
    { label: "At least 1 special character", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const passwordsMatch = password.length > 0 && password === confirm;
  // Demo: always allow Save. Production would require all rules + matching passwords.
  const allValid = true;

  if (done) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center justify-center mb-5"
          style={{ width: 64, height: 64, borderRadius: 32, background: "rgba(166,20,195,0.08)" }}>
          <Check className="w-7 h-7" style={{ color: "#A614C3" }} strokeWidth={2.5} />
        </div>
        <h1 className="mb-3" style={{ ...font, fontSize: 28, fontWeight: 600, lineHeight: "34px", color: c.text }}>
          Password{" "}
          <span style={{
            background: btnGrad,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>Updated</span>
        </h1>
        <p className="mb-8" style={{ ...font, fontSize: 14, color: c.muted, maxWidth: 360 }}>
          You can now sign in with your new password.
        </p>
        <button type="button" onClick={onContinue} style={{ ...primaryBtnStyle(true), maxWidth: 240 }}>
          Sign in
        </button>
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-3" style={{ ...font, fontSize: 32, fontWeight: 600, lineHeight: "38px", color: c.text }}>
        Reset Your{" "}
        <span
          style={{
            background: btnGrad,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Password
        </span>
      </h1>
      <p className="mb-6" style={{ ...font, fontSize: 14, color: c.muted }}>
        You&apos;re resetting the password for the account below.
      </p>

      {/* Account context — read-only so the user remembers their User ID after this flow */}
      <div className="mb-6 flex items-center gap-3"
        style={{
          padding: "12px 14px",
          borderRadius: 12,
          border: `1px solid ${c.border}`,
          background: isDark ? "rgba(255,255,255,0.03)" : "#F9FAFB",
        }}>
        <span className="flex items-center justify-center flex-shrink-0"
          style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(166,20,195,0.08)" }}>
          <IdCard className="w-[18px] h-[18px]" style={{ color: "#A614C3" }} strokeWidth={1.75} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span style={{ ...font, fontSize: 11, fontWeight: 600, color: c.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>User ID</span>
            <span style={{ ...font, fontSize: 13, fontWeight: 600, color: c.text }}>{accountUserId}</span>
          </div>
          <div style={{ ...font, fontSize: 12, color: c.muted, marginTop: 2 }}>{accountEmail}</div>
        </div>
      </div>

      <div className="mb-5">
        <label style={labelStyle}>New Password</label>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter a new password"
            style={{ ...inputStyle, paddingRight: 40 }}
          />
          <button type="button" onClick={() => setShowPw(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            style={{ color: c.muted, background: "transparent", border: "none", padding: 0, lineHeight: 0 }}
            aria-label={showPw ? "Hide password" : "Show password"}>
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label style={labelStyle}>Confirm New Password</label>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Re-enter the new password"
            style={{ ...inputStyle, paddingRight: 40,
              borderColor: confirm.length > 0 && !passwordsMatch ? "#EF4444" : (inputStyle.borderColor as string) }}
          />
          <button type="button" onClick={() => setShowConfirm(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            style={{ color: c.muted, background: "transparent", border: "none", padding: 0, lineHeight: 0 }}
            aria-label={showConfirm ? "Hide password" : "Show password"}>
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {confirm.length > 0 && !passwordsMatch && (
          <div style={{ ...font, fontSize: 12, color: "#EF4444", marginTop: 6 }}>Passwords don&apos;t match.</div>
        )}
      </div>

      {/* Password rules — same style as CreateView */}
      <div className="mb-6 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {rules.map(r => (
          <div key={r.label} className="flex items-center gap-2"
            style={{ ...font, fontSize: 12, color: r.ok ? "#10B981" : c.muted }}>
            <span className="flex items-center justify-center flex-shrink-0"
              style={{ width: 14, height: 14, borderRadius: 9999,
                background: r.ok ? "rgba(16,185,129,0.12)" : (isDark ? "rgba(255,255,255,0.06)" : "#F3F4F6") }}>
              {r.ok && <Check className="w-2.5 h-2.5" style={{ color: "#10B981" }} strokeWidth={3} />}
            </span>
            {r.label}
          </div>
        ))}
      </div>

      <button type="button" disabled={!allValid} onClick={() => setDone(true)} style={primaryBtnStyle(allValid)}>
        Save Password
      </button>

      <p className="mt-5" style={{ ...font, fontSize: 12, color: c.muted, lineHeight: "18px" }}>
        This link expires in 1 hour. If it expires, request a new reset link from the sign-in page.
      </p>
    </>
  );
}
