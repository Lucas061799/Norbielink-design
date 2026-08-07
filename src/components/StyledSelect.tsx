"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

// Custom dropdown that matches the app's popover style — razz active row,
// checkmark on selected, hover background. Replaces the browser-styled
// <select> option list.
export function StyledSelect<T extends string>({
  value,
  onChange,
  options,
  labelFor,
  triggerStyle,
  c,
  font,
}: {
  value: T;
  onChange: (v: T) => void;
  options: readonly T[];
  // Optional prettifier — e.g. Individual → "Individual (1099-MISC)"
  labelFor?: (v: T) => string;
  triggerStyle: React.CSSProperties;
  // Only the tokens the popover uses — keeps the component decoupled from
  // any one component's full color palette.
  c: { text: string; muted: string; border: string; cardBg: string; hoverBg: string; razz: string; razzTintBg: string };
  font: React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const display = labelFor ? labelFor(value) : value;

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2"
        style={{
          ...triggerStyle,
          // Caller wins: if triggerStyle.border/background were explicitly set
          // (e.g. "none"/"transparent" in a table cell), we don't override them.
          // Otherwise fall back to the razz-when-open frame.
          border: triggerStyle.border !== undefined
            ? triggerStyle.border
            : (open ? `1px solid ${c.razz}` : `1px solid ${c.border}`),
          textAlign: "left",
          cursor: "pointer",
          // Trigger uses its own chevron child instead of the caller's bg image,
          // so pull the right padding back to a normal value — no need to leave
          // 32px of empty space for a chevron that isn't there.
          backgroundImage: "none",
          backgroundColor: (triggerStyle.background as string | undefined) ?? triggerStyle.backgroundColor ?? c.cardBg,
          paddingRight: 12,
          // Match sibling <input> vertical rhythm so the trigger height doesn't
          // creep above/below neighbouring text inputs and DatePickers.
          boxSizing: "border-box",
          lineHeight: 1.5,
        }}
      >
        <span style={{ ...font, color: c.text }}>{display}</span>
        <ChevronDown
          className="w-3.5 h-3.5 flex-shrink-0 transition-transform"
          style={{ color: c.muted, transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      {open && (
        <div
          className="absolute left-0 right-0 top-full mt-1 z-40 rounded-lg overflow-hidden"
          style={{ background: c.cardBg, border: `1px solid ${c.border}`, boxShadow: "0 8px 24px rgba(15,23,42,0.10)" }}
        >
          {options.map(opt => {
            const active = opt === value;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className="w-full flex items-center justify-between transition-colors"
                style={{
                  ...font,
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  color: active ? c.razz : c.text,
                  background: active ? c.razzTintBg : "transparent",
                  border: "none",
                  padding: "8px 12px",
                  textAlign: "left",
                  cursor: "pointer",
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = c.hoverBg; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <span>{labelFor ? labelFor(opt) : opt}</span>
                {active && <Check className="w-3 h-3" strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
