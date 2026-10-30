"use client";

import { useEffect } from "react";
import { X, ArrowRight, Bell, LayoutDashboard } from "lucide-react";

// -----------------------------------------------------------------------------
// Top-right dismiss hint for the Team Setup prompt. Fires when the user X's
// (or "Remind me later"s) the first-run modal — so they know the prompt is
// still reachable from the Marketplace banner and the bell, instead of
// thinking they just dismissed it forever.
//
// Lives at the DashboardShell level, not inside the modal, because the modal
// unmounts on dismiss. 10s auto-close + manual X so it doesn't park on the
// chrome. Visual pattern mirrors LicenseAlertBanner's post-dismiss toast.
// -----------------------------------------------------------------------------

interface TeamSetupDismissToastProps {
  isDark: boolean;
  open: boolean;
  onClose: () => void;
  onOpenTeamSetup: () => void;
}

const FONT = "var(--font-montserrat), Montserrat, sans-serif";

export default function TeamSetupDismissToast({ isDark, open, onClose, onOpenTeamSetup }: TeamSetupDismissToastProps) {
  // Auto-close after 10s so the toast doesn't linger. Reset when it re-opens
  // (user dismissed again after reopening the modal from banner / bell).
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, 10000);
    return () => clearTimeout(t);
  }, [open, onClose]);

  if (!open) return null;

  const bg          = isDark ? "#1E2240" : "#FFFFFF";
  const borderCol   = isDark ? "rgba(255,255,255,0.10)" : "#E5E7EB";
  const titleColor  = isDark ? "#F9FAFB" : "#111827";
  const bodyColor   = isDark ? "#9CA3AF" : "#6B7280";
  const dismissColor = isDark ? "#8B8FA8" : "#9CA3AF";
  const chipBg      = isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6";
  const chipColor   = isDark ? "#D1D5DB" : "#6B7280";

  return (
    <div
      role="status"
      className="fixed flex flex-col"
      style={{
        top: 68,
        right: 20,
        width: 340,
        zIndex: 80,
        background: bg,
        border: `1px solid ${borderCol}`,
        borderRadius: 12,
        boxShadow: "0 12px 32px rgba(0,0,0,0.14)",
        fontFamily: FONT,
        padding: 14,
        animation: "teamSetupToastIn 180ms ease-out",
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div
          className="text-[13px] font-semibold"
          style={isDark ? {
            fontFamily: FONT,
            color: "#C084FC",
          } : {
            fontFamily: FONT,
            backgroundImage: "linear-gradient(88.54deg, #5C2ED4 0.1%, #A614C3 63.88%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Need to come back to this?
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close hint"
          className="flex-shrink-0 cursor-pointer"
          style={{
            background: "transparent",
            border: "none",
            padding: 2,
            color: dismissColor,
            marginTop: -2,
            marginRight: -4,
          }}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Chip 1 — the inline banner on the Marketplace home. */}
      <div className="flex items-start gap-2.5 mb-2">
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{ width: 28, height: 28, borderRadius: 9999, background: chipBg, color: chipColor }}
        >
          <LayoutDashboard className="w-[14px] h-[14px]" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0 text-[12px]" style={{ color: bodyColor, lineHeight: 1.45 }}>
          <span style={{ color: titleColor, fontWeight: 600 }}>On the Marketplace</span>
          {" "}— a banner at the top lets you pick admins any time.
        </div>
      </div>

      {/* Chip 2 — the bell panel entry. */}
      <div className="flex items-start gap-2.5">
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{ width: 28, height: 28, borderRadius: 9999, background: chipBg, color: chipColor }}
        >
          <Bell className="w-[14px] h-[14px]" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0 text-[12px]" style={{ color: bodyColor, lineHeight: 1.45 }}>
          <span style={{ color: titleColor, fontWeight: 600 }}>In the bell</span>
          {" "}— open the notification bell in the top-right to jump back here.
        </div>
      </div>

      <button
        type="button"
        onClick={() => { onOpenTeamSetup(); onClose(); }}
        className="mt-3 inline-flex items-center gap-1 cursor-pointer self-start"
        style={{
          background: "transparent",
          border: "none",
          padding: 0,
          color: "#A614C3",
          fontFamily: FONT,
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        Set up team now
        <ArrowRight className="w-3 h-3" strokeWidth={2.4} />
      </button>

      <style>{`
        @keyframes teamSetupToastIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
