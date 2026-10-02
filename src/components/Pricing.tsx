"use client";

import { Check, Zap, Rocket, Clock, Sparkles, Minus } from "lucide-react";

interface PricingProps {
  isDark?: boolean;
  // Phase 1 ships only the first two tiers (NorbieLink Free + Pro Plus)
  // so the launch surface is lean. Phase 2 is the full 4-tier grid.
  phase?: 1 | 2;
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
    name: "NorbieLink Free",
    monthly: "$0",
    annual:  "$0",
    priceSubtext: "For individuals/agencies",
    cta: "Get Started",
    group: "essentials",
    features: [
      "Modern, Streamlined Agent Portal",
      "Faster, More Efficient Agent Experience",
      "Global Search Across Quotes, Policies & Bonds",
      "Easy-to-Scan Quote & Policy Management",
      "Clear Statuses & Action Items",
      "Streamlined Endorsement Requests",
      "Self-Service Agency & User Management",
      "Enhanced Security with MFA",
      "Self-Service Password Recovery",
      "Light & Dark Mode",
    ],
  },
  {
    key: "pro",
    name: "NorbieLink + ProSuite",
    monthly: "$8.25",
    annual:  "$99",
    priceSubtext: "per agency/month · Billed annually ($99/year)",
    cta: "Get Started",
    group: "essentials",
    features: [
      "Everything in Free, plus:",
      "AI-Powered Quote Comparison",
      "Self-Service Certificates, 24/7",
      "Real-Time Commercial Leads",
      "1:1 Agency Growth & Strategy Support",
      "Legal & Compliance Document Library",
      "CE Discounts + Easy Compliance Tracking",
      "Agency-Wide Access for $99/Year",
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

export default function Pricing({ isDark = false, phase = 2 }: PricingProps) {
  // Phase 1 scope = first two tiers only. The 4-column grid collapses
  // to 2 columns and the Next-Level band header is suppressed since
  // its tiers are hidden; the Essentials header stays and spans 2 cols.
  const visibleTiers = phase === 1 ? TIERS.slice(0, 2) : TIERS;
  const gridCols = phase === 1 ? "grid-cols-2" : "grid-cols-4";
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
      <div className={`grid ${gridCols} gap-5 mb-4`}>
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
        {phase === 2 && (
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
        )}
      </div>

      {/* Tier grid — 4 columns in phase 2, 2 columns in phase 1. Same-
          height rounded cards. Badge pills sit inline next to the tier
          name (not floating above the card) so headers land on the same
          y-axis across every column. */}
      <div className={`grid ${gridCols} gap-5 pb-12`} style={{ alignItems: "stretch" }}>
        {visibleTiers.map(tier => (
          <TierCard key={tier.key} tier={tier} isDark={isDark} c={c} btnGrad={btnGrad} />
        ))}
      </div>

      {/* 3-column comparison chart. Mirrors the "Legacy vs NorbieLink"
          flyer in Documents, with a 3rd column showing what the
          ProSuite upgrade adds on top of NorbieLink. Rendered below
          the tier grid on both phases so the value prop reads top
          (price cards) → bottom (feature-by-feature compare). */}
      <ComparisonChart isDark={isDark} c={c} btnGrad={btnGrad} />
    </div>
  );
}

/* ─── Legacy vs NorbieLink vs NorbieLink + ProSuite ────────────────────
   Three-column feature compare grouped by workflow phase. Each tier
   column has its own color treatment: Legacy = desaturated grey (the
   past), NorbieLink = neutral card (the present), ProSuite = razz
   gradient stripe (the upgrade). Row cells carry a status glyph
   (check / minus / em-dash) so the eye can skim status before
   reading the body copy. */
function ComparisonChart({
  isDark, c, btnGrad,
}: {
  isDark: boolean;
  c: { text: string; heading: string; muted: string; subtle: string; border: string; cardBg: string; hoverBg: string };
  btnGrad: string;
}) {
  type Cell = { kind: "yes" | "no" | "same"; text?: string };
  type Row = { label: string; legacy: Cell; nl: Cell; pro: Cell };
  type Section = { title: string; rows: Row[] };
  const SECTIONS: Section[] = [
    {
      title: "Your workspace",
      rows: [
        { label: "Overall experience", legacy: { kind: "yes", text: "Dated agent dashboard" }, nl: { kind: "yes", text: "Modern, streamlined workspace" }, pro: { kind: "yes", text: "Full ProSuite apps embedded" } },
        { label: "Navigation",         legacy: { kind: "yes", text: "Top nav, extra clicks" }, nl: { kind: "yes", text: "Streamlined side navigation" }, pro: { kind: "yes", text: "ProSuite tools in the same nav" } },
        { label: "Search",             legacy: { kind: "yes", text: "Limited search" },         nl: { kind: "yes", text: "Global search across quotes, policies, bonds" }, pro: { kind: "yes", text: "AI-powered quote comparison" } },
        { label: "Personalization",    legacy: { kind: "no" },                                  nl: { kind: "yes", text: "Light & dark mode" },           pro: { kind: "same" } },
      ],
    },
    {
      title: "Quoting & servicing",
      rows: [
        { label: "Quotes & policies",  legacy: { kind: "yes", text: "Right-click menus, cluttered views" }, nl: { kind: "yes", text: "Easy-to-scan views, clear statuses" }, pro: { kind: "yes", text: "AI quote comparison across carriers" } },
        { label: "Certificates",       legacy: { kind: "yes", text: "Call BTIS Support" },                   nl: { kind: "yes", text: "Download existing certs" },           pro: { kind: "yes", text: "Self-service, 24/7 (NowCerts)" } },
        { label: "Endorsements",       legacy: { kind: "yes", text: "Submitted through email" },             nl: { kind: "yes", text: "Guided in-portal workflow" },         pro: { kind: "same" } },
        { label: "Lead generation",    legacy: { kind: "no" },                                               nl: { kind: "no" },                                              pro: { kind: "yes", text: "Real-time commercial leads" } },
      ],
    },
    {
      title: "Running your agency",
      rows: [
        { label: "Agency administration", legacy: { kind: "no" },                                            nl: { kind: "yes", text: "Self-service user mgmt + login resets" }, pro: { kind: "yes", text: "Agency-wide access for $99/yr" } },
        { label: "Security",              legacy: { kind: "yes", text: "Existing login experience" },        nl: { kind: "yes", text: "MFA + self-service password recovery" }, pro: { kind: "same" } },
        { label: "Compliance & CE",       legacy: { kind: "yes", text: "Manual tracking" },                  nl: { kind: "yes", text: "Knowledge base + compliance resources" }, pro: { kind: "yes", text: "CE discounts + compliance tracking" } },
        { label: "Agent support",         legacy: { kind: "yes", text: "Routine tasks need BTIS Support" },  nl: { kind: "yes", text: "Self-service reduces calls" },           pro: { kind: "yes", text: "1:1 Agency growth & strategy" } },
      ],
    },
  ];

  const colTemplate = "minmax(170px, 1.1fr) minmax(170px, 1fr) minmax(170px, 1fr) minmax(170px, 1fr)";
  const legacyBg = isDark ? "rgba(255,255,255,0.015)" : "#F9FAFB";
  const proBg    = isDark ? "rgba(166,20,195,0.10)" : "rgba(166,20,195,0.055)";
  const proBorder = isDark ? "rgba(166,20,195,0.35)" : "rgba(166,20,195,0.20)";

  // Status glyph — compact badge that leads every data cell.
  const Glyph = ({ kind, tone }: { kind: Cell["kind"]; tone: "legacy" | "nl" | "pro" }) => {
    if (kind === "same") {
      return (
        <span className="inline-flex items-center justify-center flex-shrink-0 mt-0.5" style={{ width: 16, height: 16 }}>
          <span style={{ display: "block", width: 10, height: 2, borderRadius: 2, background: c.subtle }} />
        </span>
      );
    }
    if (kind === "no") {
      return (
        <span className="inline-flex items-center justify-center flex-shrink-0 mt-0.5 rounded-full"
          style={{ width: 16, height: 16, background: isDark ? "rgba(255,255,255,0.06)" : "#F3F4F6" }}>
          <Minus className="w-2.5 h-2.5" style={{ color: c.subtle }} strokeWidth={3} />
        </span>
      );
    }
    const checkColor = tone === "pro" ? "#A614C3" : tone === "nl" ? "#A614C3" : (isDark ? "#8B8FA8" : "#9CA3AF");
    const checkBg = tone === "pro"
      ? (isDark ? "rgba(166,20,195,0.22)" : "rgba(166,20,195,0.12)")
      : tone === "nl"
      ? (isDark ? "rgba(166,20,195,0.14)" : "rgba(166,20,195,0.10)")
      : (isDark ? "rgba(255,255,255,0.06)" : "#F3F4F6");
    return (
      <span className="inline-flex items-center justify-center flex-shrink-0 mt-0.5 rounded-full"
        style={{ width: 16, height: 16, background: checkBg }}>
        <Check className="w-2.5 h-2.5" style={{ color: checkColor }} strokeWidth={3} />
      </span>
    );
  };

  const cellTextStyle = (tone: "legacy" | "nl" | "pro"): React.CSSProperties => ({
    fontSize: 12.5,
    lineHeight: 1.5,
    color: tone === "legacy" ? c.muted : c.text,
    fontWeight: tone === "pro" ? 500 : 400,
  });

  return (
    <section className="pb-16">
      <div className="mb-5 flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h2 className="text-[22px] font-bold" style={{ color: c.heading }}>Legacy vs NorbieLink</h2>
          <p className="text-[12.5px] mt-1" style={{ color: c.muted }}>
            Side-by-side look at today&apos;s dashboard, the new NorbieLink portal, and what ProSuite layers on top.
          </p>
        </div>
        {/* Compact legend */}
        <div className="flex items-center gap-4 text-[11px]" style={{ color: c.muted }}>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center rounded-full" style={{ width: 14, height: 14, background: isDark ? "rgba(166,20,195,0.14)" : "rgba(166,20,195,0.10)" }}>
              <Check className="w-2 h-2" style={{ color: "#A614C3" }} strokeWidth={3} />
            </span>
            Available
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center rounded-full" style={{ width: 14, height: 14, background: isDark ? "rgba(255,255,255,0.06)" : "#F3F4F6" }}>
              <Minus className="w-2 h-2" style={{ color: c.subtle }} strokeWidth={3} />
            </span>
            Not available
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span style={{ display: "inline-block", width: 10, height: 2, borderRadius: 2, background: c.subtle }} />
            Same as NorbieLink
          </span>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
        {/* Column header row — tier names get their own color + icon
            treatment so the three tiers read as distinct products
            before the body copy loads. */}
        <div className="grid gap-0" style={{ gridTemplateColumns: colTemplate, borderBottom: `1px solid ${c.border}` }}>
          <div style={{ padding: "18px 20px", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: c.muted }}>
            Experience
          </div>
          <div style={{ padding: "18px 20px", background: legacyBg, borderLeft: `1px solid ${c.border}` }}>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center rounded-md" style={{ width: 20, height: 20, background: isDark ? "rgba(255,255,255,0.06)" : "#E5E7EB" }}>
                <Clock className="w-3 h-3" style={{ color: c.muted }} strokeWidth={2.25} />
              </span>
              <div style={{ fontSize: 13, fontWeight: 700, color: c.muted }}>Legacy</div>
            </div>
            <div className="text-[10.5px] mt-1" style={{ color: c.subtle, lineHeight: 1.4 }}>Today&apos;s dashboard</div>
          </div>
          <div style={{ padding: "18px 20px", borderLeft: `1px solid ${c.border}` }}>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center rounded-md" style={{ width: 20, height: 20, background: isDark ? "rgba(166,20,195,0.14)" : "rgba(166,20,195,0.10)" }}>
                <Sparkles className="w-3 h-3" style={{ color: "#A614C3" }} strokeWidth={2.25} />
              </span>
              <div style={{ fontSize: 13, fontWeight: 700, color: c.heading }}>NorbieLink</div>
            </div>
            <div className="text-[10.5px] mt-1" style={{ color: c.muted, lineHeight: 1.4 }}>The new portal</div>
          </div>
          <div style={{ padding: "18px 20px", background: proBg, borderLeft: `1px solid ${proBorder}` }}>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center rounded-md" style={{ width: 20, height: 20, background: btnGrad }}>
                <Rocket className="w-3 h-3 text-white" strokeWidth={2.25} />
              </span>
              <div style={{ fontSize: 13, fontWeight: 700,
                backgroundImage: "linear-gradient(88.54deg, #5C2ED4 0.1%, #A614C3 63.88%)",
                backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                NorbieLink + ProSuite
              </div>
            </div>
            <div className="text-[10.5px] mt-1" style={{ color: c.muted, lineHeight: 1.4 }}>Everything in NorbieLink, plus upgrades</div>
          </div>
        </div>

        {/* Sections — each section opens with a small eyebrow row that
            spans the "Experience" column only, so the tier columns
            keep flowing uninterrupted top-to-bottom. */}
        {SECTIONS.map((section, sIdx) => (
          <div key={section.title}>
            <div className="grid gap-0" style={{ gridTemplateColumns: colTemplate, borderTop: sIdx === 0 ? "none" : `1px solid ${c.border}` }}>
              <div style={{ padding: "14px 20px 6px", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#A614C3" }}>
                {section.title}
              </div>
              <div style={{ background: legacyBg, borderLeft: `1px solid ${c.border}` }} />
              <div style={{ borderLeft: `1px solid ${c.border}` }} />
              <div style={{ background: proBg, borderLeft: `1px solid ${proBorder}` }} />
            </div>
            {section.rows.map((row, rIdx) => {
              const isLast = sIdx === SECTIONS.length - 1 && rIdx === section.rows.length - 1;
              return (
                <div
                  key={row.label}
                  className="grid gap-0"
                  style={{ gridTemplateColumns: colTemplate, borderTop: `1px solid ${c.border}`, alignItems: "stretch" }}
                >
                  <div style={{ padding: "14px 20px", fontSize: 13, fontWeight: 600, color: c.heading }}>{row.label}</div>
                  <div style={{ padding: "14px 20px", background: legacyBg, display: "flex", gap: 8, borderLeft: `1px solid ${c.border}` }}>
                    <Glyph kind={row.legacy.kind} tone="legacy" />
                    <span style={cellTextStyle("legacy")}>{row.legacy.text ?? (row.legacy.kind === "no" ? "Not available" : "Same")}</span>
                  </div>
                  <div style={{ padding: "14px 20px", display: "flex", gap: 8, borderLeft: `1px solid ${c.border}` }}>
                    <Glyph kind={row.nl.kind} tone="nl" />
                    <span style={cellTextStyle("nl")}>{row.nl.text ?? (row.nl.kind === "no" ? "Not included" : "Same")}</span>
                  </div>
                  <div
                    style={{
                      padding: "14px 20px",
                      background: proBg,
                      borderLeft: `1px solid ${proBorder}`,
                      display: "flex",
                      gap: 8,
                      borderBottomRightRadius: isLast ? 16 : 0,
                    }}
                  >
                    <Glyph kind={row.pro.kind} tone="pro" />
                    <span style={cellTextStyle("pro")}>{row.pro.text ?? "Same as NorbieLink"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
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
