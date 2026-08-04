"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, ChevronDown, ChevronRight, FileEdit, HelpCircle, Layers, Plus, Send, Shield, X } from "lucide-react";
import { DatePicker } from "./DatePicker";
import { StyledSelect } from "./StyledSelect";

const FONT = "var(--font-montserrat), Montserrat, sans-serif";

type EndorsementKey =
  | "contact" | "namedinsured" | "mailing" | "effdate"
  | "classcode" | "limits" | "waiver" | "officer"
  | "mcp65" | "puc" | "thirdpartynoc" | "altemp" | "fein" | "xmod"
  | "location" | "entity"
  | "reinstate" | "cancel" | "other";

const NAV: { label: string; items: { key: EndorsementKey; label: string }[] }[] = [
  {
    label: "Insured information",
    items: [
      { key: "contact",      label: "Contact Info" },
      { key: "namedinsured", label: "Named Insured / DBA" },
      { key: "mailing",      label: "Mailing Address" },
      { key: "location",     label: "Location" },
      { key: "entity",       label: "Entity" },
      { key: "fein",         label: "FEIN" },
    ],
  },
  {
    label: "Policy information",
    items: [
      { key: "effdate",   label: "Effective Date" },
      { key: "classcode", label: "Class Code / Payroll" },
      { key: "limits",    label: "Limits" },
      { key: "xmod",      label: "XMOD" },
      { key: "mcp65",     label: "MCP 65" },
      { key: "puc",       label: "PUC Filing" },
    ],
  },
  {
    label: "Additional insured",
    items: [
      { key: "waiver",        label: "Waiver of Subrogation" },
      { key: "officer",       label: "Officer Exclusion / Inclusion" },
      { key: "altemp",        label: "Alternate Employer" },
      { key: "thirdpartynoc", label: "Third Party NOC" },
    ],
  },
  {
    label: "Policy status",
    items: [
      { key: "cancel",    label: "Cancellation Request" },
      { key: "reinstate", label: "Reinstatement Request" },
    ],
  },
  {
    label: "Misc",
    items: [
      { key: "other", label: "Other" },
    ],
  },
];

type FieldType = "date" | "text" | "select" | "textarea" | "file";
type Field = { label: string; type: FieldType; placeholder?: string; options?: string[]; span?: 1 | 2; optional?: boolean };
// Types with their own required supporting field baked in — everyone else
// falls back to the shared "Notes & documents" block at the bottom of the request.
const SKIP_UNIVERSAL_SUPPORTING = new Set<EndorsementKey>(["reinstate", "cancel", "xmod", "namedinsured"]);
const CARD_META: Record<EndorsementKey, { blurb: string; fields: Field[] }> = {
  contact:      { blurb: "Update the insured or agency contact on file.",  fields: [
                    { label: "Effective date", type: "date", span: 1 },
                    { label: "Contact type",   type: "select", options: ["Owner", "Officer", "Agent", "Employee"], span: 1 },
                    { label: "Full name",      type: "text", placeholder: "First Last", span: 2 },
                    { label: "Phone",          type: "text", placeholder: "555-123-4567", span: 1 },
                    { label: "Email",          type: "text", placeholder: "name@example.com", span: 1 },
                  ] },
  namedinsured: { blurb: "Amend the legal name or DBA of the entity.",     fields: [
                    { label: "Effective date",     type: "date", span: 1 },
                    { label: "Current legal name", type: "text", placeholder: "e.g. Byrne Insurance Group", span: 2 },
                    { label: "New legal name",     type: "text", placeholder: "e.g. Byrne Insurance Solutions", span: 2 },
                    { label: "Additional comment (please clearly explain the changes)", type: "textarea", placeholder: "Reason for the name change, any related restructuring…", span: 2 },
                  ] },
  mailing:      { blurb: "Change the mailing address on the policy.",      fields: [
                    { label: "Effective date", type: "date", span: 2 },
                    { label: "Street",         type: "text", placeholder: "123 Main St", span: 2 },
                    { label: "City",           type: "text", placeholder: "Des Moines", span: 1 },
                    { label: "State",          type: "text", placeholder: "IA", span: 1 },
                    { label: "ZIP",            type: "text", placeholder: "50314", span: 1 },
                  ] },
  effdate:      { blurb: "Adjust the effective or expiration date.",       fields: [
                    { label: "Current effective date", type: "date", span: 1 },
                    { label: "New effective date",     type: "date", span: 1 },
                  ] },
  classcode:    { blurb: "Add, edit, or remove class codes and payroll.",  fields: [
                    { label: "Effective date", type: "date", span: 1 },
                    { label: "Action",         type: "select", options: ["Add", "Edit", "Remove"], span: 1 },
                    { label: "Class code",     type: "text", placeholder: "e.g. 5190", span: 1 },
                    { label: "Payroll",        type: "text", placeholder: "e.g. 50,000", span: 1 },
                  ] },
  limits:       { blurb: "Adjust coverage limits on the policy.",          fields: [
                    { label: "Effective date", type: "date", span: 1 },
                    { label: "Coverage part",  type: "select", options: ["Each Accident", "Disease – Policy Limit", "Disease – Each Employee"], span: 1 },
                    { label: "New limit",      type: "text", placeholder: "e.g. 1,000,000", span: 2 },
                  ] },
  waiver:       { blurb: "Add a Waiver of Subrogation for a project.",     fields: [
                    { label: "Effective date",     type: "date", span: 1 },
                    { label: "Certificate holder", type: "text", placeholder: "Name on certificate", span: 2 },
                    { label: "Project",            type: "text", placeholder: "Project name", span: 2 },
                    { label: "Address",            type: "text", placeholder: "Project address", span: 2 },
                  ] },
  officer:      { blurb: "Include or exclude an officer from coverage.",   fields: [
                    { label: "Effective date", type: "date", span: 1 },
                    { label: "Action",         type: "select", options: ["Include", "Exclude"], span: 1 },
                    { label: "Officer name",   type: "text", placeholder: "First Last", span: 1 },
                    { label: "Title",          type: "text", placeholder: "e.g. President", span: 1 },
                  ] },
  mcp65:        { blurb: "File an MCP 65 form for California DMV.",        fields: [
                    { label: "Effective date", type: "date", span: 1 },
                    { label: "MC number",      type: "text", placeholder: "e.g. MC123456", span: 1 },
                    { label: "Filing type",    type: "select", options: ["Add", "Cancel"], span: 2 },
                  ] },
  puc:          { blurb: "File PUC Filing for California PUC.",            fields: [
                    { label: "Effective date", type: "date", span: 1 },
                    { label: "Carrier PUC",    type: "text", placeholder: "PUC ID", span: 1 },
                    { label: "Filing type",    type: "select", options: ["Add", "Cancel"], span: 2 },
                  ] },
  thirdpartynoc:{ blurb: "Third Party Notice of Cancellation.",            fields: [
                    { label: "Effective date", type: "date", span: 1 },
                    { label: "Party name",     type: "text", placeholder: "Third-party name", span: 2 },
                    { label: "Address",        type: "text", placeholder: "Full mailing address", span: 2 },
                  ] },
  altemp:       { blurb: "Add or remove an Alternate Employer.",           fields: [
                    { label: "Effective date", type: "date", span: 1 },
                    { label: "Alt employer",   type: "text", placeholder: "Legal name", span: 2 },
                    { label: "FEIN",           type: "text", placeholder: "12-3456789", span: 1 },
                  ] },
  fein:         { blurb: "Update the FEIN on the policy.",                 fields: [
                    { label: "Effective date", type: "date", span: 1 },
                    { label: "New FEIN",       type: "text", placeholder: "12-3456789", span: 1 },
                  ] },
  xmod:         { blurb: "Apply or update the experience mod.",            fields: [
                    { label: "Effective date", type: "date", span: 1 },
                    { label: "State",          type: "text", placeholder: "CA", span: 1 },
                    { label: "New mod factor", type: "text", placeholder: "e.g. 0.95", span: 2 },
                    { label: "Upload Ex-Mod worksheet", type: "file", span: 2 },
                  ] },
  location:     { blurb: "Add or remove a location on the policy.",        fields: [
                    { label: "Effective date",  type: "date", span: 1 },
                    { label: "Action",          type: "select", options: ["Add", "Remove"], span: 1 },
                    { label: "Address",         type: "text", placeholder: "Full address", span: 2 },
                    { label: "Classification",  type: "text", placeholder: "e.g. office", span: 2 },
                  ] },
  entity:       { blurb: "Change the legal entity structure.",             fields: [
                    { label: "Effective date", type: "date", span: 1 },
                    { label: "Current entity", type: "select", options: ["Sole Prop", "LLC", "Corporation", "Partnership"], span: 1 },
                    { label: "New entity",     type: "select", options: ["Sole Prop", "LLC", "Corporation", "Partnership"], span: 2 },
                  ] },
  reinstate:    { blurb: "Request reinstatement of a cancelled policy.",   fields: [
                    { label: "Effective date", type: "date", span: 1 },
                    { label: "Reason",         type: "textarea", placeholder: "Why should this policy be reinstated?", span: 2 },
                    { label: "Upload Acord 37 No Loss Statement", type: "file", span: 2 },
                  ] },
  cancel:       { blurb: "Cancel the policy on or after a date.",          fields: [
                    { label: "Cancellation date", type: "date", span: 1 },
                    { label: "Reason",            type: "textarea", placeholder: "Reason for cancellation", span: 2 },
                    { label: "Upload Acord 25 LPR / Replacement Coverage Document", type: "file", span: 2 },
                  ] },
  other:        { blurb: "Anything else — free-form request.",             fields: [
                    { label: "Describe the request", type: "textarea", placeholder: "Tell the underwriter what you need…", span: 2 },
                  ] },
};

function findMeta(key: EndorsementKey) {
  for (const g of NAV) for (const it of g.items) if (it.key === key) return { label: it.label, group: g.label };
  return { label: key, group: "" };
}

interface Props {
  isDark: boolean;
}

export default function EndorsementBoard({ isDark }: Props) {
  const c = {
    text: isDark ? "#F9FAFB" : "#1F2937",
    muted: isDark ? "#8B8FA8" : "#6B7280",
    sub: isDark ? "#575C74" : "#9CA3AF",
    border: isDark ? "rgba(255,255,255,0.10)" : "#E5E7EB",
    softDivider: isDark ? "rgba(255,255,255,0.06)" : "#F3F4F6",
    cardBg: isDark ? "#1E2240" : "#FFFFFF",
    // All three columns share the same soft-gray canvas; only the cards
    // inside are white, so the layout reads as one continuous surface.
    railBg: isDark ? "rgba(255,255,255,0.03)" : "#F5F6F8",
    pageBg: isDark ? "#0F1120" : "#F5F6F8",
    helperBg: isDark ? "rgba(255,255,255,0.03)" : "#F9FAFB",
    hoverBg: isDark ? "rgba(255,255,255,0.05)" : "#F0F1F4",
    razz: "#A614C3",
    razzTintBg: isDark ? "rgba(168,85,247,0.14)" : "rgba(168,85,247,0.08)",
  };
  const razzGrad = "linear-gradient(90deg,#5C2ED4 0%,#A614C3 65%)";

  const [selected, setSelected] = useState<Set<EndorsementKey>>(new Set(["contact", "effdate"]));
  const [activeKey, setActiveKey] = useState<EndorsementKey>("contact");
  // Refs to each section card so sidebar clicks can smooth-scroll to them.
  const sectionRefs = useRef<Partial<Record<EndorsementKey, HTMLElement | null>>>({});
  const jumpToSection = (k: EndorsementKey) => {
    setActiveKey(k);
    sectionRefs.current[k]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const [values, setValues] = useState<Record<string, Record<number, string>>>({});
  const [addOpen, setAddOpen] = useState(false);
  const [addPicks, setAddPicks] = useState<Set<EndorsementKey>>(new Set());
  // Single universal supporting block for the whole request (matches Option 1).
  const [notes, setNotes] = useState("");
  const [fileAttached, setFileAttached] = useState<string | null>(null);
  // Collapsible section headers in the left rail — all open by default.
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["request", "policy", "help"]));
  const CARRIERS = ["AmTrust", "Clearspring", "CNA"] as const;
  const [carrier, setCarrier] = useState<(typeof CARRIERS)[number]>("AmTrust");
  const [carrierOpen, setCarrierOpen] = useState(false);

  const orderedSelected = useMemo(() => {
    const order = NAV.flatMap(g => g.items.map(it => it.key));
    return order.filter(k => selected.has(k));
  }, [selected]);

  // Only required (non-optional) fields count toward the progress gate; the
  // universal comment/upload appended for non-SKIP types is optional and
  // never blocks submit.
  const doneCount = (k: EndorsementKey) =>
    CARD_META[k].fields.reduce((n, f, i) => n + (!f.optional && (values[k]?.[i] ?? "").trim() ? 1 : 0), 0);
  const requiredCount = (k: EndorsementKey) => CARD_META[k].fields.filter(f => !f.optional).length;
  const totalRequired = orderedSelected.reduce((sum, k) => sum + requiredCount(k), 0);
  const totalDone     = orderedSelected.reduce((sum, k) => sum + doneCount(k), 0);
  const submitReady   = orderedSelected.length > 0 && totalRequired === totalDone;

  const setValue = (k: EndorsementKey, i: number, v: string) => {
    setValues(prev => ({ ...prev, [k]: { ...(prev[k] ?? {}), [i]: v } }));
  };
  const removeCard = (k: EndorsementKey) => {
    setSelected(prev => { const s = new Set(prev); s.delete(k); return s; });
    setValues(prev => { const v = { ...prev }; delete v[k]; return v; });
    setActiveKey(prev => {
      if (prev !== k) return prev;
      const remaining = orderedSelected.filter(x => x !== k);
      return remaining[0] ?? prev;
    });
  };

  const toggleSection = (id: string) =>
    setOpenSections(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const openAdd = () => { setAddPicks(new Set()); setAddOpen(true); };
  const closeAdd = () => { setAddOpen(false); setAddPicks(new Set()); };
  const commitAdd = () => {
    setSelected(prev => { const s = new Set(prev); addPicks.forEach(k => s.add(k)); return s; });
    const first = Array.from(addPicks)[0];
    if (first) setActiveKey(first);
    closeAdd();
  };
  const togglePick = (k: EndorsementKey) => {
    setAddPicks(prev => { const s = new Set(prev); s.has(k) ? s.delete(k) : s.add(k); return s; });
  };

  return (
    <div
      className="flex flex-col flex-1 min-h-0 overflow-hidden"
      style={{
        background: c.pageBg,
        // Eat the DashboardShell's px-12 + paddingBottom so the board fills
        // edge-to-edge instead of floating inside a white margin.
        marginLeft: -48, marginRight: -48, marginBottom: -48,
      }}
    >
      {/* Slim top bar */}
      <div
        className="flex items-center gap-4 flex-shrink-0"
        style={{
          padding: "14px 24px",
          background: c.cardBg,
          borderBottom: `1px solid ${c.border}`,
        }}
      >
        <button
          type="button"
          className="inline-flex items-center gap-1.5 transition-opacity hover:opacity-70"
          style={{ fontFamily: FONT, fontSize: 12, fontWeight: 500, color: c.muted, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <div className="w-px h-4" style={{ background: c.border }} />
        <span className="text-[13px] font-semibold truncate" style={{ fontFamily: FONT, color: c.text }}>
          Endorsement request · Byrne Insurance Group
        </span>
        <div className="flex-1" />
        <span className="text-[11.5px]" style={{ fontFamily: FONT, color: c.muted }}>
          <span className="font-semibold" style={{ color: c.text }}>{totalDone}</span> / {totalRequired} fields
        </span>
      </div>

      {/* Three-column layout: LEFT tree · CENTER cards · RIGHT submit panel */}
      <div className="flex flex-1 min-h-0">
        {/* ── LEFT: nested navigator, softer gray bg, no borders on rows */}
        <aside
          className="flex-shrink-0 overflow-y-auto"
          style={{ width: 220, background: c.railBg, borderRight: `1px solid ${c.border}`, padding: "24px 10px 16px" }}
        >
          {/* Policy identity — top-aligned with the first center card's
              outer border (both sit at aside/main padding-top = 24px). */}
          <div className="px-2 pb-3 mb-3" style={{ borderBottom: `1px solid ${c.border}` }}>
            <div className="text-[13.5px] font-semibold leading-tight truncate" title="Byrne Insurance Group" style={{ fontFamily: FONT, color: c.text, letterSpacing: "-0.01em" }}>
              Byrne Insurance Group
            </div>
            <div className="text-[12px] mt-1.5 leading-tight" style={{ fontFamily: FONT, color: c.razz, fontWeight: 500 }}>
              7038911131 · VIC00003362
            </div>
          </div>

          {/* Flat list of changes — no wrapper labels. */}
          <div className="px-2 mb-3">
            <span className="text-[10.5px] font-bold uppercase tracking-wider" style={{ fontFamily: FONT, color: c.muted, letterSpacing: "0.08em" }}>
              Changes
            </span>
          </div>
          <div className="flex flex-col">
            {orderedSelected.length === 0 ? (
              <div className="px-2 py-2 text-[11.5px]" style={{ fontFamily: FONT, color: c.muted, lineHeight: 1.5 }}>
                No changes yet.
              </div>
            ) : (
              orderedSelected.map(k => {
                const meta = findMeta(k);
                const cm = CARD_META[k];
                const done = doneCount(k);
                const total = cm.fields.length;
                const isDone = done === total;
                const isActive = k === activeKey;
                return (
                  <div key={k} className="relative group" style={{ marginBottom: 2 }}>
                    <button
                      type="button"
                      onClick={() => jumpToSection(k)}
                      className="w-full text-left flex items-center gap-2 transition-colors"
                      style={{
                        fontFamily: FONT,
                        fontSize: 12.5,
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? c.razz : c.text,
                        background: isActive ? c.cardBg : "transparent",
                        border: isActive ? `1px solid ${c.border}` : "1px solid transparent",
                        padding: "8px 10px",
                        borderRadius: 8,
                        cursor: "pointer",
                        boxShadow: isActive ? "0 1px 2px rgba(15,23,42,0.04)" : "none",
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = c.hoverBg; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                    >
                      <span className="flex-1 truncate" style={{ paddingRight: 22 }}>{meta.label}</span>
                      {/* Only show the teal check when done — no numeric counter. */}
                      {isDone && (
                        <Check className="w-3.5 h-3.5 flex-shrink-0 group-hover:opacity-0 transition-opacity" style={{ color: "#73C9B7" }} strokeWidth={3} />
                      )}
                    </button>
                    {/* Remove — appears on row hover, absolutely positioned so it
                        doesn't nest a button inside the row button. */}
                    <button
                      type="button"
                      onClick={() => removeCard(k)}
                      title="Remove this change"
                      className="absolute opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                      style={{
                        right: 6, top: "50%", transform: "translateY(-50%)",
                        color: c.muted, background: "transparent", border: "none", cursor: "pointer",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "#EF4444"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = c.muted; }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            )}
            <button
              type="button"
              onClick={openAdd}
              className="w-full text-left flex items-center gap-2 transition-colors"
              style={{
                fontFamily: FONT,
                fontSize: 12.5,
                fontWeight: 500,
                color: c.razz,
                background: "transparent",
                border: "1px solid transparent",
                padding: "8px 10px",
                borderRadius: 8,
                cursor: "pointer",
                marginTop: 4,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add change</span>
            </button>
          </div>

        </aside>

        {/* ── CENTER: content cards */}
        <main className="flex-1 min-w-0 overflow-y-auto" style={{ padding: "24px 28px" }}>
          {orderedSelected.length === 0 ? (
            <div
              className="text-center rounded-2xl"
              style={{ background: c.cardBg, border: `1px solid ${c.border}`, fontFamily: FONT, padding: "72px 32px" }}
            >
              <div
                className="mx-auto flex items-center justify-center rounded-2xl mb-3"
                style={{ width: 48, height: 48, background: c.razzTintBg, border: "1px solid rgba(168,85,247,0.25)" }}
              >
                <Plus className="w-6 h-6" style={{ color: c.razz }} />
              </div>
              <div className="text-[15px] font-semibold mb-1" style={{ color: c.text }}>What&apos;s changing on this policy?</div>
              <div className="text-[12.5px] mb-4" style={{ color: c.muted, lineHeight: 1.5 }}>
                Each change becomes a card on this page. The whole request submits together.
              </div>
              <button
                type="button"
                onClick={openAdd}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12.5px] font-semibold text-white"
                style={{ background: razzGrad, fontFamily: FONT, border: "none", cursor: "pointer" }}
              >
                <Plus className="w-3.5 h-3.5" />Add change
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orderedSelected.map(k => {
                const meta = findMeta(k);
                const cm = CARD_META[k];
                const done = doneCount(k);
                const total = cm.fields.length;
                const isDone = done === total;
                return (
                  <section
                    key={k}
                    ref={el => { sectionRefs.current[k] = el; }}
                    className="rounded-2xl"
                    style={{ background: c.cardBg, border: `1px solid ${c.border}`, boxShadow: isDark ? "none" : "0 1px 2px rgba(15,23,42,0.04)", scrollMarginTop: 12 }}
                  >
                    <div className="flex items-center gap-3 px-6 pt-5 pb-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-[10.5px] font-bold uppercase tracking-wider mb-1" style={{ fontFamily: FONT, color: c.muted, letterSpacing: "0.08em" }}>
                          {meta.group}
                        </div>
                        <h2 className="text-[16px] font-semibold" style={{ fontFamily: FONT, color: c.text }}>{meta.label}</h2>
                      </div>
                      {isDone && (
                        <span
                          className="inline-flex items-center gap-1 text-[10.5px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={{ fontFamily: FONT, background: "rgba(115,201,183,0.15)", color: "#0F7A63" }}
                        >
                          <Check className="w-2.5 h-2.5" strokeWidth={3.5} />Ready
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeCard(k)}
                        title="Remove"
                        className="p-1 rounded transition-colors"
                        style={{ color: c.muted, background: "transparent", border: "none", cursor: "pointer" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "#EF4444"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = c.muted; }}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="px-6 pb-5">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                        {cm.fields.map((f, i) => {
                          const val = values[k]?.[i] ?? "";
                          const inputStyle: React.CSSProperties = {
                            fontFamily: FONT,
                            fontSize: 13,
                            color: c.text,
                            background: c.cardBg,
                            border: `1px solid ${c.border}`,
                            borderRadius: 8,
                            padding: "9px 12px",
                            outline: "none",
                            width: "100%",
                          };
                          return (
                            <div key={i} className="flex flex-col gap-1.5" style={{ gridColumn: `span ${f.span ?? 2}` }}>
                              <label className="text-[11.5px] font-semibold flex items-center gap-1" style={{ fontFamily: FONT, color: c.text }}>
                                {f.label}
                                {f.optional ? (
                                  <span className="text-[10.5px] font-medium" style={{ color: c.muted }}>optional</span>
                                ) : (
                                  <span style={{ color: c.razz }}>*</span>
                                )}
                              </label>
                              {f.type === "select" ? (
                                <StyledSelect<string>
                                  value={val || (f.placeholder ?? "")}
                                  onChange={v => setValue(k, i, v === (f.placeholder ?? "") ? "" : v)}
                                  options={[(f.placeholder ?? "Select…"), ...(f.options ?? [])]}
                                  triggerStyle={inputStyle}
                                  c={{ text: c.text, muted: c.muted, border: c.border, cardBg: c.cardBg, hoverBg: c.hoverBg, razz: c.razz, razzTintBg: c.razzTintBg }}
                                  font={{ fontFamily: FONT }}
                                />
                              ) : f.type === "textarea" ? (
                                <textarea
                                  value={val}
                                  onChange={e => setValue(k, i, e.target.value)}
                                  placeholder={f.placeholder}
                                  rows={3}
                                  style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
                                />
                              ) : f.type === "date" ? (
                                <DatePicker
                                  value={val}
                                  onChange={v => setValue(k, i, v)}
                                  inputStyle={{ ...inputStyle, border: `1px solid ${c.border}` }}
                                  c={c as unknown as Record<string, string>}
                                  btnGrad={razzGrad}
                                  font={{ fontFamily: FONT }}
                                />
                              ) : f.type === "file" ? (
                                <label
                                  className="flex items-center justify-center gap-2 rounded-lg cursor-pointer transition-colors"
                                  style={{
                                    fontFamily: FONT,
                                    fontSize: 12.5,
                                    color: val ? c.text : c.muted,
                                    background: val ? c.helperBg : "transparent",
                                    border: `1.5px dashed ${val ? c.border : c.border}`,
                                    padding: "16px 12px",
                                  }}
                                  onMouseEnter={e => { if (!val) { e.currentTarget.style.borderColor = c.razz; e.currentTarget.style.background = c.razzTintBg; } }}
                                  onMouseLeave={e => { if (!val) { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.background = "transparent"; } }}
                                >
                                  <input
                                    type="file"
                                    className="hidden"
                                    onChange={e => setValue(k, i, e.target.files?.[0]?.name ?? "")}
                                  />
                                  {val ? (
                                    <>
                                      <Check className="w-3.5 h-3.5" style={{ color: "#0F7A63" }} strokeWidth={3} />
                                      <span className="font-semibold truncate">{val}</span>
                                      <button
                                        type="button"
                                        onClick={e => { e.preventDefault(); setValue(k, i, ""); }}
                                        className="ml-1 text-[11px] font-medium transition-opacity hover:opacity-70"
                                        style={{ color: c.muted, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
                                      >
                                        Replace
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                                      </svg>
                                      <span>Drag &amp; drop or click to upload</span>
                                    </>
                                  )}
                                </label>
                              ) : (
                                <input
                                  type="text"
                                  value={val}
                                  onChange={e => setValue(k, i, e.target.value)}
                                  placeholder={f.placeholder}
                                  style={inputStyle}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </section>
                );
              })}

              {/* Universal supporting details — one comment + one file for the
                  whole request. Hidden when every selected type has its own
                  supporting field baked into the spec (Reinstate / Cancel /
                  XMOD / Named Insured). Matches Design Option 1's pattern. */}
              {orderedSelected.some(k => !SKIP_UNIVERSAL_SUPPORTING.has(k)) && (
                <section
                  className="rounded-2xl"
                  style={{ background: c.cardBg, border: `1px solid ${c.border}`, boxShadow: isDark ? "none" : "0 1px 2px rgba(15,23,42,0.04)" }}
                >
                  <div className="px-6 pt-5 pb-3">
                    <div className="text-[10.5px] font-bold uppercase tracking-wider mb-1" style={{ fontFamily: FONT, color: c.muted, letterSpacing: "0.08em" }}>
                      Supporting detail
                    </div>
                    <h2 className="text-[16px] font-semibold" style={{ fontFamily: FONT, color: c.text }}>Notes &amp; documents</h2>
                    <p className="text-[12px] mt-1" style={{ fontFamily: FONT, color: c.muted }}>
                      Optional context that applies to the whole request — the underwriter sees it alongside every change above.
                    </p>
                  </div>
                  <div className="px-6 pb-5 flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11.5px] font-semibold flex items-center gap-1" style={{ fontFamily: FONT, color: c.text }}>
                        Additional comment
                        <span className="text-[10.5px] font-medium" style={{ color: c.muted }}>optional</span>
                      </label>
                      <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Please provide detailed information about the changes you're requesting…"
                        rows={3}
                        style={{
                          fontFamily: FONT, fontSize: 13, color: c.text, background: c.cardBg,
                          border: `1px solid ${c.border}`, borderRadius: 8, padding: "9px 12px",
                          outline: "none", width: "100%", resize: "vertical", minHeight: 80,
                        }}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11.5px] font-semibold flex items-center gap-1" style={{ fontFamily: FONT, color: c.text }}>
                        Upload supporting document
                        <span className="text-[10.5px] font-medium" style={{ color: c.muted }}>optional</span>
                      </label>
                      <p className="text-[11.5px]" style={{ fontFamily: FONT, color: c.muted, marginBottom: 4 }}>
                        Attach any forms, letters, or documentation that are required for processing.
                      </p>
                      <label
                        className="flex items-center justify-center gap-2 rounded-lg cursor-pointer transition-colors"
                        style={{
                          fontFamily: FONT,
                          fontSize: 13,
                          fontWeight: 500,
                          color: fileAttached ? c.text : c.muted,
                          background: fileAttached ? c.helperBg : "transparent",
                          border: `1.5px dashed ${c.border}`,
                          padding: "18px 12px",
                        }}
                        onMouseEnter={e => { if (!fileAttached) { e.currentTarget.style.borderColor = c.razz; e.currentTarget.style.background = c.razzTintBg; } }}
                        onMouseLeave={e => { if (!fileAttached) { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.background = "transparent"; } }}
                      >
                        <input
                          type="file"
                          className="hidden"
                          onChange={e => setFileAttached(e.target.files?.[0]?.name ?? null)}
                        />
                        {fileAttached ? (
                          <>
                            <Check className="w-3.5 h-3.5" style={{ color: "#0F7A63" }} strokeWidth={3} />
                            <span className="font-semibold truncate">{fileAttached}</span>
                            <button
                              type="button"
                              onClick={e => { e.preventDefault(); setFileAttached(null); }}
                              className="ml-1 text-[11px] font-medium transition-opacity hover:opacity-70"
                              style={{ color: c.muted, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
                            >
                              Replace
                            </button>
                          </>
                        ) : (
                          <>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c.razz} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                            </svg>
                            <span style={{ color: c.text }}>Drag &amp; Drop or browse</span>
                          </>
                        )}
                      </label>
                      <p className="text-[11px] mt-1" style={{ fontFamily: FONT, color: c.muted }}>
                        Accepted file formats: PDF, JPG, PNG, DOC, DOCX. Max. file size: 10MB
                      </p>
                    </div>
                  </div>
                </section>
              )}

              <button
                type="button"
                onClick={openAdd}
                className="w-full inline-flex items-center justify-center gap-1.5 py-3 rounded-2xl text-[12.5px] font-semibold transition-colors"
                style={{ fontFamily: FONT, color: c.razz, background: "transparent", border: `1px dashed ${c.border}`, cursor: "pointer" }}
                onMouseEnter={e => { e.currentTarget.style.background = c.razzTintBg; e.currentTarget.style.borderColor = c.razz; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = c.border; }}
              >
                <Plus className="w-3.5 h-3.5" />Add another change
              </button>
            </div>
          )}
        </main>

        {/* ── RIGHT: hero submit panel (like the 2FA card in the reference) */}
        <aside
          className="flex-shrink-0 overflow-y-auto"
          style={{ width: 260, background: c.railBg, borderLeft: `1px solid ${c.border}`, padding: "16px 14px" }}
        >
          <div
            className="rounded-2xl"
            style={{ background: c.cardBg, border: `1px solid ${c.border}`, boxShadow: isDark ? "none" : "0 1px 2px rgba(15,23,42,0.04)" }}
          >
            <div className="px-5 pt-5 pb-4">
              <h3 className="text-[14px] font-semibold" style={{ fontFamily: FONT, color: c.text }}>Ready to send?</h3>
            </div>
            {/* Meta rows */}
            <div className="px-5 pb-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-semibold" style={{ fontFamily: FONT, color: c.muted }}>Progress</span>
                <span className="text-[11.5px] font-semibold" style={{ fontFamily: FONT, color: submitReady ? "#0F7A63" : c.razz }}>
                  {totalDone} / {totalRequired}
                </span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: c.softDivider }}>
                <div style={{ width: `${totalRequired === 0 ? 0 : (totalDone / totalRequired) * 100}%`, height: "100%", background: submitReady ? "#73C9B7" : razzGrad, transition: "width 300ms ease" }} />
              </div>
              <div className="flex flex-col gap-1.5 mt-1">
                <label className="text-[11.5px] font-semibold" style={{ fontFamily: FONT, color: c.muted }}>Route to</label>
                <div className="relative" onClick={e => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setCarrierOpen(o => !o)}
                    className="w-full flex items-center justify-between transition-colors"
                    style={{
                      fontFamily: FONT,
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: c.text,
                      background: c.cardBg,
                      border: `1px solid ${carrierOpen ? c.razz : c.border}`,
                      borderRadius: 8,
                      padding: "8px 10px",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span>{carrier}</span>
                    <ChevronDown className="w-3.5 h-3.5 transition-transform" style={{ color: c.muted, transform: carrierOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
                  </button>
                  {carrierOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setCarrierOpen(false)} />
                      <div
                        className="absolute left-0 right-0 top-full mt-1 z-40 rounded-lg overflow-hidden"
                        style={{ background: c.cardBg, border: `1px solid ${c.border}`, boxShadow: "0 8px 24px rgba(15,23,42,0.10)" }}
                      >
                        {CARRIERS.map(name => {
                          const active = name === carrier;
                          return (
                            <button
                              key={name}
                              type="button"
                              onClick={() => { setCarrier(name); setCarrierOpen(false); }}
                              className="w-full flex items-center justify-between transition-colors"
                              style={{
                                fontFamily: FONT,
                                fontSize: 12.5,
                                fontWeight: active ? 600 : 500,
                                color: active ? c.razz : c.text,
                                background: active ? c.razzTintBg : "transparent",
                                border: "none",
                                padding: "8px 10px",
                                textAlign: "left",
                                cursor: "pointer",
                              }}
                              onMouseEnter={e => { if (!active) e.currentTarget.style.background = c.hoverBg; }}
                              onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
                            >
                              <span>{name}</span>
                              {active && <Check className="w-3 h-3" strokeWidth={3} />}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="px-5 py-4 flex flex-col gap-2" style={{ borderTop: `1px solid ${c.softDivider}` }}>
              <button
                type="button"
                disabled={!submitReady}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12.5px] font-semibold transition-all"
                style={submitReady ? {
                  fontFamily: FONT, color: "#fff", background: razzGrad, border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(166,20,195,0.25)",
                } : {
                  fontFamily: FONT, color: c.muted, background: c.helperBg, border: `1px solid ${c.border}`, cursor: "not-allowed",
                }}
                onMouseEnter={e => { if (submitReady) e.currentTarget.style.filter = "brightness(1.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.filter = "none"; }}
              >
                <Send className="w-3.5 h-3.5" />
                {submitReady ? "Submit request" : `${totalRequired - totalDone} fields left`}
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Add-change modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.45)" }} onClick={closeAdd}>
          <div
            className="rounded-2xl flex flex-col"
            style={{ background: c.cardBg, border: `1px solid ${c.border}`, width: "min(760px, 94vw)", maxHeight: "80vh", boxShadow: "0 20px 50px rgba(0,0,0,0.20)", fontFamily: FONT }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-4">
              <div>
                <h3 className="text-[16px] font-bold mb-0.5" style={{ color: c.text }}>Add changes</h3>
                <p className="text-[12.5px]" style={{ color: c.muted }}>Pick one or more — each becomes a card in the center.</p>
              </div>
              <button
                type="button"
                onClick={closeAdd}
                className="p-1.5 rounded-md transition-colors"
                style={{ color: c.muted, background: "transparent", border: "none", cursor: "pointer" }}
                onMouseEnter={e => { e.currentTarget.style.background = c.hoverBg; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-7 pb-5 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6 items-start">
                {[
                  [NAV[0]],
                  [NAV[1]],
                  [NAV[2], NAV[3], NAV[4]],
                ].map((groups, colIdx) => (
                  <div key={colIdx} className="flex flex-col gap-6">
                    {groups.map(g => (
                      <div key={g.label}>
                        <div className="pb-2 mb-2" style={{ fontFamily: FONT, fontSize: 10.5, fontWeight: 700, color: c.muted, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `1px solid ${c.softDivider}` }}>
                          {g.label}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          {g.items.map(it => {
                            const alreadyOn = selected.has(it.key);
                            const picked    = addPicks.has(it.key);
                            const active    = picked || alreadyOn;
                            return (
                              <button
                                key={it.key}
                                type="button"
                                disabled={alreadyOn}
                                onClick={() => togglePick(it.key)}
                                className="w-full flex items-center gap-2.5 rounded-md transition-colors"
                                style={{
                                  fontFamily: FONT, textAlign: "left",
                                  background: "transparent",
                                  color: alreadyOn ? c.sub : c.text,
                                  padding: "7px 8px",
                                  border: "none",
                                  fontSize: 13,
                                  fontWeight: active ? 600 : 500,
                                  cursor: alreadyOn ? "default" : "pointer",
                                }}
                                onMouseEnter={e => { if (!alreadyOn) e.currentTarget.style.background = c.hoverBg; }}
                                onMouseLeave={e => { if (!alreadyOn) e.currentTarget.style.background = "transparent"; }}
                              >
                                <span
                                  className="flex-shrink-0 flex items-center justify-center rounded"
                                  style={{
                                    width: 17, height: 17,
                                    border: active ? "none" : `1.5px solid ${c.border}`,
                                    background: active ? razzGrad : "transparent",
                                    transition: "background 120ms",
                                  }}
                                >
                                  {active && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3.5} />}
                                </span>
                                <span className="flex-1 min-w-0 truncate">{it.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-3" style={{ borderTop: `1px solid ${c.border}` }}>
              <span className="text-[12px]" style={{ color: c.muted }}>{addPicks.size} selected</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeAdd}
                  className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors"
                  style={{ color: c.text, background: c.cardBg, border: `1px solid ${c.border}`, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={addPicks.size === 0}
                  onClick={commitAdd}
                  className="px-3.5 py-1.5 rounded-md text-[12px] font-semibold transition-all"
                  style={addPicks.size === 0 ? {
                    color: c.muted, background: c.helperBg, border: `1px solid ${c.border}`, cursor: "not-allowed",
                  } : {
                    color: "#fff", background: razzGrad, border: "none", cursor: "pointer",
                  }}
                  onMouseEnter={e => { if (addPicks.size > 0) e.currentTarget.style.filter = "brightness(1.08)"; }}
                  onMouseLeave={e => (e.currentTarget.style.filter = "none")}
                >
                  Add to request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
