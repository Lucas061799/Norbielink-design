"use client";

import { useEffect, useId, useRef } from "react";
import { X, UserPlus, ArrowRight } from "lucide-react";

// -----------------------------------------------------------------------------
// First-run Team Setup notice — NEW agency variant.
//
// Trigger (mock): the agency was just created and has no users in NorbieLink
// besides the primary contact (the signed-in user). There's no roster to pick
// admins from, so unlike TeamSetupModal this is just a notice: it explains
// that each person gets an access level and sends the user to Admin › Users,
// where the levels are explained and they add people one at a time (Add New
// User) or in bulk (Import Users).
//
// Shares TeamSetupModal's visual language (2xl card, Montserrat, razz CTA)
// and its dismissal surfaces in DashboardShell (X / Remind me later →
// banner → bell).
// -----------------------------------------------------------------------------

const FONT = "var(--font-montserrat), Montserrat, sans-serif";
const RAZZ_GRAD = "linear-gradient(88.54deg, #5C2ED4 0.1%, #A614C3 63.88%)";

interface NewAgencyTeamModalProps {
  isDark: boolean;
  open: boolean;
  onClose: () => void;
  onRemindLater: () => void;
  onAddUsers: () => void; // → Admin › Users
  onJustMe: () => void;   // one-person agency → completes setup
}

export default function NewAgencyTeamModal({ isDark, open, onClose, onRemindLater, onAddUsers, onJustMe }: NewAgencyTeamModalProps) {
  const titleId = useId();
  const primaryBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Focus the main action so Enter takes them straight to Add Users.
  useEffect(() => {
    if (open) primaryBtnRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const bg     = isDark ? "#1E2240" : "#FFFFFF";
  const text   = isDark ? "#F9FAFB" : "#1F2937";
  const muted  = isDark ? "#D1D5DB" : "#374151";
  const border = isDark ? "rgba(255,255,255,0.10)" : "#E5E7EB";


  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="rounded-2xl w-[520px] max-w-[95vw] max-h-[92vh] flex flex-col relative"
        style={{ background: bg, boxShadow: "0 20px 60px rgba(0,0,0,0.25)", fontFamily: FONT }}
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-1.5 rounded-md transition-colors cursor-pointer"
          style={{ background: "transparent", border: "none", color: muted }}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-7 pt-7 pb-6 overflow-y-auto">
          <div className="flex items-center justify-center rounded-lg" style={{ width: 48, height: 48, background: "rgba(166, 20, 195, 0.10)" }}>
            <UserPlus className="w-5 h-5" style={{ color: "#A614C3" }} strokeWidth={2} />
          </div>

          <h2 id={titleId} className="text-[18px] font-bold mt-4" style={{ fontFamily: FONT, color: text }}>
            Set up your agency&apos;s users
          </h2>
          <p className="text-[13px] mt-1.5" style={{ fontFamily: FONT, color: muted, lineHeight: 1.55 }}>
            You&apos;re the first user, and an Admin. Here&apos;s what to do next:
          </p>

          {/* The two things to do in Admin › Users: add people, then pick
              Admins. What Admins can do sits under step 2 so they choose well. */}
          <div className="mt-4 rounded-xl p-3.5 flex flex-col gap-2" style={{ border: `1px solid ${border}` }}>
            {[
              { t: "Add your users", d: "One at a time, or import a list." },
              { t: "Choose your Admins", d: "Admins can add, edit & remove users, make other Admins, and view statements & commissions." },
            ].map((s, i) => (
              <div key={s.t} className="flex items-start gap-3 rounded-lg px-3 py-2.5"
                style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6" }}>
                <span className="flex items-center justify-center rounded-full text-[11px] font-bold text-white flex-shrink-0"
                  style={{ width: 20, height: 20, background: "#A614C3", fontFamily: FONT, marginTop: 1 }}>{i + 1}</span>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-semibold" style={{ fontFamily: FONT, color: text }}>{s.t}</div>
                  <div className="text-[12px] mt-0.5" style={{ fontFamily: FONT, color: muted, lineHeight: 1.5 }}>{s.d}</div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[12.5px] mt-4" style={{ fontFamily: FONT, color: muted, lineHeight: 1.5 }}>
            You can do this anytime in{" "}
            <span style={{ fontWeight: 600, color: text }}>Admin › Users</span>.
          </p>
        </div>

        <div className="flex items-center gap-2 px-7 py-4 flex-shrink-0" style={{ borderTop: `1px solid ${border}` }}>
          <button
            type="button"
            onClick={onJustMe}
            className="mr-auto text-[12.5px] font-semibold underline underline-offset-2 cursor-pointer"
            style={{ fontFamily: FONT, background: "transparent", border: "none", padding: 0, color: muted }}
          >
            It&apos;s just me
          </button>
          <button
            type="button"
            onClick={onRemindLater}
            className="px-3.5 py-2 rounded-lg text-[12.5px] font-semibold transition-colors cursor-pointer"
            style={{ fontFamily: FONT, background: "transparent", border: `1px solid ${border}`, color: text }}
          >
            Remind me later
          </button>
          <button
            ref={primaryBtnRef}
            type="button"
            onClick={onAddUsers}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12.5px] font-semibold text-white whitespace-nowrap transition-all cursor-pointer"
            style={{ fontFamily: FONT, background: RAZZ_GRAD, border: "none" }}
          >
            Add users <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
