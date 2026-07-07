"use client";

import { useState } from "react";
import { Lightbulb, ClipboardCheck, ChevronRight, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// 3×3 dot grid — the "apps" affordance shown in the design; lucide's LayoutGrid
// is 4 squares (2×2), not what we want here.
function DotGridIcon({ className, color }: { className?: string; color: string }) {
  const dots = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      dots.push(<circle key={`${r}-${c}`} cx={4 + c * 4} cy={4 + r * 4} r={1.7} fill={color} />);
    }
  }
  return (
    <svg className={className} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {dots}
    </svg>
  );
}

interface MarketplaceProps {
  isDark?: boolean;
}

// Left-column tiles. `icon` is the base filename in /public/insurance-icons/;
// dark variant is inferred as "<icon> Dark.png" unless `noDark` is true.
const CATEGORIES: { label: string; icon: string; noDark?: boolean }[] = [
  { label: "Contractor General Liability", icon: "General Liability" },
  { label: "Worker's Comp",                icon: "Workers Comp", noDark: true },
  { label: "Non-Contractors GL/BOP",       icon: "Business Owners" },
  { label: "Excess",                       icon: "Excess" },
  { label: "Bonds",                        icon: "Bonds", noDark: true },
  { label: "Commercial Auto",              icon: "Commercial Auto" },
  { label: "Lessor's Risk",                icon: "Lessor's Risk" },
  { label: "Professional Liability",       icon: "Professional Liability" },
  { label: "Cannabis",                     icon: "Cannabis" },
  { label: "Home Based Business",          icon: "Home Based Business" },
  { label: "Non-Profit",                   icon: "Non-Profit" },
  { label: "Pollution Liability",          icon: "Pollution" },
  { label: "Builders Risk",                icon: "Builders Risk" },
  { label: "Inland Marine",                icon: "Inland Marine" },
  { label: "Boat/Marina Contractors GL",   icon: "Marine Contractors" },
  { label: "Cyber Risk",                   icon: "Cyber" },
  { label: "Vacant Risks",                 icon: "Vacant Risks" },
  { label: "Special Events",               icon: "Special Events", noDark: true },
  { label: "Truckers GL",                  icon: "Truckers GL" },
];

type PromoCategory = "Products" | "Markets" | "Bonds" | "Contests";

// The right column is a curated editorial feed, not a rotating carousel. The
// first item is the featured "hero" (gradient card); the rest render as a
// compact "More this week" list so the pattern scales cleanly from 1 to N
// without pagination dots. The category tabs above the mini list toggle which
// non-hero items are visible; the hero itself stays fixed.
const HIGHLIGHTS: {
  category: PromoCategory;
  tag: string;
  tagColor: string;
  title: string;
  body: string;
  cta: string;
  // Hero-specific — only the first entry uses this gradient
  gradient?: string;
  // Full promo art in /public/marketplace-promos/. When present, fills the
  // mini-card left tile edge-to-edge or sits behind the hero's overlay.
  // Absent on mock promos, which fall back to `imageGradient` + `thumb`.
  image?: string;
  // Per-card object-position override for the mini-tile crop.
  imagePosition?: string;
  // Placeholder art for promos without real campaign imagery yet. Rendered
  // as a gradient tile with a centered icon — visually signals "coming soon"
  // vs. the photo-real banner tiles from live campaigns.
  imageGradient?: string;
  thumb?: LucideIcon;
}[] = [
  {
    category: "Contests",
    tag: "CONTEST",
    tagColor: "#5C2ED4",
    title: "Write big. Win Foo Fighters in Vegas.",
    body: "Top binder in GL, WC, Bonds, or BOP between Mar 1 and Aug 1 wins a suite at Allegiant Stadium on Sept 26.",
    cta: "See contest details",
    gradient: "linear-gradient(135deg,#5C2ED4 0%,#7A2FBE 40%,#A614C3 70%,#C8408E 100%)",
    image: "/marketplace-promos/foo-fighters.png",
  },
  {
    category: "Bonds",
    tag: "NEW BOND",
    tagColor: "#A614C3",
    title: "California MVD dealer bonds",
    body: "$50k used-dealer bond from $400/yr, $10k wholesale from $90/yr. Verifier and yacht broker bonds too.",
    cta: "Quote a bond",
    image: "/marketplace-promos/ca-mvd-bonds.png",
  },
  {
    category: "Markets",
    tag: "NEW MARKET",
    tagColor: "#6366F1",
    title: "Non-Contractor GL & BOP marketplace",
    body: "Quote, bind, and issue GL and BOP online across 100+ classes including accounting, retail, food services, and tech.",
    cta: "Explore marketplace",
    image: "/marketplace-promos/bop-marketplace.png",
    // ~86% ≈ 25px focal-point shift left of the default `right center`
    // crop (banner is 900×352 → scales to ~281px in a 96px-wide tile, so
    // 100% - 25px/185px ≈ 86%). The gorilla illustration sits slightly
    // left of the banner's right edge, so the crop lands better there.
    imagePosition: "86% center",
  },
  {
    category: "Products",
    tag: "PRODUCT UPDATE",
    tagColor: "#0EA5A5",
    title: "Brivado adds 17 contractor classes",
    body: "General Liability program expands to specialty trades and hard-to-place contractors with flexible limits up to $2M.",
    cta: "Get a quote",
    image: "/marketplace-promos/brivado-new-classes.png",
  },
  {
    category: "Contests",
    tag: "PROMO",
    tagColor: "#5C2ED4",
    title: "$50 gift card per WC bind",
    body: "Bind AmTrust or GUARD Workers' Comp between Jul 1 and Sept 30 to earn $50 gift cards. Unlimited earnings, no size caps.",
    cta: "Start quoting",
    image: "/marketplace-promos/wc-gift-cards.png",
  },
];

// Ordered filter tabs. "All" sits first so users land on the widest set.
const FILTERS: ("All" | PromoCategory)[] = ["All", "Products", "Markets", "Bonds", "Contests"];

export default function Marketplace({ isDark = false }: MarketplaceProps) {
  const text     = isDark ? "#F9FAFB" : "#1F2937";
  const heading  = isDark ? "#F9FAFB" : "#2D3653";
  const muted    = isDark ? "#8B8FA8" : "#6B7280";
  const subtle   = isDark ? "#8B8FA8" : "#9CA3AF";
  const border   = isDark ? "rgba(255,255,255,0.10)" : "#E5E7EB";
  const cardBg   = isDark ? "#1E2240" : "#FFFFFF";
  const surface  = isDark ? "#191D35" : "#FFFFFF";
  const tileHover = isDark ? "rgba(166,20,195,0.10)" : "rgba(166,20,195,0.06)";

  const [filter, setFilter] = useState<"All" | PromoCategory>("All");
  // Hero is HIGHLIGHTS[0] and stays fixed regardless of filter. The rest of
  // the list is what the tabs toggle. "All" bypasses the category check.
  const visibleMinis = HIGHLIGHTS.slice(1).filter(
    h => filter === "All" || h.category === filter
  );

  return (
    <div
      style={{
        fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
        color: text,
      }}
    >
      {/* Page title bar — matches Quotes / Policies: 71px full-bleed strip
          extending past the main's px-12, with 28px inner padding.
          `marginTop: -24` cancels the 24px `paddingTop` the shell adds to non-
          fullHeight pages, so the title sits flush against the TopBar exactly
          like on the Quotes / Policies pages (which run with paddingTop:0). */}
      <div
        className="flex flex-col justify-center flex-shrink-0 mb-12"
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
        <h1 className="text-[22px] font-normal" style={{ color: heading }}>Marketplace</h1>
      </div>

      {/* Two-column layout — column widths follow the Figma 888 : 600 ratio
          (≈ 1.48 : 1) so the grid and the right rail stay proportional at any width.
          The "Start a new quote…" header lives in its own row so it only spans the
          LEFT column; that lets the tiles grid and the right-side banner start at
          the same y (both anchored to row 2). */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "minmax(0, 888fr) minmax(0, 600fr)",
          gridTemplateRows: "auto auto",
          columnGap: 32,
          rowGap: 0,
        }}
      >
        {/* LEFT header — row 1, column 1 only */}
        <div
          className="mb-5"
          style={{ gridColumn: 1, gridRow: 1 }}
        >
          <h2 className="text-[20px] font-bold leading-tight" style={{ color: heading }}>
            Start a new quote...
          </h2>
          <p className="text-[13px] mt-1" style={{ color: muted }}>
            Select line of business to begin submission
          </p>
        </div>

        {/* RIGHT header — grid/list toggle, right-aligned with the aside below. */}
        <div
          className="mb-5 flex justify-end"
          style={{ gridColumn: 2, gridRow: 1 }}
        >
          <button
            className="rounded-lg flex items-center justify-center transition-colors"
            style={{
              width: 48, height: 48,
              border: "none",
              background: "transparent",
              cursor: "pointer",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = tileHover)}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            aria-label="Grid view"
          >
            <DotGridIcon className="w-6 h-6" color={heading} />
          </button>
        </div>

        {/* LEFT tiles — row 2, column 1. Tiles keep their natural
            (~140px) height regardless of how tall the aside next to them
            grows; `alignSelf: start` opts this cell out of the grid's
            default stretch so tiles no longer inflate to match the
            weekly-highlights column. */}
        <section
          style={{ gridColumn: 1, gridRow: 2, alignSelf: "start" }}
          className="flex flex-col"
        >
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            }}
          >
            {CATEGORIES.map(cat => {
              const iconFile = isDark && !cat.noDark
                ? `/insurance-icons/${cat.icon} Dark.png`
                : `/insurance-icons/${cat.icon}.png`;
              return (
                <button
                  key={cat.label}
                  className="group flex flex-col items-center justify-center gap-3 rounded-2xl transition-all cursor-pointer"
                  style={{
                    background: cardBg,
                    border: `1px solid ${border}`,
                    padding: "20px 12px",
                    minHeight: 140,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = `linear-gradient(${cardBg}, ${cardBg}) padding-box, linear-gradient(to right, #5C2ED4 0%, #A614C3 65%) border-box`;
                    e.currentTarget.style.border = "1px solid transparent";
                    e.currentTarget.style.boxShadow = "0 0 8px rgba(166,20,195,0.35)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = cardBg;
                    e.currentTarget.style.border = `1px solid ${border}`;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <span
                    className="flex items-center justify-center rounded-full flex-shrink-0"
                    style={{
                      width: 60, height: 60,
                      background: isDark ? "rgba(255,255,255,0.06)" : "#EFEFEF",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={iconFile}
                      alt=""
                      style={{ width: 38, height: 38, objectFit: "contain" }}
                    />
                  </span>
                  <span
                    className="text-[12px] font-medium text-center leading-tight px-1"
                    style={{ color: heading }}
                  >
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* RIGHT — weekly spotlight + quick links + footer. Anchored to row 2 so
            its top edge aligns with the tiles grid rather than the section header.
            HIGHLIGHTS[0] renders as the featured hero; the rest render as a
            compact "More this week" list so the layout scales to N items without
            pagination. */}
        <aside className="flex flex-col gap-5" style={{ gridColumn: 2, gridRow: 2 }}>
          {/* Section eyebrow — signals editorial rather than ad */}
          <div className="flex items-center gap-2">
            <span
              className="flex items-center justify-center rounded-md"
              style={{ width: 20, height: 20, background: "linear-gradient(135deg,#5C2ED4 0%,#A614C3 65%)" }}
            >
              <Sparkles className="w-3 h-3 text-white" strokeWidth={2.25} />
            </span>
            <span
              className="text-[11px] font-semibold uppercase"
              style={{ color: heading, letterSpacing: "0.14em" }}
            >
              This week&apos;s highlights
            </span>
          </div>

          {/* Featured spotlight — HIGHLIGHTS[0] */}
          {(() => {
            const hero = HIGHLIGHTS[0];
            return (
              <div
                className="relative rounded-2xl overflow-hidden flex-shrink-0"
                style={{
                  minHeight: 220,
                  background: hero.gradient,
                }}
              >
                {/* Full-cover promo art — sits behind text; `objectPosition:
                    center right` keeps the banner's key illustration visible
                    on the right while the left is dimmed for text legibility. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hero.image}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center right",
                  }}
                />
                {/* Legibility overlay — nearly-opaque deep-purple wash
                    across the entire text half (~60% width) with a darker
                    base tint so the source banner's marketing text stops
                    bleeding through the headline. Fades sharply from 60%
                    onward to let the FF stamp show on the right. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(20,5,60,0.97) 0%, rgba(20,5,60,0.94) 70%, rgba(58,20,128,0.55) 100%)",
                  }}
                />

                <div className="relative z-10 h-full p-6 flex flex-col gap-5">
                  <div className="flex flex-col gap-3">
                    <span
                      className="self-start text-[10px] font-bold uppercase px-2.5 py-1 rounded-md"
                      style={{
                        color: "#ffffff",
                        background: "rgba(255,255,255,0.20)",
                        letterSpacing: "0.14em",
                        border: "1px solid rgba(255,255,255,0.28)",
                      }}
                    >
                      {hero.tag}
                    </span>
                    <div className="text-white text-[20px] font-bold leading-tight">
                      {hero.title}
                    </div>
                    {hero.body && (
                      <div className="text-white text-[12.5px] leading-relaxed" style={{ opacity: 0.92 }}>
                        {hero.body}
                      </div>
                    )}
                  </div>
                  {hero.cta && (
                    <button
                      className="self-start px-4 py-2 rounded-lg text-[12px] font-semibold transition-all inline-flex items-center gap-1.5"
                      style={{
                        background: "#ffffff",
                        color: "#5C2ED4",
                        border: "none",
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.10)"; }}
                    >
                      {hero.cta}
                      <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Category filter — five pills toggle which slider promos show.
              The hero above is fixed; only the slider below responds. */}
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map(f => {
              const active = filter === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors"
                  style={{
                    background: active
                      ? "linear-gradient(90deg,#5C2ED4 0%,#A614C3 100%)"
                      : "transparent",
                    color: active ? "#ffffff" : muted,
                    border: active ? "1px solid transparent" : `1px solid ${border}`,
                    cursor: "pointer",
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>

          {/* Vertical list of image-left mini cards. Real promos render first;
              remaining slots (up to 5 total) fill with dashed "Coming soon"
              placeholders so the aside height stays roughly constant across
              filter switches. */}
          <div className="flex flex-col gap-3">
            {visibleMinis.map(h => {
              const Thumb = h.thumb;
              return (
                <a
                  key={h.title}
                  href="#"
                  className="group rounded-2xl p-3 flex items-stretch gap-3 transition-all overflow-hidden"
                  style={{
                    height: 120,
                    background: surface,
                    border: `1px solid ${border}`,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.background = `linear-gradient(${surface}, ${surface}) padding-box, linear-gradient(to right, #5C2ED4 0%, #A614C3 65%) border-box`;
                    e.currentTarget.style.border = "1px solid transparent";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.background = surface;
                    e.currentTarget.style.border = `1px solid ${border}`;
                  }}
                >
                  <span
                    className="relative flex-shrink-0 rounded-xl overflow-hidden flex items-center justify-center"
                    style={{
                      width: 96,
                      background: h.image ? undefined : h.imageGradient,
                    }}
                    aria-hidden="true"
                  >
                    {h.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={h.image}
                        alt=""
                        className="absolute inset-0"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: h.imagePosition ?? "right center",
                        }}
                      />
                    ) : Thumb ? (
                      <Thumb className="w-7 h-7 text-white" strokeWidth={1.75} />
                    ) : null}
                  </span>
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <div
                        className="text-[10px] font-bold uppercase mb-0.5"
                        style={{ color: h.tagColor, letterSpacing: "0.10em" }}
                      >
                        {h.tag}
                      </div>
                      <div className="text-[13px] font-bold leading-tight mb-1" style={{ color: heading }}>
                        {h.title}
                      </div>
                      <div className="text-[11px] leading-snug" style={{
                        color: muted,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}>
                        {h.body}
                      </div>
                    </div>
                    <span
                      className="mt-1.5 text-[11px] font-semibold inline-flex items-center gap-1 transition-transform group-hover:translate-x-0.5"
                      style={{ color: h.tagColor }}
                    >
                      {h.cta}
                      <ChevronRight className="w-3 h-3" strokeWidth={2.5} />
                    </span>
                  </div>
                </a>
              );
            })}
          </div>

          {/* Quick-link cards — compact horizontal rows */}
          <div className="grid grid-cols-2 gap-3">
            <QuickCard
              icon={<Lightbulb className="w-4 h-4 text-white" strokeWidth={2} />}
              title="NorbieLink Tour"
              subtitle="Guided tour"
              surface={surface}
              border={border}
              heading={heading}
              muted={muted}
            />
            <QuickCard
              icon={<ClipboardCheck className="w-4 h-4 text-white" strokeWidth={2} />}
              title="Appetite Search"
              subtitle="Find a market"
              surface={surface}
              border={border}
              heading={heading}
              muted={muted}
            />
          </div>

          {/* Footer */}
          <div className="mt-2 text-center leading-relaxed" style={{ color: subtle }}>
            <div className="text-[10px]">
              Copyright © 2026 Builders &amp; Tradesmen&apos;s Insurance Services, Inc. (lic.#:0D10271)
            </div>
            <div className="text-[10px]">
              A Division of The Amynta Group |{" "}
              <a href="#" className="hover:underline">Privacy Policy</a>
              {" | "}
              <a href="#" className="hover:underline">Terms of Use</a>
            </div>
          </div>
        </aside>
      </div>

    </div>
  );
}

interface QuickCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  surface: string;
  border: string;
  heading: string;
  muted: string;
}

// Compact horizontal quick action — icon on the left, title + one-line subtitle
// stacked in the middle, chevron on the right. Shorter than a full editorial
// card so the right column's total height matches the left tiles grid.
function QuickCard({ icon, title, subtitle, surface, border, heading, muted }: QuickCardProps) {
  return (
    <a
      href="#"
      className="rounded-xl p-3 flex items-center gap-3 transition-all"
      style={{
        background: surface,
        border: `1px solid ${border}`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = `linear-gradient(${surface}, ${surface}) padding-box, linear-gradient(to right,#5C2ED4 0%,#A614C3 65%) border-box`;
        e.currentTarget.style.border = "1px solid transparent";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = surface;
        e.currentTarget.style.border = `1px solid ${border}`;
      }}
    >
      <span
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: "linear-gradient(135deg,#5C2ED4 0%,#A614C3 65%)" }}
      >
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] font-bold leading-tight" style={{ color: heading }}>
          {title}
        </div>
        <div className="text-[11px] mt-0.5 leading-tight truncate" style={{ color: muted }}>
          {subtitle}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "#A614C3" }} strokeWidth={2.25} />
    </a>
  );
}
