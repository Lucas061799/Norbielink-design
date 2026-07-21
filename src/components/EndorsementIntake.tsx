"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, ChevronDown, FileText, Paperclip, Plus, X } from "lucide-react";
import { DatePicker } from "./DatePicker";

const FONT = "var(--font-montserrat), Montserrat, sans-serif";

// Restyled port of the "Structured Endorsement Intake" prototype. The prototype
// used a 3-column shell (nav + form + gate) with amber/beige colors and phase
// pills — we collapsed it to the app's single-card pattern (search card style)
// with tabs on top and a slim requirements-count footer, then dropped all the
// dev-scaffolding chrome (phase badges, "reusable grid" hints, deferred tiles).

type IntakePage = "contact" | "mcp65" | "puc" | "classcode";
type Carrier = "amtrust" | "clearspring" | "cna";

interface SelectedPolicy {
  policyNumber: string;
  applicant: string;
  submissionId?: string;
  effective?: string;
}

interface Requirement { label: string; done: boolean }
interface ClassCodeRow { id: number; action: "Add" | "Edit" | "Remove"; code: string; payroll: string; ft: string; pt: string }

const CLASS_CODES: { code: string; desc: string }[] = [
  { code: "5190", desc: "Electrical wiring — within buildings" },
  { code: "5140", desc: "Electrical apparatus installation" },
  { code: "5403", desc: "Carpentry — dwellings, 3 stories or less" },
  { code: "5645", desc: "Carpentry — detached dwellings" },
  { code: "5474", desc: "Painting NOC & shop operations" },
  { code: "5551", desc: "Roofing — all kinds" },
  { code: "8742", desc: "Salespersons / collectors — outside" },
  { code: "8810", desc: "Clerical office employees NOC" },
  { code: "9014", desc: "Buildings — operation by contractors" },
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

const PAGES: { key: IntakePage; label: string; title: string; subtitle: string }[] = [
  { key: "contact",   label: "Contact Info",         title: "Contact Info",         subtitle: "Update the insured or agency contact on file. At least one contact field is required." },
  { key: "mcp65",     label: "MCP 65",               title: "MCP 65 Filing",        subtitle: "Motor Carrier Permit filing. Carrier-specific requirements appear automatically." },
  { key: "puc",       label: "PUC Filing",           title: "PUC Filing",           subtitle: "Public Utilities Commission filing request." },
  { key: "classcode", label: "Class Code / Payroll", title: "Class Code / Payroll", subtitle: "Add, remove, or edit class codes and payroll for the policy." },
];

interface Props {
  selectedPolicy: SelectedPolicy;
  onBack: () => void;
  onSubmit: () => void;
  isDark: boolean;
}

export default function EndorsementIntake({ selectedPolicy, onBack, onSubmit, isDark }: Props) {
  const [page, setPage] = useState<IntakePage>("contact");
  const [carrier, setCarrier] = useState<Carrier>("amtrust");
  const [carrierOpen, setCarrierOpen] = useState(false);

  const [contactEff, setContactEff] = useState("");
  const [contactType, setContactType] = useState("");
  const [contactTypeOpen, setContactTypeOpen] = useState(false);
  const [contactFirst, setContactFirst] = useState("");
  const [contactLast, setContactLast] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactNotes, setContactNotes] = useState("");

  const [mcpEff, setMcpEff] = useState("");
  const [mcpNumber, setMcpNumber] = useState("");
  const [mcpFormAttached, setMcpFormAttached] = useState(false);
  const [mcpNotes, setMcpNotes] = useState("");

  const [pucEff, setPucEff] = useState("");
  const [pucNumber, setPucNumber] = useState("");
  const [pucNotes, setPucNotes] = useState("");

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
  const [ccNotes, setCcNotes] = useState("");
  const nextRowId = useRef(3);

  const c = {
    text:         isDark ? "#F9FAFB" : "#1F2937",
    muted:        isDark ? "#8B8FA8" : "#6B7280",
    sub:          isDark ? "#6B7280" : "#9CA3AF",
    cardBg:       isDark ? "#191D35" : "#fff",
    border:       isDark ? "rgba(255,255,255,0.08)" : "#E5E7EB",
    borderStrong: isDark ? "rgba(255,255,255,0.18)" : "#D1D5DB",
    mutedBg:      isDark ? "rgba(255,255,255,0.03)" : "#F9FAFB",
    hoverBg:      isDark ? "rgba(255,255,255,0.04)" : "#F5F3FF",
    inputBg:      isDark ? "rgba(255,255,255,0.05)" : "#fff",
    activeBg:     isDark ? "rgba(166,20,195,0.20)" : "rgba(166,20,195,0.10)",
    softBg:       isDark ? "rgba(166,20,195,0.12)" : "rgba(166,20,195,0.06)",
    softBorder:   isDark ? "rgba(166,20,195,0.28)" : "rgba(166,20,195,0.20)",
    doneText:     isDark ? "#34D399" : "#059669",
    razz:         "#A614C3",
  };
  const font = { fontFamily: FONT } as React.CSSProperties;
  const btnGrad = isDark
    ? "radial-gradient(171.32% 99.33% at 33.13% -9%, #282550 0%, #191735 55.82%, rgba(0,0,0,0.3) 74%, rgba(0,0,0,0) 100%), linear-gradient(88.34deg, #5C2ED4 0.11%, #A614C3 63.8%)"
    : "linear-gradient(90deg,#5C2ED4 0%,#A614C3 65%)";

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

  const closeAll = () => { setCarrierOpen(false); setContactTypeOpen(false); setCcStateOpen(false); };

  const meta = PAGES.find(p => p.key === page)!;

  // ─── requirements engine
  const requirements = useMemo<Requirement[]>(() => {
    const R = (label: string, done: boolean): Requirement => ({ label, done });
    switch (page) {
      case "contact": {
        const anyContact = [contactFirst, contactLast, contactPhone, contactEmail].some(v => v.trim());
        return [
          R("Effective date",             !!contactEff.trim()),
          R("Contact type",               !!contactType.trim()),
          R("At least one contact field", anyContact),
        ];
      }
      case "mcp65": {
        const base = [
          R("Effective date", !!mcpEff.trim()),
          R("MCP 65 number",  !!mcpNumber.trim()),
        ];
        if (carrier === "cna") base.push(R("CNA MCP 65 form attached", mcpFormAttached));
        return base;
      }
      case "puc":
        return [
          R("Effective date",    !!pucEff.trim()),
          R("PUC filing number", !!pucNumber.trim()),
        ];
      case "classcode": {
        const rowReqs: Requirement[] = ccRows.flatMap((r, i) => {
          const line = i + 1;
          const items: Requirement[] = [R(`Class code (line ${line})`, !!r.code.trim())];
          if (r.action !== "Remove") {
            items.push(R(`Payroll (line ${line})`, !!r.payroll.trim()));
            items.push(R(`FT (line ${line})`,      r.ft.trim().length > 0));
            items.push(R(`PT (line ${line})`,      r.pt.trim().length > 0));
          }
          return items;
        });
        return [
          R("Effective date",    !!ccEff.trim()),
          ...rowReqs,
          R("Reason for change", !!ccReason.trim()),
          R("Location address",  !!ccAddress.trim()),
          R("City",              !!ccCity.trim()),
          R("State",             !!ccState.trim()),
          R("Zip",               !!ccZip.trim()),
        ];
      }
    }
  }, [
    page, carrier,
    contactEff, contactType, contactFirst, contactLast, contactPhone, contactEmail,
    mcpEff, mcpNumber, mcpFormAttached,
    pucEff, pucNumber,
    ccEff, ccRows, ccReason, ccAddress, ccCity, ccState, ccZip,
  ]);
  const outstanding = requirements.filter(r => !r.done).length;

  // ─── small render helpers
  const req = <span style={{ color: "#EF4444", fontWeight: 700, marginLeft: 3 }}>*</span>;
  const opt = <span style={{ color: c.sub, fontWeight: 400, fontSize: 11, marginLeft: 6 }}>optional</span>;

  const uploadZone = (attached: boolean, onAttach: () => void) => (
    <label
      className="flex flex-col items-center justify-center rounded-xl cursor-pointer transition-colors"
      style={{
        background: attached ? c.softBg : "transparent",
        border: `1.5px dashed ${attached ? c.razz : c.borderStrong}`,
        minHeight: 92,
        padding: 14,
      }}
      onClick={onAttach}
      onMouseEnter={e => { e.currentTarget.style.background = c.hoverBg; e.currentTarget.style.borderColor = c.razz; }}
      onMouseLeave={e => { e.currentTarget.style.background = attached ? c.softBg : "transparent"; e.currentTarget.style.borderColor = attached ? c.razz : c.borderStrong; }}
    >
      <Paperclip className="w-4 h-4 mb-1.5" style={{ color: c.razz }} />
      <span className="text-[12.5px] font-medium" style={{ fontFamily: FONT, color: c.text }}>
        {attached ? "Document attached" : "Drag a file here or click to browse"}
      </span>
      <span className="text-[11px] mt-0.5" style={{ fontFamily: FONT, color: c.muted }}>PDF, JPG, PNG · Max 10MB</span>
    </label>
  );

  const renderContact = () => (
    <>
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <label style={labelStyle}>Effective date {req}</label>
          <DatePicker value={contactEff} onChange={setContactEff} inputStyle={inputStyle} c={c} btnGrad={btnGrad} font={font} />
        </div>
        <div>
          <label style={labelStyle}>Contact type {req}</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => { closeAll(); setContactTypeOpen(o => !o); }}
              className="w-full flex items-center justify-between"
              style={{ ...inputStyle, cursor: "pointer", textAlign: "left", color: contactType ? c.text : c.sub }}
            >
              <span>{contactType || "Select…"}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${contactTypeOpen ? "rotate-180" : ""}`} style={{ color: c.muted }} />
            </button>
            {contactTypeOpen && (
              <div className="absolute left-0 right-0 top-full mt-1 z-20 rounded-lg shadow-lg overflow-hidden" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
                {["Insured", "Agent"].map(o => (
                  <button
                    key={o}
                    onClick={() => { setContactType(o); setContactTypeOpen(false); }}
                    className="w-full text-left px-3 py-2 text-[13px] transition-colors"
                    style={{ fontFamily: FONT, color: c.text }}
                    onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >{o}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 mt-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <label style={labelStyle}>First name {opt}</label>
          <input value={contactFirst} onChange={e => setContactFirst(e.target.value)} placeholder="Sean" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Last name {opt}</label>
          <input value={contactLast} onChange={e => setContactLast(e.target.value)} placeholder="Byrne" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Phone {opt}</label>
          <input value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="916-772-9200" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Email {opt}</label>
          <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="sbyrne@example.com" style={inputStyle} />
        </div>
      </div>

      <div className="text-[12px] mt-3" style={{ color: c.muted, fontFamily: FONT }}>
        At least one of first name, last name, phone, or email is required.
      </div>

      {renderSupporting(contactNotes, setContactNotes)}
    </>
  );

  const renderMcp65 = () => (
    <>
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <label style={labelStyle}>Effective date {req}</label>
          <DatePicker value={mcpEff} onChange={setMcpEff} inputStyle={inputStyle} c={c} btnGrad={btnGrad} font={font} />
        </div>
        <div>
          <label style={labelStyle}>MCP 65 number {req}</label>
          <input inputMode="numeric" value={mcpNumber} onChange={e => setMcpNumber(e.target.value)} placeholder="e.g. 0123456" style={inputStyle} />
        </div>
      </div>

      {carrier === "cna" && (
        <div
          className="mt-4 rounded-xl px-4 py-3 flex items-start gap-3"
          style={{ background: c.softBg, border: `1px solid ${c.softBorder}`, fontFamily: FONT }}
        >
          <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: c.razz }} />
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold" style={{ color: c.text }}>CNA requires the MCP 65 form on file</div>
            <div className="text-[12px] mt-0.5" style={{ color: c.muted }}>
              CNA only allows an MCP 65 when a commercial auto policy is in force with them.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMcpFormAttached(v => !v)}
            className="text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
            style={{
              fontFamily: FONT,
              color: mcpFormAttached ? "#fff" : c.razz,
              background: mcpFormAttached ? c.razz : "transparent",
              border: `1px solid ${c.razz}`,
              cursor: "pointer",
            }}
          >
            {mcpFormAttached ? "✓ Attached" : "Attach from library"}
          </button>
        </div>
      )}

      {renderSupporting(mcpNotes, setMcpNotes)}
    </>
  );

  const renderPuc = () => (
    <>
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <label style={labelStyle}>Effective date {req}</label>
          <DatePicker value={pucEff} onChange={setPucEff} inputStyle={inputStyle} c={c} btnGrad={btnGrad} font={font} />
        </div>
        <div>
          <label style={labelStyle}>PUC filing number {req}</label>
          <input inputMode="numeric" value={pucNumber} onChange={e => setPucNumber(e.target.value)} style={inputStyle} />
        </div>
      </div>

      {renderSupporting(pucNotes, setPucNotes)}
    </>
  );

  const renderClassCode = () => (
    <>
      <div style={{ maxWidth: 260 }}>
        <label style={labelStyle}>Effective date {req}</label>
        <DatePicker value={ccEff} onChange={setCcEff} inputStyle={inputStyle} c={c} btnGrad={btnGrad} font={font} />
      </div>

      <div className="mt-6">
        <div className="text-[13px] font-semibold mb-1.5" style={{ color: c.text, fontFamily: FONT }}>Class code changes</div>
        <div className="text-[12px] mb-3" style={{ color: c.muted, fontFamily: FONT }}>
          Choose <b style={{ color: c.text }}>Add</b>, <b style={{ color: c.text }}>Edit</b>, or <b style={{ color: c.text }}>Remove</b> per line. On <b style={{ color: c.text }}>Remove</b>, payroll and headcount aren&apos;t needed.
        </div>

        <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${c.border}`, background: c.cardBg }}>
          <div
            className="grid text-[11px] font-bold uppercase tracking-wider"
            style={{
              gridTemplateColumns: "110px 1.5fr 1fr 70px 70px 40px",
              background: c.mutedBg,
              color: c.muted,
              borderBottom: `1px solid ${c.border}`,
              fontFamily: FONT,
            }}
          >
            {["Action", "Class code", "Payroll", "FT", "PT", ""].map((h, i) => (
              <div key={i} className="px-3 py-2.5">{h}</div>
            ))}
          </div>
          {ccRows.map((r, i) => (
            <ClassCodeRowInput
              key={r.id}
              row={r}
              isLast={i === ccRows.length - 1}
              c={c}
              onChange={patch => setCcRows(rows => rows.map(x => x.id === r.id ? { ...x, ...patch } : x))}
              onRemove={() => setCcRows(rows => rows.length > 1 ? rows.filter(x => x.id !== r.id) : rows)}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setCcRows(rows => [...rows, { id: nextRowId.current++, action: "Add", code: "", payroll: "", ft: "", pt: "" }])}
          className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
          style={{ fontFamily: FONT, color: c.razz, background: c.activeBg, border: `1px dashed ${c.softBorder}`, cursor: "pointer" }}
        >
          <Plus className="w-3.5 h-3.5" /> Add line
        </button>
      </div>

      <div className="mt-6">
        <label style={labelStyle}>Reason for change {req}</label>
        <textarea
          value={ccReason}
          onChange={e => setCcReason(e.target.value)}
          placeholder="e.g. No longer have an office employee; added a low-wage electrical worker."
          rows={3}
          style={{ ...inputStyle, resize: "vertical", minHeight: 72, fontFamily: FONT }}
        />
      </div>

      <div className="mt-6">
        <div className="text-[13px] font-semibold mb-2" style={{ color: c.text, fontFamily: FONT }}>Location the changes apply to</div>
        <label style={labelStyle}>Address {req}</label>
        <input value={ccAddress} onChange={e => setCcAddress(e.target.value)} placeholder="587 Test St." style={inputStyle} />
        <div className="text-[11px] mt-1" style={{ color: c.muted, fontFamily: FONT }}>Autofills from Google Address when a match is found.</div>

        <div className="grid gap-4 mt-4" style={{ gridTemplateColumns: "2fr 1fr 1fr" }}>
          <div>
            <label style={labelStyle}>City {req}</label>
            <input value={ccCity} onChange={e => setCcCity(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>State {req}</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => { closeAll(); setCcStateOpen(o => !o); }}
                className="w-full flex items-center justify-between"
                style={{ ...inputStyle, cursor: "pointer", textAlign: "left", color: ccState ? c.text : c.sub }}
              >
                <span>{ccState || "Select"}</span>
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
          </div>
          <div>
            <label style={labelStyle}>Zip {req}</label>
            <input inputMode="numeric" maxLength={5} value={ccZip} onChange={e => setCcZip(e.target.value)} style={inputStyle} />
          </div>
        </div>
      </div>

      {renderSupporting(ccNotes, setCcNotes)}
    </>
  );

  function renderSupporting(notes: string, setNotes: (v: string) => void) {
    return (
      <div className="mt-6 grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <label style={labelStyle}>Additional comment {opt}</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Anything the underwriter should know…"
            rows={3}
            style={{ ...inputStyle, resize: "vertical", minHeight: 92, fontFamily: FONT }}
          />
        </div>
        <div>
          <label style={labelStyle}>Upload supporting document {opt}</label>
          {uploadZone(false, () => {})}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4" onClick={closeAll}>
      {/* ── Policy header — Back, policy info, and carrier context in one card */}
      <div
        className="rounded-2xl px-5 py-4 flex items-center gap-4 flex-wrap"
        style={{ background: c.cardBg, border: `1px solid ${c.border}`, boxShadow: isDark ? "none" : "0 1px 3px rgba(15,23,42,0.04)" }}
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium px-3 py-1.5 rounded-lg transition-colors"
          style={{ fontFamily: FONT, color: c.text, background: "transparent", border: `1px solid ${c.border}`, cursor: "pointer" }}
          onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline flex-wrap gap-x-2.5 gap-y-0.5">
            <span className="text-[15px] font-bold" style={{ color: c.text, fontFamily: FONT, letterSpacing: "-0.01em" }}>{selectedPolicy.policyNumber}</span>
            <span className="text-[13px]" style={{ color: c.muted, fontFamily: FONT }}>· {selectedPolicy.applicant}</span>
            {selectedPolicy.submissionId && (
              <span className="text-[11.5px]" style={{ color: c.sub, fontFamily: FONT }}>· {selectedPolicy.submissionId}</span>
            )}
          </div>
        </div>

        {/* Carrier context chip — inline instead of a whole right rail */}
        <div className="relative flex-shrink-0" onClick={e => e.stopPropagation()}>
          <span className="text-[11px] font-semibold mr-2" style={{ color: c.muted, fontFamily: FONT }}>ISSUING CARRIER</span>
          <button
            type="button"
            onClick={() => { closeAll(); setCarrierOpen(o => !o); }}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
            style={{ fontFamily: FONT, color: c.text, background: c.mutedBg, border: `1px solid ${c.border}`, cursor: "pointer" }}
            onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.background = c.mutedBg)}
          >
            {CARRIERS.find(x => x.key === carrier)!.label}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${carrierOpen ? "rotate-180" : ""}`} style={{ color: c.muted }} />
          </button>
          {carrierOpen && (
            <div className="absolute right-0 top-full mt-1 z-30 rounded-lg shadow-lg overflow-hidden" style={{ background: c.cardBg, border: `1px solid ${c.border}`, minWidth: 160 }}>
              {CARRIERS.map(x => (
                <button
                  key={x.key}
                  type="button"
                  onClick={() => { setCarrier(x.key); setCarrierOpen(false); }}
                  className="w-full text-left px-3 py-2 text-[13px] transition-colors"
                  style={{ fontFamily: FONT, color: c.text, background: x.key === carrier ? c.activeBg : "transparent" }}
                  onMouseEnter={e => { if (x.key !== carrier) e.currentTarget.style.background = c.hoverBg; }}
                  onMouseLeave={e => { if (x.key !== carrier) e.currentTarget.style.background = "transparent"; }}
                >{x.label}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs (pill chips) */}
      <div className="flex flex-wrap gap-2" onClick={e => e.stopPropagation()}>
        {PAGES.map(p => {
          const active = p.key === page;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => setPage(p.key)}
              className="text-[12.5px] font-semibold px-3.5 py-2 rounded-full transition-all"
              style={{
                fontFamily: FONT,
                color:  active ? "#fff" : c.text,
                background: active ? btnGrad : c.cardBg,
                border: `1px solid ${active ? "transparent" : c.border}`,
                cursor: "pointer",
                boxShadow: active ? "0 3px 10px rgba(166,20,195,0.20)" : "none",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = c.hoverBg; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = c.cardBg; }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* ── Form card — same shape as the "Find a policy" search card */}
      <div
        className="rounded-2xl"
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
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-8 pt-8 pb-8">
          <div className="text-[15px] font-semibold mb-1" style={{ color: c.text, fontFamily: FONT }}>{meta.title}</div>
          <div className="text-[13px] mb-6" style={{ color: c.muted, fontFamily: FONT }}>{meta.subtitle}</div>

          {page === "contact"   && renderContact()}
          {page === "mcp65"     && renderMcp65()}
          {page === "puc"       && renderPuc()}
          {page === "classcode" && renderClassCode()}
        </div>
      </div>

      {/* ── Footer bar — remaining-fields count + Cancel/Submit */}
      <div className="flex items-center justify-between gap-4 flex-wrap" onClick={e => e.stopPropagation()}>
        <div className="inline-flex items-center gap-2 text-[12.5px]" style={{ fontFamily: FONT }}>
          {outstanding === 0 ? (
            <>
              <span
                className="inline-flex items-center justify-center rounded-full"
                style={{ width: 18, height: 18, background: "rgba(16,185,129,0.15)", color: c.doneText }}
              >
                <Check className="w-3 h-3" strokeWidth={3.5} />
              </span>
              <span style={{ color: c.doneText, fontWeight: 600 }}>All required fields complete</span>
            </>
          ) : (
            <>
              <span
                className="inline-flex items-center justify-center rounded-full text-[10px] font-bold"
                style={{ width: 18, height: 18, background: c.softBg, color: c.razz }}
              >{outstanding}</span>
              <span style={{ color: c.muted }}>
                required field{outstanding > 1 ? "s" : ""} remaining
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="text-[13px] font-medium transition-colors"
            style={{
              fontFamily: FONT,
              background: c.cardBg,
              border: `1px solid ${c.border}`,
              color: c.text,
              padding: "9px 22px",
              borderRadius: 10,
              cursor: "pointer",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.background = c.cardBg)}
          >Cancel</button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={outstanding > 0}
            className="text-[13px] font-semibold text-white transition-all"
            style={{
              fontFamily: FONT,
              background: outstanding > 0 ? c.mutedBg : btnGrad,
              color: outstanding > 0 ? c.sub : "#fff",
              padding: "10px 26px",
              borderRadius: 10,
              border: outstanding > 0 ? `1px solid ${c.border}` : "none",
              cursor: outstanding > 0 ? "not-allowed" : "pointer",
              boxShadow: outstanding > 0 ? "none" : "0 4px 14px rgba(166,20,195,0.25)",
            }}
            onMouseEnter={e => { if (outstanding === 0) e.currentTarget.style.filter = "brightness(1.08)"; }}
            onMouseLeave={e => (e.currentTarget.style.filter = "none")}
          >Submit request</button>
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
  onChange: (patch: Partial<ClassCodeRow>) => void;
  onRemove: () => void;
}
function ClassCodeRowInput({ row, isLast, c, onChange, onRemove }: RowProps) {
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
    <div className="grid items-center" style={{ gridTemplateColumns: "110px 1.5fr 1fr 70px 70px 40px" }}>
      <div style={cellStyle}>
        <select value={row.action} onChange={e => onChange({ action: e.target.value as ClassCodeRow["action"] })} style={cellInput}>
          <option>Add</option>
          <option>Edit</option>
          <option>Remove</option>
        </select>
      </div>
      <div style={{ ...cellStyle, position: "relative" }}>
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
      <div style={cellStyle}>
        <input value={row.payroll} onChange={e => onChange({ payroll: e.target.value })} disabled={isRemove} inputMode="numeric" placeholder="50,000" style={{ ...cellInput, opacity: isRemove ? 0.4 : 1 }} />
      </div>
      <div style={cellStyle}>
        <input value={row.ft} onChange={e => onChange({ ft: e.target.value })} disabled={isRemove} inputMode="numeric" maxLength={3} placeholder="0" style={{ ...cellInput, opacity: isRemove ? 0.4 : 1 }} />
      </div>
      <div style={cellStyle}>
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
