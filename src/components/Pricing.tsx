"use client";

import { Check, Sparkles } from "lucide-react";

interface PricingProps {
  isDark?: boolean;
}

/* ─── Tier data ──────────────────────────────────────────────────────────
   Norbielink's version of the Notion tier ladder:

   - Free       — the entire base Norbielink app (Marketplace, Agencies,
                  Quotes/Policies, Documents). Enough to run a small book.
   - Plus       — add ProSuite (CRM, quote presentations, automated
                  marketing) for producers who need to grow the book.
   - Business   — RECOMMENDED. Add Clients + the Dashboard Overview
                  (renewals, quote follow-ups, premium/retention KPIs).
   - Enterprise — everything in Business plus advanced customer
                  management, SSO, and a dedicated success manager.
   ------------------------------------------------------------------- */
interface Tier {
  key: "free" | "plus" | "business" | "enterprise";
  name: string;
  price: string;
  priceSuffix: string;
  tagline: string;
  cta: string;
  features: string[];
  recommended?: boolean;
}

const TIERS: Tier[] = [
  {
    key: "free",
    name: "Free",
    price: "$0",
    priceSuffix: "/user / month",
    tagline: "Everything a producer needs to write and service a book.",
    cta: "Get started",
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
    price: "$29",
    priceSuffix: "/user / month",
    tagline: "Adds ProSuite for producers scaling the book.",
    cta: "Upgrade to Plus",
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
    price: "$59",
    priceSuffix: "/user / month",
    tagline: "The workspace agencies run their team on.",
    cta: "Start free trial",
    recommended: true,
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
    price: "Custom",
    priceSuffix: "billed annually",
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

export default function Pricing({ isDark = false }: PricingProps) {
  const c = {
    text:    isDark ? "#F9FAFB" : "#1F2937",
    heading: isDark ? "#F9FAFB" : "#2D3653",
    muted:   isDark ? "#8B8FA8" : "#6B7280",
    subtle:  isDark ? "#8B8FA8" : "#9CA3AF",
    border:  isDark ? "rgba(255,255,255,0.10)" : "#E5E7EB",
    cardBg:  isDark ? "#1E2240" : "#FFFFFF",
    hoverBg: isDark ? "rgba(255,255,255,0.05)" : "#F9FAFB",
  };

  const btnGrad = "linear-gradient(90deg,#5C2ED4 0%,#A614C3 65%)";

  return (
    <div style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif", color: c.text }}>
      {/* Title bar — matches Marketplace / Agencies / Quotes: 71px full-bleed
          strip. `marginTop: -24` cancels the 24px `paddingTop` the shell adds
          to non-fullHeight pages so the title sits flush against the TopBar. */}
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

      {/* Hero — headline + subtext, centered so the eye lands on the plans
          below rather than the copy. Kept short: the tier cards do the
          selling; long marketing copy above them just delays scanning. */}
      <div className="text-center max-w-[720px] mx-auto mb-10 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
          style={{ background: isDark ? "rgba(166,20,195,0.15)" : "rgba(166,20,195,0.08)" }}>
          <Sparkles className="w-3.5 h-3.5" style={{ color: "#A614C3" }} />
          <span className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: "#A614C3", letterSpacing: "0.10em" }}>Choose your plan</span>
        </div>
        <h2 className="text-[32px] font-bold leading-tight mb-3" style={{ color: c.heading }}>
          Pricing that scales with your book.
        </h2>
        <p className="text-[14px] leading-relaxed" style={{ color: c.muted }}>
          Start free with the full Norbielink workspace. Add ProSuite when you&apos;re growing,
          unlock Clients &amp; the Dashboard when you&apos;re running a team.
        </p>
      </div>

      {/* Tier grid — 4 columns on desktop, always same-height rounded cards.
          Business tier gets a gradient border + Recommended badge to pull
          the eye there (Notion does the same thing with its middle plan). */}
      <div className="grid grid-cols-4 gap-5 pb-12" style={{ alignItems: "stretch" }}>
        {TIERS.map(tier => (
          <TierCard key={tier.key} tier={tier} isDark={isDark} c={c} btnGrad={btnGrad} />
        ))}
      </div>
    </div>
  );
}

/* ─── Single-tier card ─────────────────────────────────────────────────
   Structure (top → bottom):
     1. Recommended badge (business only)
     2. Tier name + tagline
     3. Price + billing suffix
     4. CTA button — gradient on recommended, outlined otherwise
     5. Divider
     6. Feature list (check icons + text)
   ------------------------------------------------------------------- */
interface TierCardProps {
  tier: Tier;
  isDark: boolean;
  c: Record<string, string>;
  btnGrad: string;
}

function TierCard({ tier, isDark, c, btnGrad }: TierCardProps) {
  const recommended = !!tier.recommended;
  const cardStyle: React.CSSProperties = recommended
    ? {
        // Gradient border via nested-gradient trick — bg is the card color
        // in padding-box, gradient in border-box.
        background: `linear-gradient(${c.cardBg}, ${c.cardBg}) padding-box, linear-gradient(90deg,#5C2ED4 0%,#A614C3 65%) border-box`,
        border: "1.5px solid transparent",
        boxShadow: "0 8px 24px rgba(110,33,196,0.14)",
      }
    : {
        background: c.cardBg,
        border: `1px solid ${c.border}`,
      };

  return (
    <div className="relative rounded-2xl p-6 flex flex-col" style={cardStyle}>
      {/* Recommended pill — small gradient chip pinned above the header row */}
      {recommended && (
        <div className="absolute -top-3 left-6">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
            style={{ background: btnGrad, letterSpacing: "0.10em" }}>
            Recommended
          </span>
        </div>
      )}

      {/* Header — tier name + tagline */}
      <div className="mb-4">
        <h3 className="text-[18px] font-bold" style={{ color: c.heading }}>{tier.name}</h3>
        <p className="text-[12px] mt-1 leading-relaxed" style={{ color: c.muted, minHeight: 44 }}>
          {tier.tagline}
        </p>
      </div>

      {/* Price */}
      <div className="mb-5">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[32px] font-bold leading-none" style={{ color: c.heading }}>{tier.price}</span>
        </div>
        <p className="text-[11px] mt-1.5" style={{ color: c.subtle }}>{tier.priceSuffix}</p>
      </div>

      {/* CTA — recommended tier gets the primary gradient, others get an
          outlined neutral so the eye still lands on Business first. */}
      <button
        className="w-full rounded-lg text-[13px] font-semibold transition-all mb-5"
        style={
          recommended
            ? { ...({} as React.CSSProperties), padding: "10px 16px", background: btnGrad, color: "#FFFFFF", border: "1px solid transparent" }
            : { padding: "10px 16px", background: "transparent", color: c.text, border: `1px solid ${c.border}` }
        }
        onMouseEnter={e => {
          if (!recommended) e.currentTarget.style.background = c.hoverBg;
        }}
        onMouseLeave={e => {
          if (!recommended) e.currentTarget.style.background = "transparent";
        }}
      >
        {tier.cta}
      </button>

      {/* Divider between price/CTA area and the feature list */}
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
