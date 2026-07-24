"use client";

import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft, Check, ChevronDown, ChevronRight, Clock, FileText, Paperclip, Plus, Save, Send, Trash2, X,
} from "lucide-react";
import { DatePicker } from "./DatePicker";

const FONT = "var(--font-montserrat), Montserrat, sans-serif";

// Structured Endorsement Intake — feature-complete port of the prototype
// (norbielink_endorsement_prototype.html) restyled to the -design app
// language.
//
// Content and behavior come 1:1 from the prototype:
//   • 3-column shell: left page nav (grouped, with phase pills + mini
//     hints, "Deferred" items shown disabled), center card (eyebrow +
//     title + subtitle + fields), right rail (Carrier context + Ready-
//     to-submit gate with live checklist).
//   • Contact Info — single-source contact page that replaces the old
//     "email address" + "phone number" endorsement tiles (per Sean).
//   • MCP 65 — carrier-conditional CNA callout with a Strata forms-
//     library link (Felicia's rule).
//   • Class Code / Payroll — reusable grid, Elastic-style typeahead,
//     nothing pre-fills (agent supplies every value), "Remove" greys
//     out payroll/headcount, "+ Add line" for multiple changes.
//   • Live submit gate: per-page required fields + "at least one of a
//     group" rule + carrier-conditional; clicking a checklist item
//     scrolls to that field. Submit stays disabled until zero left.
//
// Style substitutions from prototype → app:
//   amber → razz-purple (#A614C3), Inter → Montserrat, beige paper →
//   white, .card → rounded-2xl + razz 3px top stroke (search-card
//   pattern), colors from the app palette (#1F2937 / #6B7280 / #E5E7EB).

type EndorsementType = "contact" | "mcp65" | "puc" | "classcode";
type Carrier = "amtrust" | "clearspring" | "cna";

interface SelectedPolicy {
  policyNumber: string;
  applicant: string;
  submissionId?: string;
  effective?: string;
  lob?: string;
  dba?: string;
  status?: string;
}

interface ClassCodeRow { id: number; action: "Add" | "Edit" | "Remove"; code: string; payroll: string; ft: string; pt: string }

const CLASS_CODES: { code: string; desc: string }[] = [
  { code: "5190", desc: "Electrical wiring – within buildings" },
  { code: "5140", desc: "Electrical apparatus installation" },
  { code: "5403", desc: "Carpentry – dwellings, 3 stories or less" },
  { code: "5645", desc: "Carpentry – detached dwellings" },
  { code: "5474", desc: "Painting NOC & shop operations" },
  { code: "5551", desc: "Roofing – all kinds" },
  { code: "8742", desc: "Salespersons / collectors – outside" },
  { code: "8810", desc: "Clerical office employees NOC" },
  { code: "9014", desc: "Buildings – operation by contractors" },
  { code: "6217", desc: "Excavation & grading NOC" },
];

const STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

const CARRIERS: { key: Carrier; label: string }[] = [
  { key: "amtrust",     label: "AmTrust" },
  { key: "clearspring", label: "Clear Spring" },
  { key: "cna",         label: "CNA" },
];

interface NavItem { key: EndorsementType | null; label: string; disabled?: boolean }
const NAV: { label?: string; items: NavItem[] }[] = [
  {
    items: [
      { key: "contact",   label: "Contact Info" },
      { key: "mcp65",     label: "MCP 65" },
      { key: "puc",       label: "PUC Filing" },
      { key: "classcode", label: "Class Code / Payroll" },
    ],
  },
  {
    label: "Coming soon",
    items: [
      { key: null, label: "Location", disabled: true },
      { key: null, label: "Entity",   disabled: true },
    ],
  },
];

const PAGE_META: Record<EndorsementType, { crumb: string; title: string; subtitle: string }> = {
  contact:   { crumb: "Phase 1 · Simple", title: "Contact Info",         subtitle: "Update the insured or agency contact on file. At least one contact field is required to submit." },
  mcp65:     { crumb: "Phase 1 · Simple", title: "MCP 65",               subtitle: "Motor Carrier Permit filing. Carrier-specific requirements appear automatically." },
  puc:       { crumb: "Phase 1 · Simple", title: "PUC Filing",           subtitle: "Public Utilities Commission filing request." },
  classcode: { crumb: "Phase 1 · Core · reusable across Location & Entity", title: "Class Code / Payroll", subtitle: "Add, remove, or edit class codes and payroll. This grid is the building block that Location and Entity endorsements reuse." },
};

interface Props {
  selectedPolicy: SelectedPolicy;
  onBack: () => void;
  onSubmit: () => void;
  isDark: boolean;
}

export default function EndorsementIntake({ selectedPolicy, onBack, onSubmit, isDark }: Props) {
  const [type, setType] = useState<EndorsementType>("contact");
  const [carrier, setCarrier] = useState<Carrier>("amtrust");
  const [carrierOpen, setCarrierOpen] = useState(false);

  // Per-type form state
  const [contactEff, setContactEff] = useState("");
  const [contactType, setContactType] = useState("");
  const [contactTypeOpen, setContactTypeOpen] = useState(false);
  const [contactFirst, setContactFirst] = useState("");
  const [contactLast, setContactLast] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const [mcpEff, setMcpEff] = useState("");
  const [mcpNumber, setMcpNumber] = useState("");
  const [mcpFormAttached, setMcpFormAttached] = useState(false);

  const [pucEff, setPucEff] = useState("");
  const [pucNumber, setPucNumber] = useState("");

  const [ccEff, setCcEff] = useState("");
  const [ccRows, setCcRows] = useState<ClassCodeRow[]>([
    { id: 1, action: "Add", code: "", payroll: "", ft: "", pt: "" },
    { id: 2, action: "Add", code: "", payroll: "", ft: "", pt: "" },
  ]);
  const [ccReason, setCcReason] = useState("");
  const [ccAddress, setCcAddress] = useState("");
  const [ccCity, setCcCity] = useState("");
  const [ccState, setCcState] = useState("");
  const [ccStateOpen, setCcStateOpen] = useState(false);
  const [ccZip, setCcZip] = useState("");
  const nextRowId = useRef(3);

  const [notes, setNotes] = useState("");
  const [fileAttached, setFileAttached] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  // Field refs for the "click checklist item → scroll to field" behavior
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});
  const setRef = (key: string) => (el: HTMLElement | null) => { fieldRefs.current[key] = el; };
  const focusRef = (key: string) => {
    const el = fieldRefs.current[key];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      const focusable = el.querySelector("input, textarea, select, button") as HTMLElement | null;
      focusable?.focus();
    }
  };

  const c = {
    text:       isDark ? "#F9FAFB" : "#1F2937",
    bodyText:   isDark ? "#C5CAD8" : "#4B5563",
    muted:      isDark ? "#8B8FA8" : "#6B7280",
    sub:        isDark ? "#6B7280" : "#9CA3AF",
    cardBg:     isDark ? "#191D35" : "#ffffff",
    border:     isDark ? "rgba(255,255,255,0.08)" : "#E5E7EB",
    softDivider:isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6",
    inputBg:    isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
    hoverBg:    isDark ? "rgba(255,255,255,0.04)" : "#F9FAFB",
    mutedBg:    isDark ? "rgba(255,255,255,0.03)" : "#F9FAFB",
    helperBg:   isDark ? "rgba(255,255,255,0.03)" : "#F9FAFB",
    softBg:     isDark ? "rgba(166,20,195,0.14)" : "rgba(166,20,195,0.08)",
    softBorder: isDark ? "rgba(166,20,195,0.30)" : "rgba(166,20,195,0.22)",
    razz:       "#A614C3",
    // Brand teal (#73C9B7) — same as the Bound status dot on Policies /
    // Quotes / Endorsements results. Text uses a darker sibling shade for
    // legible contrast on white; bg/border use tints of the brand teal.
    green:      isDark ? "#8FDBC9" : "#2D8578",
    greenBg:    isDark ? "rgba(115,201,183,0.18)" : "rgba(115,201,183,0.14)",
    greenBorder:isDark ? "rgba(115,201,183,0.35)" : "rgba(115,201,183,0.30)",
    amber:      "#B45309",
    amberBg:    isDark ? "rgba(245,158,11,0.15)" : "rgba(245,158,11,0.10)",
    warnBg:     isDark ? "rgba(239,68,68,0.10)" : "#FEF2F2",
    warnBorder: isDark ? "rgba(239,68,68,0.30)" : "#FECACA",
  };
  const font = { fontFamily: FONT } as React.CSSProperties;
  const razzGrad = "linear-gradient(90deg,#5C2ED4 0%,#A614C3 65%)";

  const inputStyle: React.CSSProperties = {
    fontFamily: FONT,
    background: c.inputBg,
    border: `1px solid ${c.border}`,
    color: c.text,
    padding: "9px 12px",
    borderRadius: 10,
    fontSize: 13,
    width: "100%",
    outline: "none",
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: FONT,
    color: c.text,
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 6,
    display: "block",
  };

  const closeAll = () => { setCarrierOpen(false); setContactTypeOpen(false); setCcStateOpen(false); };

  // ─── requirements engine (matches prototype's live submit-gate)
  interface Requirement { label: string; done: boolean; refKey: string }
  const requirements = useMemo<Requirement[]>(() => {
    const R = (label: string, done: boolean, refKey: string): Requirement => ({ label, done, refKey });
    switch (type) {
      case "contact": {
        const anyContact = [contactFirst, contactLast, contactPhone, contactEmail].some(v => v.trim());
        return [
          R("Effective date",             !!contactEff.trim(),          "contact-eff"),
          R("Contact type",               !!contactType.trim(),         "contact-type"),
          R("At least one contact field", anyContact,                   "contact-any"),
        ];
      }
      case "mcp65": {
        const base = [
          R("Effective date", !!mcpEff.trim(),    "mcp-eff"),
          R("MCP 65 number",  !!mcpNumber.trim(), "mcp-num"),
        ];
        if (carrier === "cna") base.push(R("CNA MCP 65 form attached", mcpFormAttached, "mcp-form"));
        return base;
      }
      case "puc":
        return [
          R("Effective date",    !!pucEff.trim(),    "puc-eff"),
          R("PUC filing number", !!pucNumber.trim(), "puc-num"),
        ];
      case "classcode": {
        const rowReqs: Requirement[] = ccRows.flatMap((r, i) => {
          const line = i + 1;
          const items: Requirement[] = [R(`Class code (line ${line})`, !!r.code.trim(), `cc-code-${r.id}`)];
          if (r.action !== "Remove") {
            items.push(R(`Payroll (line ${line})`, !!r.payroll.trim(), `cc-pay-${r.id}`));
            items.push(R(`FT (line ${line})`,      r.ft.trim().length > 0, `cc-ft-${r.id}`));
            items.push(R(`PT (line ${line})`,      r.pt.trim().length > 0, `cc-pt-${r.id}`));
          }
          return items;
        });
        return [
          R("Effective date",    !!ccEff.trim(),    "cc-eff"),
          ...rowReqs,
          R("Reason for change", !!ccReason.trim(), "cc-reason"),
          R("Location address",  !!ccAddress.trim(),"cc-addr"),
          R("City",              !!ccCity.trim(),   "cc-city"),
          R("State",             !!ccState.trim(),  "cc-state"),
          R("Zip",               !!ccZip.trim(),    "cc-zip"),
        ];
      }
    }
  }, [
    type, carrier,
    contactEff, contactType, contactFirst, contactLast, contactPhone, contactEmail,
    mcpEff, mcpNumber, mcpFormAttached,
    pucEff, pucNumber,
    ccEff, ccRows, ccReason, ccAddress, ccCity, ccState, ccZip,
  ]);
  const outstanding = requirements.filter(r => !r.done).length;
  const submitReady = outstanding === 0;

  // Per-page completion for the left-nav progress indicators.
  const isTypeDone = (t: EndorsementType): boolean => {
    switch (t) {
      case "contact": {
        const anyContact = [contactFirst, contactLast, contactPhone, contactEmail].some(v => v.trim());
        return !!contactEff.trim() && !!contactType.trim() && anyContact;
      }
      case "mcp65":
        return !!mcpEff.trim() && !!mcpNumber.trim() && (carrier !== "cna" || mcpFormAttached);
      case "puc":
        return !!pucEff.trim() && !!pucNumber.trim();
      case "classcode": {
        const rowsOk = ccRows.every(r => !!r.code.trim() && (r.action === "Remove" || (!!r.payroll.trim() && !!r.ft.trim() && !!r.pt.trim())));
        return !!ccEff.trim() && rowsOk && !!ccReason.trim() && !!ccAddress.trim() && !!ccCity.trim() && !!ccState.trim() && !!ccZip.trim();
      }
    }
  };
  const isTypeStarted = (t: EndorsementType): boolean => {
    switch (t) {
      case "contact":   return [contactEff, contactType, contactFirst, contactLast, contactPhone, contactEmail].some(v => v.trim());
      case "mcp65":     return !!mcpEff.trim() || !!mcpNumber.trim() || mcpFormAttached;
      case "puc":       return !!pucEff.trim() || !!pucNumber.trim();
      case "classcode": return !!ccEff.trim() || ccRows.some(r => r.code.trim() || r.payroll.trim() || r.ft.trim() || r.pt.trim()) || !!ccReason.trim() || !!ccAddress.trim() || !!ccCity.trim() || !!ccState.trim() || !!ccZip.trim();
    }
  };
  const activeTypes: EndorsementType[] = ["contact", "mcp65", "puc", "classcode"];
  const pagesDone = activeTypes.filter(isTypeDone).length;
  const totalPct = Math.round((pagesDone / activeTypes.length) * 100);

  const handleSaveDraft = () => { setDraftSaved(true); setTimeout(() => setDraftSaved(false), 2200); };

  // ─── helpers
  const SectionLabel = ({ children, first }: { children: React.ReactNode; first?: boolean }) => (
    <div
      style={{
        fontFamily: FONT,
        fontSize: 12,
        fontWeight: 700,
        color: c.text,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        margin: first ? "6px 0 8px" : "22px 0 8px",
        paddingTop: first ? 0 : 16,
        borderTop: first ? "none" : `1px solid ${c.softDivider}`,
      }}
    >
      {children}
    </div>
  );

  const Helper = ({ children, warn }: { children: React.ReactNode; warn?: boolean }) => (
    <div
      style={{
        fontFamily: FONT,
        fontSize: 12.5,
        color: c.muted,
        margin: "0 0 12px",
        padding: "9px 12px",
        background: warn ? c.warnBg : c.helperBg,
        border: `1px solid ${warn ? c.warnBorder : c.border}`,
        borderRadius: 8,
      }}
    >
      {children}
    </div>
  );

  const req = <span style={{ color: "#EF4444", fontWeight: 700, marginLeft: 2 }}>*</span>;
  const opt = <span style={{ color: c.sub, fontWeight: 400, fontSize: 11, marginLeft: 6 }}>optional</span>;

  const Field = ({ label, children, required, optional, hint, refKey }: {
    label?: React.ReactNode; children: React.ReactNode; required?: boolean; optional?: boolean;
    hint?: React.ReactNode; refKey?: string;
  }) => (
    <div style={{ margin: "14px 0" }} ref={refKey ? setRef(refKey) : undefined}>
      {label && (
        <label style={labelStyle}>
          {label}{required && req}{optional && opt}
        </label>
      )}
      {children}
      {hint && <div style={{ fontFamily: FONT, fontSize: 11.5, color: c.muted, marginTop: 4 }}>{hint}</div>}
    </div>
  );

  // Rendered as its own card outside the form card (see center column).
  const supportingDetailFields = () => (
    <>
      <Field label="Additional comment" optional>
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Anything the underwriter should know…"
          rows={3}
          style={{ ...inputStyle, resize: "vertical", minHeight: 72, fontFamily: FONT }} />
      </Field>
      <Field label="Upload supporting document" optional>
        <label
          className="flex flex-col items-center justify-center cursor-pointer transition-colors"
          style={{
            background: fileAttached ? c.softBg : c.helperBg,
            border: `1.5px dashed ${fileAttached ? c.razz : c.border}`,
            borderRadius: 10,
            padding: 16,
            textAlign: "center",
            color: c.muted,
            fontSize: 13,
          }}
          onClick={() => setFileAttached(true)}
          onMouseEnter={e => { e.currentTarget.style.borderColor = c.razz; e.currentTarget.style.color = c.text; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = fileAttached ? c.razz : c.border; e.currentTarget.style.color = c.muted; }}
        >
          <Paperclip className="w-4 h-4 mb-1.5" style={{ color: c.razz }} />
          <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 500, color: c.text }}>
            {fileAttached ? "Document attached" : "Drag a file here or click to browse"}
          </span>
          <span style={{ fontFamily: FONT, fontSize: 11, color: c.muted, marginTop: 2 }}>PDF, JPG, PNG · Max 10MB</span>
        </label>
      </Field>
    </>
  );

  // ─── page renderers (content copied 1:1 from the prototype)
  const renderContact = () => (
    <>
      <Field label="Effective date" required refKey="contact-eff">
        <div style={{ maxWidth: 260 }}>
          <DatePicker value={contactEff} onChange={setContactEff} inputStyle={inputStyle} c={c} btnGrad={razzGrad} font={font} />
        </div>
      </Field>

      <Helper>Are you updating the <b style={{ color: c.text }}>insured</b> or the <b style={{ color: c.text }}>agency</b> contact information?</Helper>

      <Field label="Contact type" required refKey="contact-type">
        <div style={{ maxWidth: 260 }} className="relative">
          <button type="button" onClick={() => { closeAll(); setContactTypeOpen(o => !o); }}
            className="w-full flex items-center justify-between"
            style={{ ...inputStyle, cursor: "pointer", textAlign: "left", color: contactType ? c.text : c.sub }}>
            <span>{contactType || "Select…"}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${contactTypeOpen ? "rotate-180" : ""}`} style={{ color: c.muted }} />
          </button>
          {contactTypeOpen && (
            <div className="absolute left-0 right-0 top-full mt-1 z-20 rounded-lg shadow-lg overflow-hidden" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
              {["Insured", "Agent"].map(o => (
                <button key={o} onClick={() => { setContactType(o); setContactTypeOpen(false); }}
                  className="w-full text-left px-3 py-2 text-[13px] transition-colors"
                  style={{ fontFamily: FONT, color: c.text }}
                  onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >{o}</button>
              ))}
            </div>
          )}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-3.5" ref={setRef("contact-any")}>
        <Field label="First name" optional>
          <input value={contactFirst} onChange={e => setContactFirst(e.target.value)} placeholder="Sean" style={inputStyle} />
        </Field>
        <Field label="Last name" optional>
          <input value={contactLast} onChange={e => setContactLast(e.target.value)} placeholder="Byrne" style={inputStyle} />
        </Field>
        <Field label="Phone" optional>
          <input value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="916-772-9200" style={inputStyle} />
        </Field>
        <Field label="Email" optional>
          <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="sbyrne@btisinc.com" style={inputStyle} />
        </Field>
      </div>

      <Helper warn>
        <span style={{ color: "#B91C1C", fontWeight: 600 }}>⚠</span>{" "}
        At least one of first name, last name, phone, or email must be completed to submit.
      </Helper>

      
    </>
  );

  const renderMcp65 = () => (
    <>
      <Field label="Effective date" required refKey="mcp-eff">
        <div style={{ maxWidth: 260 }}>
          <DatePicker value={mcpEff} onChange={setMcpEff} inputStyle={inputStyle} c={c} btnGrad={razzGrad} font={font} />
        </div>
      </Field>

      {/* Carrier-conditional callout — restyled to match the app's helper-box
          pattern (soft gray bg, thin border, muted text) with a razz text link
          for the forms-library action. No heavy color fill. */}
      {carrier === "cna" && (
        <div
          ref={setRef("mcp-form")}
          style={{
            margin: "14px 0",
            padding: "10px 12px",
            borderRadius: 8,
            background: c.helperBg,
            border: `1px solid ${c.border}`,
            borderLeft: `3px solid ${c.razz}`,
            fontFamily: FONT,
          }}
        >
          <div style={{ fontSize: 12.5, color: c.muted, lineHeight: 1.5 }}>
            <span style={{ color: c.text, fontWeight: 600 }}>CNA requirement.</span>{" "}
            CNA only allows an MCP 65 when a commercial auto policy is in force with them, and requires a specific form attached.
          </div>
          <button
            type="button"
            onClick={() => setMcpFormAttached(v => !v)}
            className="inline-flex items-center gap-1 mt-1.5 transition-opacity hover:opacity-70"
            style={{ fontFamily: FONT, fontSize: 12.5, fontWeight: 600, color: c.razz, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
          >
            {mcpFormAttached ? (
              <>
                <Check className="w-3.5 h-3.5" strokeWidth={3} />
                CNA MCP 65 form attached
              </>
            ) : (
              <>
                Open CNA MCP 65 form from the forms library
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      )}

      <Field label="MCP 65 number" required refKey="mcp-num">
        <input inputMode="numeric" value={mcpNumber} onChange={e => setMcpNumber(e.target.value)} placeholder="e.g. 0123456" style={{ ...inputStyle, maxWidth: 260 }} />
      </Field>

      
    </>
  );

  const renderPuc = () => (
    <>
      <Field label="Effective date" required refKey="puc-eff">
        <div style={{ maxWidth: 260 }}>
          <DatePicker value={pucEff} onChange={setPucEff} inputStyle={inputStyle} c={c} btnGrad={razzGrad} font={font} />
        </div>
      </Field>
      <Field label="PUC filing number" required refKey="puc-num">
        <input inputMode="numeric" value={pucNumber} onChange={e => setPucNumber(e.target.value)} style={{ ...inputStyle, maxWidth: 260 }} />
      </Field>
      
    </>
  );

  const renderClassCode = () => (
    <>
      <Field label="Effective date" required refKey="cc-eff">
        <div style={{ maxWidth: 260 }}>
          <DatePicker value={ccEff} onChange={setCcEff} inputStyle={inputStyle} c={c} btnGrad={razzGrad} font={font} />
        </div>
      </Field>

      <SectionLabel>Class code changes</SectionLabel>
      <Helper>
        Choose an action per line. On <b style={{ color: c.text }}>Remove</b>, payroll and employee counts grey out — only the class code is needed.
        Use <b style={{ color: c.text }}>+ Add line</b> for multiple changes in one request.
      </Helper>

      <div className="overflow-hidden" style={{ border: `1px solid ${c.border}`, borderRadius: 10, marginTop: 6 }}>
        <div className="grid"
          style={{ gridTemplateColumns: "120px 1.5fr 1fr 70px 70px 36px", background: c.mutedBg, borderBottom: `1px solid ${c.border}`, fontFamily: FONT, fontSize: 11, fontWeight: 600, color: c.muted, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {["Action", "Class code", "Payroll", "FT", "PT", ""].map((h, i) => (
            <div key={i} style={{ padding: "8px 10px" }}>{h}</div>
          ))}
        </div>
        {ccRows.map((r, i) => (
          <ClassCodeRowInput
            key={r.id}
            row={r}
            isLast={i === ccRows.length - 1}
            c={{ text: c.text, muted: c.muted, border: c.softDivider, cardBg: c.cardBg, hoverBg: c.hoverBg }}
            registerRef={setRef}
            onChange={patch => setCcRows(rows => rows.map(x => x.id === r.id ? { ...x, ...patch } : x))}
            onRemove={() => setCcRows(rows => rows.length > 1 ? rows.filter(x => x.id !== r.id) : rows)}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={() => setCcRows(rows => [...rows, { id: nextRowId.current++, action: "Add", code: "", payroll: "", ft: "", pt: "" }])}
        className="mt-2.5 inline-flex items-center gap-1.5 transition-colors"
        style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: c.razz, background: c.softBg, border: `1px dashed ${c.softBorder}`, padding: "8px 14px", borderRadius: 8, cursor: "pointer" }}
      >
        <Plus className="w-3.5 h-3.5" /> Add line
      </button>

      <SectionLabel>Reason for change</SectionLabel>
      <Field
        label={<>Reason {req} <span style={{ color: c.sub, fontWeight: 400, fontSize: 11, marginLeft: 6 }}>for additions, include duties &amp; operations for the class code</span></>}
        refKey="cc-reason"
      >
        <textarea value={ccReason} onChange={e => setCcReason(e.target.value)}
          placeholder="e.g. No longer have an office employee; added low-wage electrical worker."
          rows={3}
          style={{ ...inputStyle, resize: "vertical", minHeight: 80, fontFamily: FONT }} />
      </Field>

      <SectionLabel>Location the changes apply to</SectionLabel>
      <Field
        label="Address" required
        refKey="cc-addr"
        hint={<><span style={{ color: c.razz }}>◈</span> Autofills from Google Address when a match is found</>}
      >
        <input value={ccAddress} onChange={e => setCcAddress(e.target.value)} placeholder="587 Test St." style={inputStyle} />
      </Field>
      <div className="grid gap-3.5" style={{ gridTemplateColumns: "2fr 1fr 1fr 0.8fr" }}>
        <Field label="City" required refKey="cc-city">
          <input value={ccCity} onChange={e => setCcCity(e.target.value)} style={inputStyle} />
        </Field>
        <Field label="State" required refKey="cc-state">
          <div className="relative">
            <button type="button" onClick={() => { closeAll(); setCcStateOpen(o => !o); }}
              className="w-full flex items-center justify-between"
              style={{ ...inputStyle, cursor: "pointer", textAlign: "left", color: ccState ? c.text : c.sub }}>
              <span>{ccState || "Select…"}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${ccStateOpen ? "rotate-180" : ""}`} style={{ color: c.muted }} />
            </button>
            {ccStateOpen && (
              <div className="absolute left-0 right-0 top-full mt-1 z-20 rounded-lg shadow-lg overflow-hidden max-h-[240px] overflow-y-auto" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
                {STATES.map(s => (
                  <button key={s} onClick={() => { setCcState(s); setCcStateOpen(false); }}
                    className="w-full text-left px-3 py-2 text-[13px] transition-colors"
                    style={{ fontFamily: FONT, color: c.text }}
                    onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>{s}</button>
                ))}
              </div>
            )}
          </div>
        </Field>
        <Field label="Zip" required refKey="cc-zip">
          <input inputMode="numeric" maxLength={5} value={ccZip} onChange={e => setCcZip(e.target.value)} style={inputStyle} />
        </Field>
        <div />
      </div>

      
    </>
  );

  const meta = PAGE_META[type];

  const statusDot = selectedPolicy.status === "Bound" ? "#73C9B7"
                  : selectedPolicy.status === "Cancelled" ? "#EF4444"
                  : "#F59E0B";

  return (
    <div
      className="flex flex-col flex-1 min-h-0 overflow-y-auto"
      style={{
        marginTop: -48,     // eat the mb-12 gap under the "Endorsements" h1
        marginBottom: -48,  // eat main's paddingBottom so bg reaches the floor
        marginLeft: -48,    // eat main's px-12 (left)
        marginRight: -48,   // eat main's px-12 (right)
      }}
      onClick={closeAll}
    >
      {/* 3-column shell. Intake outer is the scroll container and it extends
          past main's px-12 padding via negative left/right margins so the
          sidebar bg tint reaches the app sidenav on one side and the
          viewport edge on the other. */}
      <div
        className="grid items-stretch"
        style={{
          gridTemplateColumns: "300px 1fr 340px",
          minHeight: 0,
          flex: 1,
        }}
      >

          {/* ── LEFT: sidebar — just progress + nav, no policy header
              (moved to the top strip). */}
          <div
            style={{
              borderRight: `1px solid ${c.border}`,
              padding: "28px 32px 96px 32px",
            }}
          >
          <nav
            className="flex flex-col"
            style={{ position: "sticky", top: 20, alignSelf: "flex-start" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Policy identity + scope pills — stacked above the progress bar
                so all page-context bits live in the left rail together.
                Tight vertical rhythm: back → applicant → meta → pills, single
                soft divider, no double margins with the progress row. */}
            <div style={{ padding: "0 2px 14px", borderBottom: `1px solid ${c.softDivider}` }}>
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1.5 transition-opacity hover:opacity-70"
                style={{ fontFamily: FONT, fontSize: 12, fontWeight: 500, color: c.muted, background: "transparent", border: "none", cursor: "pointer", padding: 0, marginBottom: 8 }}
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to results
              </button>
              <div
                className="truncate"
                title={selectedPolicy.applicant}
                style={{ fontFamily: FONT, fontSize: 13.5, fontWeight: 600, color: c.text, letterSpacing: "-0.01em", lineHeight: 1.35 }}
              >
                {selectedPolicy.applicant}
              </div>
              <div style={{ fontFamily: FONT, fontSize: 12, color: c.razz, fontWeight: 500, marginTop: 2, lineHeight: 1.5 }}>
                {selectedPolicy.policyNumber}
                {selectedPolicy.submissionId && (
                  <> · {selectedPolicy.submissionId}</>
                )}
              </div>
            </div>

            <div className="flex flex-col" style={{ marginTop: 14 }}>
              {/* Progress — one small uppercase 11/700 label, same style as phase groups */}
              <div style={{ padding: "0 6px 12px" }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: c.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>Progress</span>
                  <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: pagesDone === activeTypes.length ? c.green : c.razz }}>
                    {pagesDone}<span style={{ color: c.muted, marginLeft: 3 }}>/ {activeTypes.length}</span>
                  </span>
                </div>
                <div style={{ height: 3, background: c.softDivider, borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ width: `${totalPct}%`, height: "100%", background: pagesDone === activeTypes.length ? c.green : razzGrad, transition: "width 300ms ease" }} />
                </div>
              </div>

            {NAV.map((g, gi) => (
              <div key={g.label ?? `group-${gi}`} style={{ marginBottom: 20 }}>
                {g.label && (
                  <div style={{ padding: "8px 10px 6px", marginTop: gi === 0 ? 0 : 4, borderTop: gi === 0 ? "none" : `1px solid ${c.softDivider}` }}>
                    <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: c.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>{g.label}</span>
                  </div>
                )}
                {g.items.map((it, i) => {
                  const active = it.key === type;
                  const disabled = !!it.disabled || it.key === null;
                  const done     = !disabled && it.key ? isTypeDone(it.key) : false;
                  const started  = !disabled && it.key ? isTypeStarted(it.key) && !done : false;
                  const statusEl = disabled ? null : done ? (
                    <span
                      className="inline-flex items-center justify-center rounded-full"
                      style={{ width: 16, height: 16, background: c.greenBg, color: c.green }}
                      title="All required fields complete"
                    >
                      <Check className="w-2.5 h-2.5" strokeWidth={3.5} />
                    </span>
                  ) : started ? (
                    <span
                      className="rounded-full"
                      style={{ width: 8, height: 8, background: c.razz, boxShadow: `0 0 0 3px ${c.softBg}` }}
                      title="In progress"
                    />
                  ) : (
                    <span
                      className="rounded-full"
                      style={{ width: 10, height: 10, background: "transparent", border: `1.5px solid ${c.border}` }}
                      title="Not started"
                    />
                  );
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={disabled}
                      onClick={() => { if (it.key) setType(it.key); }}
                      className="w-full flex items-center justify-between gap-2 transition-colors"
                      style={{
                        fontFamily: FONT,
                        textAlign: "left",
                        background: active ? c.softBg : "transparent",
                        color: active ? c.razz : (disabled ? c.sub : c.text),
                        padding: "10px 12px",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 13.5,
                        fontWeight: active ? 600 : 500,
                        cursor: disabled ? "not-allowed" : "pointer",
                        marginBottom: 2,
                      }}
                      onMouseEnter={e => { if (!disabled && !active) e.currentTarget.style.background = c.hoverBg; }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
                    >
                      <span className="min-w-0 truncate">{it.label}</span>
                      {statusEl && <span className="flex-shrink-0 flex items-center">{statusEl}</span>}
                    </button>
                  );
                })}
              </div>
            ))}
            </div>
          </nav>
          </div>

          {/* ── CENTER: white background, no card. Sections split by
              soft dividers + section labels. */}
          <main style={{ padding: "28px 32px 96px" }} onClick={e => e.stopPropagation()}>
            <div>
              {/* Header: h1 + subtitle. WC scope + status live in
                  the shared top strip above the 3-column grid. */}
              <div style={{ padding: "0 4px 20px", borderBottom: `1px solid ${c.softDivider}` }}>
                <h1 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 600, color: c.text, letterSpacing: "-0.01em", margin: 0 }}>{meta.title}</h1>
                <p style={{ margin: "8px 0 0", color: c.muted, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{meta.subtitle}</p>
              </div>

              {/* Fields section — flat, no card */}
              <div style={{ padding: "10px 4px 22px" }}>
                {type === "contact"   && renderContact()}
                {type === "mcp65"     && renderMcp65()}
                {type === "puc"       && renderPuc()}
                {type === "classcode" && renderClassCode()}
              </div>

              {/* Supporting Detail — flat, no card */}
              <div style={{ padding: "20px 4px 24px", borderTop: `1px solid ${c.softDivider}` }}>
                <div style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: c.text, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                  Supporting detail
                </div>
                {supportingDetailFields()}
              </div>
            </div>
          </main>

          {/* ── RIGHT: sidebar column — same treatment as LEFT. */}
          <div
            style={{
              borderLeft: `1px solid ${c.border}`,
              padding: "28px 32px 96px 32px",
            }}
          >
          <aside
            className="flex flex-col"
            style={{ position: "sticky", top: 20, alignSelf: "flex-start" }}
            onClick={e => e.stopPropagation()}
          >
            {/* ── Section header: CARRIER + carrier state pill (like the reference's
                "Embedding v3 · AI Model · Warning" panel header). */}
            <div style={{ padding: "0 2px 12px" }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <div style={{ fontFamily: FONT, fontSize: 18, fontWeight: 600, color: c.text, letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                    {CARRIERS.find(x => x.key === carrier)!.label}
                  </div>
                  <div style={{ fontFamily: FONT, fontSize: 12, color: c.muted, marginTop: 2 }}>Issuing carrier</div>
                </div>
                {(carrier === "cna" && type === "mcp65") ? (
                  <span
                    className="inline-flex items-center gap-1.5"
                    style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: "#B91C1C", background: "rgba(239,68,68,0.10)", border: `1px solid rgba(239,68,68,0.22)`, padding: "3px 10px", borderRadius: 999 }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#EF4444" }} /> Extra rule
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1.5"
                    style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: c.green, background: c.greenBg, border: `1px solid ${c.greenBorder}`, padding: "3px 10px", borderRadius: 999 }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#10B981" }} /> Standard
                  </span>
                )}
              </div>

              {/* Carrier dropdown (kept as a compact chip so switching is fast) */}
              <div className="relative">
                <button type="button" onClick={() => { closeAll(); setCarrierOpen(o => !o); }}
                  className="w-full flex items-center justify-between"
                  style={{ ...inputStyle, cursor: "pointer", textAlign: "left" }}
                >
                  <span>Change carrier: {CARRIERS.find(x => x.key === carrier)!.label}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${carrierOpen ? "rotate-180" : ""}`} style={{ color: c.muted }} />
                </button>
                {carrierOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-30 rounded-lg shadow-lg overflow-hidden" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
                    {CARRIERS.map(x => (
                      <button key={x.key} onClick={() => { setCarrier(x.key); setCarrierOpen(false); }}
                        className="w-full text-left px-3 py-2 text-[13px] transition-colors"
                        style={{ fontFamily: FONT, color: x.key === carrier ? c.razz : c.text, background: x.key === carrier ? c.softBg : "transparent", fontWeight: x.key === carrier ? 600 : 500 }}
                        onMouseEnter={e => { if (x.key !== carrier) e.currentTarget.style.background = c.hoverBg; }}
                        onMouseLeave={e => { if (x.key !== carrier) e.currentTarget.style.background = "transparent"; }}
                      >{x.label}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── SUBMIT GATE — bordered card with big number + requirement rows,
                each row clickable to scroll to its field. */}
            <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: c.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 20, marginBottom: 8, padding: "0 2px" }}>
              Submit gate
            </div>
            <div
              className="rounded-xl"
              style={{ border: `1px solid ${c.border}`, background: c.cardBg, overflow: "hidden" }}
            >
              <div className="flex items-baseline gap-2" style={{ padding: "14px 14px 12px" }}>
                <span style={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, color: submitReady ? c.green : c.razz, letterSpacing: "-0.03em", lineHeight: 1 }}>{outstanding}</span>
                <span style={{ fontFamily: FONT, fontSize: 12.5, color: c.muted }}>
                  {outstanding === 1 ? "requirement left" : "requirements left"}
                </span>
              </div>
              {requirements.length > 0 && (
                <ul className="list-none p-0 m-0" style={{ borderTop: `1px solid ${c.softDivider}` }}>
                  {requirements.map((r, i) => (
                    <li key={r.label + i}>
                      <button
                        type="button"
                        onClick={() => !r.done && focusRef(r.refKey)}
                        disabled={r.done}
                        className="w-full flex items-center gap-2.5 text-left transition-colors"
                        style={{
                          padding: "9px 14px",
                          borderTop: i === 0 ? "none" : `1px solid ${c.softDivider}`,
                          fontFamily: FONT,
                          fontSize: 13,
                          background: "transparent",
                          border: "none",
                          cursor: r.done ? "default" : "pointer",
                        }}
                        onMouseEnter={e => { if (!r.done) e.currentTarget.style.background = c.hoverBg; }}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <span
                          className="flex items-center justify-center flex-shrink-0 rounded-full"
                          style={{
                            width: 18, height: 18,
                            background: r.done ? c.greenBg : c.amberBg,
                            color:      r.done ? c.green   : c.amber,
                          }}
                        >
                          {r.done ? <Check className="w-3 h-3" strokeWidth={3.5} /> : <span style={{ fontSize: 10, fontWeight: 700 }}>!</span>}
                        </span>
                        <span className="flex-1 min-w-0 truncate" style={{ color: r.done ? c.muted : c.text, textDecoration: r.done ? "line-through" : "none" }}>{r.label}</span>
                        {!r.done && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.sub }} />}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* ── Primary CTA — Submit endorsement request, pulled out of the
                cards so it reads as the page's final action. */}
            <button
              type="button"
              onClick={onSubmit}
              disabled={!submitReady}
              className="w-full inline-flex items-center justify-center gap-1.5 transition-all"
              style={{
                fontFamily: FONT,
                fontSize: 13.5,
                fontWeight: 600,
                padding: "12px 16px",
                borderRadius: 10,
                marginTop: 20,
                border: "none",
                color: submitReady ? "#fff" : c.sub,
                background: submitReady ? razzGrad : c.mutedBg,
                cursor: submitReady ? "pointer" : "not-allowed",
                boxShadow: submitReady ? "0 4px 14px rgba(166,20,195,0.25)" : "none",
              }}
              onMouseEnter={e => { if (submitReady) e.currentTarget.style.filter = "brightness(1.08)"; }}
              onMouseLeave={e => (e.currentTarget.style.filter = "none")}
            >
              <Send className="w-3.5 h-3.5" />
              {submitReady ? "Submit endorsement request" : `${outstanding} field${outstanding > 1 ? "s" : ""} remaining`}
            </button>
          </aside>
          </div>
        </div>
    </div>
  );
}

// ───────────────────────────────────────── class-code row (with typeahead)

interface RowProps {
  row: ClassCodeRow;
  isLast: boolean;
  c: Record<string, string>;
  registerRef: (key: string) => (el: HTMLElement | null) => void;
  onChange: (patch: Partial<ClassCodeRow>) => void;
  onRemove: () => void;
}
function ClassCodeRowInput({ row, isLast, c, registerRef, onChange, onRemove }: RowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const hits = row.code.trim()
    ? CLASS_CODES.filter(x => x.code.includes(row.code.trim()) || x.desc.toLowerCase().includes(row.code.trim().toLowerCase())).slice(0, 6)
    : [];
  const isRemove = row.action === "Remove";
  const cellInput: React.CSSProperties = {
    fontFamily: FONT,
    width: "100%",
    border: "none",
    background: "transparent",
    color: c.text,
    fontSize: 13,
    padding: "6px 4px",
    outline: "none",
  };
  const cellStyle: React.CSSProperties = {
    padding: "6px 10px",
    borderBottom: isLast ? "none" : `1px solid ${c.border}`,
    borderRight: `1px solid ${c.border}`,
  };
  return (
    <div className="grid items-center" style={{ gridTemplateColumns: "120px 1.5fr 1fr 70px 70px 36px" }}>
      <div style={cellStyle}>
        <select value={row.action} onChange={e => onChange({ action: e.target.value as ClassCodeRow["action"] })} style={cellInput}>
          <option>Add</option>
          <option>Edit</option>
          <option>Remove</option>
        </select>
      </div>
      <div style={{ ...cellStyle, position: "relative" }} ref={registerRef(`cc-code-${row.id}`)}>
        <input
          value={row.code}
          onChange={e => { onChange({ code: e.target.value }); setMenuOpen(true); }}
          onFocus={() => setMenuOpen(true)}
          onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
          placeholder="type 'electric' or 5190"
          autoComplete="off"
          style={cellInput}
        />
        {menuOpen && hits.length > 0 && (
          <div
            className="absolute z-20 rounded-lg shadow-lg overflow-hidden"
            style={{ background: c.cardBg, border: `1px solid ${c.border}`, top: "100%", left: 6, right: 6, marginTop: 2, maxHeight: 200, overflowY: "auto" }}
          >
            {hits.map(h => (
              <button
                key={h.code}
                type="button"
                onMouseDown={() => { onChange({ code: h.code }); setMenuOpen(false); }}
                className="w-full flex items-center justify-between gap-3 px-3 py-2 text-left transition-colors"
                style={{ fontFamily: FONT, background: "transparent", border: "none", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <span className="text-[13px] font-semibold" style={{ color: c.text, fontFamily: "ui-monospace, monospace" }}>{h.code}</span>
                <span className="text-[11.5px] text-right" style={{ color: c.muted }}>{h.desc}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={cellStyle} ref={registerRef(`cc-pay-${row.id}`)}>
        <input value={row.payroll} onChange={e => onChange({ payroll: e.target.value })} disabled={isRemove} inputMode="numeric" placeholder="50,000" style={{ ...cellInput, opacity: isRemove ? 0.4 : 1 }} />
      </div>
      <div style={cellStyle} ref={registerRef(`cc-ft-${row.id}`)}>
        <input value={row.ft} onChange={e => onChange({ ft: e.target.value })} disabled={isRemove} inputMode="numeric" maxLength={3} placeholder="0" style={{ ...cellInput, opacity: isRemove ? 0.4 : 1 }} />
      </div>
      <div style={cellStyle} ref={registerRef(`cc-pt-${row.id}`)}>
        <input value={row.pt} onChange={e => onChange({ pt: e.target.value })} disabled={isRemove} inputMode="numeric" maxLength={3} placeholder="0" style={{ ...cellInput, opacity: isRemove ? 0.4 : 1 }} />
      </div>
      <div style={{ ...cellStyle, borderRight: "none", textAlign: "center" }}>
        <button
          type="button"
          onClick={onRemove}
          title="Remove line"
          className="transition-colors"
          style={{ background: "transparent", border: "none", color: c.muted, cursor: "pointer", padding: 4 }}
          onMouseEnter={e => (e.currentTarget.style.color = "#EF4444")}
          onMouseLeave={e => (e.currentTarget.style.color = c.muted)}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
