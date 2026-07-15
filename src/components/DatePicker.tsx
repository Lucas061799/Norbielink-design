"use client";

import { useRef, useState, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

// Popup calendar with day/month/year drill-down. Value is MM/DD/YYYY.
// Local copies of this component also live in Endorsements.tsx and Agencies.tsx —
// they should ultimately import from here, but the refactor hasn't been done yet.
export function DatePicker({ value, onChange, inputStyle, c, btnGrad, font }: {
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
