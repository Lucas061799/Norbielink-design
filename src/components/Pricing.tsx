"use client";

import { Check, Zap, Rocket } from "lucide-react";

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
  key: "free" | "pro" | "business" | "enterprise";
  name: string;
  // The card always shows the monthly rate as the marquee price. `annual` is
  // kept on the type in case a future revision reintroduces a billing toggle;
  // for now the annual context lives inline in `priceSubtext` (e.g.
  // "per agency/month · Billed annually ($99/year)") so both cadences are
  // visible on the card at once.
  monthly: string;
  annual:  string;
  priceSubtext: string;
  cta: string;
  // Optional chip shown between the price block and the CTA — e.g. the
  // "Free Trial Available" affordance on Business.
  priceChip?: string;
  badge?: { label: string; tone: "brand" | "gold" };
  features: string[];
  // Group the four tiers into two visual bands above the grid — Essentials
  // (Free + Pro) vs Next Level (Business + Enterprise), matching the
  // reference's "Get started with the basics" / "Power tools for growing
  // agencies" copy split.
  group: "essentials" | "next-level";
}

const TIERS: Tier[] = [
  {
    key: "free",
    name: "Free",
    monthly: "$0",
    annual:  "$0",
    priceSubtext: "For individuals/agencies",
    cta: "Get Started",
    group: "essentials",
    features: [
      "NorbieLink Portal Access",
      "AI-Powered Appetite Search",
      "Quote & Policy Management",
      "Award-Winning Support",
      "Knowledge Base Access",
      "Enhanced security with MFA",
      "Faster than the legacy view",
      "One place for Endorsement Requests",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    monthly: "$8.25",
    annual:  "$99",
    priceSubtext: "per agency/month · Billed annually ($99/year)",
    cta: "Get Started",
    group: "essentials",
    features: [
      "Everything in Free, plus:",
      "Full ProSuite Apps Suite",
      "Quote Compare AI",
      "NowCerts - Instant Certificates",
      "Lead Connect - Real-time Leads",
      "Easy CE Compliance (Save 10%)",
      "Spanish Marketing Tools",
      "Priority Support",
      "Unlimited Agency Access",
    ],
  },
  {
    key: "business",
    name: "Business",
    monthly: "$12.42",
    annual:  "$149",
    priceSubtext: "per agency/month · Billed annually ($149/year)",
    cta: "Start Free Trial",
    priceChip: "Free Trial Available",
    badge: { label: "Most popular", tone: "gold" },
    group: "next-level",
    features: [
      "Everything in Pro, plus:",
      "Client Portal & Storage",
      "Quick Quote Pre-Pop Forms",
      "Renewal Tracking & Reminders",
      "AI Upsell Insights",
      "Custom Dashboard",
      "Performance Analytics",
      "Advanced Outmarket Tools",
      "Exclusive Carrier Deals",
    ],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    monthly: "Contact Sales",
    annual:  "Contact Sales",
    priceSubtext: "For multi-agency operations",
    cta: "Contact Sales",
    group: "next-level",
    features: [
      "Everything in Business, plus:",
      "Unlimited Client Storage",
      "Multi-Agency Architecture",
      "White-Label Portal Options",
      "API Access & Integrations",
      "Dedicated Success Manager",
      "24/7 Priority Support",
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

      {/* Group headers — split the 4 tiers into two bands so the eye can
          skim "starter tools" vs "growing-team tools" before diving into
          the feature lists. Each header spans two columns of the tier grid
          below (Free + Pro on the left, Business + Enterprise on the
          right). Icons match the tone: soft-purple Zap for Essentials
          (energy, quick wins), gradient Rocket for Next Level (growth,
          upgrade) — same Rocket the sidenav uses for the Pricing route
          itself so the visual thread runs from nav to page hero. */}
      <div className="grid grid-cols-4 gap-5 mb-4">
        <div className="col-span-2">
          <div className="inline-flex items-center gap-2 mb-1.5">
            <span
              className="inline-flex items-center justify-center rounded-md"
              style={{
                width: 22, height: 22,
                background: isDark ? "rgba(166,20,195,0.20)" : "rgba(166,20,195,0.10)",
              }}
            >
              <Zap className="w-3 h-3" style={{ color: "#A614C3" }} strokeWidth={2.5} />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: c.muted, letterSpacing: "0.14em" }}>Essentials</span>
          </div>
          <h3 className="text-[20px] font-bold leading-tight" style={{ color: c.heading }}>Get started with the basics</h3>
          <p className="text-[12.5px] mt-1" style={{ color: c.muted }}>Core tools to power your agency</p>
        </div>
        <div className="col-span-2">
          <div className="inline-flex items-center gap-2 mb-1.5">
            <span
              className="inline-flex items-center justify-center rounded-md"
              style={{ width: 22, height: 22, background: btnGrad }}
            >
              <Rocket className="w-3 h-3 text-white" strokeWidth={2.25} />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: c.muted, letterSpacing: "0.14em" }}>Next Level</span>
          </div>
          <h3 className="text-[20px] font-bold leading-tight" style={{ color: c.heading }}>Power tools for growing agencies</h3>
          <p className="text-[12.5px] mt-1" style={{ color: c.muted }}>Unlock your agency&apos;s full potential</p>
        </div>
      </div>

      {/* Tier grid — 4 columns, same-height rounded cards. Badge pills
          sit inline next to the tier name (not floating above the card)
          so headers land on the same y-axis across all four. */}
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
  isDark: boolean;
  c: Record<string, string>;
  btnGrad: string;
}

function TierCard({ tier, isDark, c, btnGrad }: TierCardProps) {
  const price = tier.monthly;
  // Non-numeric prices ("Contact Sales") skip the per-agency suffix and
  // annual-billing sub-line — the label already communicates the model.
  const isNumericPrice = price.startsWith("$");

  // Recommended tier drives visual emphasis (gradient border + gradient CTA)
  const isPrimaryCta = tier.badge?.tone === "gold";

  return (
    <div
      className="relative rounded-2xl p-6 flex flex-col"
      style={
        isPrimaryCta
          ? {
              // Gradient border via double background-image trick — inner
              // fill matches the card bg, outer layer is the brand gradient,
              // clipped so only the 2px border ring shows the gradient.
              // Plus a soft purple glow so the recommended tier reads as
              // "lifted" from the row.
              background: `linear-gradient(${c.cardBg}, ${c.cardBg}) padding-box, ${btnGrad} border-box`,
              border: "2px solid transparent",
              boxShadow: isDark
                ? "0 12px 40px rgba(166,20,195,0.25)"
                : "0 12px 32px rgba(166,20,195,0.18)",
            }
          : {
              background: c.cardBg,
              border: `1px solid ${c.border}`,
            }
      }
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

      {/* Price block — big value on line 1, priceSubtext on line 2 (either
          "per agency/month" for the priced tiers or a "who it's for" phrase
          for Free / Enterprise), optional "Billed annually ($X/year)" on
          line 3. minHeight reserves the 3-line slot so all four CTAs land
          on the same y-axis regardless of which sub-lines are populated. */}
      <div className="mb-5 mt-2" style={{ minHeight: 76 }}>
        {/* Numeric prices use the marquee 32px weight; the text-label prices
            ("Contact Sales") drop to 24px + nowrap so they fit on one line
            in the ~180px-wide card without wrapping to "Contact\nSales". */}
        <div
          className={isNumericPrice ? "text-[32px] font-bold leading-none" : "text-[24px] font-bold leading-none whitespace-nowrap"}
          style={{ color: c.heading }}
        >
          {price}
        </div>
        <p className="text-[11px] mt-1.5" style={{ color: c.muted }}>{tier.priceSubtext}</p>
      </div>

      {/* Optional trial affordance chip — reserved slot below the price so
          the CTA still lines up whether or not this tier advertises a free
          trial. Empty when tier.priceChip is unset. */}
      <div className="mb-4" style={{ minHeight: 24 }}>
        {tier.priceChip && (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold"
            style={{
              background: isDark ? "rgba(166,20,195,0.20)" : "rgba(166,20,195,0.10)",
              color: "#A614C3",
            }}
          >
            {tier.priceChip}
          </span>
        )}
      </div>

      {/* CTA — Business ("Most popular" gold badge) gets the primary purple
          gradient; every other tier gets a neutral outlined button. */}
      <button
        type="button"
        className="w-full rounded-lg text-[13px] font-semibold transition-all mb-5"
        style={
          isPrimaryCta
            ? { padding: "10px 16px", background: btnGrad, color: "#FFFFFF", border: "1px solid transparent" }
            : { padding: "10px 16px", background: "transparent", color: c.text, border: `1px solid ${c.border}` }
        }
        onMouseEnter={e => {
          if (!isPrimaryCta) e.currentTarget.style.background = c.hoverBg;
        }}
        onMouseLeave={e => {
          if (!isPrimaryCta) e.currentTarget.style.background = "transparent";
        }}
      >
        {tier.cta}
      </button>

      {/* Divider between CTA and the feature list */}
      <div className="mb-5" style={{ borderTop: `1px solid ${c.border}` }} />

      {/* Feature list — "Everything in <tier>, plus:" acts as a section
          header linking this tier to the previous one. Render it without a
          check chip and bolded so it reads as a header, not as another
          feature row (the check chip made it look like a plain item and
          added visual noise). */}
      <ul className="flex flex-col gap-2.5">
        {tier.features.map(f => {
          const isSectionHeader = /^Everything in .+, plus:$/.test(f);
          if (isSectionHeader) {
            return (
              <li key={f} className="text-[12.5px] font-bold" style={{ color: c.heading }}>
                {f}
              </li>
            );
          }
          return (
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
          );
        })}
      </ul>
    </div>
  );
}
