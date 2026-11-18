"use client";

import { useEffect, useState } from "react";
import { Download, X, ChevronDown, Check, ArrowUpRight, ArrowDownRight, UserPlus, RefreshCw } from "lucide-react";

interface ReportsProps {
  isDark?: boolean;
  onNavigate?: (page: string) => void;
}

const FONT = "var(--font-montserrat), Montserrat, sans-serif";
const RAZZ = "linear-gradient(90deg,#5C2ED4 0%,#A614C3 100%)";

const AS_OF = "Nov 11, 2026";
const PREV_AS_OF = "Oct 11";

// Adoption snapshots by cohort (current + previous month, sample).
type Cohort = "all" | "w1" | "w2" | "w3";
interface Snap { total: number; loggedin: number; active30: number; active7: number; }
const DATASET: Record<Cohort, { label: string; short: string; cur: Snap; prev: Snap }> = {
  all: { label: "All agencies",      short: "All agencies", cur: { total: 240, loggedin: 158, active30: 97, active7: 46 }, prev: { total: 228, loggedin: 142, active30: 88, active7: 42 } },
  w1:  { label: "Wave 1 · earliest", short: "Wave 1",       cur: { total: 105, loggedin: 89, active30: 61, active7: 30 }, prev: { total: 105, loggedin: 86, active30: 58, active7: 28 } },
  w2:  { label: "Wave 2",            short: "Wave 2",       cur: { total: 82, loggedin: 49, active30: 28, active7: 12 }, prev: { total: 75, loggedin: 41, active30: 24, active7: 11 } },
  w3:  { label: "Wave 3 · newest",   short: "Wave 3",       cur: { total: 53, loggedin: 20, active30: 8, active7: 4 }, prev: { total: 48, loggedin: 15, active30: 6, active7: 3 } },
};
const COHORTS: Cohort[] = ["all", "w1", "w2", "w3"];

// User (agent) snapshots by cohort — the people inside the agencies above.
// invited = all user accounts created; activated = has logged in at least
// once; active30/7 = users active in the window; single = active agencies
// where only one user is active (usually the primary contact). Sample data.
interface UserSnap { invited: number; activated: number; active30: number; active7: number; single: number; }
const USERS: Record<Cohort, { cur: UserSnap; prev: UserSnap }> = {
  all: { cur: { invited: 963, activated: 621, active30: 328, active7: 161, single: 28 }, prev: { invited: 880, activated: 554, active30: 294, active7: 146, single: 31 } },
  w1:  { cur: { invited: 459, activated: 362, active30: 219, active7: 112, single: 12 }, prev: { invited: 445, activated: 348, active30: 208, active7: 106, single: 14 } },
  w2:  { cur: { invited: 330, activated: 183, active30: 86, active7: 39, single: 9 }, prev: { invited: 296, activated: 152, active30: 72, active7: 34, single: 10 } },
  w3:  { cur: { invited: 174, activated: 76, active30: 23, active7: 10, single: 7 }, prev: { invited: 139, activated: 54, active30: 14, active7: 6, single: 7 } },
};

const pct = (n: number, base: number) => Math.round((n / base) * 100);

// ── Activity & traffic (range-driven, sample) ─────────────────────────────
type RangeId = "7d" | "30d" | "90d" | "12m" | "ytd";
const RANGES: { id: RangeId; label: string }[] = [
  { id: "7d", label: "Last 7 days" }, { id: "30d", label: "Last 30 days" },
  { id: "90d", label: "Last 90 days" }, { id: "12m", label: "Last 12 months" }, { id: "ytd", label: "Year to date" },
];
type Pair = [number, number];
interface RangeData { prevLabel: string; active: Pair; onboarded: Pair; started: Pair; submitted: Pair; bound: Pair; premium: Pair; series: { l: string; c: number }[]; }
const RANGE_DATA: Record<RangeId, RangeData> = {
  "7d":  { prevLabel: "prior 7 days", active: [46, 42], onboarded: [5, 6], started: [1120, 1030], submitted: [740, 690], bound: [250, 236], premium: [3.1, 2.9], series: [{ l: "Mon", c: 3 }, { l: "Tue", c: 2 }, { l: "Wed", c: 4 }, { l: "Thu", c: 4 }, { l: "Fri", c: 3 }, { l: "Sat", c: 1 }, { l: "Sun", c: 2 }] },
  "30d": { prevLabel: "prior 30 days", active: [97, 88], onboarded: [16, 22], started: [4820, 4510], submitted: [3140, 2980], bound: [1090, 1015], premium: [13.4, 12.6], series: [{ l: "Wk 1", c: 15 }, { l: "Wk 2", c: 17 }, { l: "Wk 3", c: 18 }, { l: "Wk 4", c: 13 }] },
  "90d": { prevLabel: "prior 90 days", active: [130, 121], onboarded: [56, 50], started: [14200, 13050], submitted: [9250, 8600], bound: [3180, 2910], premium: [39.6, 36.4], series: [{ l: "Sep", c: 74 }, { l: "Oct", c: 88 }, { l: "Nov", c: 63 }] },
  "12m": { prevLabel: "prior 12 months", active: [153, 140], onboarded: [177, 158], started: [57600, 50200], submitted: [37400, 33100], bound: [12900, 11250], premium: [161, 142], series: [{ l: "Dec", c: 44 }, { l: "Jan", c: 49 }, { l: "Feb", c: 55 }, { l: "Mar", c: 58 }, { l: "Apr", c: 61 }, { l: "May", c: 66 }, { l: "Jun", c: 38 }, { l: "Jul", c: 52 }, { l: "Aug", c: 61 }, { l: "Sep", c: 74 }, { l: "Oct", c: 88 }, { l: "Nov", c: 63 }] },
  "ytd": { prevLabel: "same period last year", active: [151, 140], onboarded: [166, 148], started: [52800, 47900], submitted: [34300, 31200], bound: [11850, 10700], premium: [148, 131], series: [{ l: "Jan", c: 49 }, { l: "Feb", c: 55 }, { l: "Mar", c: 58 }, { l: "Apr", c: 61 }, { l: "May", c: 66 }, { l: "Jun", c: 38 }, { l: "Jul", c: 52 }, { l: "Aug", c: 61 }, { l: "Sep", c: 74 }, { l: "Oct", c: 88 }, { l: "Nov", c: 63 }] },
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

// ── User (agent) drill-down lists (sample) ────────────────────────────────
type UserSegKind = "invited" | "activated" | "uactive30" | "uactive7" | "pending";
const USER_POOL = [
  { name: "Dana Pruitt",    title: "Principal",       agency: "Summit Risk Partners",    email: "dana@summitrisk.com" },
  { name: "Kyle Benton",    title: "Producer",        agency: "Summit Risk Partners",    email: "kyle@summitrisk.com" },
  { name: "Marcus Reed",    title: "Principal",       agency: "Harbor & Vale Insurance", email: "marcus@harborvale.com" },
  { name: "Elena Ruiz",     title: "CSR",             agency: "Harbor & Vale Insurance", email: "elena@harborvale.com" },
  { name: "Grace Lin",      title: "Account Manager", agency: "Meridian Coverage Group", email: "grace@meridiancoverage.com" },
  { name: "Sam Okafor",     title: "Producer",        agency: "Meridian Coverage Group", email: "sam@meridiancoverage.com" },
  { name: "Priya Nair",     title: "Principal",       agency: "Cedar Ridge Agency",      email: "priya@cedarridge.com" },
  { name: "Hannah Boyd",    title: "Producer",        agency: "Northgate Assurance",     email: "hannah@northgateassure.com" },
  { name: "Tom Alvarez",    title: "CSR",             agency: "Northgate Assurance",     email: "tom@northgateassure.com" },
  { name: "Nadia Khan",     title: "Principal",       agency: "Ironwood Insurance",      email: "nadia@ironwoodins.com" },
  { name: "Owen Clarke",    title: "Producer",        agency: "Blue Harbor Brokers",     email: "owen@blueharbor.com" },
  { name: "Mia Torres",     title: "Accounting",      agency: "Pine Street Insurance",   email: "mia@pinestreetins.com" },
];
const USER_SEG_INFO: Record<UserSegKind, { title: string; note: string; meta: (i: number) => string }> = {
  invited:   { title: "Users invited",           note: "Every user account created across the agencies.",    meta: (i) => (i % 3 === 2 ? "Invite pending" : "Activated") },
  activated: { title: "Activated users",         note: "Have logged in at least once.",                       meta: (i) => `First login ${["Feb 3", "Mar 18", "Apr 2", "Jun 11", "Aug 27"][i % 5]}` },
  uactive30: { title: "Active users",  note: "Portal activity in the selected period.",                meta: (i) => `Last active ${["today", "yesterday", "3 days ago", "1 week ago", "2 weeks ago"][i % 5]}` },
  uactive7:  { title: "Active users · 7 days",   note: "Portal activity in the last 7 days.",                 meta: (i) => `Last active ${["today", "yesterday", "2 days ago", "4 days ago"][i % 4]}` },
  pending:   { title: "Pending invites",         note: "Invited but haven't logged in yet — resend from Admin › Users.", meta: (i) => `Invited ${["Nov 4", "Oct 22", "Oct 9", "Sep 30", "Sep 12"][i % 5]}` },
};

// ── ProSuite (sample) ─────────────────────────────────────────────────────
// Who's on ProSuite and which of its tools they actually use. Tool list
// mirrors the ProSuite plan on the Pricing page.
const PRO_STATS = { members: [58, 48], newMembers: [9, 6], renewals60: 7, avgTools: [3.4, 3.0] };
const PRO_TOOLS: { name: string; does: string; using: Pair; users: number; active30: number }[] = [
  { name: "Outmarket",          does: "AI quote comparison across carriers", using: [48, 39], users: 190, active30: 37 },
  { name: "NowCerts",           does: "Self-service certificates, 24/7",     using: [42, 36], users: 165, active30: 32 },
  { name: "Commercial Leads",   does: "Real-time commercial leads",          using: [29, 21], users: 88, active30: 19 },
  { name: "Compliance Library", does: "Legal & compliance documents",        using: [25, 23], users: 67, active30: 9 },
  { name: "CE Tracking",        does: "CE discounts + compliance tracking",  using: [20, 17], users: 104, active30: 7 },
  { name: "Growth Support",     does: "1:1 agency growth & strategy",        using: [11, 10], users: 23, active30: 4 },
];
const PRO_MEMBERS: { agency: string; contact: string; state: string; since: string; users: number; tools: string[]; lastActive: string }[] = [
  { agency: "Summit Risk Partners",    contact: "Dana Pruitt",  state: "CA", since: "Feb 2026", users: 14, tools: ["Outmarket", "NowCerts", "Commercial Leads", "CE Tracking"], lastActive: "Today" },
  { agency: "Harbor & Vale Insurance", contact: "Marcus Reed",  state: "WA", since: "Mar 2026", users: 9,  tools: ["Outmarket", "NowCerts", "Compliance Library"],              lastActive: "Yesterday" },
  { agency: "Meridian Coverage Group", contact: "Grace Lin",    state: "NY", since: "Jan 2026", users: 22, tools: ["Outmarket", "NowCerts", "Commercial Leads", "Growth Support", "CE Tracking"], lastActive: "Today" },
  { agency: "Cedar Ridge Agency",      contact: "Priya Nair",   state: "OR", since: "Jun 2026", users: 5,  tools: ["NowCerts"],                                                 lastActive: "3 days ago" },
  { agency: "Northgate Assurance",     contact: "Hannah Boyd",  state: "IL", since: "Apr 2026", users: 11, tools: ["Outmarket", "Commercial Leads"],                            lastActive: "Today" },
  { agency: "Ironwood Insurance",      contact: "Nadia Khan",   state: "AZ", since: "Sep 2026", users: 7,  tools: ["Outmarket", "NowCerts", "Compliance Library"],              lastActive: "1 week ago" },
  { agency: "Blue Harbor Brokers",     contact: "Owen Clarke",  state: "CA", since: "Oct 2026", users: 4,  tools: ["Outmarket"],                                                lastActive: "2 days ago" },
];

// ── Single-agency view (sample) ───────────────────────────────────────────
// Built from the sample agency pool so every agency in a list can be opened.
type AgencyStatus = "Active" | "Lapsed" | "Never logged in";
const AGENCY_STATUS: AgencyStatus[] = ["Active", "Active", "Active", "Active", "Active", "Lapsed", "Active", "Lapsed", "Active", "Never logged in", "Never logged in", "Active"];
const AGENCY_SINCE = ["Jan 2025", "Mar 2025", "Jun 2025", "Aug 2025", "Feb 2025", "Nov 2024", "Jan 2025", "Apr 2025", "Sep 2025", "Oct 2026", "Oct 2026", "May 2025"];
const AGENCY_LAST_LOGIN = ["Today", "Yesterday", "3 days ago", "2 days ago", "Today", "6 weeks ago", "Today", "9 weeks ago", "1 week ago", "Never", "Never", "4 days ago"];
const FILLER_PEOPLE = [
  { name: "Jordan Lee", title: "Producer" }, { name: "Ava Patel", title: "CSR" }, { name: "Chris Moreno", title: "Account Manager" },
  { name: "Taylor Brooks", title: "Producer" }, { name: "Riley Chen", title: "CSR" }, { name: "Morgan Diaz", title: "Accounting" },
  { name: "Jamie Fox", title: "Producer" }, { name: "Casey Nguyen", title: "CSR" }, { name: "Drew Patel", title: "Producer" },
  { name: "Alex Romero", title: "Account Manager" }, { name: "Sydney Park", title: "CSR" }, { name: "Blake Turner", title: "Producer" },
  { name: "Quinn Harper", title: "CSR" }, { name: "Reese Walker", title: "Producer" }, { name: "Avery Scott", title: "Accounting" },
  { name: "Parker Lane", title: "Producer" }, { name: "Rowan Ellis", title: "CSR" }, { name: "Emerson Hale", title: "Producer" },
  { name: "Finley Ross", title: "Account Manager" }, { name: "Hayden Cole", title: "CSR" }, { name: "Kendall Ray", title: "Producer" },
];
// Last-active cycle for sample people; the last entry is outside 30 days.
const PERSON_LAST = ["Today", "Yesterday", "3 days ago", "1 week ago", "2 weeks ago", "5 weeks ago"];
type PersonStatus = "active" | "inactive" | "pending";

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
type SegKind = "all" | "loggedin" | "active" | "weekly" | "nologin" | "dormant" | "single";
const SEG_INFO: Record<SegKind, { title: string; note: string; meta: (i: number) => string }> = {
  all:      { title: "All tracked agencies",            note: "Every agency in the reporting universe.",               meta: () => "Tracked" },
  loggedin: { title: "Agencies that have logged in",    note: "Signed in at least once — adopted.",                    meta: (i) => `Last login ${["2 days", "5 days", "1 week", "3 weeks", "1 month"][i % 5]} ago` },
  active:   { title: "Active agencies",  note: "Recorded portal activity in the selected period.",         meta: () => "Active this month" },
  weekly:   { title: "Active agencies · last 7 days",   note: "Recorded portal activity in the last 7 days.",          meta: () => "Active this week" },
  nologin:  { title: "Agencies with no recorded login", note: "Invited but never signed in — onboarding opportunity.", meta: (i) => `Invited ${["Oct 2", "Sep 18", "Aug 30", "Jul 12"][i % 4]} · never signed in` },
  single:   { title: "Single-user agencies",            note: "Active, but only one person logs in — usually the primary contact.", meta: (i) => `Only ${["the principal", "the primary contact", "one CSR", "one producer"][i % 4]} is active` },
  dormant:  { title: "Lapsed agencies",                 note: "Logged in before, not active this period — re-engage.",      meta: (i) => `Last active ${["5", "7", "9", "12", "16"][i % 5]} weeks ago` },
};
// Users per sample agency; never-logged-in / lapsed agencies have no
// recently active users by definition.
const POOL_USERS = [14, 9, 6, 11, 22, 5, 17, 8, 7, 12, 4, 10];
// Active (30-day) users for an active agency — same rule the single-agency
// view uses: activated users whose sample last-active is within 30 days.
const poolActive = (i: number) => {
  const users = POOL_USERS[i % POOL_USERS.length], activated = Math.max(1, users - (i % 4));
  return Array.from({ length: activated }, (_, pi) => pi).filter(pi => !["5 weeks ago"].includes(["Today", "Yesterday", "3 days ago", "1 week ago", "2 weeks ago", "5 weeks ago"][pi % 6])).length;
};
const buildSegment = (kind: SegKind, count: number) => ({ kind, count, title: SEG_INFO[kind].title, note: SEG_INFO[kind].note, rows: AGENCY_POOL.map((a, i) => ({ ...a, meta: SEG_INFO[kind].meta(i), users: POOL_USERS[i % POOL_USERS.length], activeUsers: kind === "nologin" || kind === "dormant" ? 0 : kind === "single" ? 1 : poolActive(i) })) });
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
  const color = good === null ? (isDark ? "#C4C8D0" : "#4B5563") : good ? (isDark ? "#34D399" : "#059669") : (isDark ? "#F87171" : "#DC2626");
  const Icon = diff >= 0 ? ArrowUpRight : ArrowDownRight;
  const mag = Number.isInteger(diff) ? Math.abs(diff).toString() : Math.abs(diff).toFixed(1);
  return (
    <span className="inline-flex items-center gap-1 text-[11px]" style={{ fontFamily: FONT }}>
      <span className="inline-flex items-center gap-0.5 font-semibold" style={{ color }}><Icon className="w-3 h-3" strokeWidth={2.5} />{mag}{unit}</span>
      <span style={{ color: isDark ? "#C4C8D0" : "#4B5563" }}>vs {label ?? PREV_AS_OF}</span>
    </span>
  );
}

// Compact change pill for the overview grid: "+48 (5.2%)", green when the
// move is good, red when bad, grey when flat.
function DeltaPill({ cur, prev, unit = "", inverse = false, isDark }: { cur: number; prev: number; unit?: string; inverse?: boolean; isDark: boolean }) {
  const diff = cur - prev;
  const good = diff === 0 ? null : inverse ? diff < 0 : diff > 0;
  const fg = good === null ? (isDark ? "#C4C8D0" : "#374151") : good ? (isDark ? "#6EE7B7" : "#047857") : (isDark ? "#FCA5A5" : "#B91C1C");
  const bg = good === null ? (isDark ? "rgba(255,255,255,0.08)" : "#F3F4F6") : good ? (isDark ? "rgba(16,185,129,0.16)" : "#D1FAE5") : (isDark ? "rgba(239,68,68,0.16)" : "#FEE2E2");
  const mag = Number.isInteger(diff) ? Math.abs(diff).toLocaleString() : Math.abs(diff).toFixed(1);
  const rel = prev ? ` (${((Math.abs(diff) / prev) * 100).toFixed(1)}%)` : "";
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11.5px] font-semibold whitespace-nowrap" style={{ fontFamily: FONT, color: fg, background: bg }}>
      {diff >= 0 ? "+" : "−"}{mag}{unit}{unit ? "" : rel}
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
  const [userDrill, setUserDrill] = useState<UserSegKind | null>(null);
  const [cohort, setCohort] = useState<Cohort>("all");
  const [cohortOpen, setCohortOpen] = useState(false);
  // Single-agency view: agency name + optional status forced by the list it
  // was opened from (e.g. opened from "Lapsed agencies" → shows as Lapsed).
  const [agencySel, setAgencySel] = useState<{ name: string; status?: AgencyStatus } | null>(null);
  const [agencyQuery, setAgencyQuery] = useState("");
  // Users table in the agency view: search, status filter, show all.
  const [userQuery, setUserQuery] = useState("");
  const [userFilter, setUserFilter] = useState<"all" | PersonStatus>("all");
  const [showAllUsers, setShowAllUsers] = useState(false);
  // Jump to the top when switching between all agencies and one agency.
  useEffect(() => { document.querySelector("main")?.scrollTo({ top: 0 }); }, [agencySel]);
  // Switch agency (or back to all with null) and reset the users table.
  const openAgency = (sel: { name: string; status?: AgencyStatus } | null) => {
    setAgencySel(sel); setUserQuery(""); setUserFilter("all"); setShowAllUsers(false);
  };
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
    muted:   isDark ? "#D1D5DB" : "#374151",
    faint:   isDark ? "#C4C8D0" : "#4B5563",
    line:    isDark ? "rgba(255,255,255,0.10)" : "#EBECF0",
    panel:   isDark ? "#14182E" : "#FFFFFF",
    panelAlt:isDark ? "#191D34" : "#FFFFFF",
    // Boxes are white on the grey Reports page background (set in DashboardShell).
    box:     isDark ? "#191D34" : "#FFFFFF",
    track:   isDark ? "rgba(255,255,255,0.08)" : "#EEEFF3",
  };

  // Adoption (cohort-scoped)
  const ds = DATASET[cohort];
  const TOTAL = ds.cur.total, LOGGED_IN = ds.cur.loggedin, ACTIVE_30 = ds.cur.active30, ACTIVE_7 = ds.cur.active7;
  const NO_LOGIN = TOTAL - LOGGED_IN, LAPSED = LOGGED_IN - ACTIVE_30;
  const pr = ds.prev;
  const pNO = pr.total - pr.loggedin;
  const adoptNow = pct(LOGGED_IN, TOTAL);
  const segCount: Record<Exclude<SegKind, "single">, number> = { all: TOTAL, loggedin: LOGGED_IN, active: ACTIVE_30, weekly: ACTIVE_7, nologin: NO_LOGIN, dormant: LAPSED };

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

  // Overview grid: counts on top (click → drill-down list); each rate sits
  // directly under the count it's derived from (Never logged in under Tracked).
  type Metric = { label: string; value: string; rate?: string; cur: number; prev: number; unit?: string; inverse?: boolean; info: string; kind?: SegKind; userKind?: UserSegKind };
  // One row: each count carries its rate in the same box. "Active" follows
  // the selected report range, so no 30/7-day split.
  const overview: Metric[] = [
    { label: "Agencies tracked", value: TOTAL.toLocaleString(), cur: TOTAL, prev: pr.total, info: "Unique agencies in the reporting universe", kind: "all" },
    { label: "Have logged in", value: LOGGED_IN.toLocaleString(), rate: `${adoptNow}%`, cur: LOGGED_IN, prev: pr.loggedin, info: "Agencies with at least one sign-in · % of tracked agencies", kind: "loggedin" },
    { label: "Active", value: ACTIVE_30.toLocaleString(), rate: `${pct(ACTIVE_30, LOGGED_IN)}%`, cur: ACTIVE_30, prev: pr.active30, info: "Agencies with portal activity in the selected period · % of agencies that have logged in", kind: "active" },
    { label: "Never logged in", value: NO_LOGIN.toLocaleString(), rate: `${pct(NO_LOGIN, TOTAL)}%`, cur: NO_LOGIN, prev: pNO, inverse: true, info: "Invited agencies with no recorded sign-in · % of tracked agencies", kind: "nologin" },
  ];
  // Users (agents) inside those agencies — same 4×2 layout, each rate under
  // the count it comes from.
  const us = USERS[cohort].cur, up = USERS[cohort].prev;
  const PENDING = us.invited - us.activated, pPENDING = up.invited - up.activated;
  const userMetrics: Metric[] = [
    { label: "Users invited", value: us.invited.toLocaleString(), cur: us.invited, prev: up.invited, info: "All user accounts created across the agencies", userKind: "invited" },
    { label: "Activated", value: us.activated.toLocaleString(), rate: `${pct(us.activated, us.invited)}%`, cur: us.activated, prev: up.activated, info: "Users who have logged in at least once · % of invited", userKind: "activated" },
    { label: "Active", value: us.active30.toLocaleString(), rate: `${pct(us.active30, us.activated)}%`, cur: us.active30, prev: up.active30, info: "Users with portal activity in the selected period · % of activated", userKind: "uactive30" },
    { label: "Pending invites", value: PENDING.toLocaleString(), rate: `${pct(PENDING, us.invited)}%`, cur: PENDING, prev: pPENDING, inverse: true, info: "Invited users who haven't logged in yet · % of invited", userKind: "pending" },
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

  const panel: React.CSSProperties = { background: c.panelAlt, border: `1px solid ${c.line}`, borderRadius: 18 };

  const composition = (items: { name: string; value: number; display: string }[], donutSize = 116, legendCols = 1) => {
    const colored = items.map((it, i) => ({ ...it, color: PALETTE[i % PALETTE.length] }));
    return <Composition items={colored} size={donutSize} legendCols={legendCols} colors={{ heading: c.heading, text: c.text, faint: c.faint, track: c.track }} />;
  };
  // Hover for clickable boxes/rows: razz outline with a soft glow, matching
  // the side nav's active item. Inset so it isn't clipped by the panel edge.
  // Corners are square, except where the hovered cell sits on a rounded
  // corner of the panel underneath — there it follows that curve.
  const hoverOn = (el: HTMLElement) => {
    el.style.boxShadow = `inset 0 0 0 1.5px ${isDark ? "rgba(200,120,230,0.9)" : "#A614C3"}, inset 0 0 12px rgba(166,20,195,${isDark ? 0.35 : 0.18})`;
    const panelEl = el.parentElement?.closest<HTMLElement>(".rounded-xl");
    if (!panelEl) return;
    const r = el.getBoundingClientRect(), p = panelEl.getBoundingClientRect();
    const rad = Math.max(0, parseFloat(getComputedStyle(panelEl).borderTopLeftRadius) - 1);
    const near = (x: number, y: number) => Math.abs(x - y) < 3;
    const top = near(r.top, p.top + 1) || near(r.top, p.top), bottom = near(r.bottom, p.bottom - 1) || near(r.bottom, p.bottom);
    const left = near(r.left, p.left + 1) || near(r.left, p.left), right = near(r.right, p.right - 1) || near(r.right, p.right);
    el.style.borderTopLeftRadius = top && left ? `${rad}px` : "";
    el.style.borderTopRightRadius = top && right ? `${rad}px` : "";
    el.style.borderBottomLeftRadius = bottom && left ? `${rad}px` : "";
    el.style.borderBottomRightRadius = bottom && right ? `${rad}px` : "";
  };
  const hoverOff = (el: HTMLElement) => {
    el.style.boxShadow = "none";
    el.style.borderTopLeftRadius = el.style.borderTopRightRadius = el.style.borderBottomLeftRadius = el.style.borderBottomRightRadius = "";
  };

  // Bold date/period text inside section subtitles.
  const b = (text: React.ReactNode) => <strong className="font-semibold" style={{ color: c.heading }}>{text}</strong>;

  // 4×2 metric panel used by the Agency and User overviews.
  const metricGrid = (title: string, subtitle: React.ReactNode, items: Metric[], mb = "mb-6") => (
    <div className={`rounded-xl overflow-hidden ${mb}`} style={{ background: c.box, border: `1px solid ${c.line}` }}>
      <div className="px-6 py-4 flex flex-wrap items-baseline justify-between gap-2" style={{ borderBottom: `1px solid ${c.line}` }}>
        <h2 className="text-[16px] font-bold" style={{ color: c.heading }}>{title}</h2>
        <span className="text-[12px]" style={{ color: c.muted }}>{subtitle}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((m, idx) => {
          const clickable = !!m.kind || !!m.userKind;
          const open = () => { if (m.kind) setDrill(m.kind); else if (m.userKind) setUserDrill(m.userKind); };
          return (
            <div key={m.label}
              role={clickable ? "button" : undefined} tabIndex={clickable ? 0 : undefined}
              onClick={open}
              onKeyDown={(e) => { if (clickable && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); open(); } }}
              title={m.info}
              className={`px-6 py-5 transition-colors${clickable ? " cursor-pointer" : ""}`}
              style={{ borderTop: idx >= 4 ? `1px solid ${c.line}` : undefined, borderLeft: idx % 4 ? `1px solid ${c.line}` : undefined }}
              onMouseEnter={e => { if (clickable) hoverOn(e.currentTarget); }}
              onMouseLeave={e => hoverOff(e.currentTarget)}>
              {/* Clickable boxes show it on hover (tint) — no extra link text. */}
              <div className="text-[13px] font-semibold whitespace-nowrap" style={{ color: c.text }}>{m.label}</div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-[30px] font-extrabold leading-none tracking-tight" style={{ color: c.heading }}>{m.value}</span>
                {m.rate && <span className="text-[16px] font-bold" style={{ color: c.muted }}>{m.rate}</span>}
              </div>
              <div className="mt-2.5"><DeltaPill cur={m.cur} prev={m.prev} unit={m.unit} inverse={m.inverse} isDark={isDark} /></div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Two-up "next steps" strip under each overview: icon, title, one line,
  // action link; the whole half opens its list.
  const nextSteps = (items: { key: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; title: string; action: string; text: React.ReactNode; open: () => void }[], mb = "mb-6") => (
    <div className={`rounded-xl overflow-hidden ${mb} grid grid-cols-1 lg:grid-cols-2`} style={{ background: c.box, border: `1px solid ${c.line}` }}>
      {items.map((o, i) => (
        <div key={o.key} role="button" tabIndex={0}
          onClick={o.open}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); o.open(); } }}
          className="flex items-start gap-3.5 px-6 py-5 cursor-pointer transition-colors"
          style={{ borderLeft: i ? `1px solid ${c.line}` : undefined }}
          onMouseEnter={e => hoverOn(e.currentTarget)}
          onMouseLeave={e => hoverOff(e.currentTarget)}>
          <div className="flex items-center justify-center rounded-lg flex-shrink-0" style={{ width: 36, height: 36, background: isDark ? "rgba(166,20,195,0.16)" : "rgba(166,20,195,0.08)" }}>
            <o.icon className="w-4 h-4" style={{ color: "#A614C3" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13px] font-semibold" style={{ color: c.heading }}>{o.title}</span>
              <span className="text-[12px] font-semibold whitespace-nowrap" style={{ color: "#A614C3" }}>{o.action} →</span>
            </div>
            <p className="text-[12.5px] leading-relaxed mt-1" style={{ color: c.muted }}>{o.text}</p>
          </div>
        </div>
      ))}
    </div>
  );

  // Same boxed look as the Agency Adoption Overview: label, big value,
  // change pill (shown when Compare is on).
  const statRow = (items: { label: string; value: string; cur: number; prev: number }[]) => (
    <div className="rounded-xl overflow-hidden grid grid-cols-2 lg:grid-cols-4" style={{ background: c.box, border: `1px solid ${c.line}` }}>
      {items.map((s, i) => (
        <div key={s.label} className="px-6 py-5"
          style={{ borderLeft: i % 4 ? `1px solid ${c.line}` : undefined }}>
          <div className="text-[13px] font-semibold" style={{ color: c.text }}>{s.label}</div>
          <div className="flex items-center justify-between gap-3 mt-2">
            <span className="text-[30px] font-extrabold leading-none tracking-tight" style={{ color: c.heading }}>{s.value}</span>
            {compare && <DeltaPill cur={s.cur} prev={s.prev} isDark={isDark} />}
          </div>
        </div>
      ))}
    </div>
  );

  // ── Single-agency view ──────────────────────────────────────────────────
  const agencyView = () => {
    if (!agencySel) return null;
    const i = Math.max(0, AGENCY_POOL.findIndex(a => a.name === agencySel.name));
    const a = AGENCY_POOL[i];
    const status: AgencyStatus = agencySel.status ?? AGENCY_STATUS[i];
    const pro = PRO_MEMBERS.find(m => m.agency === a.name);
    const users = POOL_USERS[i];
    const never = status === "Never logged in", lapsed = status === "Lapsed";
    const activated = never ? 0 : Math.max(1, users - (i % 4));
    const pending = users - activated;
    // Activity scales the portal-wide sample by this agency's size; never-
    // logged-in and lapsed agencies have none in the period by definition.
    const k = never || lapsed ? 0 : users / 1200;
    const sc = (n: number) => Math.round(n * k);
    const stats = [
      { label: "Quotes started", value: sc(d.started[0]).toLocaleString(), cur: sc(d.started[0]), prev: sc(d.started[1]) },
      { label: "Submitted", value: sc(d.submitted[0]).toLocaleString(), cur: sc(d.submitted[0]), prev: sc(d.submitted[1]) },
      { label: "Bound", value: sc(d.bound[0]).toLocaleString(), cur: sc(d.bound[0]), prev: sc(d.bound[1]) },
      { label: "Written premium", value: `$${Math.round(d.premium[0] * k * 1000).toLocaleString()}K`, cur: Math.round(d.premium[0] * k * 1000), prev: Math.round(d.premium[1] * k * 1000) },
    ];
    const logins = d.series.map(p => ({ l: p.l, c: never ? 0 : lapsed ? 0 : Math.max(1, Math.round(p.c * users * 0.9)) }));
    const loginMax = Math.max(1, ...logins.map(l => l.c));
    const named = USER_POOL.filter(u => u.agency === a.name).map(u => ({ name: u.name, title: u.title, email: u.email }));
    const domain = a.email.split("@")[1];
    const people = [...named, ...FILLER_PEOPLE.map(f => ({ ...f, email: `${f.name.split(" ")[0].toLowerCase()}@${domain}` }))]
      .slice(0, users)
      .map((u, pi) => {
        const st: PersonStatus = never || pi >= activated ? "pending" : lapsed || PERSON_LAST[pi % PERSON_LAST.length].includes("5 weeks") ? "inactive" : "active";
        const last = st === "pending" ? "Invite pending" : lapsed ? "7+ weeks ago" : PERSON_LAST[pi % PERSON_LAST.length];
        return { ...u, st, last };
      });
    // Box counts come from the same people list as the table/filters.
    const act30 = people.filter(p => p.st === "active").length;
    const counts = { all: people.length, active: people.filter(p => p.st === "active").length, inactive: people.filter(p => p.st === "inactive").length, pending: people.filter(p => p.st === "pending").length };
    const q = userQuery.trim().toLowerCase();
    const matched = people.filter(p => (userFilter === "all" || p.st === userFilter) && (!q || `${p.name} ${p.email} ${p.title}`.toLowerCase().includes(q)));
    const filtering = !!q || userFilter !== "all";
    const shown = showAllUsers || filtering ? matched : matched.slice(0, 6);
    const statusColor = status === "Active"
      ? { fg: isDark ? "#6EE7B7" : "#047857", bg: isDark ? "rgba(16,185,129,0.16)" : "#D1FAE5" }
      : status === "Lapsed"
        ? { fg: isDark ? "#FCD34D" : "#92400E", bg: isDark ? "rgba(245,158,11,0.16)" : "#FEF3C7" }
        : { fg: isDark ? "#C4C8D0" : "#374151", bg: isDark ? "rgba(255,255,255,0.08)" : "#F3F4F6" };
    const box: React.CSSProperties = { background: c.box, border: `1px solid ${c.line}` };
    return (
      <>
        <button type="button" onClick={() => openAgency(null)} className="flex items-center gap-1 text-[12.5px] font-semibold mb-4 cursor-pointer" style={{ fontFamily: FONT, color: "#A614C3", background: "transparent", border: "none", padding: 0 }}>
          ← All agencies
        </button>

        {/* Agency header */}
        <div className="rounded-xl px-6 py-5 mb-6 flex flex-wrap items-start justify-between gap-4" style={box}>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-[20px] font-bold" style={{ color: c.heading }}>{a.name}</h2>
              <span className="text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full" style={{ color: statusColor.fg, background: statusColor.bg }}>{status}</span>
              {pro && <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full" style={{ color: "#A614C3", background: isDark ? "rgba(166,20,195,0.18)" : "rgba(166,20,195,0.08)", letterSpacing: "0.04em" }}>PROSUITE</span>}
            </div>
            <div className="text-[12.5px] mt-1" style={{ color: c.muted }}>{a.contact} · {a.email} · {a.phone}</div>
          </div>
          <div className="flex gap-8 text-[12px]" style={{ color: c.muted }}>
            <div>Member since<div className="text-[14px] font-semibold mt-0.5" style={{ color: c.heading }}>{AGENCY_SINCE[i]}</div></div>
            <div>Last login<div className="text-[14px] font-semibold mt-0.5" style={{ color: c.heading }}>{never ? "Never" : lapsed ? (AGENCY_LAST_LOGIN[i].includes("week") ? AGENCY_LAST_LOGIN[i] : "6 weeks ago") : AGENCY_LAST_LOGIN[i]}</div></div>
          </div>
        </div>

        {/* Users */}
        <div className="rounded-xl overflow-hidden mb-6" style={box}>
          <div className="px-6 py-4 flex flex-wrap items-baseline justify-between gap-2" style={{ borderBottom: `1px solid ${c.line}` }}>
            <h3 className="text-[16px] font-bold" style={{ color: c.heading }}>Users</h3>
            <span className="text-[12px]" style={{ color: c.muted }}>Sample data</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Users", value: users },
              { label: "Activated", value: activated, sub: `${pct(activated, users)}% of users` },
              { label: "Active", value: act30, sub: `${pct(act30, activated)}% of activated` },
              { label: "Pending invites", value: pending },
            ].map((m, idx) => (
              <div key={m.label} className="px-6 py-5" style={{ borderLeft: idx % 4 ? `1px solid ${c.line}` : undefined }}>
                <div className="text-[13px] font-semibold" style={{ color: c.text }}>{m.label}</div>
                <div className="text-[30px] font-extrabold leading-none tracking-tight mt-2" style={{ color: c.heading }}>{m.value}</div>
                {m.sub && <div className="text-[11.5px] mt-2" style={{ color: c.muted }}>{m.sub}</div>}
              </div>
            ))}
          </div>
          {/* Search + status filter */}
          <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-3" style={{ borderTop: `1px solid ${c.line}` }}>
            <div className="flex items-center gap-1.5 flex-wrap">
              {([["all", "All"], ["active", "Active"], ["inactive", "Not active"], ["pending", "Invite pending"]] as ["all" | PersonStatus, string][]).map(([k, label]) => {
                const on = userFilter === k;
                return (
                  <button key={k} type="button" onClick={() => setUserFilter(k)}
                    className="px-2.5 py-1 rounded-full text-[12px] font-semibold cursor-pointer"
                    style={{ fontFamily: FONT, color: on ? "#FFFFFF" : c.text, background: on ? RAZZ : "transparent", border: on ? "1px solid transparent" : `1px solid ${c.line}` }}>
                    {label} <span style={{ opacity: on ? 0.85 : 0.7 }}>{counts[k]}</span>
                  </button>
                );
              })}
            </div>
            <input value={userQuery} onChange={e => setUserQuery(e.target.value)} placeholder="Search name, email or title…"
              className="px-3 py-1.5 rounded-lg text-[12.5px] outline-none" style={{ fontFamily: FONT, color: c.text, background: c.panel, border: `1px solid ${c.line}`, width: 240 }} />
          </div>
          <table className="w-full text-left" style={{ borderTop: `1px solid ${c.line}` }}>
            <thead>
              <tr className="text-[11px] font-bold uppercase" style={{ letterSpacing: "0.08em", color: c.muted, background: isDark ? "#1E2240" : "#F7F8FA" }}>
                <th className="px-6 py-2.5 font-bold">Name</th>
                <th className="px-3 py-2.5 font-bold">Job title</th>
                <th className="px-3 py-2.5 font-bold">Email</th>
                <th className="px-6 py-2.5 font-bold">Last active</th>
              </tr>
            </thead>
            <tbody>
              {shown.map(u => (
                <tr key={u.email} style={{ borderTop: `1px solid ${c.line}` }}>
                  <td className="px-6 py-3 text-[13px] font-semibold" style={{ color: c.heading }}>{u.name}</td>
                  <td className="px-3 py-3 text-[12.5px]" style={{ color: c.text }}>{u.title}</td>
                  <td className="px-3 py-3 text-[12.5px]" style={{ color: c.text }}>{u.email}</td>
                  <td className="px-6 py-3 text-[12.5px]" style={{ color: u.st === "pending" ? c.muted : c.text, fontStyle: u.st === "pending" ? "italic" : undefined }}>{u.last}</td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr style={{ borderTop: `1px solid ${c.line}` }}><td colSpan={4} className="px-6 py-6 text-center text-[12.5px]" style={{ color: c.muted }}>No users match.</td></tr>
              )}
            </tbody>
          </table>
          <div className="px-6 py-3 flex items-center justify-between gap-3 text-[12px]" style={{ color: c.muted, borderTop: `1px solid ${c.line}` }}>
            <span>Showing {shown.length} of {filtering ? `${matched.length} matching` : users} users</span>
            <div className="flex items-center gap-3">
              {!filtering && matched.length > 6 && (
                <button type="button" onClick={() => setShowAllUsers(v => !v)} className="font-semibold cursor-pointer" style={{ fontFamily: FONT, color: "#A614C3", background: "transparent", border: "none", padding: 0 }}>
                  {showAllUsers ? "Show fewer" : `Show all ${users} users`}
                </button>
              )}
              <button type="button" onClick={() => downloadCsv(`norbielink-${a.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-users.csv`, [["Name", "Job title", "Email", "Last active"], ...matched.map(u => [u.name, u.title, u.email, u.last])])}
                className="flex items-center gap-1 font-semibold cursor-pointer" style={{ fontFamily: FONT, color: c.text, background: "transparent", border: "none", padding: 0 }}>
                <Download className="w-3.5 h-3.5" style={{ color: c.faint }} /> Export
              </button>
            </div>
          </div>
        </div>

        {/* Activity */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-[13px] font-bold uppercase" style={{ letterSpacing: "0.1em", color: c.heading }}>Activity</h3>
            <SampleTag />
          </div>
          <span className="text-[12px]" style={{ color: c.muted }}>{b(periodLabel)}{compare && <> · vs {b(actPrevLabel)}</>}</span>
        </div>
        {statRow(stats)}
        <div className="p-5 mt-6 mb-6" style={panel}>
          <div className="text-[13px] font-semibold mb-5" style={{ color: c.heading }}>Logins <span style={{ color: c.faint }}>· {periodLabel}</span></div>
          {never || lapsed ? (
            <div className="text-[12.5px] py-6 text-center" style={{ color: c.muted }}>{never ? "No one at this agency has logged in yet." : "No logins in this period."}</div>
          ) : (
            <div className="flex items-end gap-3" style={{ minHeight: 120 }}>
              {logins.map(m => (
                <div key={m.l} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[11px] font-semibold" style={{ color: c.heading }}>{m.c}</span>
                  <div className="w-full rounded-t" style={{ height: 4 + (m.c / loginMax) * 96, background: RAZZ }} />
                  <span className="text-[10.5px]" style={{ color: c.faint }}>{m.l}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ProSuite */}
        <div className="rounded-xl px-6 py-5 mb-10" style={box}>
          <div className="flex items-baseline justify-between gap-3 mb-3">
            <h3 className="text-[16px] font-bold" style={{ color: c.heading }}>ProSuite</h3>
            {pro && <span className="text-[12px]" style={{ color: c.muted }}>Member since {b(pro.since)}</span>}
          </div>
          {pro ? (
            <div className="flex flex-col">
              {pro.tools.map((t, ti) => {
                const tool = PRO_TOOLS.find(x => x.name === t);
                const n = Math.max(1, Math.round(users * [0.7, 0.55, 0.4, 0.3, 0.25][ti % 5]));
                return (
                  <div key={t} className="flex items-center justify-between gap-3 py-2.5" style={{ borderTop: ti ? `1px solid ${c.line}` : undefined }}>
                    <div>
                      <div className="text-[13px] font-semibold" style={{ color: c.heading }}>{t}</div>
                      {tool && <div className="text-[11.5px]" style={{ color: c.muted }}>{tool.does}</div>}
                    </div>
                    <span className="text-[12.5px]" style={{ color: c.text }}>{b(n)} of {users} users</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-[12.5px]" style={{ color: c.muted }}>Not a ProSuite member.</div>
          )}
        </div>
      </>
    );
  };

  return (
    <div style={{ fontFamily: FONT, color: c.text }}>
      {/* Report header */}
      <div className="flex items-center justify-between flex-shrink-0 mb-10" style={{ height: 71, background: isDark ? "#0F1120" : "#FFFFFF", borderBottom: `0.87px solid ${c.line}`, marginTop: -24, marginLeft: -48, marginRight: -48, paddingLeft: 28, paddingRight: 28 }}>
        <h1 className="text-[22px] font-normal" style={{ color: c.heading }}>Reports</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button type="button" onClick={() => setCohortOpen(o => !o)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold cursor-pointer" style={{ fontFamily: FONT, border: `1px solid ${c.line}`, color: c.text }}>
              <span className="truncate" style={{ maxWidth: 200 }}>{agencySel ? agencySel.name : ds.short}</span><ChevronDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.faint }} />
            </button>
            {cohortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setCohortOpen(false)} />
                <div className="absolute right-0 top-full mt-1 rounded-lg overflow-hidden z-20" style={{ background: c.panel, border: `1px solid ${c.line}`, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", width: 260 }}>
                  {COHORTS.map(k => (
                    <button key={k} type="button" onClick={() => { setCohort(k); openAgency(null); setCohortOpen(false); }} className="w-full text-left px-3.5 py-2 text-[12.5px] flex items-center justify-between" style={{ fontFamily: FONT, color: c.text, background: !agencySel && k === cohort ? c.track : "transparent", cursor: "pointer" }}>
                      {DATASET[k].label}{!agencySel && k === cohort && <Check className="w-3.5 h-3.5" style={{ color: "#A614C3" }} strokeWidth={2.5} />}
                    </button>
                  ))}
                  {/* Single agency — search the agency list */}
                  <div className="px-3 pt-2.5 pb-1.5" style={{ borderTop: `1px solid ${c.line}` }}>
                    <div className="text-[10.5px] font-bold uppercase mb-1.5" style={{ letterSpacing: "0.08em", color: c.muted }}>Single agency</div>
                    <input autoFocus value={agencyQuery} onChange={e => setAgencyQuery(e.target.value)} placeholder="Search agencies…"
                      className="w-full px-2.5 py-1.5 rounded-md text-[12.5px] outline-none"
                      style={{ fontFamily: FONT, color: c.text, background: c.panel, border: `1px solid ${c.line}` }} />
                  </div>
                  <div className="overflow-y-auto pb-1" style={{ maxHeight: 220 }}>
                    {AGENCY_POOL.filter(a => a.name.toLowerCase().includes(agencyQuery.trim().toLowerCase())).map(a => (
                      <button key={a.name} type="button" onClick={() => { openAgency({ name: a.name }); setCohortOpen(false); setAgencyQuery(""); }}
                        className="w-full text-left px-3.5 py-1.5 text-[12.5px] flex items-center justify-between" style={{ fontFamily: FONT, color: c.text, background: agencySel?.name === a.name ? c.track : "transparent", cursor: "pointer" }}>
                        <span className="truncate">{a.name}</span>{agencySel?.name === a.name && <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#A614C3" }} strokeWidth={2.5} />}
                      </button>
                    ))}
                  </div>
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
          <button type="button" onClick={() => downloadCsv(`norbielink-adoption-${cohort}.csv`, [["Metric", "Value", `vs ${adoptPrevLabel}`], ["Cohort", ds.label, ""], ["Period", periodLabel, ""], ["Agencies tracked", TOTAL, TOTAL - pr.total], ["Have logged in", LOGGED_IN, LOGGED_IN - pr.loggedin], ["Active", ACTIVE_30, ACTIVE_30 - pr.active30], ["No recorded login", NO_LOGIN, NO_LOGIN - pNO]])}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold cursor-pointer" style={{ fontFamily: FONT, border: `1px solid ${c.line}`, color: c.text }}>
            <Download className="w-3.5 h-3.5" style={{ color: c.faint }} /> Export
          </button>
        </div>
      </div>

      {agencySel ? agencyView() : (<>
      {/* Overview — agencies (the account) then users (the people in them) */}
      {metricGrid("Agency Adoption Overview", <>{ds.label} · snapshot {b(asOfLabel)} · change vs {b(adoptPrevLabel)}{cohort !== "all" && " · wave figures are sample data"}</>, overview)}

      {/* Agency next steps — never logged in / lapsed */}
      {nextSteps([
        { key: "nologin", icon: UserPlus, title: "Ready to onboard", action: "Onboard", open: () => setDrill("nologin"),
          text: <><strong style={{ color: c.heading }}>{NO_LOGIN} agencies</strong> haven&apos;t logged in yet.</> },
        { key: "dormant", icon: RefreshCw, title: "Ready to re-engage", action: "Re-engage", open: () => setDrill("dormant"),
          text: <><strong style={{ color: c.heading }}>{LAPSED} agencies</strong> have used NorbieLink before but not in this period.</> },
      ])}

      {metricGrid("User Activity", <>Agents inside these agencies · change vs {b(adoptPrevLabel)} · sample data</>, userMetrics, "mb-10")}


      {/* ── Activity & traffic ──────────────────────────────────────────── */}
      <div className="pt-8" style={{ borderTop: `1px solid ${c.line}` }}>
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div className="flex items-center gap-2">
            <h3 className="text-[13px] font-bold uppercase" style={{ letterSpacing: "0.1em", color: c.heading }}>Activity &amp; traffic</h3>
            <SampleTag />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[12px]" style={{ color: c.muted }}>{b(periodLabel)}{compare && <> · vs {b(actPrevLabel)}</>}</span>
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

      {/* ── ProSuite: who's on it and which tools they use ─────────────── */}
      <div className="pt-8 mb-10" style={{ borderTop: `1px solid ${c.line}` }}>
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div className="flex items-center gap-2">
            <h3 className="text-[13px] font-bold uppercase" style={{ letterSpacing: "0.1em", color: c.heading }}>ProSuite</h3>
            <SampleTag />
          </div>
          <button type="button"
            onClick={() => downloadCsv("norbielink-prosuite-members.csv", [["Agency", "Contact", "State", "Member since", "Users", "Tools used", "Last active"], ...PRO_MEMBERS.map(m => [m.agency, m.contact, m.state, m.since, m.users, m.tools.join("; "), m.lastActive])])}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer"
            style={{ fontFamily: FONT, color: c.text, background: c.panel, border: `1px solid ${c.line}` }}>
            <Download className="w-3.5 h-3.5" style={{ color: c.faint }} /> Export members
          </button>
        </div>

        {/* Summary */}
        <div className="rounded-xl overflow-hidden mb-6 grid grid-cols-2 lg:grid-cols-4" style={{ background: c.box, border: `1px solid ${c.line}` }}>
          {[
            { label: "ProSuite members", value: PRO_STATS.members[0].toLocaleString(), sub: `${pct(PRO_STATS.members[0], LOGGED_IN)}% of logged-in agencies`, cur: PRO_STATS.members[0], prev: PRO_STATS.members[1] },
            { label: "New this period", value: PRO_STATS.newMembers[0].toLocaleString(), sub: periodLabel, cur: PRO_STATS.newMembers[0], prev: PRO_STATS.newMembers[1] },
            { label: "Avg. tools per agency", value: PRO_STATS.avgTools[0].toFixed(1), sub: `of ${PRO_TOOLS.length} ProSuite tools`, cur: PRO_STATS.avgTools[0], prev: PRO_STATS.avgTools[1] },
            { label: "Renewals due · 60 days", value: PRO_STATS.renewals60.toLocaleString(), sub: "Annual plan renewals coming up", cur: null as number | null, prev: null as number | null },
          ].map((m, i) => (
            <div key={m.label} className="px-6 py-5" style={{ borderLeft: i % 2 ? `1px solid ${c.line}` : undefined, borderTop: i >= 2 ? `1px solid ${c.line}` : undefined }}>
              <div className="text-[13px] font-semibold" style={{ color: c.text }}>{m.label}</div>
              <div className="flex items-center justify-between gap-3 mt-2">
                <span className="text-[30px] font-extrabold leading-none tracking-tight" style={{ color: c.heading }}>{m.value}</span>
                {m.cur !== null && m.prev !== null && <DeltaPill cur={m.cur} prev={m.prev} isDark={isDark} />}
              </div>
              <div className="text-[11.5px] mt-2" style={{ color: c.muted }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Tool usage */}
        <div className="p-5 mb-6" style={panel}>
          <div className="flex items-baseline justify-between gap-3 flex-wrap mb-4">
            <span className="text-[13px] font-semibold" style={{ color: c.heading }}>Tools in use</span>
            <span className="text-[12px]" style={{ color: c.muted }}>Agencies and users on each tool · share of {PRO_STATS.members[0]} member agencies</span>
          </div>
          <div className="flex flex-col">
            {PRO_TOOLS.map((t, i) => {
              const share = pct(t.using[0], PRO_STATS.members[0]);
              return (
                <div key={t.name} className="grid items-center gap-4 py-3" style={{ gridTemplateColumns: "minmax(170px,1.1fr) 2fr 190px 104px", borderTop: i ? `1px solid ${c.line}` : undefined }}>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold" style={{ color: c.heading }}>{t.name}</div>
                    <div className="text-[11.5px] truncate" style={{ color: c.muted }}>{t.does}</div>
                  </div>
                  <div className="h-[10px] rounded-full" style={{ background: c.track }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.max(share, 2)}%`, background: RAZZ }} />
                  </div>
                  <div className="text-[12.5px] text-right whitespace-nowrap" style={{ color: c.text }}>
                    <span className="font-semibold" style={{ color: c.heading }}>{t.using[0]}</span> agencies · {share}%
                    <div className="text-[11px]" style={{ color: c.muted }}>{t.users} users · {t.active30} agencies active</div>
                  </div>
                  <div className="justify-self-end"><DeltaPill cur={t.using[0]} prev={t.using[1]} isDark={isDark} /></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Members */}
        <div className="rounded-xl overflow-hidden" style={{ background: c.box, border: `1px solid ${c.line}` }}>
          <div className="px-5 py-4 flex items-baseline justify-between gap-3" style={{ borderBottom: `1px solid ${c.line}` }}>
            <span className="text-[13px] font-semibold" style={{ color: c.heading }}>ProSuite members</span>
            <span className="text-[12px]" style={{ color: c.muted }}>Showing {PRO_MEMBERS.length} of {PRO_STATS.members[0]} · most recently active</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left" style={{ minWidth: 760 }}>
              <thead>
                <tr className="text-[11px] font-bold uppercase" style={{ letterSpacing: "0.08em", color: c.muted, background: isDark ? "#1E2240" : "#F7F8FA" }}>
                  <th className="px-5 py-2.5 font-bold">Agency</th>
                  <th className="px-3 py-2.5 font-bold">Member since</th>
                  <th className="px-3 py-2.5 font-bold text-right">Users</th>
                  <th className="px-3 py-2.5 font-bold">Tools used</th>
                  <th className="px-5 py-2.5 font-bold">Last active</th>
                </tr>
              </thead>
              <tbody>
                {PRO_MEMBERS.map(m => (
                  <tr key={m.agency} onClick={() => openAgency({ name: m.agency, status: "Active" })} className="cursor-pointer transition-colors"
                    onMouseEnter={e => hoverOn(e.currentTarget)}
                    onMouseLeave={e => hoverOff(e.currentTarget)}
                    style={{ borderTop: `1px solid ${c.line}` }}>
                    <td className="px-5 py-3">
                      <div className="text-[13px] font-semibold" style={{ color: c.heading }}>{m.agency}</div>
                      <div className="text-[11.5px]" style={{ color: c.muted }}>{m.contact} · {m.state}</div>
                    </td>
                    <td className="px-3 py-3 text-[12.5px] whitespace-nowrap" style={{ color: c.text }}>{m.since}</td>
                    <td className="px-3 py-3 text-[12.5px] text-right" style={{ color: c.text }}>{m.users}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {m.tools.map(tool => (
                          <span key={tool} className="text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ color: isDark ? "#E9B8F2" : "#7E0F95", background: isDark ? "rgba(166,20,195,0.18)" : "rgba(166,20,195,0.08)" }}>{tool}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[12.5px] whitespace-nowrap" style={{ color: c.text }}>{m.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      </>)}

      {/* Source footer */}
      <div className="flex items-end justify-between gap-6 flex-wrap pb-2">
        <p className="text-[10.5px] leading-relaxed" style={{ color: c.faint, maxWidth: 820 }}>Source: NorbieLink login and activity data, snapshot as of {asOfLabel}, reporting period {periodLabel}, compared with the {adoptPrevLabel}. Cohort: {ds.label}. Activity, traffic and premium figures are sample data; custom ranges map to the nearest sample window.</p>
        <span className="text-[10.5px] font-semibold uppercase" style={{ letterSpacing: "0.1em", color: c.faint }}>Powered by BTIS</span>
      </div>

      {/* Drill-down modal */}
      {drill && (() => {
        const seg = buildSegment(drill, drill === "single" ? USERS[cohort].cur.single : segCount[drill]);
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
                  <div key={r.name} role="button" tabIndex={0}
                    onClick={() => { openAgency({ name: r.name, status: seg.kind === "nologin" ? "Never logged in" : seg.kind === "dormant" ? "Lapsed" : seg.kind === "all" ? undefined : "Active" }); setDrill(null); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { openAgency({ name: r.name }); setDrill(null); } }}
                    className="flex items-start justify-between gap-3 py-3 px-2 -mx-2 cursor-pointer transition-colors"
                    onMouseEnter={e => hoverOn(e.currentTarget)}
                    onMouseLeave={e => hoverOff(e.currentTarget)}
                    style={{ borderBottom: i === seg.rows.length - 1 ? "none" : `1px solid ${c.line}` }}>
                    <div className="min-w-0"><div className="text-[13px] font-medium truncate" style={{ color: c.text }}>{r.name}</div><div className="text-[11.5px] mt-0.5 truncate" style={{ color: c.muted }}>{r.contact} · {r.email} · {r.phone}</div></div>
                    <div className="flex-shrink-0 text-right pt-0.5">
                      <div className="text-[12px] font-semibold" style={{ color: c.text }}>{r.users} users · {r.activeUsers} active</div>
                      <div className="text-[11.5px] mt-0.5" style={{ color: c.muted }}>{r.meta}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between gap-3 px-6 py-4" style={{ borderTop: `1px solid ${c.line}` }}>
                <span className="text-[11.5px]" style={{ color: c.faint }}>Showing {seg.rows.length} of {seg.count.toLocaleString()} · sample data</span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => downloadCsv(`norbielink-${seg.kind}-${cohort}.csv`, [["Agency", "Contact", "Email", "Phone", "Users", "Active users", "Status"], ...seg.rows.map(r => [r.name, r.contact, r.email, r.phone, r.users, r.activeUsers, r.meta])])} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold cursor-pointer" style={{ fontFamily: FONT, border: `1px solid ${c.line}`, color: c.text }}><Download className="w-3.5 h-3.5" style={{ color: c.faint }} /> Export CSV</button>
                  <button type="button" onClick={() => { setDrill(null); viewAgencies(); }} className="px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold text-white cursor-pointer" style={{ fontFamily: FONT, background: RAZZ, border: "none" }}>Open in Agencies</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* User drill-down modal — people, not agencies */}
      {userDrill && (() => {
        const info = USER_SEG_INFO[userDrill];
        const count = { invited: us.invited, activated: us.activated, uactive30: us.active30, uactive7: us.active7, pending: PENDING }[userDrill];
        const rows = USER_POOL.map((u, i) => ({ ...u, meta: info.meta(i) }));
        return (
          <div className="fixed inset-0 z-[80] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setUserDrill(null)}>
            <div className="rounded-2xl w-[640px] max-w-[94vw] max-h-[84vh] flex flex-col" style={{ background: c.panel, boxShadow: "0 20px 60px rgba(0,0,0,0.25)", fontFamily: FONT }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4" style={{ borderBottom: `1px solid ${c.line}` }}>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2"><span className="text-[20px] font-bold" style={{ color: c.heading }}>{count.toLocaleString()}</span><h3 className="text-[14px] font-semibold" style={{ color: c.heading }}>{info.title}</h3></div>
                  <p className="text-[12px] mt-0.5" style={{ color: c.muted }}>{info.note} · {ds.label}</p>
                </div>
                <button type="button" onClick={() => setUserDrill(null)} aria-label="Close" className="p-1.5 rounded-md cursor-pointer flex-shrink-0" style={{ color: c.faint, border: "none", background: "transparent" }}><X className="w-4 h-4" /></button>
              </div>
              <div className="overflow-y-auto px-6 py-2" style={{ minHeight: 120 }}>
                {rows.map((r, i) => (
                  <div key={r.email} className="flex items-start justify-between gap-3 py-3" style={{ borderBottom: i === rows.length - 1 ? "none" : `1px solid ${c.line}` }}>
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium truncate" style={{ color: c.text }}>{r.name} <span className="font-normal" style={{ color: c.muted }}>· {r.title}</span></div>
                      <div className="text-[11.5px] mt-0.5 truncate" style={{ color: c.muted }}>{r.agency} · {r.email}</div>
                    </div>
                    <span className="text-[11.5px] flex-shrink-0 text-right pt-0.5" style={{ color: c.muted }}>{r.meta}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between gap-3 px-6 py-4" style={{ borderTop: `1px solid ${c.line}` }}>
                <span className="text-[11.5px]" style={{ color: c.faint }}>Showing {rows.length} of {count.toLocaleString()} · sample data</span>
                <button type="button" onClick={() => downloadCsv(`norbielink-users-${userDrill}-${cohort}.csv`, [["Name", "Job title", "Agency", "Email", "Status"], ...rows.map(r => [r.name, r.title, r.agency, r.email, r.meta])])} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold cursor-pointer" style={{ fontFamily: FONT, border: `1px solid ${c.line}`, color: c.text }}><Download className="w-3.5 h-3.5" style={{ color: c.faint }} /> Export CSV</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
