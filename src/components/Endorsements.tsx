"use client";

import { useRef, useState, useEffect } from "react";
import { Search, ChevronDown, Paperclip, X, Calendar, ChevronLeft, ChevronRight, FileText, Trash2, Send, ClipboardList, Clock, CheckCircle2, FileSearch, SearchX } from "lucide-react";

const FONT = "var(--font-montserrat), Montserrat, sans-serif";

function DatePicker({ value, onChange, inputStyle, c, btnGrad, font }: {
  value: string;
  onChange: (v: string) => void;
  inputStyle: React.CSSProperties;
  c: Record<string, string>;
  btnGrad: string;
  font: React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"day" | "month" | "year">("day");
  const parts = value?.split("/") ?? [];
  const initDate = parts[2] ? new Date(+parts[2], +parts[0] - 1, +parts[1]) : new Date();
  const [viewY, setViewY] = useState(initDate.getFullYear());
  const [viewM, setViewM] = useState(initDate.getMonth());
  const [yearPage, setYearPage] = useState(Math.floor(initDate.getFullYear() / 12) * 12);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) { setOpen(false); setMode("day"); }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const WEEKDAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  const daysInMonth = new Date(viewY, viewM + 1, 0).getDate();
  const firstDay = new Date(viewY, viewM, 1).getDay();
  const selY = parts[2] ? +parts[2] : null;
  const selM = parts[0] ? +parts[0] - 1 : null;
  const selD = parts[1] ? +parts[1] : null;
  const today = new Date();

  const prev = () => {
    if (mode === "day") { if (viewM === 0) { setViewY(viewY - 1); setViewM(11); } else setViewM(viewM - 1); }
    else if (mode === "month") setViewY(viewY - 1);
    else setYearPage(yearPage - 12);
  };
  const next = () => {
    if (mode === "day") { if (viewM === 11) { setViewY(viewY + 1); setViewM(0); } else setViewM(viewM + 1); }
    else if (mode === "month") setViewY(viewY + 1);
    else setYearPage(yearPage + 12);
  };
  const pick = (d: number) => {
    const mm = String(viewM + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    onChange(`${mm}/${dd}/${viewY}`);
    setOpen(false);
    setMode("day");
  };

  const headerLabel = mode === "day"
    ? `${MONTHS[viewM]} ${viewY}`
    : mode === "month"
    ? String(viewY)
    : `${yearPage} – ${yearPage + 11}`;
  const onHeaderClick = () => {
    if (mode === "day") setMode("month");
    else if (mode === "month") { setYearPage(Math.floor(viewY / 12) * 12); setMode("year"); }
    else setMode("day");
  };

  const cellStyle = (isSel: boolean, isCurrent: boolean): React.CSSProperties => ({
    height: 30,
    color: isSel ? "#fff" : (isCurrent ? "#A855F7" : c.text),
    background: isSel ? btnGrad : "transparent",
    fontWeight: (isSel || isCurrent) ? 700 : 500,
    border: isCurrent && !isSel ? "1px solid rgba(168,85,247,0.45)" : "1px solid transparent",
  });

  return (
    <div ref={wrapRef} className="relative">
      <input value={value} readOnly placeholder="MM/DD/YYYY" style={{ ...inputStyle, cursor: "pointer" }} onClick={() => setOpen(o => !o)} />
      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 cursor-pointer" style={{ color: c.muted }} onClick={() => setOpen(o => !o)} />
      {open && (
        <div className="absolute z-50 mt-2 rounded-2xl p-4"
          style={{ ...font, background: c.cardBg, border: `1px solid ${c.border}`, width: 280, boxShadow: "0 10px 30px rgba(0,0,0,0.12)", left: 0 }}>
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prev} className="p-1.5 rounded-lg transition-colors"
              onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <ChevronLeft className="w-4 h-4" style={{ color: c.text }} />
            </button>
            <button type="button" onClick={onHeaderClick}
              className="text-[13px] font-semibold px-2 py-1 rounded-lg transition-colors"
              style={{ color: c.text }}
              onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              {headerLabel}
            </button>
            <button type="button" onClick={next} className="p-1.5 rounded-lg transition-colors"
              onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <ChevronRight className="w-4 h-4" style={{ color: c.text }} />
            </button>
          </div>
          {mode === "day" && (
            <>
              <div className="grid grid-cols-7 gap-1 mb-1">
                {WEEKDAYS.map((w, i) => (
                  <div key={i} className="text-center text-[10px] font-semibold py-1" style={{ color: c.muted }}>{w}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const d = i + 1;
                  const isSel = selY === viewY && selM === viewM && selD === d;
                  const isToday = !isSel && today.getFullYear() === viewY && today.getMonth() === viewM && today.getDate() === d;
                  return (
                    <button key={d} type="button" onClick={() => pick(d)}
                      className="text-[12px] rounded-lg transition-all"
                      style={cellStyle(isSel, isToday)}
                      onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = c.hoverBg; }}
                      onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "transparent"; }}>
                      {d}
                    </button>
                  );
                })}
              </div>
            </>
          )}
          {mode === "month" && (
            <div className="grid grid-cols-3 gap-2">
              {MONTHS_SHORT.map((m, i) => {
                const isSel = selY === viewY && selM === i;
                const isCurrent = !isSel && today.getFullYear() === viewY && today.getMonth() === i;
                return (
                  <button key={m} type="button" onClick={() => { setViewM(i); setMode("day"); }}
                    className="text-[12px] rounded-lg transition-all"
                    style={{ ...cellStyle(isSel, isCurrent), height: 40 }}
                    onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = c.hoverBg; }}
                    onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "transparent"; }}>
                    {m}
                  </button>
                );
              })}
            </div>
          )}
          {mode === "year" && (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 12 }).map((_, i) => {
                const y = yearPage + i;
                const isSel = selY === y;
                const isCurrent = !isSel && today.getFullYear() === y;
                return (
                  <button key={y} type="button" onClick={() => { setViewY(y); setMode("month"); }}
                    className="text-[12px] rounded-lg transition-all"
                    style={{ ...cellStyle(isSel, isCurrent), height: 40 }}
                    onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = c.hoverBg; }}
                    onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "transparent"; }}>
                    {y}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type SearchBy = "Policy Number" | "Submission ID" | "Named Insured";
type View = "search" | "form" | "success";

const SEARCH_OPTIONS: SearchBy[] = ["Policy Number", "Submission ID", "Named Insured"];
const LOBS = [
  "General Liability", "Worker's Comp", "Commercial Auto", "Property",
  "Professional Liability", "Cyber Liability", "Builder's Risk", "Bonds",
  "Umbrella", "Business Owners", "Vacant Risks",
];
const STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

export default function Endorsements({ isDark }: { isDark: boolean }) {
  const [view, setView] = useState<View>("search");

  const [searchBy, setSearchBy] = useState<SearchBy>("Policy Number");
  const [searchByOpen, setSearchByOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Form state
  const [policyNumber, setPolicyNumber] = useState("");
  const [namedInsured, setNamedInsured] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [lob, setLob] = useState<string[]>([]);
  const [lobOpen, setLobOpen] = useState(false);
  const [state, setState] = useState("");
  const [stateOpen, setStateOpen] = useState(false);
  const [carrierName, setCarrierName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const c = {
    text:         isDark ? "#F9FAFB" : "#1F2937",
    muted:        isDark ? "#8B8FA8" : "#6B7280",
    sub:          isDark ? "#6B7280" : "#9CA3AF",
    cardBg:       isDark ? "#191D35" : "#fff",
    border:       isDark ? "rgba(255,255,255,0.08)" : "#E5E7EB",
    borderStrong: isDark ? "rgba(255,255,255,0.18)" : "#D1D5DB",
    mutedBg:      isDark ? "rgba(255,255,255,0.03)" : "#F9FAFB",
    hoverBg:      isDark ? "rgba(255,255,255,0.04)" : "#F9FAFB",
    inputBg:      isDark ? "rgba(255,255,255,0.05)" : "#fff",
  };
  const font = { fontFamily: FONT } as React.CSSProperties;
  const btnGrad = isDark
    ? "radial-gradient(171.32% 99.33% at 33.13% -9%, #282550 0%, #191735 55.82%, rgba(0,0,0,0.3) 74%, rgba(0,0,0,0) 100%), linear-gradient(88.34deg, #5C2ED4 0.11%, #A614C3 63.8%)"
    : "linear-gradient(90deg,#5C2ED4 0%,#A614C3 65%)";

  const closeAll = () => { setSearchByOpen(false); setLobOpen(false); setStateOpen(false); };

  const submitReady = policyNumber.trim() && namedInsured.trim() && contactEmail.trim();

  const handleSearch = () => {
    if (!searchValue.trim()) return;
    // Mock: always "not found" — goes to form view
    setView("form");
    if (searchBy === "Policy Number") setPolicyNumber(searchValue);
    if (searchBy === "Named Insured") setNamedInsured(searchValue);
  };

  const handleSubmit = () => {
    if (!submitReady) return;
    setView("success");
  };

  const handleBack = () => {
    setView("search");
  };

  const toggleLob = (v: string) => {
    setLob(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  };
  const onDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
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
        {view === "search" && (
          <div className="flex flex-col gap-6">
          <div className="rounded-2xl overflow-hidden"
            style={{
              background: c.cardBg,
              borderLeft: `1px solid ${c.border}`,
              borderRight: `1px solid ${c.border}`,
              borderBottom: `1px solid ${c.border}`,
              boxShadow: isDark ? "none" : "0 1px 3px rgba(15,23,42,0.04)",
            }}>
            {/* Top stroke = the brand gradient itself, not a separate pill inset.
                overflow-hidden lets the rounded corners clip the bar to the card shape. */}
            <div style={{ height: 4, background: "linear-gradient(90deg,#5C2ED4 0%,#A614C3 65%)" }} />
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
          </div>
        )}

        {view === "form" && (
          <div className="flex flex-col gap-5" onClick={e => e.stopPropagation()}>
            {/* No-match info banner */}
            <div className="rounded-2xl"
              style={{
                background: isDark
                  ? `linear-gradient(180deg, rgba(166,20,195,0.08) 0%, ${c.cardBg} 60%)`
                  : `linear-gradient(180deg, #FBF5FE 0%, ${c.cardBg} 70%)`,
                border: `1px solid ${isDark ? "rgba(166,20,195,0.22)" : "rgba(166,20,195,0.14)"}`,
                boxShadow: isDark
                  ? "0 8px 24px -12px rgba(166,20,195,0.35)"
                  : "0 1px 3px rgba(15,23,42,0.04), 0 8px 24px -16px rgba(166,20,195,0.22)",
              }}>
              <div style={{ height: 4, background: btnGrad, borderRadius: 9999, margin: "8px 16px 0" }} />
              <div className="flex items-start gap-3 px-7 py-6">
                <div className="flex-shrink-0 flex items-center justify-center"
                  style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: "linear-gradient(135deg, #5C2ED4 0%, #A614C3 100%)",
                    boxShadow: "0 4px 10px -2px rgba(166,20,195,0.4)",
                    marginTop: 2,
                  }}>
                  <span className="text-white text-[14px] font-bold leading-none" style={{ fontFamily: FONT, transform: "translateY(-1px)" }}>!</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2.5 mb-1.5 flex-wrap">
                    <span className="text-[17px] font-bold leading-tight" style={{ fontFamily: FONT, color: c.text, letterSpacing: "-0.01em" }}>Well, that&apos;s bananas!</span>
                    <span className="text-[11px] font-semibold tracking-wide"
                      style={{ fontFamily: FONT, color: "#A614C3" }}>NO MATCH FOUND</span>
                  </div>
                  <div className="text-[13px] leading-relaxed" style={{ fontFamily: FONT, color: c.muted, maxWidth: "80ch" }}>
                    We couldn&apos;t find records matching that policy info. Not all policies are in NorbieLink yet, so just fill out the form below and we&apos;ll get your request to the right team.
                  </div>
                </div>
              </div>
            </div>

            {/* Form card */}
            <div className="rounded-2xl"
              style={{ background: c.cardBg, border: `1px solid ${c.border}`, boxShadow: isDark ? "none" : "0 1px 3px rgba(15,23,42,0.04)" }}>
              <div className="px-8 py-8 grid gap-5" style={{ gridTemplateColumns: "repeat(6, 1fr)" }}>
                {/* Row 1 */}
                <div style={{ gridColumn: "span 3" }}>
                  <label style={labelStyle}>Policy Number</label>
                  <input value={policyNumber} onChange={e => setPolicyNumber(e.target.value)}
                    placeholder="Enter policy number" style={inputStyle} />
                </div>
                <div style={{ gridColumn: "span 3" }}>
                  <label style={labelStyle}>Named Insured</label>
                  <input value={namedInsured} onChange={e => setNamedInsured(e.target.value)}
                    placeholder="Enter insured name" style={inputStyle} />
                </div>

                {/* Row 2 */}
                <div style={{ gridColumn: "span 2" }}>
                  <label style={labelStyle}>Policy Effective Date</label>
                  <DatePicker value={effectiveDate} onChange={setEffectiveDate} inputStyle={inputStyle} c={c} btnGrad={btnGrad} font={font} />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={labelStyle}>Line of Business</label>
                  <div className="relative">
                    <button onClick={() => { closeAll(); setLobOpen(o => !o); }}
                      className="w-full flex items-center justify-between"
                      style={{ ...inputStyle, cursor: "pointer", textAlign: "left", color: lob.length ? c.text : c.sub }}>
                      <span className="truncate">{lob.length ? `${lob.length} selected` : "Select Line(s) of Business"}</span>
                      <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${lobOpen ? "rotate-180" : ""}`} style={{ color: c.muted }} />
                    </button>
                    {lobOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1 z-20 rounded-lg shadow-lg overflow-hidden max-h-[240px] overflow-y-auto"
                        style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
                        {LOBS.map(l => (
                          <button key={l} onClick={() => toggleLob(l)}
                            className="w-full flex items-center gap-2 text-left px-3 py-2 text-[13px] transition-colors"
                            style={{ fontFamily: FONT, color: c.text }}
                            onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                            <div className="flex items-center justify-center w-4 h-4 rounded flex-shrink-0"
                              style={{ border: `1.5px solid ${c.borderStrong}`, background: c.cardBg }}>
                              {lob.includes(l) && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            </div>
                            {l}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={labelStyle}>State</label>
                  <div className="relative">
                    <button onClick={() => { closeAll(); setStateOpen(o => !o); }}
                      className="w-full flex items-center justify-between"
                      style={{ ...inputStyle, cursor: "pointer", textAlign: "left", color: state ? c.text : c.sub }}>
                      <span>{state || "Select state"}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${stateOpen ? "rotate-180" : ""}`} style={{ color: c.muted }} />
                    </button>
                    {stateOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1 z-20 rounded-lg shadow-lg overflow-hidden max-h-[240px] overflow-y-auto"
                        style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
                        {STATES.map(s => (
                          <button key={s} onClick={() => { setState(s); setStateOpen(false); }}
                            className="w-full text-left px-3 py-2 text-[13px] transition-colors"
                            style={{ fontFamily: FONT, color: c.text }}
                            onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 3 */}
                <div style={{ gridColumn: "span 6" }}>
                  <label style={labelStyle}>Carrier Name</label>
                  <input value={carrierName} onChange={e => setCarrierName(e.target.value)}
                    placeholder="Enter carrier name" style={inputStyle} />
                </div>

                {/* Row 4 */}
                <div style={{ gridColumn: "span 3" }}>
                  <label style={labelStyle}>Contact Email</label>
                  <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)}
                    placeholder="email@example.com" style={inputStyle} />
                </div>
                <div style={{ gridColumn: "span 3" }}>
                  <label style={labelStyle}>Contact Phone</label>
                  <input value={contactPhone} onChange={e => setContactPhone(e.target.value)}
                    placeholder="(123) 456-7890" style={inputStyle} />
                </div>

                {/* Row 5 */}
                <div style={{ gridColumn: "span 3" }}>
                  <label style={labelStyle}>Notes</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Free text notes (optional)"
                    rows={5}
                    style={{ ...inputStyle, resize: "vertical", minHeight: 140 }} />
                </div>
                <div style={{ gridColumn: "span 3" }}>
                  <label style={labelStyle}>Upload Documents</label>
                  {files.length === 0 ? (
                    <label
                      onDrop={onDrop}
                      onDragOver={e => e.preventDefault()}
                      className="flex flex-col items-center justify-center rounded-xl cursor-pointer transition-colors"
                      style={{
                        background: "transparent",
                        border: `1.5px dashed ${c.borderStrong}`,
                        minHeight: 140,
                        padding: "18px",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = isDark ? "rgba(166,20,195,0.08)" : "rgba(168,85,247,0.06)"; e.currentTarget.style.borderColor = "#A614C3"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = c.borderStrong; }}>
                      <Paperclip className="w-7 h-7 mb-3" style={{ color: "#A614C3" }} />
                      <span className="text-[13px] font-medium" style={{ fontFamily: FONT, color: c.text }}>Drag &amp; Drop or Click to Browse</span>
                      <span className="text-[11px] mt-1" style={{ fontFamily: FONT, color: c.muted }}>PDF, JPG, PNG · Max 10MB</span>
                      <input ref={fileInputRef} type="file" multiple onChange={onFileChange} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                    </label>
                  ) : (
                    <div
                      onDrop={onDrop}
                      onDragOver={e => e.preventDefault()}
                      className="rounded-xl flex flex-col gap-3"
                      style={{ border: `1.5px dashed ${c.borderStrong}`, padding: "14px", minHeight: 140 }}>
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4" style={{ color: "#A614C3" }} />
                        <span className="text-[13px] font-semibold" style={{ fontFamily: FONT, color: c.text }}>{files.length} file(s) selected</span>
                        <span className="text-[12px]" style={{ fontFamily: FONT, color: c.muted }}>· PDF, JPG, PNG · 10MB max</span>
                        <button type="button" onClick={() => fileInputRef.current?.click()}
                          className="ml-auto text-[12px] font-semibold transition-opacity hover:opacity-70"
                          style={{ fontFamily: FONT, color: "#A614C3" }}>+ Add more</button>
                        <input ref={fileInputRef} type="file" multiple onChange={onFileChange} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {files.map((f, i) => (
                          <div key={i} className="flex items-center gap-2 rounded-lg px-2.5 py-2"
                            style={{ background: c.mutedBg, border: `1px solid ${c.border}`, minWidth: 0, maxWidth: "100%" }}>
                            <div className="flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0"
                              style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
                              <FileText className="w-3.5 h-3.5" style={{ color: c.muted }} />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[12px] font-medium truncate" style={{ fontFamily: FONT, color: c.text, maxWidth: 140 }}>{f.name}</span>
                              <span className="text-[10px]" style={{ fontFamily: FONT, color: c.muted }}>{f.size.toLocaleString()} bytes</span>
                            </div>
                            <button type="button" onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                              className="flex-shrink-0 p-1 rounded transition-colors hover:opacity-70" aria-label="Remove file">
                              <Trash2 className="w-3.5 h-3.5" style={{ color: "#EF4444" }} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button onClick={handleBack}
                className="text-[13px] font-medium transition-colors"
                style={{
                  fontFamily: FONT,
                  background: c.cardBg,
                  border: `1px solid ${c.border}`,
                  color: c.text,
                  padding: "9px 28px",
                  borderRadius: 10,
                  cursor: "pointer",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = c.cardBg)}>
                Back
              </button>
              <button onClick={handleSubmit}
                disabled={!submitReady}
                className="text-[13px] font-semibold text-white transition-all"
                style={{
                  fontFamily: FONT,
                  background: btnGrad,
                  padding: "10px 32px",
                  borderRadius: 10,
                  opacity: submitReady ? 1 : 0.5,
                  cursor: submitReady ? "pointer" : "not-allowed",
                  boxShadow: "0 4px 14px rgba(166,20,195,0.25)",
                }}
                onMouseEnter={e => { if (submitReady) e.currentTarget.style.filter = "brightness(1.08)"; }}
                onMouseLeave={e => (e.currentTarget.style.filter = "none")}>
                Submit
              </button>
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
              setPolicyNumber(""); setNamedInsured(""); setEffectiveDate("");
              setLob([]); setState(""); setCarrierName("");
              setContactEmail(""); setContactPhone(""); setNotes(""); setFiles([]);
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
