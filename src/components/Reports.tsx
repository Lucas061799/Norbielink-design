"use client";

import { useState } from "react";
import { Download, X, ChevronDown, Check, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface ReportsProps {
  isDark?: boolean;
  onNavigate?: (page: string) => void;
}

const FONT = "var(--font-montserrat), Montserrat, sans-serif";
const RAZZ = "linear-gradient(90deg,#5C2ED4 0%,#A614C3 100%)";
const TEAL_GRAD = "linear-gradient(90deg,#0EA5A5 0%,#2DD4BF 100%)";
const HERO_GRAD = "linear-gradient(100deg,#A614C3 0%,#7C3AED 55%,#14B8A6 100%)";
const TEAL = "#0D9488";

const AS_OF = "Nov 11, 2026";
const PREV_AS_OF = "Oct 11";

// Adoption snapshots by cohort (current + previous month, sample).
type Cohort = "all" | "w1" | "w2" | "w3";
interface Snap { total: number; loggedin: number; active30: number; active7: number; }
const DATASET: Record<Cohort, { label: string; short: string; cur: Snap; prev: Snap }> = {
  all: { label: "All agencies",      short: "All agencies", cur: { total: 963, loggedin: 634, active30: 389, active7: 185 }, prev: { total: 915, loggedin: 571, active30: 352, active7: 168 } },
  w1:  { label: "Wave 1 · earliest", short: "Wave 1",       cur: { total: 420, loggedin: 357, active30: 243, active7: 121 }, prev: { total: 420, loggedin: 345, active30: 232, active7: 115 } },
  w2:  { label: "Wave 2",            short: "Wave 2",       cur: { total: 330, loggedin: 198, active30: 112, active7: 50 },  prev: { total: 300, loggedin: 165, active30: 95,  active7: 44 } },
  w3:  { label: "Wave 3 · newest",   short: "Wave 3",       cur: { total: 213, loggedin: 79,  active30: 34,  active7: 14 },  prev: { total: 195, loggedin: 61,  active30: 25,  active7: 9 } },
};
const COHORTS: Cohort[] = ["all", "w1", "w2", "w3"];

const pct = (n: number, base: number) => Math.round((n / base) * 100);
const pct1 = (n: number, base: number) => ((n / base) * 100).toFixed(1);

// ── Activity & traffic (range-driven, sample) ─────────────────────────────
type RangeId = "7d" | "30d" | "90d" | "12m" | "ytd";
const RANGES: { id: RangeId; label: string }[] = [
  { id: "7d", label: "Last 7 days" }, { id: "30d", label: "Last 30 days" },
  { id: "90d", label: "Last 90 days" }, { id: "12m", label: "Last 12 months" }, { id: "ytd", label: "Year to date" },
];
type Pair = [number, number];
interface RangeData { prevLabel: string; active: Pair; onboarded: Pair; started: Pair; submitted: Pair; bound: Pair; premium: Pair; series: { l: string; c: number }[]; }
const RANGE_DATA: Record<RangeId, RangeData> = {
  "7d":  { prevLabel: "prior 7 days", active: [185, 171], onboarded: [19, 22], started: [1120, 1030], submitted: [740, 690], bound: [250, 236], premium: [3.1, 2.9], series: [{ l: "Mon", c: 3 }, { l: "Tue", c: 2 }, { l: "Wed", c: 4 }, { l: "Thu", c: 4 }, { l: "Fri", c: 3 }, { l: "Sat", c: 1 }, { l: "Sun", c: 2 }] },
  "30d": { prevLabel: "prior 30 days", active: [389, 341], onboarded: [63, 88], started: [4820, 4510], submitted: [3140, 2980], bound: [1090, 1015], premium: [13.4, 12.6], series: [{ l: "Wk 1", c: 15 }, { l: "Wk 2", c: 17 }, { l: "Wk 3", c: 18 }, { l: "Wk 4", c: 13 }] },
  "90d": { prevLabel: "prior 90 days", active: [521, 486], onboarded: [225, 198], started: [14200, 13050], submitted: [9250, 8600], bound: [3180, 2910], premium: [39.6, 36.4], series: [{ l: "Sep", c: 74 }, { l: "Oct", c: 88 }, { l: "Nov", c: 63 }] },
  "12m": { prevLabel: "prior 12 months", active: [612, 560], onboarded: [709, 631], started: [57600, 50200], submitted: [37400, 33100], bound: [12900, 11250], premium: [161, 142], series: [{ l: "Dec", c: 44 }, { l: "Jan", c: 49 }, { l: "Feb", c: 55 }, { l: "Mar", c: 58 }, { l: "Apr", c: 61 }, { l: "May", c: 66 }, { l: "Jun", c: 38 }, { l: "Jul", c: 52 }, { l: "Aug", c: 61 }, { l: "Sep", c: 74 }, { l: "Oct", c: 88 }, { l: "Nov", c: 63 }] },
  "ytd": { prevLabel: "same period last year", active: [604, 560], onboarded: [665, 590], started: [52800, 47900], submitted: [34300, 31200], bound: [11850, 10700], premium: [148, 131], series: [{ l: "Jan", c: 49 }, { l: "Feb", c: 55 }, { l: "Mar", c: 58 }, { l: "Apr", c: 61 }, { l: "May", c: 66 }, { l: "Jun", c: 38 }, { l: "Jul", c: 52 }, { l: "Aug", c: 61 }, { l: "Sep", c: 74 }, { l: "Oct", c: 88 }, { l: "Nov", c: 63 }] },
};
const TRAFFIC: Record<RangeId, { sessions: Pair; avgDur: Pair; pps: Pair; returning: Pair }> = {
  "7d": { sessions: [1980, 1840], avgDur: [372, 360], pps: [5.2, 5.0], returning: [63, 61] },
  "30d": { sessions: [8450, 7720], avgDur: [388, 375], pps: [5.6, 5.3], returning: [66, 63] },
  "90d": { sessions: [25100, 23200], avgDur: [401, 390], pps: [5.8, 5.6], returning: [69, 66] },
  "12m": { sessions: [102000, 89000], avgDur: [410, 395], pps: [6.0, 5.7], returning: [71, 68] },
  "ytd": { sessions: [93500, 82000], avgDur: [406, 392], pps: [5.9, 5.6], returning: [70, 67] },
};
const LOB_SHARES = [
  { lob: "General Liability", share: 0.31 }, { lob: "Commercial Auto", share: 0.23 }, { lob: "Professional Liability", share: 0.18 },
  { lob: "Cyber", share: 0.13 }, { lob: "Bonds", share: 0.08 }, { lob: "Workers' Comp", share: 0.07 },
];
const TOP_MODULES = [{ name: "Marketplace", share: 34 }, { name: "Quotes", share: 22 }, { name: "Policies", share: 15 }, { name: "Agencies", share: 12 }, { name: "Endorsements", share: 8 }, { name: "Reports", share: 5 }, { name: "Other", share: 4 }];
const SOURCES = [{ name: "Direct", share: 48 }, { name: "Invite email", share: 27 }, { name: "Bookmark", share: 14 }, { name: "Referral", share: 7 }, { name: "Search", share: 4 }];
const DEVICES = [{ name: "Desktop", share: 82 }, { name: "Mobile", share: 14 }, { name: "Tablet", share: 4 }];
const STATES = [{ name: "CA", share: 21 }, { name: "TX", share: 13 }, { name: "FL", share: 11 }, { name: "NY", share: 9 }, { name: "IL", share: 7 }];
const fmtM = (n: number) => (n >= 100 ? `$${Math.round(n)}M` : `$${n.toFixed(1)}M`);
const fmtDur = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDate = (iso: string) => { const [y, m, dd] = iso.split("-").map(Number); return `${MONTHS_SHORT[m - 1]} ${dd}, ${y}`; };
const fmtShort = (iso: string) => { const [, m, dd] = iso.split("-").map(Number); return `${MONTHS_SHORT[m - 1]} ${dd}`; };
// Map a custom span (days) onto the nearest sample bucket so the mocked
// metrics still resolve. A real build would query the exact date range.
const bucketFor = (days: number): RangeId => (days <= 10 ? "7d" : days <= 45 ? "30d" : days <= 135 ? "90d" : days <= 280 ? "ytd" : "12m");

// ── Drill-down segments ───────────────────────────────────────────────────
const AGENCY_POOL = [
  { name: "Summit Risk Partners",    contact: "Dana Pruitt",   email: "dana@summitrisk.com",       phone: "(415) 555-0132" },
  { name: "Harbor & Vale Insurance", contact: "Marcus Reed",   email: "marcus@harborvale.com",     phone: "(206) 555-0177" },
  { name: "Cedar Ridge Agency",      contact: "Priya Nair",    email: "priya@cedarridge.com",      phone: "(503) 555-0190" },
  { name: "Blue Harbor Brokers",     contact: "Owen Clarke",   email: "owen@blueharbor.com",       phone: "(619) 555-0144" },
  { name: "Northgate Assurance",     contact: "Hannah Boyd",   email: "hannah@northgateassure.com",phone: "(312) 555-0168" },
  { name: "Pine Street Insurance",   contact: "Luis Ortega",   email: "luis@pinestreetins.com",    phone: "(602) 555-0121" },
  { name: "Meridian Coverage Group", contact: "Grace Lin",     email: "grace@meridiancoverage.com",phone: "(646) 555-0109" },
  { name: "Lakeside Underwriters",   contact: "Trevor Shaw",   email: "trevor@lakesideuw.com",     phone: "(414) 555-0155" },
  { name: "Ironwood Insurance",      contact: "Nadia Khan",    email: "nadia@ironwoodins.com",     phone: "(480) 555-0188" },
  { name: "Crestline Risk",          contact: "Brian Foley",   email: "brian@crestlinerisk.com",   phone: "(714) 555-0133" },
  { name: "Vanguard Agency",         contact: "Sofia Mendes",  email: "sofia@vanguardagency.com",  phone: "(305) 555-0176" },
  { name: "Oakfield Brokers",        contact: "Derek Yoon",    email: "derek@oakfieldbrokers.com", phone: "(972) 555-0112" },
];
type SegKind = "all" | "loggedin" | "active" | "weekly" | "nologin" | "dormant";
const SEG_INFO: Record<SegKind, { title: string; note: string; meta: (i: number) => string }> = {
  all:      { title: "All tracked agencies",            note: "Every agency in the reporting universe.",               meta: () => "Tracked" },
  loggedin: { title: "Agencies that have logged in",    note: "Signed in at least once — adopted.",                    meta: (i) => `Last login ${["2 days", "5 days", "1 week", "3 weeks", "1 month"][i % 5]} ago` },
  active:   { title: "Active agencies · last 30 days",  note: "Recorded portal activity in the last 30 days.",         meta: () => "Active this month" },
  weekly:   { title: "Active agencies · last 7 days",   note: "Recorded portal activity in the last 7 days.",          meta: () => "Active this week" },
  nologin:  { title: "Agencies with no recorded login", note: "Invited but never signed in — onboarding opportunity.", meta: (i) => `Invited ${["Oct 2", "Sep 18", "Aug 30", "Jul 12"][i % 4]} · never signed in` },
  dormant:  { title: "Lapsed agencies",                 note: "Logged in before, inactive 30+ days — re-engage.",      meta: (i) => `Last active ${["5", "7", "9", "12", "16"][i % 5]} weeks ago` },
};
const buildSegment = (kind: SegKind, count: number) => ({ kind, count, title: SEG_INFO[kind].title, note: SEG_INFO[kind].note, rows: AGENCY_POOL.map((a, i) => ({ ...a, meta: SEG_INFO[kind].meta(i) })) });
const downloadCsv = (filename: string, rows: (string | number)[][]) => {
  const csv = rows.map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(",")).join("\n");
  try {
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  } catch { /* download blocked */ }
};

function SampleTag() {
  return <span className="text-[9.5px] font-semibold uppercase px-1.5 py-0.5 rounded flex-shrink-0" style={{ fontFamily: FONT, letterSpacing: "0.08em", color: "#A614C3", background: "rgba(166,20,195,0.10)" }}>Sample data</span>;
}

function Delta({ cur, prev, unit = "", inverse = false, label, isDark }: { cur: number; prev: number; unit?: string; inverse?: boolean; label?: string; isDark: boolean }) {
  const diff = cur - prev;
  const good = diff === 0 ? null : inverse ? diff < 0 : diff > 0;
  const color = good === null ? (isDark ? "#9AA0AD" : "#6B7280") : good ? (isDark ? "#34D399" : "#059669") : (isDark ? "#F87171" : "#DC2626");
  const Icon = diff >= 0 ? ArrowUpRight : ArrowDownRight;
  const mag = Number.isInteger(diff) ? Math.abs(diff).toString() : Math.abs(diff).toFixed(1);
  return (
    <span className="inline-flex items-center gap-1 text-[11px]" style={{ fontFamily: FONT }}>
      <span className="inline-flex items-center gap-0.5 font-semibold" style={{ color }}><Icon className="w-3 h-3" strokeWidth={2.5} />{mag}{unit}</span>
      <span style={{ color: isDark ? "#9AA0AD" : "#6B7280" }}>vs {label ?? PREV_AS_OF}</span>
    </span>
  );
}

const PALETTE = ["#5C2ED4", "#A614C3", "#C13FD6", "#D873E6", "#0EA5A5", "#2DD4BF", "#9AA0AD"];

// Interactive donut + legend: hover a slice (or legend row) to highlight it,
// dim the rest, and show its name / value / share in the center.
function Composition({ items, size = 116, legendCols = 1, colors }: {
  items: { name: string; value: number; display: string; color: string }[];
  size?: number; legendCols?: number;
  colors: { heading: string; text: string; faint: string; track: string };
}) {
  const [hover, setHover] = useState<number | null>(null);
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  const stroke = Math.round(size * 0.15);
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const active = hover != null ? items[hover] : null;
  const activeShare = active ? Math.round((active.value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-6 flex-wrap">
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            {items.map((it, idx) => {
              const before = items.slice(0, idx).reduce((a, x) => a + x.value, 0);
              const off = (before / total) * circ;
              const len = (it.value / total) * circ;
              const dim = hover != null && hover !== idx;
              return <circle key={it.name} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={it.color} strokeWidth={hover === idx ? stroke + 3 : stroke} strokeDasharray={`${len.toFixed(2)} ${(circ - len).toFixed(2)}`} strokeDashoffset={(-off).toFixed(2)} style={{ opacity: dim ? 0.3 : 1, cursor: "pointer", transition: "opacity 120ms, stroke-width 120ms" }} onMouseEnter={() => setHover(idx)} onMouseLeave={() => setHover(null)} />;
            })}
          </g>
        </svg>
        {active && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-2 text-center">
            <span className="text-[14px] font-bold leading-none" style={{ color: colors.heading }}>{active.display}</span>
            <span className="text-[9px] font-medium uppercase mt-1 leading-tight" style={{ letterSpacing: "0.04em", color: colors.faint }}>{active.name}</span>
            <span className="text-[9.5px]" style={{ color: colors.faint }}>{activeShare}% share</span>
          </div>
        )}
      </div>
      <div className="flex-1" style={{ display: "grid", gridTemplateColumns: `repeat(${legendCols},minmax(0,1fr))`, gap: "8px 24px", minWidth: 180 }}>
        {items.map((it, idx) => (
          <div key={it.name} className="flex items-center gap-2.5" onMouseEnter={() => setHover(idx)} onMouseLeave={() => setHover(null)} style={{ opacity: hover != null && hover !== idx ? 0.45 : 1, transition: "opacity 120ms" }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: it.color, flexShrink: 0 }} />
            <span className="text-[12.5px] flex-1 truncate" style={{ color: colors.text }}>{it.name}</span>
            <span className="text-[12.5px] font-semibold flex-shrink-0" style={{ color: colors.heading }}>{it.display}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Reports({ isDark = false, onNavigate }: ReportsProps) {
  const [drill, setDrill] = useState<SegKind | null>(null);
  const [cohort, setCohort] = useState<Cohort>("all");
  const [cohortOpen, setCohortOpen] = useState(false);
  const [rangeId, setRangeId] = useState<RangeId>("30d");
  const [periodOpen, setPeriodOpen] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [cStart, setCStart] = useState("2026-10-12");
  const [cEnd, setCEnd] = useState("2026-11-11");
  const [compare, setCompare] = useState(true);
  const viewAgencies = () => onNavigate?.("Agencies");

  const c = {
    heading: isDark ? "#F9FAFB" : "#1C2030",
    text:    isDark ? "#E5E7EB" : "#1F2937",
    muted:   isDark ? "#C4C8D0" : "#4B5563",
    faint:   isDark ? "#9AA0AD" : "#6B7280",
    line:    isDark ? "rgba(255,255,255,0.10)" : "#EBECF0",
    panel:   isDark ? "#14182E" : "#FFFFFF",
    panelAlt:isDark ? "#191D34" : "#FAFAFC",
    track:   isDark ? "rgba(255,255,255,0.08)" : "#EEEFF3",
  };

  // Adoption (cohort-scoped)
  const ds = DATASET[cohort];
  const TOTAL = ds.cur.total, LOGGED_IN = ds.cur.loggedin, ACTIVE_30 = ds.cur.active30, ACTIVE_7 = ds.cur.active7;
  const NO_LOGIN = TOTAL - LOGGED_IN, LAPSED = LOGGED_IN - ACTIVE_30;
  const pr = ds.prev;
  const pNO = pr.total - pr.loggedin, pLAPSED = pr.loggedin - pr.active30;
  const adoptNow = pct(LOGGED_IN, TOTAL), adoptPrev = pct(pr.loggedin, pr.total);
  const segCount: Record<SegKind, number> = { all: TOTAL, loggedin: LOGGED_IN, active: ACTIVE_30, weekly: ACTIVE_7, nologin: NO_LOGIN, dormant: LAPSED };

  // Activity (range-scoped)
  const d = RANGE_DATA[rangeId];
  const tr = TRAFFIC[rangeId];
  const rangeLabel = RANGES.find(r => r.id === rangeId)!.label;
  const asOfLabel = customMode ? fmtDate(cEnd) : AS_OF;
  const periodLabel = customMode ? `${fmtShort(cStart)} – ${fmtShort(cEnd)}` : rangeLabel;
  const adoptPrevLabel = customMode ? "prior period" : PREV_AS_OF;
  const actPrevLabel = customMode ? "prior period" : d.prevLabel;
  const bindRate = Math.round((d.bound[0] / d.started[0]) * 100);
  const bindRatePrev = Math.round((d.bound[1] / d.started[1]) * 100);
  const seriesMax = Math.max(...d.series.map(s => s.c));
  const lob = LOB_SHARES.map(l => ({ lob: l.lob, premium: d.premium[0] * l.share }));

  const kpis = [
    { label: "Agencies tracked", value: TOTAL.toLocaleString(), suffix: undefined as string | undefined, sub: "Unique agencies in the reporting universe", accent: "linear-gradient(90deg,#5C2ED4,#7C3AED)", kind: "all" as SegKind, cur: TOTAL, prev: pr.total },
    { label: "Have logged in", value: LOGGED_IN.toLocaleString(), suffix: `${adoptNow}%`, sub: "Adoption rate against all tracked agencies", accent: "linear-gradient(90deg,#A614C3,#D633E0)", kind: "loggedin" as SegKind, cur: LOGGED_IN, prev: pr.loggedin },
    { label: "Active · last 30 days", value: ACTIVE_30.toLocaleString(), suffix: `${pct(ACTIVE_30, TOTAL)}%`, sub: `${pct(ACTIVE_30, LOGGED_IN)}% of agencies that have logged in`, accent: RAZZ, kind: "active" as SegKind, cur: ACTIVE_30, prev: pr.active30 },
    { label: "Active · last 7 days", value: ACTIVE_7.toLocaleString(), suffix: `${pct(ACTIVE_7, TOTAL)}%`, sub: `${pct(ACTIVE_7, ACTIVE_30)}% of the last-30-day active base`, accent: TEAL_GRAD, kind: "weekly" as SegKind, cur: ACTIVE_7, prev: pr.active7 },
  ];
  const funnel = [
    { label: "Agencies tracked", sub: "total universe", n: TOTAL, pp: 100, grad: "linear-gradient(90deg,#5C2ED4,#7C3AED)", connector: `${pct1(LOGGED_IN, TOTAL)}% have created an individual login`, kind: "all" as SegKind },
    { label: "Have logged in", sub: "adopted", n: LOGGED_IN, pp: adoptNow, grad: "linear-gradient(90deg,#A614C3,#D633E0)", connector: `${pct1(ACTIVE_30, LOGGED_IN)}% of adopters returned within 30 days`, kind: "loggedin" as SegKind },
    { label: "Active in last 30 days", sub: "monthly active", n: ACTIVE_30, pp: pct(ACTIVE_30, TOTAL), grad: "linear-gradient(90deg,#C13FD6,#E05BE0)", connector: `${pct1(ACTIVE_7, ACTIVE_30)}% of monthly actives returned within 7 days`, kind: "active" as SegKind },
    { label: "Active in last 7 days", sub: "weekly active", n: ACTIVE_7, pp: pct(ACTIVE_7, TOTAL), grad: TEAL_GRAD, connector: undefined as string | undefined, kind: "weekly" as SegKind },
  ];
  const winStats = [
    { label: "Active agencies", value: d.active[0].toLocaleString(), cur: d.active[0], prev: d.active[1] },
    { label: "New agencies", value: d.onboarded[0].toLocaleString(), cur: d.onboarded[0], prev: d.onboarded[1] },
    { label: "Quotes bound", value: d.bound[0].toLocaleString(), cur: d.bound[0], prev: d.bound[1] },
    { label: "Written premium", value: fmtM(d.premium[0]), cur: d.premium[0], prev: d.premium[1] },
  ];
  const trafficStats = [
    { label: "Sessions", value: tr.sessions[0].toLocaleString(), cur: tr.sessions[0], prev: tr.sessions[1] },
    { label: "Avg. session", value: fmtDur(tr.avgDur[0]), cur: tr.avgDur[0], prev: tr.avgDur[1] },
    { label: "Pages / session", value: tr.pps[0].toFixed(1), cur: tr.pps[0], prev: tr.pps[1] },
    { label: "Returning", value: `${tr.returning[0]}%`, cur: tr.returning[0], prev: tr.returning[1] },
  ];

  const R = 54, CIRC = 2 * Math.PI * R, prog = (adoptNow / 100) * CIRC;
  const panel: React.CSSProperties = { background: c.panelAlt, border: `1px solid ${c.line}`, borderRadius: 18 };
  const clickable = (kind: SegKind, node: React.ReactNode, cls = "") => (
    <button type="button" onClick={() => setDrill(kind)} className={`text-left cursor-pointer ${cls}`} style={{ fontFamily: FONT }}>{node}</button>
  );

  const composition = (items: { name: string; value: number; display: string }[], donutSize = 116, legendCols = 1) => {
    const colored = items.map((it, i) => ({ ...it, color: PALETTE[i % PALETTE.length] }));
    return <Composition items={colored} size={donutSize} legendCols={legendCols} colors={{ heading: c.heading, text: c.text, faint: c.faint, track: c.track }} />;
  };
  const statRow = (items: { label: string; value: string; cur: number; prev: number }[]) => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
      {items.map(s => (
        <div key={s.label}>
          <div className="text-[26px] font-bold leading-none tracking-tight" style={{ color: c.heading }}>{s.value}</div>
          <div className="mt-2 mb-1" style={{ minHeight: 14 }}>{compare && <Delta cur={s.cur} prev={s.prev} label={actPrevLabel} isDark={isDark} />}</div>
          <div className="text-[12px]" style={{ color: c.muted }}>{s.label}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ fontFamily: FONT, color: c.text }}>
      {/* Report header */}
      <div className="flex items-center justify-between flex-shrink-0 mb-10" style={{ height: 71, borderBottom: `0.87px solid ${c.line}`, marginTop: -24, marginLeft: -48, marginRight: -48, paddingLeft: 28, paddingRight: 28 }}>
        <h1 className="text-[22px] font-normal" style={{ color: c.heading }}>Reports</h1>
        <div className="flex items-center gap-3">
          <span className="hidden lg:inline text-[11px] font-semibold uppercase" style={{ letterSpacing: "0.12em", color: c.faint }}>Agency Adoption Report · Snapshot {asOfLabel}</span>
          <div className="relative">
            <button type="button" onClick={() => setCohortOpen(o => !o)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold cursor-pointer" style={{ fontFamily: FONT, border: `1px solid ${c.line}`, color: c.text }}>
              {ds.short}<ChevronDown className="w-3.5 h-3.5" style={{ color: c.faint }} />
            </button>
            {cohortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setCohortOpen(false)} />
                <div className="absolute right-0 top-full mt-1 rounded-lg overflow-hidden z-20" style={{ background: c.panel, border: `1px solid ${c.line}`, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: 176 }}>
                  {COHORTS.map(k => (
                    <button key={k} type="button" onClick={() => { setCohort(k); setCohortOpen(false); }} className="w-full text-left px-3.5 py-2 text-[12.5px] flex items-center justify-between" style={{ fontFamily: FONT, color: c.text, background: k === cohort ? c.track : "transparent", cursor: "pointer" }}>
                      {DATASET[k].label}{k === cohort && <Check className="w-3.5 h-3.5" style={{ color: "#A614C3" }} strokeWidth={2.5} />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          {/* Reporting period: presets + custom date range */}
          <div className="relative">
            <button type="button" onClick={() => setPeriodOpen(o => !o)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold cursor-pointer" style={{ fontFamily: FONT, border: `1px solid ${c.line}`, color: c.text }}>
              {periodLabel}<ChevronDown className="w-3.5 h-3.5" style={{ color: c.faint }} />
            </button>
            {periodOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setPeriodOpen(false)} />
                <div className="absolute right-0 top-full mt-1 rounded-lg overflow-hidden z-20" style={{ background: c.panel, border: `1px solid ${c.line}`, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: 236 }}>
                  {RANGES.map(r => (
                    <button key={r.id} type="button" onClick={() => { setRangeId(r.id); setCustomMode(false); setPeriodOpen(false); }} className="w-full text-left px-3.5 py-2 text-[12.5px] flex items-center justify-between" style={{ fontFamily: FONT, color: c.text, background: (!customMode && r.id === rangeId) ? c.track : "transparent", cursor: "pointer" }}>
                      {r.label}{!customMode && r.id === rangeId && <Check className="w-3.5 h-3.5" style={{ color: "#A614C3" }} strokeWidth={2.5} />}
                    </button>
                  ))}
                  <div className="p-3" style={{ borderTop: `1px solid ${c.line}` }}>
                    <div className="text-[11px] font-bold uppercase mb-2" style={{ letterSpacing: "0.08em", color: c.faint }}>Custom range</div>
                    <div className="flex items-center gap-2 mb-2">
                      <input type="date" value={cStart} onChange={e => setCStart(e.target.value)} className="flex-1 min-w-0 px-2 py-1.5 rounded text-[12px]" style={{ fontFamily: FONT, border: `1px solid ${c.line}`, color: c.text, background: c.panel }} />
                      <span className="text-[12px]" style={{ color: c.faint }}>–</span>
                      <input type="date" value={cEnd} onChange={e => setCEnd(e.target.value)} className="flex-1 min-w-0 px-2 py-1.5 rounded text-[12px]" style={{ fontFamily: FONT, border: `1px solid ${c.line}`, color: c.text, background: c.panel }} />
                    </div>
                    <button type="button" onClick={() => { const days = (Date.parse(cEnd) - Date.parse(cStart)) / 86400000; setRangeId(bucketFor(days)); setCustomMode(true); setPeriodOpen(false); }} className="w-full px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white cursor-pointer" style={{ fontFamily: FONT, background: RAZZ, border: "none" }}>Apply range</button>
                  </div>
                </div>
              </>
            )}
          </div>
          <button type="button" onClick={() => downloadCsv(`norbielink-adoption-${cohort}.csv`, [["Metric", "Value", `vs ${adoptPrevLabel}`], ["Cohort", ds.label, ""], ["Period", periodLabel, ""], ["Agencies tracked", TOTAL, TOTAL - pr.total], ["Have logged in", LOGGED_IN, LOGGED_IN - pr.loggedin], ["Active last 30 days", ACTIVE_30, ACTIVE_30 - pr.active30], ["No recorded login", NO_LOGIN, NO_LOGIN - pNO]])}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold cursor-pointer" style={{ fontFamily: FONT, border: `1px solid ${c.line}`, color: c.text }}>
            <Download className="w-3.5 h-3.5" style={{ color: c.faint }} /> Export
          </button>
        </div>
      </div>

      {/* Eyebrow */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5" style={{ background: isDark ? "rgba(45,212,191,0.12)" : "#EEFAF8", border: `1px solid ${isDark ? "rgba(45,212,191,0.25)" : "#CFF0EA"}` }}>
        <span style={{ width: 7, height: 7, borderRadius: 999, background: TEAL }} />
        <span className="text-[11px] font-bold uppercase" style={{ letterSpacing: "0.12em", color: TEAL }}>Portal adoption &amp; engagement</span>
      </div>

      {/* Hero */}
      <h2 className="font-extrabold tracking-tight mb-4" style={{ color: c.heading, fontSize: 44, lineHeight: 1.08, maxWidth: 760 }}>
        <span style={{ background: HERO_GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>{adoptNow}%</span> of tracked agencies have logged into NorbieLink.
      </h2>
      <p className="font-semibold mb-5" style={{ color: c.text, fontSize: 20, lineHeight: 1.3, maxWidth: 680 }}>{LOGGED_IN.toLocaleString()} of {TOTAL.toLocaleString()} agencies are in — and the ones who are, keep coming back.</p>
      <p className="mb-6" style={{ color: c.muted, fontSize: 14, lineHeight: 1.65, maxWidth: 680 }}>
        Agencies that adopt NorbieLink stay engaged: <strong style={{ color: c.heading }}>{pct(ACTIVE_30, LOGGED_IN)}% of logged-in agencies</strong> were active in the last 30 days, and roughly <strong style={{ color: c.heading }}>half of those</strong> logged in during the past week. Volume clusters in a predictable <strong style={{ color: c.heading }}>9 AM – 3 PM Pacific</strong> window, which makes the remaining <strong style={{ color: c.heading }}>{NO_LOGIN} agencies</strong> a clean, targeted onboarding opportunity.
      </p>
      <div className="flex items-center gap-2 mb-10 text-[12px]" style={{ color: c.faint }}>
        <span>Showing <strong style={{ color: c.heading }}>{ds.label}</strong> · snapshot {asOfLabel} · change vs the {adoptPrevLabel} snapshot.{cohort !== "all" && " Wave figures are sample data."}</span>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map(k => (
          <div key={k.label} role="button" tabIndex={0} onClick={() => setDrill(k.kind)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setDrill(k.kind); } }} className="relative rounded-xl overflow-hidden cursor-pointer" style={{ background: c.panel, border: `1px solid ${c.line}` }}>
            <div style={{ height: 3, background: k.accent }} />
            <div className="p-5">
              <div className="text-[11px] font-bold uppercase mb-2.5" style={{ letterSpacing: "0.1em", color: c.faint }}>{k.label}</div>
              <div className="flex items-baseline gap-2">
                <span className="text-[34px] font-extrabold leading-none tracking-tight" style={{ color: c.heading }}>{k.value}</span>
                {k.suffix && <span className="text-[15px] font-semibold" style={{ color: c.muted }}>{k.suffix}</span>}
              </div>
              <div className="mt-2.5"><Delta cur={k.cur} prev={k.prev} label={adoptPrevLabel} isDark={isDark} /></div>
              <div className="text-[11.5px] mt-2 leading-snug" style={{ color: c.muted }}>{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Funnel + Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-5 mb-6">
        <div className="p-7" style={panel}>
          <div className="flex items-baseline justify-between mb-6">
            <h3 className="text-[13px] font-bold uppercase" style={{ letterSpacing: "0.1em", color: c.heading }}>Adoption funnel</h3>
            <span className="text-[11.5px]" style={{ color: c.faint }}>Agencies · share of {TOTAL.toLocaleString()}</span>
          </div>
          <div className="flex flex-col gap-1">
            {funnel.map((f) => (
              <div key={f.label}>
                {clickable(f.kind, (
                  <>
                    <div className="flex items-baseline justify-between gap-3 mb-1.5">
                      <span className="text-[13px]" style={{ color: c.heading }}><strong>{f.label}</strong> <span style={{ color: c.faint }}>{f.sub}</span></span>
                      <span className="text-[13px]" style={{ color: c.heading }}><strong>{f.n.toLocaleString()}</strong> <span className="text-[11.5px]" style={{ color: c.faint }}>{f.pp}%</span></span>
                    </div>
                    <div className="h-[18px] rounded-full" style={{ background: c.track }}><div className="h-full rounded-full" style={{ width: `${Math.max(f.pp, 2)}%`, background: f.grad }} /></div>
                  </>
                ), "w-full")}
                {f.connector && <div className="text-[11px] py-2 pl-1" style={{ color: TEAL }}>↘ {f.connector}</div>}
              </div>
            ))}
          </div>
        </div>
        <div className="p-7" style={panel}>
          <div className="flex items-baseline justify-between mb-5">
            <h3 className="text-[13px] font-bold uppercase" style={{ letterSpacing: "0.1em", color: c.heading }}>Engagement</h3>
            <span className="text-[11.5px]" style={{ color: c.faint }}>Repeat usage</span>
          </div>
          <div className="flex items-center gap-5 mb-6">
            <div className="relative flex-shrink-0" style={{ width: 128, height: 128 }}>
              <svg width="128" height="128" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r={R} fill="none" stroke={c.track} strokeWidth="14" />
                <circle cx="64" cy="64" r={R} fill="none" stroke="#A614C3" strokeWidth="14" strokeLinecap="round" strokeDasharray={`${prog} ${CIRC - prog}`} transform="rotate(-90 64 64)" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[22px] font-extrabold leading-none" style={{ color: c.heading }}>{adoptNow}%</span>
                <span className="text-[9px] font-bold uppercase mt-1" style={{ letterSpacing: "0.1em", color: c.faint }}>Adopted</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {clickable("loggedin", <span className="text-[12.5px] flex items-center gap-2" style={{ color: c.muted }}><span style={{ width: 9, height: 9, borderRadius: 999, background: "#A614C3" }} /><strong style={{ color: c.heading }}>{LOGGED_IN}</strong> logged in</span>)}
              {clickable("nologin", <span className="text-[12.5px] flex items-center gap-2" style={{ color: c.muted }}><span style={{ width: 9, height: 9, borderRadius: 999, background: c.track }} /><strong style={{ color: c.heading }}>{NO_LOGIN}</strong> never logged in</span>)}
              <Delta cur={adoptNow} prev={adoptPrev} unit=" pts" label={adoptPrevLabel} isDark={isDark} />
            </div>
          </div>
          <div className="mb-4">
            <div className="text-[24px] font-extrabold leading-none mb-1.5" style={{ color: TEAL }}>{pct(ACTIVE_30, LOGGED_IN)}%</div>
            <p className="text-[12px] leading-relaxed" style={{ color: c.muted }}>of agencies that have used NorbieLink were active in the last 30 days — healthy repeat engagement, not one-and-done logins.</p>
          </div>
          <div>
            <div className="text-[24px] font-extrabold leading-none mb-1.5" style={{ color: "#A614C3" }}>{pct(ACTIVE_7, ACTIVE_30)}%</div>
            <p className="text-[12px] leading-relaxed" style={{ color: c.muted }}>of monthly actives also logged in during the last 7 days, showing a solid core of habitual weekly users.</p>
          </div>
        </div>
      </div>

      {/* Never logged in / Lapsed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-10">
        <div className="p-6 flex gap-5" style={panel}>
          <button type="button" onClick={() => setDrill("nologin")} className="text-[40px] font-extrabold leading-none flex-shrink-0 cursor-pointer" style={{ fontFamily: FONT, color: "#A614C3" }}>{NO_LOGIN}</button>
          <div>
            <div className="flex items-center gap-2 mb-1.5"><span className="text-[12px] font-bold uppercase" style={{ letterSpacing: "0.08em", color: c.heading }}>Never logged in · {pct(NO_LOGIN, TOTAL)}%</span><Delta cur={NO_LOGIN} prev={pNO} inverse label={adoptPrevLabel} isDark={isDark} /></div>
            <p className="text-[12px] leading-relaxed mb-3" style={{ color: c.muted }}>Agencies with no recorded login. The single largest headroom in the program — a defined list, reachable with guided onboarding and admin-led setup.</p>
            <button type="button" onClick={() => setDrill("nologin")} className="inline-block px-2.5 py-1 rounded text-[10.5px] font-bold uppercase cursor-pointer" style={{ fontFamily: FONT, letterSpacing: "0.06em", color: TEAL, background: isDark ? "rgba(45,212,191,0.14)" : "#E9F8F5" }}>Onboard</button>
          </div>
        </div>
        <div className="p-6 flex gap-5" style={panel}>
          <button type="button" onClick={() => setDrill("dormant")} className="text-[40px] font-extrabold leading-none flex-shrink-0 cursor-pointer" style={{ fontFamily: FONT, color: "#7C3AED" }}>{LAPSED}</button>
          <div>
            <div className="flex items-center gap-2 mb-1.5"><span className="text-[12px] font-bold uppercase" style={{ letterSpacing: "0.08em", color: c.heading }}>Lapsed · {pct(LAPSED, LOGGED_IN)}% of adopters</span><Delta cur={LAPSED} prev={pLAPSED} inverse label={adoptPrevLabel} isDark={isDark} /></div>
            <p className="text-[12px] leading-relaxed mb-3" style={{ color: c.muted }}>Logged in at some point but inactive for 30+ days ({LOGGED_IN} adopted − {ACTIVE_30} active). They already know the portal — these need a reason to return, not a first-time intro.</p>
            <button type="button" onClick={() => setDrill("dormant")} className="inline-block px-2.5 py-1 rounded text-[10.5px] font-bold uppercase cursor-pointer" style={{ fontFamily: FONT, letterSpacing: "0.06em", color: "#7C3AED", background: isDark ? "rgba(124,58,237,0.16)" : "#F1EBFE" }}>Re-engage</button>
          </div>
        </div>
      </div>

      {/* ── Activity & traffic ──────────────────────────────────────────── */}
      <div className="pt-8" style={{ borderTop: `1px solid ${c.line}` }}>
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div className="flex items-center gap-2">
            <h3 className="text-[13px] font-bold uppercase" style={{ letterSpacing: "0.1em", color: c.heading }}>Activity &amp; traffic</h3>
            <SampleTag />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[12px]" style={{ color: c.faint }}>{periodLabel}</span>
            <button type="button" onClick={() => setCompare(v => !v)} className="flex items-center gap-2 text-[12.5px] font-medium cursor-pointer" style={{ fontFamily: FONT, color: c.muted }}>
              <span className="flex items-center justify-center" style={{ width: 15, height: 15, borderRadius: 4, border: `1.5px solid ${compare ? "#A614C3" : c.line}`, background: compare ? RAZZ : "transparent" }}>{compare && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}</span>
              Compare
            </button>
          </div>
        </div>

        {statRow(winStats)}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="p-5" style={panel}>
            <div className="text-[13px] font-semibold mb-5" style={{ color: c.heading }}>New agencies onboarded <span style={{ color: c.faint }}>· {periodLabel}</span></div>
            <div className="flex items-end gap-3" style={{ minHeight: 120 }}>
              {d.series.map(m => (
                <div key={m.l} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[11px] font-semibold" style={{ color: c.heading }}>{m.c}</span>
                  <div className="w-full rounded-t" style={{ height: 8 + (m.c / seriesMax) * 92, background: RAZZ }} />
                  <span className="text-[10.5px]" style={{ color: c.faint }}>{m.l}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-5" style={panel}>
            <div className="flex items-baseline justify-between mb-5">
              <span className="text-[13px] font-semibold" style={{ color: c.heading }}>Quote-to-bind</span>
              <span className="text-[12px] flex items-center gap-2" style={{ color: c.muted }}>{bindRate}% bind rate {compare && <Delta cur={bindRate} prev={bindRatePrev} label={actPrevLabel} isDark={isDark} />}</span>
            </div>
            <div className="flex flex-col gap-3">
              {[{ l: "Started", v: d.started[0] }, { l: "Submitted", v: d.submitted[0] }, { l: "Bound", v: d.bound[0] }].map(f => {
                const p = Math.round((f.v / d.started[0]) * 100);
                return (
                  <div key={f.l} className="flex items-center gap-3">
                    <div className="text-[12px] flex-shrink-0 text-right" style={{ color: c.text, width: 72 }}>{f.l}</div>
                    <div className="flex-1 h-[18px] rounded" style={{ background: c.track }}><div className="h-full rounded" style={{ width: `${Math.max(p, 2)}%`, background: RAZZ }} /></div>
                    <div className="text-[12px] font-semibold flex-shrink-0 text-right" style={{ color: c.heading, width: 86 }}>{f.v.toLocaleString()} · {p}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-5 mt-6 mb-10" style={panel}>
          <div className="flex items-baseline justify-between mb-5">
            <span className="text-[13px] font-semibold" style={{ color: c.heading }}>Written premium by line of business</span>
            <span className="text-[12px]" style={{ color: c.muted }}>{fmtM(d.premium[0])} · {periodLabel}</span>
          </div>
          {composition(lob.map(l => ({ name: l.lob, value: l.premium, display: fmtM(l.premium) })), 128, 2)}
        </div>

        {/* Traffic */}
        <div className="flex items-center gap-2 mb-6"><h3 className="text-[13px] font-bold uppercase" style={{ letterSpacing: "0.1em", color: c.heading }}>Web traffic</h3><SampleTag /></div>
        {statRow(trafficStats)}

        <div className="p-5 mt-8 mb-6" style={panel}>
          <div className="text-[13px] font-semibold mb-5" style={{ color: c.heading }}>Most-visited modules <span style={{ color: c.faint }}>· share of page views</span></div>
          {composition(TOP_MODULES.map(m => ({ name: m.name, value: m.share, display: `${m.share}%` })), 128, 2)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {[{ t: "Traffic sources", items: SOURCES, w: 96 }, { t: "Devices", items: DEVICES, w: 72 }, { t: "Top states", items: STATES, w: 44 }].map(col => (
            <div key={col.t} className="p-5" style={panel}>
              <div className="text-[13px] font-semibold mb-5" style={{ color: c.heading }}>{col.t}</div>
              {composition(col.items.map(i => ({ name: i.name, value: i.share, display: `${i.share}%` })), 96, 1)}
            </div>
          ))}
        </div>
      </div>

      {/* Source footer */}
      <div className="flex items-end justify-between gap-6 flex-wrap pb-2">
        <p className="text-[10.5px] leading-relaxed" style={{ color: c.faint, maxWidth: 820 }}>Source: NorbieLink login and activity data, snapshot as of {asOfLabel}, reporting period {periodLabel}, compared with the {adoptPrevLabel}. Cohort: {ds.label}. Activity, traffic and premium figures are sample data; custom ranges map to the nearest sample window.</p>
        <span className="text-[10.5px] font-semibold uppercase" style={{ letterSpacing: "0.1em", color: c.faint }}>Powered by BTIS</span>
      </div>

      {/* Drill-down modal */}
      {drill && (() => {
        const seg = buildSegment(drill, segCount[drill]);
        return (
          <div className="fixed inset-0 z-[80] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setDrill(null)}>
            <div className="rounded-2xl w-[640px] max-w-[94vw] max-h-[84vh] flex flex-col" style={{ background: c.panel, boxShadow: "0 20px 60px rgba(0,0,0,0.25)", fontFamily: FONT }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4" style={{ borderBottom: `1px solid ${c.line}` }}>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2"><span className="text-[20px] font-bold" style={{ color: c.heading }}>{seg.count.toLocaleString()}</span><h3 className="text-[14px] font-semibold" style={{ color: c.heading }}>{seg.title}</h3></div>
                  <p className="text-[12px] mt-0.5" style={{ color: c.muted }}>{seg.note} · {ds.label}</p>
                </div>
                <button type="button" onClick={() => setDrill(null)} aria-label="Close" className="p-1.5 rounded-md cursor-pointer flex-shrink-0" style={{ color: c.faint, border: "none", background: "transparent" }}><X className="w-4 h-4" /></button>
              </div>
              <div className="overflow-y-auto px-6 py-2" style={{ minHeight: 120 }}>
                {seg.rows.map((r, i) => (
                  <div key={r.name} className="flex items-start justify-between gap-3 py-3" style={{ borderBottom: i === seg.rows.length - 1 ? "none" : `1px solid ${c.line}` }}>
                    <div className="min-w-0"><div className="text-[13px] font-medium truncate" style={{ color: c.text }}>{r.name}</div><div className="text-[11.5px] mt-0.5 truncate" style={{ color: c.muted }}>{r.contact} · {r.email} · {r.phone}</div></div>
                    <span className="text-[11.5px] flex-shrink-0 text-right pt-0.5" style={{ color: c.muted }}>{r.meta}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between gap-3 px-6 py-4" style={{ borderTop: `1px solid ${c.line}` }}>
                <span className="text-[11.5px]" style={{ color: c.faint }}>Showing {seg.rows.length} of {seg.count.toLocaleString()} · sample data</span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => downloadCsv(`norbielink-${seg.kind}-${cohort}.csv`, [["Agency", "Contact", "Email", "Phone", "Status"], ...seg.rows.map(r => [r.name, r.contact, r.email, r.phone, r.meta])])} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold cursor-pointer" style={{ fontFamily: FONT, border: `1px solid ${c.line}`, color: c.text }}><Download className="w-3.5 h-3.5" style={{ color: c.faint }} /> Export CSV</button>
                  <button type="button" onClick={() => { setDrill(null); viewAgencies(); }} className="px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold text-white cursor-pointer" style={{ fontFamily: FONT, background: RAZZ, border: "none" }}>Open in Agencies</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
