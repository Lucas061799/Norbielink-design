"use client";

import { useState } from "react";
import { Check } from "lucide-react";

interface PricingProps {
  isDark?: boolean;
}

/* ─── Tier data ──────────────────────────────────────────────────────────
   Norbielink's tier ladder:

   - Free       — the entire base Norbielink app (Marketplace, Agencies,
                  Quotes/Policies, Documents). Marked "YOUR CURRENT PLAN"
                  so the reader immediately knows where they stand.
   - Plus       — MOST POPULAR. Adds ProSuite (CRM, quote presentations,
                  automated marketing) for producers scaling the book.
   - Business   — MOST VALUABLE. Adds Clients + the Dashboard Overview
                  (renewals, quote follow-ups, premium/retention KPIs).
   - Enterprise — Business plus advanced customer management, SSO, and a
                  dedicated success manager.

   `monthly` = price displayed when the top-of-page toggle is on Monthly.
   `annual`  = per-month price when billed annually (~20% cheaper). We
               show one line so the price area doesn't shift height
               between tiers or between billing modes.
   ------------------------------------------------------------------- */
interface Tier {
  key: "free" | "plus" | "business" | "enterprise";
  name: string;
  monthly: string;
  annual:  string;
  tagline: string;
  cta: string;
  isCurrent?: boolean;
  badge?: { label: string; tone: "brand" | "gold" };
  features: string[];
}

const TIERS: Tier[] = [
  {
    key: "free",
    name: "Free",
    monthly: "$0",
    annual:  "$0",
    tagline: "Everything a producer needs to write and service a book.",
    cta: "Your current plan",
    isCurrent: true,
    features: [
      "Full Marketplace — quote across all product lines",
      "Agencies workspace — profiles, contacts, docs, notes",
      "Quotes & Policies pipeline",
      "Basic reporting and export",
    ],
  },
  {
    key: "plus",
    name: "Plus",
    monthly: "$29",
    annual:  "$23",
    tagline: "Adds ProSuite for producers scaling the book.",
    cta: "Upgrade now",
    badge: { label: "Most popular", tone: "brand" },
    features: [
      "Everything in Free",
      "ProSuite CRM (contacts, tasks, pipeline)",
      "Automated marketing campaigns",
      "Quote presentations & document templates",
      "Priority email support",
    ],
  },
  {
    key: "business",
    name: "Business",
    monthly: "$59",
    annual:  "$47",
    tagline: "The workspace agencies run their team on.",
    cta: "Upgrade now",
    badge: { label: "Most valuable", tone: "gold" },
    features: [
      "Everything in Plus",
      "Clients — full book of business view",
      "Dashboard Overview with Premium Booked, Retention, Conversion KPIs",
      "Action Items — renewals & follow-ups queue",
      "Team roles & activity audit log",
      "Advanced exports and scheduled reports",
    ],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    monthly: "Custom",
    annual:  "Custom",
    tagline: "For multi-office agencies and MGAs.",
    cta: "Contact sales",
    features: [
      "Everything in Business",
      "Advanced customer management (segments, custom fields, workflows)",
      "SSO + SCIM user provisioning",
      "Custom retention & book-of-business dashboards",
      "Dedicated Customer Success Manager",
      "SLA-backed uptime & security review",
    ],
  },
];

type Billing = "monthly" | "annually";

export default function Pricing({ isDark = false }: PricingProps) {
  const [billing, setBilling] = useState<Billing>("monthly");
  const annually = billing === "annually";

  const c = {
    text:    isDark ? "#F9FAFB" : "#1F2937",
    heading: isDark ? "#F9FAFB" : "#2D3653",
    muted:   isDark ? "#8B8FA8" : "#6B7280",
    subtle:  isDark ? "#8B8FA8" : "#9CA3AF",
    border:  isDark ? "rgba(255,255,255,0.10)" : "#E5E7EB",
    cardBg:  isDark ? "#1E2240" : "#FFFFFF",
    hoverBg: isDark ? "rgba(255,255,255,0.05)" : "#F9FAFB",
    bannerBg: isDark ? "rgba(166,20,195,0.06)" : "#F9FAFB",
  };

  const btnGrad = "linear-gradient(90deg,#5C2ED4 0%,#A614C3 65%)";

  return (
    <div style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif", color: c.text }}>
      {/* Title bar — matches Marketplace / Agencies / Quotes: 71px full-bleed
          strip. `marginTop: -24` cancels the shell's 24px paddingTop. */}
      <div
        className="flex flex-col justify-center flex-shrink-0 mb-8"
        style={{
          height: 71,
          borderBottom: `0.87px solid ${isDark ? "rgba(255,255,255,0.08)" : "#F3F4F6"}`,
          marginTop: -24,
          marginLeft: -48,
          marginRight: -48,
          paddingLeft: 28,
          paddingRight: 28,
        }}
      >
        <h1 className="text-[22px] font-normal" style={{ color: c.heading }}>Pricing</h1>
      </div>

      {/* Section header row — small "CHOOSE YOUR PLANS" eyebrow on the left,
          Monthly/Annually toggle on the right. Keeping the eyebrow left-
          aligned and the toggle right-aligned reads as one horizontal band
          instead of a stacked hero, which is what tightened up the layout
          compared to the previous centered version. */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-1 h-1 rounded-full" style={{ background: c.muted }} />
          <span className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: c.muted, letterSpacing: "0.14em" }}>Choose your plans</span>
        </div>
        <BillingToggle billing={billing} setBilling={setBilling} c={c} btnGrad={btnGrad} />
      </div>

      {/* Billing banner — swaps content in place instead of hiding when the
          user flips to Annually. Hiding it made the whole tier grid jump up
          the moment the toggle flipped, which read as a layout bug. Keeping
          the same slot with different content preserves vertical rhythm and
          gives the user positive feedback for switching. */}
      <div
        className="flex items-center justify-between rounded-2xl px-6 py-4 mb-6 gap-4 flex-wrap"
        style={{ background: c.bannerBg, border: `1px solid ${c.border}` }}
      >
        {annually ? (
          <>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="inline-flex items-center justify-center rounded-full flex-shrink-0"
                  style={{ width: 20, height: 20, background: "rgba(16,185,129,0.15)" }}
                >
                  <Check className="w-3 h-3" style={{ color: "#10B981" }} strokeWidth={3} />
                </span>
                <span className="text-[14px] font-bold" style={{ color: c.heading }}>You&apos;re saving 20% with annual billing</span>
              </div>
              <p className="text-[12.5px] pl-7" style={{ color: c.muted }}>
                Paid up-front once a year. Cancel or downgrade anytime from your admin settings.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className="px-4 py-2 rounded-lg text-[12.5px] font-semibold transition-colors flex-shrink-0"
              style={{ background: c.cardBg, border: `1px solid ${c.border}`, color: c.text }}
              onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = c.cardBg)}
            >
              Back to monthly
            </button>
          </>
        ) : (
          <>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[14px] font-bold" style={{ color: c.heading }}>Free 2-month Plus trial available</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-white"
                  style={{ background: btnGrad, letterSpacing: "0.10em" }}>Save 20%</span>
              </div>
              <p className="text-[12.5px]" style={{ color: c.muted }}>
                Switch to annual billing today and get your first two months of Plus on us.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setBilling("annually")}
              className="px-4 py-2 rounded-lg text-[12.5px] font-semibold transition-colors flex-shrink-0"
              style={{ background: c.cardBg, border: `1px solid ${c.border}`, color: c.text }}
              onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = c.cardBg)}
            >
              Switch to annually
            </button>
          </>
        )}
      </div>

      {/* Tier grid — 4 columns, same-height rounded cards. Badge pills
          sit inline next to the tier name (not floating above the card)
          so headers land on the same y-axis across all four. */}
      <div className="grid grid-cols-4 gap-5 pb-12" style={{ alignItems: "stretch" }}>
        {TIERS.map(tier => (
          <TierCard key={tier.key} tier={tier} annually={annually} isDark={isDark} c={c} btnGrad={btnGrad} />
        ))}
      </div>
    </div>
  );
}

/* ─── Monthly / Annually toggle ─────────────────────────────────────── */
interface BillingToggleProps {
  billing: Billing;
  setBilling: (b: Billing) => void;
  c: Record<string, string>;
  btnGrad: string;
}
function BillingToggle({ billing, setBilling, c, btnGrad }: BillingToggleProps) {
  const isAnnually = billing === "annually";
  return (
    <div className="inline-flex items-center gap-2 rounded-full p-1"
      style={{ background: c.hoverBg, border: `1px solid ${c.border}` }}>
      <button
        type="button"
        onClick={() => setBilling("monthly")}
        className="px-3 py-1 rounded-full text-[12px] font-semibold transition-colors"
        style={{
          background: !isAnnually ? c.cardBg : "transparent",
          color: !isAnnually ? c.text : c.muted,
          boxShadow: !isAnnually ? "0 1px 2px rgba(15,23,42,0.06)" : undefined,
        }}
      >
        Monthly
      </button>
      <button
        type="button"
        onClick={() => setBilling("annually")}
        className="px-3 py-1 rounded-full text-[12px] font-semibold transition-colors flex items-center gap-2"
        style={{
          background: isAnnually ? c.cardBg : "transparent",
          color: isAnnually ? c.text : c.muted,
          boxShadow: isAnnually ? "0 1px 2px rgba(15,23,42,0.06)" : undefined,
        }}
      >
        Annually
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-white"
          style={{ background: btnGrad, letterSpacing: "0.08em" }}>−20%</span>
      </button>
    </div>
  );
}

/* ─── Single-tier card ─────────────────────────────────────────────────
   Structure (top → bottom):
     1. Header row — tier name + optional inline badge pill
     2. One-line tagline
     3. Price + billing suffix
     4. CTA button — full-width; primary gradient for the "MOST VALUABLE"
        (Business) tier so the eye still lands there; outlined neutral
        elsewhere; muted "your current plan" state on Free
     5. Divider
     6. Feature list (check icons + text)
   ------------------------------------------------------------------- */
interface TierCardProps {
  tier: Tier;
  annually: boolean;
  isDark: boolean;
  c: Record<string, string>;
  btnGrad: string;
}

function TierCard({ tier, annually, isDark, c, btnGrad }: TierCardProps) {
  const price = annually ? tier.annual : tier.monthly;
  const isCustomPrice = price === "Custom";
  const priceSuffix = isCustomPrice
    ? (annually ? "billed annually" : "contact for quote")
    : "per agency / month";

  // Recommended tier drives visual emphasis (gradient border + gradient CTA)
  const isPrimaryCta = tier.badge?.tone === "gold";

  return (
    <div
      className="relative rounded-2xl p-6 flex flex-col"
      style={{
        background: c.cardBg,
        border: `1px solid ${c.border}`,
      }}
    >
      {/* Header row — tier name + inline badge (Most popular / Most valuable).
          Kept inline so the tier name still anchors the eye on the left; a
          floating badge above the card left the header row uneven. */}
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-[18px] font-bold" style={{ color: c.heading }}>{tier.name}</h3>
        {tier.badge && (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-md text-[9.5px] font-bold uppercase tracking-wider whitespace-nowrap"
            style={
              tier.badge.tone === "gold"
                ? { background: btnGrad, color: "#FFFFFF", letterSpacing: "0.10em" }
                : {
                    background: isDark ? "rgba(166,20,195,0.20)" : "rgba(166,20,195,0.10)",
                    color: "#A614C3",
                    letterSpacing: "0.10em",
                  }
            }
          >
            {tier.badge.label}
          </span>
        )}
      </div>

      {/* Tagline — one line, muted; minHeight keeps price rows aligned
          across the four cards even when the tagline wraps. */}
      <p className="text-[12px] leading-relaxed mb-5" style={{ color: c.muted, minHeight: 36 }}>
        {tier.tagline}
      </p>

      {/* Price + suffix — suffix always on its own line so every tier has the
          same price-section height. When it was inline for numeric prices and
          block-level for "Custom", the Enterprise CTA sat ~20px lower than
          the other three and broke the button row. Suffix uses c.muted (not
          c.subtle) — the lighter subtle grey was disappearing on white. */}
      <div className="mb-5">
        <div className="text-[32px] font-bold leading-none" style={{ color: c.heading }}>{price}</div>
        <p className="text-[11px] mt-1.5" style={{ color: c.muted }}>{priceSuffix}</p>
      </div>

      {/* CTA — three states:
          - current plan  → muted outlined, non-interactive read
          - primary       → gradient (Most valuable tier only)
          - default       → outlined neutral */}
      <button
        type="button"
        disabled={tier.isCurrent}
        className="w-full rounded-lg text-[13px] font-semibold transition-all mb-5"
        style={
          tier.isCurrent
            ? { padding: "10px 16px", background: "transparent", color: c.muted, border: `1px solid ${c.border}`, cursor: "default" }
            : isPrimaryCta
              ? { padding: "10px 16px", background: btnGrad, color: "#FFFFFF", border: "1px solid transparent" }
              : { padding: "10px 16px", background: "transparent", color: c.text, border: `1px solid ${c.border}` }
        }
        onMouseEnter={e => {
          if (!tier.isCurrent && !isPrimaryCta) e.currentTarget.style.background = c.hoverBg;
        }}
        onMouseLeave={e => {
          if (!tier.isCurrent && !isPrimaryCta) e.currentTarget.style.background = "transparent";
        }}
      >
        {tier.cta}
      </button>

      {/* Divider between CTA and the feature list */}
      <div className="mb-5" style={{ borderTop: `1px solid ${c.border}` }} />

      {/* Feature list */}
      <ul className="flex flex-col gap-2.5">
        {tier.features.map(f => (
          <li key={f} className="flex items-start gap-2">
            <span
              className="flex-shrink-0 flex items-center justify-center rounded-full mt-0.5"
              style={{
                width: 16, height: 16,
                background: isDark ? "rgba(166,20,195,0.20)" : "rgba(166,20,195,0.10)",
              }}
            >
              <Check className="w-3 h-3" style={{ color: "#A614C3" }} strokeWidth={3} />
            </span>
            <span className="text-[12px] leading-relaxed" style={{ color: c.text }}>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
