"use client";

import { useEffect, useState } from "react";
import { X, ArrowRight, Bell, UserCog } from "lucide-react";

// -----------------------------------------------------------------------------
// Push-based license alert banner. Lives inline on dashboard surfaces so a
// lapsed or imminent license expiration is impossible to miss — no bell click
// required. The TopBar bell still carries the full notification list; this
// banner only surfaces CRITICAL severities and only ever shows ONE at a time,
// so it doesn't stack up or train users to scan past it.
//
// Two consumers today:
//   - Marketplace (home dashboard) — first thing an external user sees. On
//     dismiss, pops a top-right toast telling them (a) the bell keeps the
//     full list for later, and (b) Admin → Overview is where they actually
//     renew, so the action isn't forgotten.
//   - Agency Detail (client / Admin view) — the actual place they renew from.
//     Same banner, no post-dismiss toast (nothing to point to — they're
//     already on the renewal page).
// -----------------------------------------------------------------------------

export type BannerSeverity = "critical" | "warning";

export type BannerNotification = {
  id: string;
  severity: BannerSeverity;
  title: string;
  body: string;
  actionLabel: string;
};

// Seeded here so Marketplace + Agency Detail stay in sync for the mock. When
// wired to real data, this becomes a selector over the shared notifications
// store filtered to {critical, warning}.
export const BANNER_NOTIFICATIONS: BannerNotification[] = [
  {
    id: "lic-expired-acme",
    severity: "critical",
    title: "License expired",
    body: "Acme Insurance Agency's California license expired on 09/15/2026. Renew now to keep writing business.",
    actionLabel: "Renew license",
  },
  {
    id: "lic-expiring-15",
    severity: "warning",
    title: "License expires in 15 days",
    body: "Your Texas license expires on 11/11/2026. Verify with NIPR before it lapses.",
    actionLabel: "Verify now",
  },
];

interface LicenseAlertBannerProps {
  isDark: boolean;
  // Called when the primary CTA ("Renew license" / "Verify now") is clicked
  // AND when the dismiss-toast "Open Admin now" link is clicked. Routes to
  // the Admin / Agency detail page where renewal happens.
  onAction?: () => void;
  // When true, pops a small toast at the top-right of the viewport after the
  // user dismisses the banner, pointing out (a) where this info lives if they
  // want to see it again (bell → notifications), and (b) where to actually
  // renew (Admin → Overview). Marketplace sets this because its user hasn't
  // navigated anywhere yet; the Admin surface itself leaves it off (they're
  // already on the renewal page — nowhere to point).
  hintAfterDismiss?: boolean;
}

export default function LicenseAlertBanner({ isDark, onAction, hintAfterDismiss = false }: LicenseAlertBannerProps) {
  // Single boolean: once the user X's the banner, it's gone for this mount.
  // We DON'T rotate to the next item — the user asked for ONE banner, not a
  // queue. The bell still carries everything in the panel for anyone who
  // wants the full list.
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  // Auto-close the toast after 10s so it doesn't linger on the chrome. User
  // can also close it manually.
  useEffect(() => {
    if (!toastOpen) return;
    const t = setTimeout(() => setToastOpen(false), 10000);
    return () => clearTimeout(t);
  }, [toastOpen]);

  // Pick the highest-severity item once; stays stable across renders so a
  // dismiss doesn't suddenly rotate in a new banner behind the toast.
  const n = BANNER_NOTIFICATIONS
    .slice()
    .sort((a, b) => (a.severity === "critical" ? 0 : 1) - (b.severity === "critical" ? 0 : 1))[0];

  const FONT = "var(--font-montserrat), Montserrat, sans-serif";
  // Dark-mode fill matches the Marketplace tile surface (#1E2240) so the
  // banner reads as the same "card" family instead of a translucent wash.
  const bg = isDark ? "#1E2240" : "#F9FAFB";
  const borderCol = isDark ? "rgba(255,255,255,0.10)" : "#E5E7EB";
  const bodyColor = isDark ? "#9CA3AF" : "#6B7280";
  const dismissColor = isDark ? "#8B8FA8" : "#9CA3AF";
  const toastBg = isDark ? "#1E2240" : "#FFFFFF";
  const toastTitle = isDark ? "#F9FAFB" : "#111827";
  const chipBg = isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6";
  const chipColor = isDark ? "#D1D5DB" : "#6B7280";

  const gradId = `banner-razz-${n.id}`;

  // Dismiss-hint toast — rendered as a Fragment-level sibling so its
  // `position: fixed` is anchored to the viewport, not trapped inside any
  // ancestor that creates a containing block (transforms, filters, etc.).
  const toastNode = toastOpen && hintAfterDismiss ? (
    <div
      role="status"
      className="fixed flex flex-col"
      style={{
        top: 68,
        right: 20,
        width: 340,
        zIndex: 60,
        background: toastBg,
        border: `1px solid ${borderCol}`,
        borderRadius: 12,
        boxShadow: "0 12px 32px rgba(0,0,0,0.14)",
        fontFamily: FONT,
        padding: 14,
        animation: "licenseAlertToastIn 180ms ease-out",
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
          onClick={() => setToastOpen(false)}
          className="flex-shrink-0 cursor-pointer"
          aria-label="Close hint"
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

      {/* Two pointers — one for viewing the notification again (bell), one
          for actually renewing (Admin). */}
      <div className="flex items-start gap-2.5 mb-2">
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{ width: 28, height: 28, borderRadius: 9999, background: chipBg, color: chipColor }}
        >
          <Bell className="w-[14px] h-[14px]" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0 text-[12px]" style={{ color: bodyColor, lineHeight: 1.45 }}>
          <span style={{ color: toastTitle, fontWeight: 600 }}>View anytime</span>
          {" "}— the bell in the top-right keeps every notification.
        </div>
      </div>

      <div className="flex items-start gap-2.5">
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{ width: 28, height: 28, borderRadius: 9999, background: chipBg, color: chipColor }}
        >
          <UserCog className="w-[14px] h-[14px]" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0 text-[12px]" style={{ color: bodyColor, lineHeight: 1.45 }}>
          <span style={{ color: toastTitle, fontWeight: 600 }}>Renew it</span>
          {" "}— go to Admin → Overview to review and renew the license.
        </div>
      </div>

      {onAction && (
        <button
          type="button"
          onClick={() => { onAction(); setToastOpen(false); }}
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
          Open Admin now
          <ArrowRight className="w-3 h-3" strokeWidth={2.4} />
        </button>
      )}

      <style>{`
        @keyframes licenseAlertToastIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  ) : null;

  // Banner is gone — only the toast (if any) remains in the tree.
  if (bannerDismissed) return toastNode;

  return (
    <>
      <div
        className="rounded-xl p-4 mb-6 flex items-start gap-3"
        style={{ background: bg, border: `1px solid ${borderCol}` }}
      >
        {/* Alert glyph — color follows the title: razz gradient in light mode
            (matches the Agency Detail "Pending updates" banner), solid lighter
            razz in dark mode so glyph + title read as one accent. */}
        <svg
          className="w-5 h-5 flex-shrink-0 mt-0.5"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {!isDark && (
            <defs>
              <linearGradient id={gradId} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="24" y2="0">
                <stop offset="0%" stopColor="#5C2ED4" />
                <stop offset="100%" stopColor="#A614C3" />
              </linearGradient>
            </defs>
          )}
          <circle cx="12" cy="12" r="10" stroke={isDark ? "#C084FC" : `url(#${gradId})`} />
          <line x1="12" x2="12" y1="8" y2="12" stroke={isDark ? "#C084FC" : `url(#${gradId})`} />
          <line x1="12" x2="12.01" y1="16" y2="16" stroke={isDark ? "#C084FC" : `url(#${gradId})`} />
        </svg>

        <div className="flex-1 min-w-0">
          <div
            className="text-[13px] font-semibold"
            style={isDark ? {
              // Dark mode: a solid lighter razz (#C084FC, matches the PRO
              // badge) — the deep-razz gradient reads as muddy against the
              // #1E2240 surface.
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
            {n.title}
          </div>
          <div className="text-[12px] mt-0.5" style={{ fontFamily: FONT, color: bodyColor }}>
            {n.body}
          </div>
        </div>

        <button
          type="button"
          onClick={onAction}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white transition-all whitespace-nowrap"
          style={{
            fontFamily: FONT,
            background: "linear-gradient(90deg, #5C2ED4 0%, #A614C3 65%)",
            cursor: onAction ? "pointer" : "default",
          }}
        >
          {n.actionLabel}
        </button>

        <button
          type="button"
          onClick={() => {
            setBannerDismissed(true);
            if (hintAfterDismiss) setToastOpen(true);
          }}
          className="flex-shrink-0 cursor-pointer self-start"
          aria-label={`Dismiss: ${n.title}`}
          style={{
            background: "transparent",
            border: "none",
            padding: 2,
            color: dismissColor,
            marginTop: 2,
            marginRight: -4,
          }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {toastNode}
    </>
  );
}
