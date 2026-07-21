"use client";

import { useState } from "react";
import { Search, ChevronDown, X, Send, ClipboardList, Clock, CheckCircle2 } from "lucide-react";
import EndorsementIntake from "./EndorsementIntake";

const FONT = "var(--font-montserrat), Montserrat, sans-serif";

type SearchBy = "Select" | "Policy Number" | "DBA" | "Applicant Name" | "Bond Number";
type View = "search" | "results" | "form" | "success";

// Mock results table returned after a "find a policy" search. Static list so
// every search resolves to the same set — this is a design mock, not a real
// lookup. Row shape mirrors the legacy view's policy grid so a real backend
// can drop in without touching the render.
interface SearchResult {
  submissionId: string;
  policyNumber: string;
  applicant: string;
  lob: string;
  dba: string;
  status: PolicyStatus;
  effective: string;
}
type PolicyStatus = "Bound" | "Cancelled" | "Incomplete" | "Submission Incomplete";
const STATUS_OPTIONS: PolicyStatus[] = ["Bound", "Cancelled", "Incomplete", "Submission Incomplete"];
const SEARCH_RESULTS: SearchResult[] = [
  { submissionId: "VIC00003362",     policyNumber: "7038911131",     applicant: "Pizza Club LLC, Pizza Club BT LLC",      lob: "Victor",         dba: "--",                                status: "Cancelled",             effective: "07/19/2026" },
  { submissionId: "VIC00003355",     policyNumber: "P102117404",     applicant: "MONTICELLO STAFFING LLC",                lob: "Victor",         dba: "--",                                status: "Bound",                 effective: "07/20/2026" },
  { submissionId: "QMWC0750104-E47", policyNumber: "WCB11144570800", applicant: "SB DE Production Test 2 LLC",            lob: "Worker's Comp",  dba: "SB DE Production Test 2 LLC",       status: "Bound",                 effective: "05/11/2026" },
  { submissionId: "QMWC0748621-E43", policyNumber: "WCB11144570700", applicant: "SB PA Production Test 3",                lob: "Worker's Comp",  dba: "SB PA Production Test 3",           status: "Submission Incomplete", effective: "05/29/2026" },
  { submissionId: "QMWC0754121-E48", policyNumber: "WCB11144570600", applicant: "SB Test 2 LLC",                          lob: "Worker's Comp",  dba: "SB Test 2 LLC",                     status: "Incomplete",            effective: "05/11/2026" },
  { submissionId: "QMWC0638232-E1",  policyNumber: "CWC03611900",    applicant: "OJM RENOVATIONS LLC",                    lob: "Worker's Comp",  dba: "OJM RENOVATIONS",                   status: "Cancelled",             effective: "09/26/2025" },
  { submissionId: "QMWC0583874-E1",  policyNumber: "CWC01145503",    applicant: "DG Construction LLC",                    lob: "Worker's Comp",  dba: "DG Construction",                   status: "Submission Incomplete", effective: "09/11/2025" },
  { submissionId: "QMWC0583845-E1",  policyNumber: "CWC01144203",    applicant: "DRYWALL SOLUTIONS LTD (A Corp)",         lob: "Worker's Comp",  dba: "DRYWALL SOLUTIONS LTD",             status: "Incomplete",            effective: "09/11/2025" },
  { submissionId: "QMWC0579022-E2",  policyNumber: "CWC01115103",    applicant: "Liam Russell",                           lob: "Worker's Comp",  dba: "R Pro Marlin Plumbing",             status: "Cancelled",             effective: "09/06/2025" },
  { submissionId: "QMWC0579023-E2",  policyNumber: "CWC01114603",    applicant: "WHITE GRAPE PAINTING INC",               lob: "Worker's Comp",  dba: "WHITE GRAPE PAINTING INC",          status: "Bound",                 effective: "09/06/2025" },
];

const SEARCH_OPTIONS: SearchBy[] = ["Select", "Policy Number", "DBA", "Applicant Name", "Bond Number"];

export default function Endorsements({ isDark }: { isDark: boolean }) {
  const [view, setView] = useState<View>("search");

  const [searchBy, setSearchBy] = useState<SearchBy>("Policy Number");
  const [searchByOpen, setSearchByOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Row click on a search result opens a chooser modal: New Request (open the
  // structured intake) vs View Existing (drop into a list of prior endorsements
  // for that policy — mock/stub for now).
  const [chooseOpen, setChooseOpen] = useState(false);
  const [pendingResult, setPendingResult] = useState<SearchResult | null>(null);
  // The row the intake is currently anchored to. Snapshotted at New Request
  // time so re-opening the chooser without navigating doesn't retarget the
  // in-flight intake.
  const [intakePolicy, setIntakePolicy] = useState<SearchResult | null>(null);

  // Status column filter on the results table — mirrors the multi-select
  // dropdown pattern used on Policies. Empty set = no filter.
  const [statusFilter, setStatusFilter] = useState<Set<PolicyStatus>>(new Set());
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);

  const c = {
    text:         isDark ? "#F9FAFB" : "#1F2937",
    muted:        isDark ? "#8B8FA8" : "#6B7280",
    sub:          isDark ? "#6B7280" : "#9CA3AF",
    cardBg:       isDark ? "#191D35" : "#fff",
    border:       isDark ? "rgba(255,255,255,0.08)" : "#E5E7EB",
    mutedBg:      isDark ? "rgba(255,255,255,0.03)" : "#F9FAFB",
    hoverBg:      isDark ? "rgba(255,255,255,0.04)" : "#F9FAFB",
    inputBg:      isDark ? "rgba(255,255,255,0.05)" : "#fff",
  };
  const btnGrad = isDark
    ? "radial-gradient(171.32% 99.33% at 33.13% -9%, #282550 0%, #191735 55.82%, rgba(0,0,0,0.3) 74%, rgba(0,0,0,0) 100%), linear-gradient(88.34deg, #5C2ED4 0.11%, #A614C3 63.8%)"
    : "linear-gradient(90deg,#5C2ED4 0%,#A614C3 65%)";

  const closeAll = () => { setSearchByOpen(false); setStatusFilterOpen(false); };

  const toggleStatus = (s: PolicyStatus) => {
    setStatusFilter(prev => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s); else next.add(s);
      return next;
    });
  };
  const filteredResults = statusFilter.size > 0
    ? SEARCH_RESULTS.filter(r => statusFilter.has(r.status))
    : SEARCH_RESULTS;

  const handleSearch = () => {
    if (!searchValue.trim()) return;
    // Mock: always resolves to the static SEARCH_RESULTS list. A real backend
    // would filter by (searchBy, searchValue) and populate `results` here.
    setView("results");
  };

  // Row click on the results table → open the chooser modal.
  const handleSelectResult = (r: SearchResult) => {
    setPendingResult(r);
    setChooseOpen(true);
  };

  // "New Request" → snapshot the row and open the structured intake.
  const handleChooseNew = () => {
    if (pendingResult) setIntakePolicy(pendingResult);
    setChooseOpen(false);
    setView("form");
  };

  // "View Existing" — stub for the design mock: close the modal and stay on
  // the results table until we wire real historical endorsements.
  const handleChooseExisting = () => {
    setChooseOpen(false);
  };

  const handleSubmit = () => setView("success");

  const handleBack = () => {
    // Drop back on the results table so the user can pick another policy
    // without re-typing their search.
    setView(searchValue.trim() ? "results" : "search");
  };

  const inputStyle: React.CSSProperties = {
    fontFamily: FONT,
    background: c.inputBg,
    border: `1px solid ${c.border}`,
    color: c.text,
    padding: "10px 14px",
    borderRadius: 10,
    fontSize: 13,
    width: "100%",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: FONT,
    color: c.muted,
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 6,
    display: "block",
  };

  return (
    <div className="flex flex-col flex-1 min-h-0" style={{ fontFamily: FONT }} onClick={closeAll}>
      {/* Section title */}
      <div className="flex flex-col justify-center flex-shrink-0 mb-12"
        style={{ height: 71, borderBottom: `0.87px solid ${isDark ? "rgba(255,255,255,0.08)" : "#E5E7EB"}`, marginLeft: -48, marginRight: -48, paddingLeft: 28, paddingRight: 28 }}>
        <h1 className="text-[22px] font-normal" style={{ fontFamily: FONT, color: c.text }}>Endorsements</h1>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto" style={{ paddingBottom: 48 }}>
        {(view === "search" || view === "results") && (
          <div className="flex flex-col gap-6">
          {/* Top stroke is painted as a 4px-tall background-image at the top of the card
              instead of a child div. The card's rounded-2xl naturally clips the gradient
              to a real 16px corner — a child div with border-radius would get clamped to
              ~2px because the browser caps corner radius at half the element's height. */}
          <div className="rounded-2xl"
            style={{
              backgroundColor: c.cardBg,
              backgroundImage: "linear-gradient(90deg,#5C2ED4 0%,#A614C3 65%)",
              backgroundRepeat: "no-repeat",
              backgroundSize: "100% 4px",
              backgroundPosition: "top",
              borderLeft: `1px solid ${c.border}`,
              borderRight: `1px solid ${c.border}`,
              borderBottom: `1px solid ${c.border}`,
              boxShadow: isDark ? "none" : "0 1px 3px rgba(15,23,42,0.04)",
            }}>
            <div className="px-8 py-8">
              <div className="text-[15px] font-semibold mb-1" style={{ color: c.text }}>Find a policy to endorse</div>
              <div className="text-[13px] mb-6" style={{ color: c.muted }}>Search by policy number, submission ID, or insured name.</div>

              <div className="flex items-end gap-3" onClick={e => e.stopPropagation()}>
                <div className="flex-1" style={{ maxWidth: 240 }}>
                  <label style={labelStyle}>Search By</label>
                  <div className="relative">
                    <button onClick={() => { closeAll(); setSearchByOpen(o => !o); }}
                      className="w-full flex items-center justify-between"
                      style={{ ...inputStyle, cursor: "pointer", textAlign: "left" }}>
                      <span>{searchBy}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${searchByOpen ? "rotate-180" : ""}`} style={{ color: c.muted }} />
                    </button>
                    {searchByOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1 z-20 rounded-lg shadow-lg overflow-hidden"
                        style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
                        {SEARCH_OPTIONS.map(o => (
                          <button key={o} onClick={() => { setSearchBy(o); setSearchByOpen(false); }}
                            className="w-full text-left px-3 py-2 text-[13px] transition-colors"
                            style={{ fontFamily: FONT, color: c.text }}
                            onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                            {o}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <label style={labelStyle}>Enter Info</label>
                  <input value={searchValue} onChange={e => setSearchValue(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSearch()}
                    placeholder="Enter search term"
                    style={inputStyle} />
                </div>

                <button onClick={handleSearch}
                  disabled={!searchValue.trim()}
                  className="flex items-center gap-2 text-[13px] font-semibold text-white transition-all"
                  style={{
                    fontFamily: FONT,
                    background: btnGrad,
                    padding: "10px 28px",
                    borderRadius: 10,
                    opacity: searchValue.trim() ? 1 : 0.5,
                    cursor: searchValue.trim() ? "pointer" : "not-allowed",
                    boxShadow: "0 4px 14px rgba(166,20,195,0.25)",
                  }}
                  onMouseEnter={e => { if (searchValue.trim()) e.currentTarget.style.filter = "brightness(1.08)"; }}
                  onMouseLeave={e => (e.currentTarget.style.filter = "none")}>
                  <Search className="w-4 h-4" />Search
                </button>
              </div>
            </div>
          </div>

          {view === "search" && (<>
          {/* How it works */}
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {[
              { icon: Search,        title: "1. Find your policy",   body: "Search by policy number, submission ID, or insured name — we'll pull it up instantly." },
              { icon: ClipboardList, title: "2. Tell us what changed", body: "Add coverage, update limits, swap a vehicle — just describe the change and attach docs." },
              { icon: Send,          title: "3. We route it",         body: "Your request lands with the right carrier team the moment you hit submit." },
            ].map(step => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-2xl px-6 py-5"
                  style={{ background: c.cardBg, border: `1px solid ${c.border}`, boxShadow: isDark ? "none" : "0 1px 3px rgba(15,23,42,0.04)" }}>
                  <div className="flex items-center justify-center mb-3"
                    style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: isDark ? "rgba(166,20,195,0.14)" : "rgba(166,20,195,0.08)",
                      border: `1px solid ${isDark ? "rgba(166,20,195,0.28)" : "rgba(166,20,195,0.18)"}`,
                    }}>
                    <Icon className="w-[18px] h-[18px]" style={{ color: "#A614C3" }} />
                  </div>
                  <div className="text-[13px] font-semibold mb-1" style={{ fontFamily: FONT, color: c.text }}>{step.title}</div>
                  <div className="text-[12px] leading-relaxed" style={{ fontFamily: FONT, color: c.muted }}>{step.body}</div>
                </div>
              );
            })}
          </div>

          {/* Recent endorsement requests */}
          <div className="rounded-2xl"
            style={{ background: c.cardBg, border: `1px solid ${c.border}`, boxShadow: isDark ? "none" : "0 1px 3px rgba(15,23,42,0.04)" }}>
            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: `1px solid ${c.border}` }}>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: c.muted }} />
                <span className="text-[14px] font-semibold" style={{ fontFamily: FONT, color: c.text }}>Recent endorsement requests</span>
              </div>
              <button className="text-[12px] font-semibold transition-opacity hover:opacity-70"
                style={{ fontFamily: FONT, color: "#A614C3" }}>View all</button>
            </div>
            <div className="grid px-6 py-3 gap-4"
              style={{ gridTemplateColumns: "1.2fr 1.6fr 1.4fr 1fr 1fr", borderBottom: `1px solid ${c.border}`, background: c.mutedBg }}>
              {["Request ID", "Insured", "Type", "Submitted", "Status"].map(h => (
                <div key={h} className="text-[11px] font-bold uppercase tracking-wider"
                  style={{ fontFamily: FONT, color: c.muted }}>{h}</div>
              ))}
            </div>
            {[
              { id: "REQ-2026-0421", insured: "Acme Logistics",       type: "Add Vehicle",       date: "Apr 18, 2026", status: "Processing" },
              { id: "REQ-2026-0387", insured: "Sunrise Bakery",       type: "Change Address",    date: "Apr 12, 2026", status: "Completed"  },
              { id: "REQ-2026-0356", insured: "Metro Construction",   type: "Add Insured",       date: "Apr 08, 2026", status: "Completed"  },
              { id: "REQ-2026-0329", insured: "Harbor Marine Co.",    type: "Update Limits",     date: "Mar 30, 2026", status: "Completed"  },
            ].map((r, i, arr) => {
              const statusColor = r.status === "Processing"
                ? { color: "#B45309", bg: isDark ? "rgba(245,158,11,0.15)" : "rgba(245,158,11,0.12)" }
                : { color: "#047857", bg: isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.12)" };
              return (
                <div key={r.id} className="grid px-6 py-3.5 items-center gap-4 transition-colors"
                  style={{ gridTemplateColumns: "1.2fr 1.6fr 1.4fr 1fr 1fr", borderBottom: i !== arr.length - 1 ? `1px solid ${c.border}` : "none" }}
                  onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <div className="text-[12px] font-semibold" style={{ fontFamily: FONT, color: c.text }}>{r.id}</div>
                  <div className="text-[12px]" style={{ fontFamily: FONT, color: c.text }}>{r.insured}</div>
                  <div className="text-[12px]" style={{ fontFamily: FONT, color: c.muted }}>{r.type}</div>
                  <div className="text-[12px]" style={{ fontFamily: FONT, color: c.muted }}>{r.date}</div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit"
                    style={{ background: statusColor.bg }}>
                    {r.status === "Processing"
                      ? <Clock className="w-3 h-3" style={{ color: statusColor.color }} />
                      : <CheckCircle2 className="w-3 h-3" style={{ color: statusColor.color }} />}
                    <span className="text-[11px] font-semibold" style={{ fontFamily: FONT, color: statusColor.color }}>{r.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
          </>)}

          {view === "results" && (<>
            {/* Results table — the persistent search card above already gives the user
                a way to change the query, so we skip the "Results for X — N matches"
                summary row.

                Sort arrows + status chip mirror the Policies / Quotes list styling so
                the results here read as part of the same table system. */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: c.cardBg, border: `1px solid ${c.border}`, boxShadow: isDark ? "none" : "0 1px 3px rgba(15,23,42,0.04)" }}>
              <div className="grid px-6 py-3 gap-4"
                style={{ gridTemplateColumns: "1.3fr 1.2fr 1.6fr 1fr 1.4fr 0.9fr 0.9fr", borderBottom: `1px solid ${c.border}`, background: c.mutedBg }}>
                {["Submission ID", "Policy Number", "Applicant", "LOB", "DBA", "Status", "Effective"].map(h => {
                  const isStatus = h === "Status";
                  return (
                    <div key={h}
                      className={`flex items-center text-[11px] font-bold uppercase tracking-wider ${isStatus ? "relative" : ""}`}
                      style={{ fontFamily: FONT, color: c.muted }}
                      onClick={isStatus ? (e => e.stopPropagation()) : undefined}
                    >
                      {h}
                      <span className="inline-flex ml-0.5">
                        <svg width="14" height="9" viewBox="0 0 14 9" fill="none">
                          <path d="M4 8V1M4 1L2 3M4 1L6 3" stroke={c.sub} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 1V8M10 8L8 6M10 8L12 6" stroke={c.sub} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      {isStatus && (
                        <>
                          <button
                            type="button"
                            onClick={() => setStatusFilterOpen(o => !o)}
                            className="ml-1 p-0.5 rounded transition-colors relative"
                            style={{ background: statusFilter.size ? "rgba(166,20,195,0.14)" : "transparent", border: "none", cursor: "pointer" }}
                            title="Filter"
                          >
                            <ChevronDown className="w-3 h-3" style={{ color: statusFilter.size ? "#A614C3" : c.muted }} />
                            {statusFilter.size > 0 && (
                              <span
                                className="absolute -top-1 -right-1 text-[9px] font-bold flex items-center justify-center rounded-full"
                                style={{ width: 12, height: 12, background: "#A614C3", color: "#fff", fontFamily: FONT }}
                              >{statusFilter.size}</span>
                            )}
                          </button>
                          {statusFilterOpen && (
                            <div
                              className="absolute z-30 rounded-lg shadow-lg overflow-hidden"
                              style={{
                                top: "calc(100% + 4px)",
                                left: -8,
                                minWidth: 210,
                                background: c.cardBg,
                                border: `1px solid ${c.border}`,
                                boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
                              }}
                            >
                              <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: `1px solid ${c.border}` }}>
                                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: c.muted, fontFamily: FONT }}>Filter by status</span>
                                {statusFilter.size > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => setStatusFilter(new Set())}
                                    className="text-[11px] font-semibold transition-opacity hover:opacity-70"
                                    style={{ color: "#A614C3", background: "transparent", border: "none", cursor: "pointer" }}
                                  >Clear</button>
                                )}
                              </div>
                              {STATUS_OPTIONS.map(s => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => toggleStatus(s)}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors"
                                  style={{ fontFamily: FONT, background: "transparent", border: "none", cursor: "pointer" }}
                                  onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                >
                                  <div className="flex items-center justify-center w-4 h-4 rounded flex-shrink-0"
                                    style={{ border: `1.5px solid ${statusFilter.has(s) ? "#A614C3" : c.sub}`, background: statusFilter.has(s) ? "#A614C3" : "transparent" }}>
                                    {statusFilter.has(s) && (
                                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    )}
                                  </div>
                                  <span className="text-[12.5px]" style={{ color: c.text, textTransform: "none", letterSpacing: 0 }}>{s}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
              {filteredResults.map((r, i, arr) => {
                // Colored dot per status; chip itself uses the neutral bg so it
                // reads as part of the Policies / Quotes chip family. Bound uses
                // the brand teal (matches Policies' Sold/Issued dot).
                const statusDot = r.status === "Bound"                 ? "#73C9B7"  // brand teal
                                : r.status === "Incomplete"            ? "#F59E0B"  // amber
                                : r.status === "Submission Incomplete" ? "#F59E0B"  // amber
                                :                                        "#EF4444"; // red — Cancelled
                return (
                  <button key={r.submissionId + "-" + i} onClick={() => handleSelectResult(r)}
                    className="grid px-6 py-3.5 items-center gap-4 transition-colors w-full text-left"
                    style={{
                      gridTemplateColumns: "1.3fr 1.2fr 1.6fr 1fr 1.4fr 0.9fr 0.9fr",
                      borderBottom: i !== arr.length - 1 ? `1px solid ${c.border}` : "none",
                      background: "transparent",
                      fontFamily: FONT,
                      cursor: "pointer",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <div className="text-[12px] font-semibold" style={{ color: c.text }}>{r.submissionId}</div>
                    <div className="text-[12px]" style={{ color: c.text }}>{r.policyNumber}</div>
                    <div className="text-[12px]" style={{ color: c.text }}>{r.applicant}</div>
                    <div className="text-[12px]" style={{ color: c.muted }}>{r.lob}</div>
                    <div className="text-[12px]" style={{ color: c.muted }}>{r.dba}</div>
                    <div className="flex items-center">
                      <span
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-[3px] rounded-md whitespace-nowrap"
                        style={{ fontFamily: FONT, background: c.mutedBg, color: c.text, border: `1px solid ${c.border}` }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: statusDot }} />
                        {r.status}
                      </span>
                    </div>
                    <div className="text-[12px]" style={{ color: c.muted }}>{r.effective}</div>
                  </button>
                );
              })}
              {filteredResults.length === 0 && (
                <div className="px-6 py-10 text-center text-[13px]" style={{ color: c.muted, fontFamily: FONT }}>
                  No policies match this filter.
                </div>
              )}
            </div>
          </>)}
          </div>
        )}

        {view === "form" && intakePolicy && (
          <EndorsementIntake
            selectedPolicy={{
              policyNumber: intakePolicy.policyNumber,
              applicant:    intakePolicy.applicant,
              submissionId: intakePolicy.submissionId,
              effective:    intakePolicy.effective,
            }}
            onBack={handleBack}
            onSubmit={handleSubmit}
            isDark={isDark}
          />
        )}

        {chooseOpen && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center"
            style={{ background: "rgba(15,23,42,0.45)", fontFamily: FONT, backdropFilter: "blur(2px)", padding: 16 }}
            onClick={() => setChooseOpen(false)}
          >
            <div
              className="rounded-2xl relative"
              style={{
                background: c.cardBg,
                border: `1px solid ${c.border}`,
                boxShadow: isDark ? "0 20px 60px rgba(0,0,0,0.5)" : "0 20px 50px rgba(15,23,42,0.15)",
                width: "min(520px, 100%)",
              }}
              onClick={e => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setChooseOpen(false)}
                aria-label="Close"
                className="absolute rounded-md transition-colors"
                style={{ top: 14, right: 14, background: "transparent", border: "none", cursor: "pointer", padding: 6 }}
                onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <X className="w-4 h-4" style={{ color: c.muted }} />
              </button>

              <div className="px-8 pt-8 pb-7">
                <div className="text-[15px] font-semibold mb-1" style={{ color: c.text }}>
                  What would you like to do?
                </div>
                <div className="text-[13px] mb-5" style={{ color: c.muted }}>
                  Start a new endorsement request for this policy, or view existing requests on file.
                </div>

                {pendingResult && (
                  <div
                    className="rounded-lg px-3.5 py-2.5 mb-6"
                    style={{ background: c.mutedBg, border: `1px solid ${c.border}` }}
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: c.muted }}>
                      Selected policy
                    </div>
                    <div className="text-[13px] font-semibold" style={{ color: c.text }}>
                      {pendingResult.policyNumber}
                      <span className="font-normal ml-2" style={{ color: c.muted }}>· {pendingResult.applicant}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3">
                  {[
                    { label: "New Request",   onClick: handleChooseNew },
                    { label: "View Existing", onClick: handleChooseExisting },
                  ].map(b => (
                    <button
                      key={b.label}
                      type="button"
                      onClick={b.onClick}
                      className="text-[13px] font-semibold text-white transition-all"
                      style={{
                        fontFamily: FONT,
                        background: btnGrad,
                        padding: "10px 24px",
                        borderRadius: 10,
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(166,20,195,0.25)",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.08)")}
                      onMouseLeave={e => (e.currentTarget.style.filter = "none")}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === "success" && (
          <div className="rounded-2xl flex flex-col items-center justify-center text-center"
            style={{ background: c.cardBg, border: `1px solid ${c.border}`, boxShadow: isDark ? "none" : "0 1px 3px rgba(15,23,42,0.04)", padding: "72px 32px" }}>
            <div className="flex items-center justify-center mb-5"
              style={{ width: 64, height: 64, borderRadius: 999, background: "rgba(52,211,153,0.12)" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5 9-11" stroke="#A614C3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-[18px] font-bold mb-2" style={{ color: c.text }}>Request submitted</div>
            <div className="text-[13px] mb-6 max-w-md" style={{ color: c.muted }}>
              We received your endorsement request and forwarded it to the right team. You&apos;ll hear back by email.
            </div>
            <button onClick={() => {
              setView("search");
              setSearchValue("");
              setPendingResult(null);
              setIntakePolicy(null);
            }}
              className="text-[13px] font-semibold text-white"
              style={{
                fontFamily: FONT,
                background: btnGrad,
                padding: "10px 28px",
                borderRadius: 10,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(166,20,195,0.25)",
              }}
              onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.08)")}
              onMouseLeave={e => (e.currentTarget.style.filter = "none")}>
              Start another request
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
