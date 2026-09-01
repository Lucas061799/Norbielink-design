"use client";

import { Fragment, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, ChevronDown, ChevronRight, FileEdit, HelpCircle, Info, Layers, Plus, Printer, Send, Shield, X } from "lucide-react";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { DatePicker } from "./DatePicker";
import { StyledSelect } from "./StyledSelect";

const FONT = "var(--font-montserrat), Montserrat, sans-serif";

// Excel-spec character constraints per field label. Keyed on the lowercased
// label so both the main flat-field render and the grid renderers can share
// the same rules. Formatters strip disallowed characters, cap length, and
// apply light auto-formatting (dashes / percent sign).
type FieldConstraint = {
  maxLength?: number;
  inputMode: "numeric";
  format: (raw: string) => string;
};
function constraintFor(label: string): FieldConstraint | null {
  const l = label.toLowerCase().trim();
  // FEIN — must be 9 numerals; auto-format as xx-xxxxxxx
  if (l === "fein" || l.endsWith(" fein") || l === "alternate employer fein") {
    return {
      maxLength: 10,
      inputMode: "numeric",
      format: raw => {
        const d = raw.replace(/\D/g, "").slice(0, 9);
        return d.length > 2 ? `${d.slice(0, 2)}-${d.slice(2)}` : d;
      },
    };
  }
  // Phone Number — 10 numerals; auto-format as xxx-xxx-xxxx
  if (l === "phone number" || l === "phone") {
    return {
      maxLength: 12,
      inputMode: "numeric",
      format: raw => {
        let d = raw.replace(/\D/g, "").slice(0, 11);
        if (d.length === 11 && d.startsWith("1")) d = d.slice(1);
        d = d.slice(0, 10);
        if (d.length > 6) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
        if (d.length > 3) return `${d.slice(0, 3)}-${d.slice(3)}`;
        return d;
      },
    };
  }
  // Class Code — 4 numerals
  if (l === "class code") {
    return { maxLength: 4, inputMode: "numeric", format: raw => raw.replace(/\D/g, "").slice(0, 4) };
  }
  // FT / PT / Employees at Jobsite — 3 numerals
  if (l === "full time employees" || l === "part time employees" || l === "employees at jobsite") {
    return { maxLength: 3, inputMode: "numeric", format: raw => raw.replace(/\D/g, "").slice(0, 3) };
  }
  // Ownership % — 3 numerals with % suffix
  if (l === "ownership %") {
    return {
      maxLength: 4,
      inputMode: "numeric",
      format: raw => {
        const d = raw.replace(/\D/g, "").slice(0, 3);
        return d ? `${d}%` : "";
      },
    };
  }
  // Zip — 5 numerals. Covers plain "Zip" plus prefixed variants like
  // "Holder Zip" and "Jobsite Zip" that show up in the Waiver of
  // Subrogation nested address blocks.
  if (l === "zip" || l === "zip code" || l.endsWith(" zip")) {
    return { maxLength: 5, inputMode: "numeric", format: raw => raw.replace(/\D/g, "").slice(0, 5) };
  }
  // Payroll — open numeric with auto-comma formatting (spec: "Open Numeric Box").
  // No explicit length cap; we soft-cap at 10 digits (~$10B) to keep the input sane.
  if (l === "payroll") {
    return {
      inputMode: "numeric",
      format: raw => {
        const d = raw.replace(/\D/g, "").slice(0, 10);
        return d ? Number(d).toLocaleString("en-US") : "";
      },
    };
  }
  return null;
}

export type EndorsementKey =
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

// Flat list of every human-readable endorsement type label. Exported so
// upstream consumers (e.g. the Endorsements All Requests type filter)
// can show the full catalog even when the visible data only spans a
// subset of the types.
export const ALL_ENDORSEMENT_TYPE_LABELS: string[] = NAV.flatMap(g => g.items.map(it => it.label));

type FieldType = "date" | "text" | "select" | "textarea" | "file";
type Field = { label: string; type: FieldType; placeholder?: string; options?: string[]; span?: 1 | 2; optional?: boolean };

// All 50 states + DC — reused by every card that has a State dropdown.
const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

// Entity Type dropdown — matches the Excel spec's list (12+ options, plus Other).
const ENTITY_TYPES = [
  "Association","Common Ownership","Corporation","Government Entity","Individual",
  "Joint Employers","Joint Venture","Labor Union","Limited Liability Company",
  "Limited Partnership","Partnership","Sole Proprietorship","Trust","Other",
];
// Types with their own required supporting field baked in — everyone else
// falls back to the shared "Notes & documents" block at the bottom of the request.
// Empty for now — every endorsement type also gets the shared bottom section
// so users always have a place to attach general context / files.
const SKIP_UNIVERSAL_SUPPORTING = new Set<EndorsementKey>();
const CARD_META: Record<EndorsementKey, { blurb: string; footNote?: string; fields: Field[] }> = {
  contact:      { blurb: "Are you updating the insured or agency contact information?",
                  footNote: "At least one contact info field must be completed in order to submit.",
                  fields: [
                    { label: "Effective date", type: "date", span: 1 },
                    { label: "Contact",        type: "select", options: ["Agent", "Insured"], span: 1 },
                    { label: "First Name",     type: "text", placeholder: "Jane", span: 1, optional: true },
                    { label: "Last Name",      type: "text", placeholder: "Doe",  span: 1, optional: true },
                    { label: "Phone Number",   type: "text", placeholder: "(555) 123-4567", span: 1, optional: true },
                    { label: "Email Address",  type: "text", placeholder: "name@example.com", span: 1, optional: true },
                  ] },
  namedinsured: { blurb: "Are you amending the Legal Name or DBA of the entity? If changing the entity or ownership structure, use the Entity endorsement instead.",
                  footNote: "At least one of New Legal Name or New DBA must be completed in order to submit.",
                  fields: [
                    { label: "Effective date",     type: "date", span: 1 },
                    { label: "Current Legal Name", type: "text", placeholder: "e.g. Byrne Insurance Group", span: 1 },
                    { label: "Current DBA",        type: "text", placeholder: "e.g. Byrne Insurance", span: 1, optional: true },
                    { label: "New Legal Name",     type: "text", placeholder: "e.g. Byrne Insurance Solutions", span: 1, optional: true },
                    { label: "New DBA",            type: "text", placeholder: "e.g. Byrne Solutions", span: 1, optional: true },
                    { label: "Reason for the change (please clearly explain what is changing)", type: "textarea", placeholder: "Reason for the name change, any related restructuring…", span: 2 },
                  ] },
  mailing:      { blurb: "Change the mailing address on the policy.",      fields: [
                    { label: "Effective date", type: "date", span: 1 },
                    { label: "Address",        type: "text", placeholder: "123 Main St", span: 2 },
                    { label: "City",           type: "text", placeholder: "Des Moines", span: 1 },
                    { label: "State",          type: "select", options: US_STATES, span: 1 },
                    { label: "ZIP",            type: "text", placeholder: "50314", span: 1 },
                  ] },
  effdate:      { blurb: "Change the requested policy effective date.",    fields: [
                    { label: "Requested Policy Effective Date", type: "date", span: 1 },
                    { label: "Reason for effective date change", type: "textarea", placeholder: "Explain why the effective date needs to change…", span: 2 },
                  ] },
  classcode:    { blurb: "Add, remove, or edit class codes and payroll for a location. Use + Add line for multiple changes in one request.",
                  fields: [
                    { label: "Effective date", type: "date", span: 1 },
                    { label: "Reason for class code / payroll changes (for additions, include duties & operations for the class code)",
                      type: "textarea", placeholder: "Describe duties, operations, or the reason for the change…", span: 2 },
                    { label: "Location address the changes apply to", type: "text", placeholder: "123 Main St", span: 2 },
                    { label: "City",           type: "text", placeholder: "Des Moines", span: 1 },
                    { label: "State",          type: "select", options: US_STATES, span: 1 },
                    { label: "Zip",            type: "text", placeholder: "50314", span: 1 },
                  ] },
  limits:       { blurb: "Change the Employers Liability limits on the policy. Effective date must be the policy inception date.",
                  fields: [
                    { label: "Effective date", type: "date", span: 1 },
                    { label: "Employers Liability Limits", type: "select",
                      options: ["$100,000 / $500,000 / $100,000", "$500,000 / $500,000 / $500,000", "$1,000,000 / $1,000,000 / $1,000,000"],
                      span: 1 },
                  ] },
  waiver:       { blurb: "Add a Waiver of Subrogation. For Specific waivers, fill in the holder / jobsite / class-code details below; for Blanket waivers, leave those fields blank.",
                  fields: [
                    { label: "Effective date",       type: "date", span: 1 },
                    { label: "Waiver of Subrogation", type: "select", options: ["Blanket", "Specific"], span: 1 },
                    { label: "Waiver Holder's Name", type: "text", placeholder: "Name on certificate", span: 2, optional: true },
                    { label: "Holder Address",       type: "text", placeholder: "Street", span: 2, optional: true },
                    { label: "Holder City",          type: "text", placeholder: "City", span: 1, optional: true },
                    { label: "Holder State",         type: "select", options: US_STATES, span: 1, optional: true },
                    { label: "Holder Zip",           type: "text", placeholder: "ZIP", span: 1, optional: true },
                    { label: "Jobsite Address",      type: "text", placeholder: "Street", span: 2, optional: true },
                    { label: "Jobsite City",         type: "text", placeholder: "City", span: 1, optional: true },
                    { label: "Jobsite State",        type: "select", options: US_STATES, span: 1, optional: true },
                    { label: "Jobsite Zip",          type: "text", placeholder: "ZIP", span: 1, optional: true },
                    { label: "Class Code",           type: "text", placeholder: "e.g. 5190", span: 1, optional: true },
                    { label: "Payroll",              type: "text", placeholder: "e.g. 50,000", span: 1, optional: true },
                    { label: "Employees at Jobsite", type: "text", placeholder: "e.g. 3", span: 1, optional: true },
                    { label: "Description of Work",  type: "textarea", placeholder: "Describe the work performed at this jobsite…", span: 2, optional: true },
                  ] },
  officer:      { blurb: "This page is for requests to exclude or include an officer previously disclosed. If ownership is changing, please complete an Entity endorsement. A signed officer waiver may be required for excluded officers.",
                  fields: [
                    { label: "Effective date", type: "date", span: 1 },
                    { label: "First Name",     type: "text", placeholder: "Jane", span: 1 },
                    { label: "Last Name",      type: "text", placeholder: "Doe",  span: 1 },
                    { label: "Title",          type: "text", placeholder: "e.g. President", span: 1 },
                    { label: "Included / Excluded", type: "select", options: ["Included", "Excluded"], span: 1 },
                  ] },
  mcp65:        { blurb: "File an MCP 65 form for California DMV.",        fields: [
                    { label: "Effective date",  type: "date", span: 1 },
                    { label: "MCP 65 Number",   type: "text", placeholder: "e.g. MC123456", span: 1 },
                  ] },
  puc:          { blurb: "File a PUC Filing for the Public Utilities Commission.",
                  fields: [
                    { label: "Effective date",     type: "date", span: 1 },
                    { label: "PUC Filing Number",  type: "text", placeholder: "PUC ID", span: 1 },
                  ] },
  thirdpartynoc:{ blurb: "Third Party Notice of Cancellation — carrier will notify the named party if the policy is cancelled.",
                  fields: [
                    { label: "Effective date",     type: "date", span: 1 },
                    { label: "Third Party Name",   type: "text", placeholder: "e.g. City of Sacramento", span: 1 },
                    { label: "Address",            type: "text", placeholder: "Street", span: 2 },
                    { label: "City",               type: "text", placeholder: "City", span: 1 },
                    { label: "State",              type: "select", options: US_STATES, span: 1 },
                    { label: "Zip",                type: "text", placeholder: "ZIP", span: 1 },
                  ] },
  altemp:       { blurb: "Add an Alternate Employer endorsement. State determines the correct form number.",
                  fields: [
                    { label: "Effective date",         type: "date", span: 1 },
                    { label: "State",                  type: "select", options: US_STATES, span: 1 },
                    { label: "Form Number",            type: "text", placeholder: "e.g. WC 00 03 01 A", span: 1 },
                    { label: "Name of Alternate Employer", type: "text", placeholder: "Legal name", span: 1 },
                    { label: "Alternate Employer FEIN", type: "text", placeholder: "12-3456789", span: 1 },
                  ] },
  fein:         { blurb: "",                                                fields: [
                    { label: "Effective date", type: "date", span: 1 },
                    { label: "FEIN",           type: "text", placeholder: "12-3456789", span: 1 },
                    { label: "Legal Name",     type: "text", placeholder: "Entity legal name", span: 1 },
                    { label: "DBA",            type: "text", placeholder: "Doing-business-as name", span: 1, optional: true },
                  ] },
  xmod:         { blurb: "Apply or update the experience mod on the policy.",
                  fields: [
                    { label: "Ex-Mod Effective Date", type: "date", span: 1 },
                    { label: "Ex-Mod Factor",         type: "text", placeholder: "e.g. 0.95", span: 1 },
                    { label: "Legal Name",            type: "text", placeholder: "Entity legal name", span: 1 },
                    { label: "DBA",                   type: "text", placeholder: "Doing-business-as name", span: 1, optional: true },
                    { label: "FEIN",                  type: "text", placeholder: "12-3456789", span: 1 },
                    { label: "Rating State(s)",       type: "text", placeholder: "e.g. CA, NV", span: 1 },
                    { label: "Please upload ex-mod worksheet if available", type: "file", span: 2, optional: true },
                  ] },
  location:     { blurb: "Add, edit, or remove a location on the policy. If also changing entity or ownership structure, use the Entity endorsement.",
                  fields: [
                    { label: "Effective date",          type: "date", span: 1 },
                    { label: "Add/Edit/Remove Location", type: "select", options: ["Add", "Edit", "Remove"], span: 1 },
                    { label: "Address",                 type: "text", placeholder: "Street", span: 2 },
                    { label: "City",                    type: "text", placeholder: "City", span: 1 },
                    { label: "State",                   type: "select", options: US_STATES, span: 1 },
                    { label: "Zip",                     type: "text", placeholder: "ZIP", span: 1 },
                    { label: "Legal Name at this location", type: "text", placeholder: "Entity legal name", span: 1 },
                    { label: "DBA",                     type: "text", placeholder: "Doing-business-as name", span: 1, optional: true },
                    { label: "Operations performed at this location", type: "textarea", placeholder: "Describe operations…", span: 2 },
                  ] },
  entity:       { blurb: "Add, edit, or remove an entity on the policy — including ownership, entity type, and location exposure.",
                  fields: [
                    { label: "Effective date",          type: "date", span: 1 },
                    { label: "Add/Edit/Remove Entity",  type: "select", options: ["Add New Entity", "Edit Entity", "Remove Entity"], span: 1 },
                    { label: "Entity Type",             type: "select", options: ENTITY_TYPES, span: 1 },
                    { label: "Other Entity Type (if Other selected)", type: "text", placeholder: "Describe entity type", span: 1, optional: true },
                    { label: "Legal Name",              type: "text", placeholder: "Entity legal name", span: 1 },
                    { label: "DBA",                     type: "text", placeholder: "Doing-business-as name", span: 1, optional: true },
                    { label: "FEIN",                    type: "text", placeholder: "12-3456789", span: 1 },
                    { label: "Entity Location — Address", type: "text", placeholder: "Street", span: 2 },
                    { label: "City",                    type: "text", placeholder: "City", span: 1 },
                    { label: "State",                   type: "select", options: US_STATES, span: 1 },
                    { label: "Zip",                     type: "text", placeholder: "ZIP", span: 1 },
                    { label: "Operations performed at this location", type: "textarea", placeholder: "Describe operations…", span: 2 },
                  ] },
  reinstate:    { blurb: "Request reinstatement of a cancelled policy.",   fields: [
                    { label: "Effective date",        type: "date", span: 1 },
                    { label: "Reinstatement Request", type: "text", placeholder: "Reason for reinstatement", span: 2 },
                    { label: "Upload Acord 37 No Loss Statement", type: "file", span: 2, optional: true },
                  ] },
  cancel:       { blurb: "Cancel the policy on or after a specific date.", fields: [
                    { label: "Effective date",      type: "date", span: 1 },
                    { label: "Cancellation Reason", type: "select",
                      options: [
                        "Coverage placed elsewhere",
                        "Ownership Change / Business Sold",
                        "Completed Operations - No Employees",
                        "Retiring / Out of Business",
                        "Rewritten",
                        "Other",
                      ],
                      span: 1 },
                    { label: "Upload Acord 35 LPR / Replacement Coverage Document", type: "file", span: 2 },
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
  onBack?: () => void;
  // Set true when opening the board to review an already-submitted request
  // (e.g. from the "View Existing" chooser on the Endorsements landing) so it
  // opens straight in the submitted-recap view instead of the fresh intake.
  initialSubmitted?: boolean;
  // Fired from the recap page's "Submit a new Request" CTA. Parents use this
  // to remount the board in fresh-intake mode with the same policy still
  // selected — instead of falling back to onBack which returns to search.
  onNewRequest?: () => void;
  // Per-request seed used when opening the recap for a specific past
  // submission (e.g. clicking a row in "Recent endorsement requests").
  // When set, overrides the built-in demo batch so each row lands on
  // its own cards + values + submitted date. Only read when
  // `initialSubmitted` is true.
  submittedSeed?: {
    selected: EndorsementKey[];
    values: Record<string, Record<number, string>>;
    submittedOn?: string;
  };
}

export default function EndorsementBoard({ isDark, onBack, initialSubmitted = false, onNewRequest, submittedSeed }: Props) {
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

  // When opening for a review of an existing request, seed a plausible sample
  // batch (Contact Info + Mailing Address + Officer + Class Code) so the recap
  // reads as a real multi-change submission. A real backend hook-up would
  // replace this with the actual submission's data.
  const [selected, setSelected] = useState<Set<EndorsementKey>>(
    initialSubmitted
      ? new Set<EndorsementKey>(submittedSeed?.selected ?? ["contact", "mailing", "officer", "classcode"])
      : new Set<EndorsementKey>()
  );
  const [activeKey, setActiveKey] = useState<EndorsementKey | null>(
    initialSubmitted ? (submittedSeed?.selected?.[0] ?? "contact") : null
  );
  // Refs to each section card so sidebar clicks can smooth-scroll to them.
  const sectionRefs = useRef<Partial<Record<EndorsementKey, HTMLElement | null>>>({});
  const jumpToSection = (k: EndorsementKey) => {
    setActiveKey(k);
    sectionRefs.current[k]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  // Default recap seed (used by the "View Existing" chooser). Hoisted out
  // of the useState initializer so the SWC parser doesn't mis-read the
  // `??` fallback's multi-property object literal as a destructuring
  // pattern.
  const defaultSubmittedValues: Record<string, Record<number, string>> = {
    contact: {
      0: "08/07/2026",         // Effective date
      1: "Insured",            // Contact
      2: "Sean",               // First Name
      3: "Byrne",              // Last Name
      4: "(916) 772-9200",     // Phone Number
      5: "sbyrne@btisinc.com", // Email Address
    },
    mailing: {
      0: "08/07/2026",         // Effective date
      1: "587 Test St.",       // Street
      2: "Sacramento",         // City
      3: "CA",                 // State
      4: "95814",              // ZIP
    },
    officer: {
      0: "08/07/2026",         // Effective date
      1: "Jordan",             // First Name
      2: "Reeves",             // Last Name
      3: "President",          // Title
      4: "Excluded",           // Included / Excluded
    },
    classcode: {
      0: "08/07/2026",         // Effective date
      1: "Adding a new low-wage electrical worker; office role removed after Q2 restructuring.", // Reason
      2: "587 Test St.",       // Location address
      3: "Sacramento",         // City
      4: "CA",                 // State
      5: "95814",              // Zip
    },
  };
  const [values, setValues] = useState<Record<string, Record<number, string>>>(
    initialSubmitted
      ? (submittedSeed?.values ?? defaultSubmittedValues)
      : {}
  );
  const [addOpen, setAddOpen] = useState(false);
  const [addPicks, setAddPicks] = useState<Set<EndorsementKey>>(new Set());
  // Single universal supporting block for the whole request (matches Option 1).
  const [notes, setNotes] = useState("");
  const [fileAttached, setFileAttached] = useState<string[]>([]);
  // Class Code / Payroll repeatable rows — each row picks an action
  // (Add / Edit / Remove) and captures its own code + payroll + FT/PT.
  // Remove greys out the numeric cells; only the class code is required.
  // Excel spec (Class Code-Payroll sheet): Action dropdown is
  // "(Add Class Code) (Remove Class Code) (Edit Payroll)" — payroll & FT/PT
  // grey out when Remove Class Code is picked.
  type CcAction = "Add Class Code" | "Remove Class Code" | "Edit Payroll";
  type CcRow = { action: CcAction; code: string; payroll: string; ft: string; pt: string };
  const emptyCcRow = (): CcRow => ({ action: "Add Class Code", code: "", payroll: "", ft: "", pt: "" });
  // Per-card class-code grid state. classcode / location / entity all use the
  // same repeat-row shape but each maintains its own rows so edits stay scoped.
  type CcCard = "classcode" | "location" | "entity";
  const [ccRowsByCard, setCcRowsByCard] = useState<Record<CcCard, CcRow[]>>({
    classcode: [emptyCcRow(), emptyCcRow()],
    location:  [emptyCcRow(), emptyCcRow()],
    entity:    [emptyCcRow(), emptyCcRow()],
  });
  const getCcRows = (card: CcCard) => ccRowsByCard[card];
  const setCcRowsForCard = (card: CcCard, updater: (rs: CcRow[]) => CcRow[]) =>
    setCcRowsByCard(prev => ({ ...prev, [card]: updater(prev[card]) }));

  // Entity Ownership grid — repeatable rows per Excel spec's Ownership
  // Information section (First / Last / Title / Ownership % / Incl-Excl).
  type OwnerRow = { first: string; last: string; title: string; pct: string; status: "Included" | "Excluded" };
  const emptyOwnerRow = (): OwnerRow => ({ first: "", last: "", title: "", pct: "", status: "Included" });
  const [entityOwners, setEntityOwners] = useState<OwnerRow[]>([emptyOwnerRow()]);
  // Additional officer entries on the Officer card. The primary officer's
  // data lives in the flat CARD_META fields (First / Last / Title / Status);
  // any extras added via "+ Add another officer" get their own row here so
  // the intake can capture multiple officer changes in a single request.
  type OfficerExtra = { eff: string; first: string; last: string; title: string; status: "Included" | "Excluded" };
  const emptyOfficerExtra = (): OfficerExtra => ({ eff: "", first: "", last: "", title: "", status: "Included" });
  const [officerExtras, setOfficerExtras] = useState<OfficerExtra[]>([]);
  // Additional class-code / payroll / employee entries for a Specific
  // Waiver of Subrogation. The primary set lives in the flat CARD_META
  // fields (Class Code / Payroll / Employees at Jobsite); extras added
  // via "+ Add another class code" append here so one waiver can cover
  // multiple class codes on the same jobsite.
  type WaiverClassExtra = { code: string; payroll: string; employees: string };
  const emptyWaiverClassExtra = (): WaiverClassExtra => ({ code: "", payroll: "", employees: "" });
  const [waiverClassExtras, setWaiverClassExtras] = useState<WaiverClassExtra[]>([]);
  // Collapsible section headers in the left rail — all open by default.
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["request", "policy", "help"]));
  // Preview-before-submit + top-right confirmation toast + submitted-state
  // (post-send view replaces the intake with a read-only summary).
  const [previewOpen, setPreviewOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [submitted, setSubmitted] = useState(initialSubmitted);

  const orderedSelected = useMemo(() => {
    const order = NAV.flatMap(g => g.items.map(it => it.key));
    return order.filter(k => selected.has(k));
  }, [selected]);

  // Only required (non-optional) fields count toward the progress gate; the
  // universal comment/upload appended for non-SKIP types is optional and
  // never blocks submit.
  // Class Code / Payroll has a repeatable-row grid on top of the flat
  // fields; count it as one extra required item satisfied by any row that
  // has a class code entered.
  const isCcCard = (k: EndorsementKey): k is CcCard => k === "classcode" || k === "location" || k === "entity";
  const ccHasValidRow = (card: CcCard) => getCcRows(card).some(r => r.code.trim().length > 0);
  const entityHasValidOwner = () => entityOwners.some(o => o.first.trim().length > 0);
  // "At-least-one-of" gates: cards where a group of otherwise-optional fields
  // must have at least one filled to submit. Enforced as a single extra
  // required item in the doneCount / requiredCount math so the progress
  // counter reads truthfully without user-facing footnote copy.
  const AT_LEAST_ONE: Partial<Record<EndorsementKey, number[]>> = {
    contact:      [2, 3, 4, 5], // First / Last / Phone / Email
    namedinsured: [3, 4],       // New Legal Name / New DBA
  };
  const hasAnyOf = (k: EndorsementKey, idxs: number[]) =>
    idxs.some(i => (values[k]?.[i] ?? "").trim().length > 0);
  // Location Remove mode hides Legal Name (6) / DBA (7) / Operations (8)
  // and drops the class-code grid — those requirements should not block
  // submit for a location being removed.
  const locationRemoveMode = () => (values["location"]?.[1] ?? "") === "Remove";
  // Entity Remove mode: only the identifying fields (Legal Name + FEIN)
  // are needed to point us at which entity to drop. Entity type, address,
  // operations, ownership grid, and class-code grid all fall away.
  const entityAction = () => values["entity"]?.[1] ?? "";
  const entityRemoveMode = () => entityAction() === "Remove Entity";
  const ENTITY_REMOVE_HIDDEN = new Set([2, 3, 5, 7, 8, 9, 10, 11]); // Type, Other Type, DBA, Address, City, State, Zip, Operations
  // Waiver of Subrogation: fields 2..14 belong to the holder / jobsite /
  // class-code block. They only apply when Specific is chosen — Blanket
  // waivers don't need them, so we hide the whole block. When Specific
  // is chosen, the same fields become required (Excel spec).
  const waiverType = () => values["waiver"]?.[1] ?? "";
  const isWaiverExtra = (i: number) => i >= 2 && i <= 14;
  const isHiddenField = (k: EndorsementKey, i: number) => {
    if (k === "location" && locationRemoveMode() && (i === 6 || i === 7 || i === 8)) return true;
    if (k === "waiver" && waiverType() === "Blanket" && isWaiverExtra(i)) return true;
    // Entity: "Other Entity Type" is a follow-up only meaningful when the
    // Entity Type dropdown (idx 2) is set to "Other" — hide otherwise.
    if (k === "entity" && i === 3 && (values["entity"]?.[2] ?? "") !== "Other") return true;
    return false;
  };
  const isForcedRequired = (k: EndorsementKey, i: number) =>
    k === "waiver" && waiverType() === "Specific" && isWaiverExtra(i);
  const doneCount = (k: EndorsementKey) => {
    const base = CARD_META[k].fields.reduce((n, f, i) => {
      if (isHiddenField(k, i)) return n;
      const req = !f.optional || isForcedRequired(k, i);
      return n + (req && (values[k]?.[i] ?? "").trim() ? 1 : 0);
    }, 0);
    let extra = 0;
    if (isCcCard(k) && !(k === "location" && locationRemoveMode()) && ccHasValidRow(k)) extra += 1;
    if (k === "entity" && entityHasValidOwner()) extra += 1;
    const oneOf = AT_LEAST_ONE[k];
    if (oneOf && hasAnyOf(k, oneOf)) extra += 1;
    return base + extra;
  };
  const requiredCount = (k: EndorsementKey) => {
    const base = CARD_META[k].fields.filter((f, i) => (!f.optional || isForcedRequired(k, i)) && !isHiddenField(k, i)).length;
    let extra = 0;
    if (isCcCard(k) && !(k === "location" && locationRemoveMode())) extra += 1;  // class-code grid
    if (k === "entity") extra += 1;      // ownership grid
    if (AT_LEAST_ONE[k]) extra += 1;     // at-least-one-of guardrail
    return base + extra;
  };
  const totalRequired = orderedSelected.reduce((sum, k) => sum + requiredCount(k), 0);
  const totalDone     = orderedSelected.reduce((sum, k) => sum + doneCount(k), 0);
  const submitReady   = orderedSelected.length > 0 && totalRequired === totalDone;

  // Opens a printable HTML window with the Norbielink logo + full request
  // recap and triggers the browser print dialog so the user saves as PDF.
  // Shared across the hero circular icon, the bottom Download button, and
  // any future entry points.
  const downloadCopy = () => {
    const esc = (s: string) => s.replace(/[&<>"']/g, m => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[m] as string));
    const groups = orderedSelected.map(k => {
      const meta = findMeta(k);
      const cm = CARD_META[k];
      const rows = cm.fields.map((f, i) => `
        <tr>
          <td class="lbl">${esc(f.label)}${f.optional ? ' <span class="opt">(optional)</span>' : ''}</td>
          <td class="val">${esc((values[k]?.[i] ?? "").trim() || "—")}</td>
        </tr>`).join("");
      return `
        <section class="card">
          <div class="eyebrow">${esc(meta.group)}</div>
          <h2>${esc(meta.label)}</h2>
          <table>${rows}</table>
        </section>`;
    }).join("");
    const win = window.open("", "_blank", "noopener,noreferrer,width=900,height=1100");
    if (!win) return;
    win.document.write(`<!doctype html>
<html><head><meta charset="utf-8"><title>Endorsement request · Byrne Insurance Group</title>
<style>
  @page { margin: 20mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1F2937; margin: 0; padding: 24px 32px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 16px; border-bottom: 1px solid #E5E7EB; }
  header img { height: 34px; }
  header .stamp { font-size: 11px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; }
  h1 { font-size: 22px; margin: 24px 0 4px; }
  .policy { color: #A614C3; font-weight: 600; font-size: 13px; letter-spacing: 0.01em; }
  .card { border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px 20px; margin: 16px 0; page-break-inside: avoid; }
  .eyebrow { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #6B7280; margin-bottom: 4px; }
  h2 { font-size: 16px; margin: 0 0 12px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 6px 0; font-size: 13px; vertical-align: top; border-bottom: 1px dashed #F3F4F6; }
  td:last-child { padding-left: 12px; }
  tr:last-child td { border-bottom: none; }
  .lbl { color: #6B7280; width: 42%; }
  .opt { color: #9CA3AF; font-size: 11px; }
  .val { color: #1F2937; word-break: break-word; }
  footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #E5E7EB; font-size: 11px; color: #9CA3AF; text-align: center; }
</style></head><body>
  <header>
    <img src="${window.location.origin}/norbielink-logo.svg" alt="Norbielink" />
    <span class="stamp">Endorsement request</span>
  </header>
  <h1>Byrne Insurance Group</h1>
  <div class="policy">7038911131 · VIC00003362</div>
  ${groups}
  <footer>Generated by Norbielink · ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</footer>
  <script>
    const img = document.querySelector("header img");
    const trigger = () => { window.focus(); window.print(); };
    if (img && !img.complete) { img.addEventListener("load", trigger); img.addEventListener("error", trigger); }
    else { trigger(); }
  </script>
</body></html>`);
    win.document.close();
  };

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

  // Renders the repeatable Action / Class Code / Payroll / FT / PT grid used
  // by classcode, location, and entity cards. Each caller shares the shape but
  // maintains its own rows via ccRowsByCard so edits stay scoped.
  // Entity Ownership grid — repeatable rows for the Ownership Information
  // block on the Entity endorsement (Excel spec). First / Last / Title /
  // Ownership % / Included-Excluded, with + Add owner and per-row remove.
  const renderOwnerGrid = () => {
    const cols = "1.1fr 1.1fr 1.1fr 140px 130px 40px";
    return (
      <div className="flex flex-col gap-2" style={{ gridColumn: "span 2" }}>
        <p className="text-[12px]" style={{ fontFamily: FONT, color: c.text, margin: 0, fontWeight: 500 }}>
          Ownership Information <span style={{ color: c.muted, fontWeight: 400 }}>(if adding excluded owners, please attach a signed waiver form)</span>
        </p>
        <div style={{ border: `1px solid ${c.border}`, borderRadius: 10, marginTop: 4 }}>
          <div style={{ display: "grid", gridTemplateColumns: cols, background: c.helperBg, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
            {["First name","Last name","Title","Ownership %","Status",""].map((h, hi) => (
              <div key={hi} style={{ padding: "8px 12px", borderBottom: `1px solid ${c.border}`, fontFamily: FONT, fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: c.muted }}>{h}</div>
            ))}
          </div>
          {entityOwners.map((row, ridx) => {
            const isLast = ridx === entityOwners.length - 1;
            const cellStyle: React.CSSProperties = {
              padding: 0,
              borderBottom: isLast ? "none" : `1px solid ${c.softDivider}`,
              borderRight: `1px solid ${c.softDivider}`,
              display: "flex", alignItems: "stretch", minHeight: 44,
            };
            const rowInputStyle: React.CSSProperties = {
              fontFamily: FONT, fontSize: 13, color: c.text,
              background: "transparent", border: "none", padding: "10px 12px",
              width: "100%", outline: "none",
            };
            const patch = (p: Partial<OwnerRow>) => setEntityOwners(rs => rs.map((r, j) => j === ridx ? { ...r, ...p } : r));
            return (
              <div key={ridx} style={{ display: "grid", gridTemplateColumns: cols, position: "relative" }}>
                <div style={cellStyle}>
                  <input value={row.first} onChange={e => patch({ first: e.target.value })} placeholder="Jane" style={rowInputStyle} />
                </div>
                <div style={cellStyle}>
                  <input value={row.last} onChange={e => patch({ last: e.target.value })} placeholder="Doe" style={rowInputStyle} />
                </div>
                <div style={cellStyle}>
                  <input value={row.title} onChange={e => patch({ title: e.target.value })} placeholder="e.g. President" style={rowInputStyle} />
                </div>
                <div style={cellStyle}>
                  <input
                    value={row.pct}
                    onChange={e => {
                      const d = e.target.value.replace(/\D/g, "").slice(0, 3);
                      patch({ pct: d ? `${d}%` : "" });
                    }}
                    placeholder="e.g. 100%"
                    inputMode="numeric"
                    maxLength={4}
                    style={rowInputStyle}
                  />
                </div>
                <div style={{ ...cellStyle, display: "block" }}>
                  <StyledSelect
                    value={row.status}
                    onChange={v => patch({ status: v as OwnerRow["status"] })}
                    options={["Included", "Excluded"]}
                    labelFor={v => v}
                    triggerStyle={{ ...rowInputStyle, padding: "10px 16px", background: "transparent", border: "none" }}
                    c={{ text: c.text, muted: c.muted, border: c.border, cardBg: c.cardBg, hoverBg: c.hoverBg, razz: c.razz, razzTintBg: c.razzTintBg }}
                    font={{ fontFamily: FONT }}
                  />
                </div>
                <div style={{ ...cellStyle, borderRight: "none", justifyContent: "center" }}>
                  <button
                    type="button"
                    onClick={() => setEntityOwners(rs => rs.length > 1 ? rs.filter((_, j) => j !== ridx) : rs)}
                    title="Remove owner"
                    style={{ background: "transparent", border: "none", color: c.muted, cursor: "pointer", padding: 4, display: "flex", alignItems: "center", justifyContent: "center" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#EF4444")}
                    onMouseLeave={e => (e.currentTarget.style.color = c.muted)}
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setEntityOwners(rs => [...rs, emptyOwnerRow()])}
          style={{
            width: "100%",
            fontFamily: FONT, fontSize: 12.5, fontWeight: 600,
            color: c.razz, background: "transparent",
            border: `1px dashed ${c.border}`, borderRadius: 8,
            padding: "10px 14px", cursor: "pointer", marginTop: 4,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = c.razzTintBg; e.currentTarget.style.borderColor = c.razz; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = c.border; }}
        >
          + Add owner
        </button>
      </div>
    );
  };

  const renderCcGrid = (card: CcCard, opts?: { hideAction?: boolean; addLabel?: string }) => {
    const rows = getCcRows(card);
    // Section headers come straight from the Excel spec ("Please provide
    // exposure for this new location only.", etc.). Class Code / Payroll
    // itself has no header in the spec — it goes directly from the reason
    // field into the grid.
    const CC_HEADERS: Record<CcCard, string | null> = {
      classcode: null,
      location:  "Please provide exposure for this location.",
      entity:    "Please provide exposure for this entity.",
    };
    const header = CC_HEADERS[card];
    // When the parent card is in "Add" mode, every row is implicitly
    // "Add Class Code" — hide the Action column so the user isn't offered
    // a dropdown with only one option.
    const hideAction = opts?.hideAction ?? false;
    const cols = hideAction ? "1.4fr 1fr .6fr .6fr 40px" : "180px 1.4fr 1fr .6fr .6fr 40px";
    const headers = hideAction ? ["Class code","Payroll","FT","PT",""] : ["Action","Class code","Payroll","FT","PT",""];
    return (
      <div className="flex flex-col gap-2" style={{ gridColumn: "span 2" }}>
        {header && (
          <p className="text-[12px]" style={{ fontFamily: FONT, color: c.text, margin: 0, fontWeight: 500 }}>
            {header}
          </p>
        )}
        <div style={{ border: `1px solid ${c.border}`, borderRadius: 10, marginTop: 4 }}>
          <div style={{ display: "grid", gridTemplateColumns: cols, background: c.helperBg, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
            {headers.map((h, hi) => (
              <div key={hi} style={{ padding: "8px 12px", borderBottom: `1px solid ${c.border}`, fontFamily: FONT, fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: c.muted }}>{h}</div>
            ))}
          </div>
          {rows.map((row, ridx) => {
            const isRemove = row.action === "Remove Class Code";
            const isLast = ridx === rows.length - 1;
            const cellStyle: React.CSSProperties = {
              padding: 0,
              borderBottom: isLast ? "none" : `1px solid ${c.softDivider}`,
              borderRight: `1px solid ${c.softDivider}`,
              display: "flex", alignItems: "stretch", minHeight: 44,
            };
            const rowInputStyle: React.CSSProperties = {
              fontFamily: FONT, fontSize: 13, color: c.text,
              background: "transparent", border: "none", padding: "10px 12px",
              width: "100%", outline: "none",
            };
            const patch = (p: Partial<CcRow>) => setCcRowsForCard(card, rs => rs.map((r, j) => j === ridx ? { ...r, ...p } : r));
            return (
              <div key={ridx} style={{ display: "grid", gridTemplateColumns: cols, position: "relative" }}>
                {!hideAction && (
                  <div style={{ ...cellStyle, display: "block" }}>
                    <StyledSelect
                      value={row.action}
                      onChange={v => { const a = v as CcRow["action"]; patch({ action: a, ...(a === "Remove Class Code" ? { payroll: "", ft: "", pt: "" } : {}) }); }}
                      options={["Add Class Code", "Remove Class Code", "Edit Payroll"]}
                      labelFor={v => v}
                      triggerStyle={{ ...rowInputStyle, padding: "10px 16px", background: "transparent", border: "none" }}
                      c={{ text: c.text, muted: c.muted, border: c.border, cardBg: c.cardBg, hoverBg: c.hoverBg, razz: c.razz, razzTintBg: c.razzTintBg }}
                      font={{ fontFamily: FONT }}
                    />
                  </div>
                )}
                <div style={cellStyle}>
                  <input value={row.code} onChange={e => patch({ code: e.target.value.replace(/\D/g, "").slice(0, 4) })} placeholder="e.g. 5190" inputMode="numeric" maxLength={4} style={rowInputStyle} />
                </div>
                <div style={cellStyle}>
                  <input
                    value={row.payroll}
                    onChange={e => {
                      const d = e.target.value.replace(/\D/g, "").slice(0, 10);
                      patch({ payroll: d ? Number(d).toLocaleString("en-US") : "" });
                    }}
                    placeholder="50,000"
                    disabled={isRemove}
                    inputMode="numeric"
                    style={{ ...rowInputStyle, opacity: isRemove ? 0.35 : 1, cursor: isRemove ? "not-allowed" : "text" }}
                  />
                </div>
                <div style={cellStyle}>
                  <input value={row.ft} onChange={e => patch({ ft: e.target.value.replace(/\D/g, "").slice(0, 3) })} placeholder="0" disabled={isRemove} inputMode="numeric" maxLength={3} style={{ ...rowInputStyle, opacity: isRemove ? 0.35 : 1, cursor: isRemove ? "not-allowed" : "text" }} />
                </div>
                <div style={cellStyle}>
                  <input value={row.pt} onChange={e => patch({ pt: e.target.value.replace(/\D/g, "").slice(0, 3) })} placeholder="0" disabled={isRemove} inputMode="numeric" maxLength={3} style={{ ...rowInputStyle, opacity: isRemove ? 0.35 : 1, cursor: isRemove ? "not-allowed" : "text" }} />
                </div>
                <div style={{ ...cellStyle, borderRight: "none", justifyContent: "center" }}>
                  <button
                    type="button"
                    onClick={() => setCcRowsForCard(card, rs => rs.length > 1 ? rs.filter((_, j) => j !== ridx) : rs)}
                    title="Remove line"
                    style={{ background: "transparent", border: "none", color: c.muted, cursor: "pointer", padding: 4, display: "flex", alignItems: "center", justifyContent: "center" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#EF4444")}
                    onMouseLeave={e => (e.currentTarget.style.color = c.muted)}
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setCcRowsForCard(card, rs => [...rs, emptyCcRow()])}
          style={{
            width: "100%",
            fontFamily: FONT, fontSize: 12.5, fontWeight: 600,
            color: c.razz, background: "transparent",
            border: `1px dashed ${c.border}`, borderRadius: 8,
            padding: "10px 14px", cursor: "pointer", marginTop: 4,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = c.razzTintBg; e.currentTarget.style.borderColor = c.razz; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = c.border; }}
        >
          + {opts?.addLabel ?? "Add line"}
        </button>
      </div>
    );
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
          onClick={onBack}
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

      {/* Post-submit view — mirrors the intake's 3-column shell so the
          transition from editing → submitted feels like the same page.
          LEFT: policy + committed-changes list (all checked). CENTER:
          success card + per-change recap. RIGHT: confirmation + actions. */}
      {submitted && (
        <div className="flex flex-1 min-h-0">
          {/* LEFT rail — mirrors the intake sidebar, everything green now. */}
          <aside className="flex-shrink-0 overflow-y-auto"
            style={{ width: 220, background: c.pageBg, borderRight: `1px solid ${c.border}`, padding: "24px 10px 16px" }}>
            <div className="px-2 pb-3 mb-3" style={{ borderBottom: `1px solid ${c.border}` }}>
              <div className="text-[13.5px] font-semibold leading-tight truncate" style={{ fontFamily: FONT, color: c.text, letterSpacing: "-0.01em" }}>
                Byrne Insurance Group
              </div>
              <div className="text-[12px] mt-1.5 leading-tight" style={{ fontFamily: FONT, color: c.razz, fontWeight: 500 }}>
                7038911131 · VIC00003362
              </div>
            </div>
            <div className="px-2 mb-3">
              <span className="text-[10.5px] font-bold uppercase tracking-wider" style={{ fontFamily: FONT, color: c.muted, letterSpacing: "0.08em" }}>Submitted changes</span>
            </div>
            <div className="flex flex-col px-2">
              {orderedSelected.map(k => {
                const meta = findMeta(k);
                return (
                  <div key={k} className="flex items-center gap-2 py-2" style={{
                    fontFamily: FONT, fontSize: 12.5, fontWeight: 500, color: c.text,
                  }}>
                    <Check className="w-3 h-3 flex-shrink-0" strokeWidth={3} style={{ color: "#73C9B7" }} />
                    <span className="flex-1 truncate">{meta.label}</span>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* CENTER — success hero + recap cards. Right panel actions were
              hoisted into this hero so the layout is a single column instead
              of a lonely side-panel. */}
          <main className="flex-1 min-w-0 overflow-y-auto" style={{ padding: "24px 28px" }}>
            <div className="flex flex-col gap-4">
              {(() => {
                return (
                  <div className="rounded-2xl px-6 py-5 flex items-start gap-3"
                    style={{ background: c.cardBg, border: `1px solid ${c.border}`, boxShadow: isDark ? "none" : "0 1px 2px rgba(15,23,42,0.04)" }}>
                    <span className="flex-shrink-0 flex items-center justify-center rounded-full" style={{ width: 36, height: 36, background: isDark ? "rgba(115,201,183,0.22)" : "rgba(115,201,183,0.18)" }}>
                      <Check className="w-4 h-4" strokeWidth={3} style={{ color: isDark ? "#73C9B7" : "#0F7A63" }} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[16px] font-bold" style={{ fontFamily: FONT, color: c.text }}>
                        {initialSubmitted ? "Submitted request" : "Request submitted"}
                      </h3>
                      <p className="text-[12.5px] mt-1" style={{ fontFamily: FONT, color: c.muted, lineHeight: 1.5 }}>
                        {initialSubmitted
                          ? `Submitted ${submittedSeed?.submittedOn ?? "Jul 24, 2026"}. Print a copy for your records or start a new request below.`
                          : "A copy has been emailed to your inbox. Our team will follow up if anything else is needed."}
                      </p>
                    </div>
                    {/* Quick circular download shortcut — same action as the
                        Download button after the recap; sits in the top-right
                        of the hero so users can grab a copy without scrolling. */}
                    <button
                      type="button"
                      onClick={downloadCopy}
                      title="Print"
                      aria-label="Print"
                      className="flex-shrink-0 inline-flex items-center justify-center rounded-full transition-colors"
                      style={{
                        width: 28, height: 28,
                        background: "transparent",
                        border: `1px solid ${c.border}`,
                        color: c.muted,
                        cursor: "pointer",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = c.hoverBg; e.currentTarget.style.color = c.razz; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = c.muted; }}
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })()}

              {orderedSelected.map(k => {
                const meta = findMeta(k);
                const cm = CARD_META[k];
                return (
                  <section key={k} className="rounded-2xl"
                    style={{ background: c.cardBg, border: `1px solid ${c.border}`, boxShadow: isDark ? "none" : "0 1px 2px rgba(15,23,42,0.04)" }}>
                    <div className="flex items-center gap-3 px-6 pt-5 pb-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-[10.5px] font-bold uppercase tracking-wider mb-1" style={{ fontFamily: FONT, color: c.muted, letterSpacing: "0.08em" }}>{meta.group}</div>
                        <h2 className="text-[16px] font-semibold" style={{ fontFamily: FONT, color: c.text }}>{meta.label}</h2>
                      </div>
                    </div>
                    <div className="px-6 pb-5">
                      <div className="flex flex-col gap-1.5">
                        {cm.fields.map((f, i) => {
                          const v = (values[k]?.[i] ?? "").trim();
                          return (
                            <div key={f.label} className="flex items-start gap-3 text-[13px]" style={{ fontFamily: FONT, color: c.text }}>
                              <span className="w-[42%] flex-shrink-0" style={{ color: c.muted }}>
                                {f.label}{f.optional && <span style={{ color: c.sub }}> (optional)</span>}
                              </span>
                              <span className="flex-1 min-w-0" style={{ color: v ? c.text : c.sub, wordBreak: "break-word" }}>{v || "—"}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </section>
                );
              })}

              {/* Bottom action row — full-size buttons after the recap so
                  they sit at the visual "end" of the submitted request.
                  Split left/right so Download reads as secondary and
                  Back to Endorsements is the primary end-of-flow action. */}
              <div className="flex items-center justify-between gap-2 flex-wrap mt-2">
                <button
                  type="button"
                  onClick={downloadCopy}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
                  style={{ fontFamily: FONT, color: c.text, background: c.cardBg, border: `1px solid ${c.border}`, cursor: "pointer" }}
                  onMouseEnter={e => { e.currentTarget.style.background = c.hoverBg; }}
                  onMouseLeave={e => { e.currentTarget.style.background = c.cardBg; }}
                >
                  <Printer className="w-3.5 h-3.5" />Print
                </button>
                {(onNewRequest || onBack) && (
                  <button
                    type="button"
                    onClick={onNewRequest ?? onBack}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all"
                    style={{ fontFamily: FONT, color: "#fff", background: razzGrad, border: "none", cursor: "pointer" }}
                    onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.08)")}
                    onMouseLeave={e => (e.currentTarget.style.filter = "none")}
                  >
                    Submit a new Request
                  </button>
                )}
              </div>
            </div>
          </main>
        </div>
      )}

      {/* Three-column layout: LEFT tree · CENTER cards · RIGHT submit panel */}
      {!submitted && (
      <div className="flex flex-1 min-h-0">
        {/* ── LEFT: nested navigator, softer gray bg, no borders on rows */}
        <aside
          className="flex-shrink-0 overflow-y-auto"
          style={{ width: 220, background: c.pageBg, borderRight: `1px solid ${c.border}`, padding: "24px 10px 16px" }}
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
                fontWeight: 600,
                color: c.razz,
                background: c.razzTintBg,
                border: `1px dashed ${c.razz}`,
                padding: "8px 10px",
                borderRadius: 8,
                cursor: "pointer",
                marginTop: 8,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = razzGrad; e.currentTarget.style.color = "#ffffff"; e.currentTarget.style.borderColor = "transparent"; }}
              onMouseLeave={e => { e.currentTarget.style.background = c.razzTintBg; e.currentTarget.style.color = c.razz; e.currentTarget.style.borderColor = c.razz; }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add more Changes</span>
            </button>
          </div>

        </aside>

        {/* ── CENTER: content cards */}
        <main className="flex-1 min-w-0 overflow-y-auto" style={{ padding: "24px 28px" }}>
          {orderedSelected.length === 0 ? (
            /* Empty-state picker — the change catalog is rendered inline as
                "page 0" so users pick their changes immediately on landing
                instead of hitting a callout + separate popup. Same picker
                UI as the Add-change modal; commits via the same flow. */
            <div className="rounded-2xl flex flex-col"
              style={{ background: c.cardBg, border: `1px solid ${c.border}`, fontFamily: FONT }}>
              <div className="px-7 pt-6 pb-4">
                <h3 className="text-[16px] font-bold mb-0.5" style={{ color: c.text }}>What Are We Changing On This Policy?</h3>
                <p className="text-[12.5px]" style={{ color: c.muted }}>Pick one or more — each becomes a card in the center.</p>
              </div>
              <div className="px-7 pb-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6 items-start">
                  {[
                    [NAV[0]],
                    [NAV[1]],
                    [NAV[2], NAV[3], NAV[4]],
                  ].map((groups, colIdx) => (
                    <div key={colIdx} className="flex flex-col gap-6">
                      {groups.map(g => (
                        <div key={g.label}>
                          <div className="pb-2 mb-2" style={{ fontFamily: FONT, fontSize: 12.5, fontWeight: 700, color: c.text, borderBottom: `1px solid ${c.softDivider}` }}>
                            {g.label}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            {g.items.map(it => {
                              const picked = addPicks.has(it.key);
                              return (
                                <button
                                  key={it.key}
                                  type="button"
                                  onClick={() => togglePick(it.key)}
                                  className="w-full flex items-center gap-2.5 rounded-md transition-colors"
                                  style={{
                                    fontFamily: FONT, textAlign: "left",
                                    background: "transparent",
                                    color: c.text,
                                    padding: "7px 8px",
                                    border: "none",
                                    fontSize: 13,
                                    fontWeight: picked ? 600 : 500,
                                    cursor: "pointer",
                                  }}
                                  onMouseEnter={e => { e.currentTarget.style.background = c.hoverBg; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                                >
                                  <span
                                    className="flex-shrink-0 flex items-center justify-center rounded"
                                    style={{
                                      width: 17, height: 17,
                                      border: picked ? "none" : `1.5px solid ${c.border}`,
                                      background: picked ? razzGrad : "transparent",
                                      transition: "background 120ms",
                                    }}
                                  >
                                    {picked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3.5} />}
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
              {/* Inset divider — sits between the picker grid and the
                  action row without touching the card's rounded edges. */}
              <div className="mx-6" style={{ height: 1, background: c.border }} />
              <div className="flex items-center justify-between px-6 py-3">
                <span className="text-[12px]" style={{ color: c.muted }}>{addPicks.size} selected</span>
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
                        <h2 className="text-[16px] font-semibold" style={{ fontFamily: FONT, color: c.text }}>{meta.label}</h2>
                        {cm.blurb && (
                          <p className="text-[12px] mt-1" style={{ fontFamily: FONT, color: c.muted, lineHeight: 1.5 }}>{cm.blurb}</p>
                        )}
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
                          const showCcGrid = k === "classcode" && i === 1;
                          // Compact every Address / City / State / Zip 4-tuple
                          // onto 2 rows: Address full-width, then City + State
                          // + Zip packed into a nested 3-col grid inside the
                          // span-2 cell attached to Address. Each entry is the
                          // index of the Address field; the following 3 fields
                          // (+1/+2/+3) are treated as City / State / Zip.
                          const ADDR_BLOCKS: Partial<Record<EndorsementKey, number[]>> = {
                            mailing:       [1],  // Street/City/State/ZIP
                            classcode:     [2],
                            waiver:        [3, 7], // Holder block + Jobsite block
                            thirdpartynoc: [2],
                            location:      [2],
                            entity:        [7],
                          };
                          const addrIdxs = ADDR_BLOCKS[k] ?? [];
                          if (addrIdxs.some(a => i === a + 1 || i === a + 2 || i === a + 3)) return null;
                          // Location Remove mode: hide Legal Name (6),
                          // DBA (7), and Operations (8) — the user is only
                          // identifying which location to drop, not editing
                          // it. Nested-address block (idx 2 + 3/4/5) still
                          // renders so the location can be identified.
                          if (k === "location" && (values["location"]?.[1] ?? "") === "Remove" && (i === 6 || i === 7 || i === 8)) return null;
                          // Waiver of Subrogation: hide the holder / jobsite /
                          // class-code block when Blanket is selected — those
                          // fields only apply to Specific waivers.
                          if (k === "waiver" && waiverType() === "Blanket" && i >= 2 && i <= 14) return null;
                          // Entity: "Other Entity Type" (idx 3) only
                          // renders when Entity Type (idx 2) is "Other".
                          if (k === "entity" && i === 3 && (values["entity"]?.[2] ?? "") !== "Other") return null;
                          const currentAddrIdx = addrIdxs.find(a => a === i);
                          const showCcAddressExtras = currentAddrIdx !== undefined;
                          // Waiver Specific: Class Code / Payroll /
                          // Employees at Jobsite share a 3-col row (same
                          // treatment as City/State/Zip in the address
                          // block). Render at Class Code (11); hide the
                          // next two so they don't lay out separately.
                          const ccTripleStart = k === "waiver" ? 11 : -1;
                          if (k === "waiver" && (i === ccTripleStart + 1 || i === ccTripleStart + 2)) return null;
                          const showCcPayrollTriple = k === "waiver" && i === ccTripleStart;
                          return (
                            <Fragment key={i}>
                              {showCcGrid && renderCcGrid("classcode")}
                              {k === "entity" && i === 7 && renderOwnerGrid()}
                              {k === "fein" && i === 2 && (
                                <p className="text-[12px]" style={{ gridColumn: "span 2", fontFamily: FONT, color: c.text, margin: "4px 0 -4px", fontWeight: 500 }}>
                                  Entity the FEIN applies to
                                </p>
                              )}
                              {k === "reinstate" && i === 2 && (
                                <p className="text-[12px]" style={{ gridColumn: "span 2", fontFamily: FONT, color: c.muted, margin: "4px 0 -4px", lineHeight: 1.5 }}>
                                  A carrier specific no loss statement may be required. If needed, we will reach out.
                                </p>
                              )}
                              {/* Waiver Specific — inline helper before the
                                  Holder name fields: only one holder entity
                                  is allowed per waiver request. Hidden on
                                  Blanket (whole block is hidden anyway). */}
                              {k === "waiver" && i === 2 && waiverType() === "Specific" && (
                                <div className="flex items-start gap-2"
                                  style={{ gridColumn: "span 2", padding: "10px 12px", background: c.helperBg, border: `1px solid ${c.border}`, borderRadius: 8 }}>
                                  <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: c.razz }} />
                                  <p className="text-[12px]" style={{ fontFamily: FONT, color: c.text, lineHeight: 1.5, margin: 0 }}>
                                    Only one entity per waiver request allowed.
                                  </p>
                                </div>
                              )}
                              {/* Waiver Specific — section header directly
                                  above the Class Code / Payroll / Employees
                                  triple so the fields read as one group
                                  tied to the jobsite. */}
                              {k === "waiver" && i === 11 && waiverType() === "Specific" && (
                                <div className="flex items-start gap-2"
                                  style={{ gridColumn: "span 2", padding: "10px 12px", background: c.helperBg, border: `1px solid ${c.border}`, borderRadius: 8, marginTop: 4 }}>
                                  <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: c.razz }} />
                                  <p className="text-[12.5px]" style={{ fontFamily: FONT, color: c.text, lineHeight: 1.5, margin: 0, fontWeight: 600 }}>
                                    Class Code / Payroll associated with job
                                  </p>
                                </div>
                              )}
                              {showCcPayrollTriple && (
                                <div style={{ gridColumn: "span 2", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                                  {[ccTripleStart, ccTripleStart + 1, ccTripleStart + 2].map(subI => {
                                    const subF = cm.fields[subI];
                                    const subVal = values[k]?.[subI] ?? "";
                                    const subCons = constraintFor(subF.label);
                                    const subInputStyle: React.CSSProperties = {
                                      fontFamily: FONT, fontSize: 13, color: c.text,
                                      background: c.cardBg, border: `1px solid ${c.border}`,
                                      borderRadius: 8, padding: "9px 12px", outline: "none", width: "100%",
                                    };
                                    return (
                                      <div key={subI} className="flex flex-col gap-1.5">
                                        <label className="text-[11.5px] font-semibold flex items-center gap-1" style={{ fontFamily: FONT, color: c.text }}>
                                          {subF.label}
                                          {(!subF.optional || isForcedRequired(k, subI)) && <span style={{ color: c.razz }}>*</span>}
                                        </label>
                                        <input
                                          type="text"
                                          value={subVal}
                                          inputMode={subCons?.inputMode}
                                          maxLength={subCons?.maxLength}
                                          onChange={e => setValue(k, subI, subCons ? subCons.format(e.target.value) : e.target.value)}
                                          placeholder={subF.placeholder}
                                          style={subInputStyle}
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            <div className="flex flex-col gap-1.5" style={{ gridColumn: `span ${f.span ?? 2}`, display: showCcPayrollTriple ? "none" : "flex" }}>
                              <label className="text-[11.5px] font-semibold flex items-center gap-1" style={{ fontFamily: FONT, color: c.text }}>
                                {f.label}
                                {(!f.optional || isForcedRequired(k, i)) && <span style={{ color: c.razz }}>*</span>}
                              </label>
                              {f.type === "select" ? (
                                <StyledSelect<string>
                                  value={val}
                                  onChange={v => setValue(k, i, v)}
                                  options={f.options ?? []}
                                  labelFor={v => v || "Select…"}
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
                                (() => {
                                  // Multi-file support — filenames joined by \n
                                  // in the underlying string state so the rest
                                  // of the form model (single string per field)
                                  // stays unchanged. Split for display / remove.
                                  const files = val ? val.split("\n").filter(Boolean) : [];
                                  return (
                                    <div className="flex flex-col gap-1.5">
                                      {files.length > 0 && files.map((name, idx) => (
                                        <div key={`${name}-${idx}`}
                                          className="flex items-center gap-2 rounded-lg px-3 py-2"
                                          style={{ fontFamily: FONT, fontSize: 12.5, color: c.text, background: c.helperBg, border: `1px solid ${c.border}` }}>
                                          <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#0F7A63" }} strokeWidth={3} />
                                          <span className="font-medium truncate flex-1">{name}</span>
                                          <button
                                            type="button"
                                            onClick={e => { e.preventDefault(); const next = files.filter((_, j) => j !== idx); setValue(k, i, next.join("\n")); }}
                                            className="text-[11px] font-medium transition-opacity hover:opacity-70 flex-shrink-0"
                                            style={{ color: c.muted, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
                                          >
                                            Remove
                                          </button>
                                        </div>
                                      ))}
                                      <label
                                        className="flex items-center justify-center gap-2 rounded-lg cursor-pointer transition-colors"
                                        style={{
                                          fontFamily: FONT,
                                          fontSize: 12.5,
                                          color: c.muted,
                                          background: "transparent",
                                          border: `1.5px dashed ${c.border}`,
                                          padding: "16px 12px",
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = c.razz; e.currentTarget.style.background = c.razzTintBg; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.background = "transparent"; }}
                                      >
                                        <input
                                          type="file"
                                          multiple
                                          className="hidden"
                                          onChange={e => {
                                            const picked = Array.from(e.target.files ?? []).map(f => f.name);
                                            if (picked.length) setValue(k, i, [...files, ...picked].join("\n"));
                                            e.currentTarget.value = "";
                                          }}
                                        />
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                                        </svg>
                                        <span>{files.length > 0 ? "Add another file" : "Drag & drop or click to upload"}</span>
                                      </label>
                                    </div>
                                  );
                                })()
                              ) : (
                                (() => {
                                  // Address-shaped fields get the shared
                                  // AddressAutocomplete so users can search
                                  // instead of typing free-form.
                                  const isAddress = /address|street/i.test(f.label);
                                  if (isAddress) {
                                    return (
                                      <AddressAutocomplete
                                        value={val}
                                        onChange={v => setValue(k, i, v)}
                                        onSelect={addr => {
                                          // Batch-fill street + neighbouring
                                          // City / State / ZIP fields in the
                                          // same card when the user picks a
                                          // suggestion.
                                          const streetVal = addr.street || val;
                                          const findIdx = (rx: RegExp) => cm.fields.findIndex(x => rx.test(x.label));
                                          const cityIdx  = findIdx(/^city$/i);
                                          const stateIdx = findIdx(/^state$/i);
                                          const zipIdx   = findIdx(/^zip|postal/i);
                                          setValues(prev => {
                                            const bucket = { ...(prev[k] ?? {}) };
                                            bucket[i] = streetVal;
                                            if (cityIdx  >= 0 && addr.city)  bucket[cityIdx]  = addr.city;
                                            if (stateIdx >= 0 && addr.state) bucket[stateIdx] = addr.state;
                                            if (zipIdx   >= 0 && addr.zip)   bucket[zipIdx]   = addr.zip;
                                            return { ...prev, [k]: bucket };
                                          });
                                        }}
                                        placeholder={f.placeholder}
                                        inputStyle={inputStyle}
                                      />
                                    );
                                  }
                                  // Excel-spec character constraints per field label
                                  // (Phone / FEIN / Class Code / FT / PT / Zip / Ownership %).
                                  // Strips disallowed chars, caps length, and applies
                                  // light auto-formatting where the spec calls for it.
                                  const cons = constraintFor(f.label);
                                  return (
                                    <input
                                      type="text"
                                      value={val}
                                      onChange={e => {
                                        if (!cons) { setValue(k, i, e.target.value); return; }
                                        setValue(k, i, cons.format(e.target.value));
                                      }}
                                      inputMode={cons?.inputMode}
                                      maxLength={cons?.maxLength}
                                      placeholder={f.placeholder}
                                      style={inputStyle}
                                    />
                                  );
                                })()
                              )}
                            </div>
                            {k === "officer" && i === 0 && (
                              <div style={{ gridColumn: "span 1" }} />
                            )}
                            {showCcAddressExtras && currentAddrIdx !== undefined && (
                              <div style={{ gridColumn: "span 2", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                                {[currentAddrIdx + 1, currentAddrIdx + 2, currentAddrIdx + 3].map(subI => {
                                  const subF = cm.fields[subI];
                                  const subVal = values[k]?.[subI] ?? "";
                                  const subCons = constraintFor(subF.label);
                                  const subInputStyle: React.CSSProperties = {
                                    fontFamily: FONT, fontSize: 13, color: c.text,
                                    background: c.cardBg, border: `1px solid ${c.border}`,
                                    borderRadius: 8, padding: "9px 12px", outline: "none", width: "100%",
                                  };
                                  return (
                                    <div key={subI} className="flex flex-col gap-1.5">
                                      <label className="text-[11.5px] font-semibold flex items-center gap-1" style={{ fontFamily: FONT, color: c.text }}>
                                        {subF.label}
                                        {!subF.optional && <span style={{ color: c.razz }}>*</span>}
                                      </label>
                                      {subF.type === "select" ? (
                                        <StyledSelect
                                          value={subVal}
                                          onChange={v => setValue(k, subI, v)}
                                          options={subF.options ?? []}
                                          labelFor={v => v || "Select…"}
                                          triggerStyle={subInputStyle}
                                          c={{ text: c.text, muted: c.muted, border: c.border, cardBg: c.cardBg, hoverBg: c.hoverBg, razz: c.razz, razzTintBg: c.razzTintBg }}
                                          font={{ fontFamily: FONT }}
                                        />
                                      ) : (
                                        <input
                                          type="text"
                                          value={subVal}
                                          inputMode={subCons?.inputMode}
                                          maxLength={subCons?.maxLength}
                                          onChange={e => setValue(k, subI, subCons ? subCons.format(e.target.value) : e.target.value)}
                                          placeholder={subF.placeholder}
                                          style={subInputStyle}
                                        />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            </Fragment>
                          );
                        })}
                        {k === "entity" && renderCcGrid(k)}
                        {k === "waiver" && waiverType() === "Specific" && (() => {
                          const inputStyleXtra: React.CSSProperties = {
                            fontFamily: FONT, fontSize: 13, color: c.text,
                            background: c.cardBg, border: `1px solid ${c.border}`,
                            borderRadius: 8, padding: "9px 12px", outline: "none", width: "100%",
                          };
                          const patchWC = (idx: number, p: Partial<WaiverClassExtra>) =>
                            setWaiverClassExtras(rs => rs.map((r, j) => j === idx ? { ...r, ...p } : r));
                          return (
                            <>
                              {waiverClassExtras.map((row, idx) => (
                                <div key={idx} style={{
                                  gridColumn: "span 2", marginTop: 12, paddingTop: 12,
                                  borderTop: `1px solid ${c.softDivider}`,
                                }}>
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="text-[11.5px] font-bold uppercase tracking-wider" style={{ fontFamily: FONT, color: c.muted, letterSpacing: "0.06em" }}>
                                      Class code {idx + 2}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setWaiverClassExtras(rs => rs.filter((_, j) => j !== idx))}
                                      title="Remove class code"
                                      style={{ background: "transparent", border: "none", color: c.muted, cursor: "pointer", padding: 4, display: "flex", alignItems: "center", justifyContent: "center" }}
                                      onMouseEnter={e => (e.currentTarget.style.color = "#EF4444")}
                                      onMouseLeave={e => (e.currentTarget.style.color = c.muted)}
                                    >
                                      <X className="w-3.5 h-3.5" strokeWidth={2} />
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-3 gap-x-4 gap-y-4">
                                    <div className="flex flex-col gap-1.5">
                                      <label className="text-[11.5px] font-semibold flex items-center gap-1" style={{ fontFamily: FONT, color: c.text }}>
                                        Class Code<span style={{ color: c.razz }}>*</span>
                                      </label>
                                      <input value={row.code} onChange={e => patchWC(idx, { code: e.target.value.replace(/\D/g, "").slice(0, 4) })} placeholder="e.g. 5190" inputMode="numeric" maxLength={4} style={inputStyleXtra} />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                      <label className="text-[11.5px] font-semibold flex items-center gap-1" style={{ fontFamily: FONT, color: c.text }}>
                                        Payroll<span style={{ color: c.razz }}>*</span>
                                      </label>
                                      <input value={row.payroll} onChange={e => { const d = e.target.value.replace(/\D/g, "").slice(0, 10); patchWC(idx, { payroll: d ? Number(d).toLocaleString("en-US") : "" }); }} placeholder="e.g. 50,000" inputMode="numeric" style={inputStyleXtra} />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                      <label className="text-[11.5px] font-semibold flex items-center gap-1" style={{ fontFamily: FONT, color: c.text }}>
                                        Employees at Jobsite<span style={{ color: c.razz }}>*</span>
                                      </label>
                                      <input value={row.employees} onChange={e => patchWC(idx, { employees: e.target.value.replace(/\D/g, "").slice(0, 3) })} placeholder="e.g. 3" inputMode="numeric" maxLength={3} style={inputStyleXtra} />
                                    </div>
                                  </div>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => setWaiverClassExtras(rs => [...rs, emptyWaiverClassExtra()])}
                                className="w-full inline-flex items-center justify-center gap-1.5 py-3 rounded-2xl text-[12.5px] font-semibold transition-colors"
                                style={{
                                  fontFamily: FONT,
                                  color: c.razz,
                                  background: "transparent",
                                  border: `1px dashed ${c.border}`,
                                  cursor: "pointer",
                                  marginTop: 16,
                                  gridColumn: "span 2",
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = c.razzTintBg; e.currentTarget.style.borderColor = c.razz; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = c.border; }}
                              >
                                <Plus className="w-3.5 h-3.5" />Add another class code &amp; payroll
                              </button>
                            </>
                          );
                        })()}
                        {k === "officer" && (() => {
                          const inputStyleXtra: React.CSSProperties = {
                            fontFamily: FONT, fontSize: 13, color: c.text,
                            background: c.cardBg, border: `1px solid ${c.border}`,
                            borderRadius: 8, padding: "9px 12px", outline: "none", width: "100%",
                          };
                          const patchOfficer = (idx: number, p: Partial<OfficerExtra>) =>
                            setOfficerExtras(rs => rs.map((r, j) => j === idx ? { ...r, ...p } : r));
                          return (
                            <>
                              {officerExtras.map((row, idx) => (
                                <div key={idx} style={{
                                  gridColumn: "span 2", marginTop: 12, paddingTop: 12,
                                  borderTop: `1px solid ${c.softDivider}`,
                                }}>
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="text-[11.5px] font-bold uppercase tracking-wider" style={{ fontFamily: FONT, color: c.muted, letterSpacing: "0.06em" }}>
                                      Officer {idx + 2}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setOfficerExtras(rs => rs.filter((_, j) => j !== idx))}
                                      title="Remove officer"
                                      style={{ background: "transparent", border: "none", color: c.muted, cursor: "pointer", padding: 4, display: "flex", alignItems: "center", justifyContent: "center" }}
                                      onMouseEnter={e => (e.currentTarget.style.color = "#EF4444")}
                                      onMouseLeave={e => (e.currentTarget.style.color = c.muted)}
                                    >
                                      <X className="w-3.5 h-3.5" strokeWidth={2} />
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                                    <div className="flex flex-col gap-1.5">
                                      <label className="text-[11.5px] font-semibold flex items-center gap-1" style={{ fontFamily: FONT, color: c.text }}>
                                        Effective date<span style={{ color: c.razz }}>*</span>
                                      </label>
                                      <DatePicker
                                        value={row.eff}
                                        onChange={v => patchOfficer(idx, { eff: v })}
                                        inputStyle={inputStyleXtra}
                                        c={c as unknown as Record<string, string>}
                                        btnGrad={razzGrad}
                                        font={{ fontFamily: FONT }}
                                      />
                                    </div>
                                    <div />

                                    <div className="flex flex-col gap-1.5">
                                      <label className="text-[11.5px] font-semibold flex items-center gap-1" style={{ fontFamily: FONT, color: c.text }}>
                                        First Name<span style={{ color: c.razz }}>*</span>
                                      </label>
                                      <input value={row.first} onChange={e => patchOfficer(idx, { first: e.target.value })} placeholder="Jane" style={inputStyleXtra} />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                      <label className="text-[11.5px] font-semibold flex items-center gap-1" style={{ fontFamily: FONT, color: c.text }}>
                                        Last Name<span style={{ color: c.razz }}>*</span>
                                      </label>
                                      <input value={row.last} onChange={e => patchOfficer(idx, { last: e.target.value })} placeholder="Doe" style={inputStyleXtra} />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                      <label className="text-[11.5px] font-semibold flex items-center gap-1" style={{ fontFamily: FONT, color: c.text }}>
                                        Title<span style={{ color: c.razz }}>*</span>
                                      </label>
                                      <input value={row.title} onChange={e => patchOfficer(idx, { title: e.target.value })} placeholder="e.g. President" style={inputStyleXtra} />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                      <label className="text-[11.5px] font-semibold flex items-center gap-1" style={{ fontFamily: FONT, color: c.text }}>
                                        Included / Excluded<span style={{ color: c.razz }}>*</span>
                                      </label>
                                      <StyledSelect
                                        value={row.status}
                                        onChange={v => patchOfficer(idx, { status: v as OfficerExtra["status"] })}
                                        options={["Included", "Excluded"]}
                                        labelFor={v => v}
                                        triggerStyle={inputStyleXtra}
                                        c={{ text: c.text, muted: c.muted, border: c.border, cardBg: c.cardBg, hoverBg: c.hoverBg, razz: c.razz, razzTintBg: c.razzTintBg }}
                                        font={{ fontFamily: FONT }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => setOfficerExtras(rs => [...rs, emptyOfficerExtra()])}
                                className="w-full inline-flex items-center justify-center gap-1.5 py-3 rounded-2xl text-[12.5px] font-semibold transition-colors"
                                style={{
                                  fontFamily: FONT,
                                  color: c.razz,
                                  background: "transparent",
                                  border: `1px dashed ${c.border}`,
                                  cursor: "pointer",
                                  marginTop: 16,
                                  gridColumn: "span 2",
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = c.razzTintBg; e.currentTarget.style.borderColor = c.razz; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = c.border; }}
                              >
                                <Plus className="w-3.5 h-3.5" />Add another officer
                              </button>
                            </>
                          );
                        })()}
                        {k === "location" && (() => {
                          const locAction = values["location"]?.[1] ?? "";
                          // Remove mode: no class-code exposure needed —
                          // the user is only identifying the location to drop.
                          if (locAction === "Remove") return null;
                          // Add mode: every row is implicitly Add Class Code,
                          // so hide the per-row Action dropdown.
                          // The grid's own "+ Add" button doubles as the
                          // add-another-location entry point for this card.
                          return renderCcGrid("location", {
                            hideAction: locAction === "Add",
                            addLabel: "Add another location",
                          });
                        })()}
                      </div>
                      {cm.footNote && (
                        <p className="text-[11.5px] mt-3" style={{ fontFamily: FONT, color: c.muted, lineHeight: 1.5 }}>{cm.footNote}</p>
                      )}
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
                    <h2 className="text-[16px] font-semibold" style={{ fontFamily: FONT, color: c.text }}>Supporting materials</h2>
                    <p className="text-[12px] mt-1" style={{ fontFamily: FONT, color: c.muted }}>
                      Optional notes and documents that apply to the whole request — the underwriter sees them alongside every change above.
                    </p>
                  </div>
                  <div className="px-6 pb-5 flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11.5px] font-semibold flex items-center gap-1" style={{ fontFamily: FONT, color: c.text }}>
                        Additional comment
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
                      </label>
                      <p className="text-[11.5px]" style={{ fontFamily: FONT, color: c.muted, marginBottom: 4 }}>
                        Attach any forms, letters, or documentation that are required for processing.
                      </p>
                      {/* Multi-file upload — each attached file gets its
                          own row with a remove control; the dashed picker
                          stays under the list so users can add more. */}
                      {fileAttached.length > 0 && (
                        <div className="flex flex-col gap-1.5 mb-1">
                          {fileAttached.map((name, idx) => (
                            <div key={`${name}-${idx}`}
                              className="flex items-center gap-2 rounded-lg px-3 py-2"
                              style={{ fontFamily: FONT, fontSize: 12.5, color: c.text, background: c.helperBg, border: `1px solid ${c.border}` }}>
                              <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#0F7A63" }} strokeWidth={3} />
                              <span className="font-medium truncate flex-1">{name}</span>
                              <button
                                type="button"
                                onClick={() => setFileAttached(prev => prev.filter((_, i) => i !== idx))}
                                className="text-[11px] font-medium transition-opacity hover:opacity-70 flex-shrink-0"
                                style={{ color: c.muted, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <label
                        className="flex items-center justify-center gap-2 rounded-lg cursor-pointer transition-colors"
                        style={{
                          fontFamily: FONT,
                          fontSize: 13,
                          fontWeight: 500,
                          color: c.muted,
                          background: "transparent",
                          border: `1.5px dashed ${c.border}`,
                          padding: "18px 12px",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = c.razz; e.currentTarget.style.background = c.razzTintBg; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.background = "transparent"; }}
                      >
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          onChange={e => {
                            const picked = Array.from(e.target.files ?? []).map(f => f.name);
                            if (picked.length) setFileAttached(prev => [...prev, ...picked]);
                            // Reset the input so the same file can be re-picked
                            // after removing (browsers ignore identical picks).
                            e.currentTarget.value = "";
                          }}
                        />
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c.razz} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                        </svg>
                        <span style={{ color: c.text }}>{fileAttached.length > 0 ? "Add another file" : "Drag & Drop or browse"}</span>
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
                style={{ fontFamily: FONT, color: c.razz, background: "transparent", border: `1px dashed #D1D5DB`, cursor: "pointer" }}
                onMouseEnter={e => { e.currentTarget.style.background = c.razzTintBg; e.currentTarget.style.borderColor = c.razz; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#D1D5DB"; }}
              >
                <Plus className="w-3.5 h-3.5" />Add more Changes
              </button>

              {/* Preview & submit — lives at the bottom of the form so users
                  scroll down to the action instead of hunting for a right
                  panel that isn't there anymore. */}
              <button
                type="button"
                disabled={!submitReady}
                onClick={() => setPreviewOpen(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 py-3 rounded-xl text-[13px] font-semibold transition-all"
                style={submitReady ? {
                  fontFamily: FONT, color: "#fff", background: razzGrad, border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(166,20,195,0.25)",
                } : {
                  fontFamily: FONT, color: c.muted, background: c.helperBg, border: `1px solid ${c.border}`, cursor: "not-allowed",
                }}
                onMouseEnter={e => { if (submitReady) e.currentTarget.style.filter = "brightness(1.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.filter = "none"; }}
              >
                <Send className="w-3.5 h-3.5" />
                {submitReady
                  ? "Preview & submit"
                  : `${totalRequired - totalDone} ${totalRequired - totalDone === 1 ? "field" : "fields"} left`}
              </button>
            </div>
          )}
        </main>
      </div>
      )}

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
            {/* Inset divider — matches the empty-state picker so both
                surfaces read the same way. */}
            <div className="mx-6" style={{ height: 1, background: c.border }} />
            <div className="flex items-center justify-between px-6 py-3">
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

      {/* ── Preview-before-submit modal ─────────────────────────────────
          Summarises every selected change + filled value in one scroll,
          offers a Download (copy of the request) button and a Send
          Now action that closes the modal + fires the top-right toast. */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="rounded-2xl flex flex-col"
            style={{ background: c.cardBg, border: `1px solid ${c.border}`, width: "min(720px, 94vw)", maxHeight: "82vh", boxShadow: "0 20px 50px rgba(0,0,0,0.20)", fontFamily: FONT }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-4">
              <div>
                <h3 className="text-[16px] font-bold mb-0.5" style={{ color: c.text }}>Preview Endorsement Request</h3>
                <p className="text-[12.5px]" style={{ color: c.muted }}>Review everything before it goes to our team.</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="p-1.5 rounded-md transition-colors"
                style={{ color: c.muted, background: "transparent", border: "none", cursor: "pointer" }}
                onMouseEnter={e => { e.currentTarget.style.background = c.hoverBg; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 pb-5 overflow-y-auto">
              {/* Policy header — echoes the sidebar identity block. */}
              <div className="rounded-xl px-4 py-3 mb-4" style={{ background: c.railBg, border: `1px solid ${c.border}` }}>
                <div className="text-[10.5px] font-bold uppercase tracking-wider mb-1" style={{ color: c.muted, letterSpacing: "0.08em" }}>Policy</div>
                <div className="text-[13.5px] font-semibold" style={{ color: c.text }}>Byrne Insurance Group</div>
                <div className="text-[12px] mt-0.5" style={{ color: c.razz, fontWeight: 500 }}>7038911131 · VIC00003362</div>
              </div>

              {/* Per-change summary — label + supporting field values. */}
              <div className="flex flex-col gap-3">
                {orderedSelected.map(k => {
                  const meta = findMeta(k);
                  const cm = CARD_META[k];
                  const rows = cm.fields
                    .map((f, i) => ({ label: f.label, value: (values[k]?.[i] ?? "").trim(), optional: !!f.optional }));
                  return (
                    <div key={k} className="rounded-xl px-4 py-3" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
                      <div className="text-[10.5px] font-bold uppercase tracking-wider mb-2" style={{ color: c.muted, letterSpacing: "0.08em" }}>{meta.group}</div>
                      <div className="text-[14px] font-semibold mb-2" style={{ color: c.text }}>{meta.label}</div>
                      <div className="flex flex-col gap-1.5">
                        {rows.map(r => (
                          <div key={r.label} className="flex items-start gap-3 text-[12.5px]" style={{ color: c.text }}>
                            <span className="w-[42%] flex-shrink-0" style={{ color: c.muted }}>
                              {r.label}{r.optional && <span style={{ color: c.sub }}> (optional)</span>}
                            </span>
                            <span className="flex-1 min-w-0" style={{ color: r.value ? c.text : c.sub, wordBreak: "break-word" }}>
                              {r.value || "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 px-6 py-3" style={{ borderTop: `1px solid ${c.border}` }}>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[12px] font-semibold transition-colors"
                style={{ color: c.text, background: c.cardBg, border: `1px solid ${c.border}`, cursor: "pointer" }}
                onMouseEnter={e => { e.currentTarget.style.background = c.hoverBg; }}
                onMouseLeave={e => { e.currentTarget.style.background = c.cardBg; }}
              >
                Back to editing
              </button>
              <button
                type="button"
                onClick={() => {
                  setPreviewOpen(false);
                  setSubmitted(true);
                  setToastOpen(true);
                  window.setTimeout(() => setToastOpen(false), 6000);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[12px] font-semibold transition-all"
                style={{ color: "#fff", background: razzGrad, border: "none", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.08)")}
                onMouseLeave={e => (e.currentTarget.style.filter = "none")}
              >
                <Send className="w-3.5 h-3.5" />Send now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success toast — top-right, auto-hides after 4.5s. ─────────── */}
      {toastOpen && (
        <div
          className="fixed z-[60] flex items-start gap-3 rounded-xl"
          style={{
            top: 24, right: 24,
            width: 360,
            padding: "12px 14px",
            background: c.cardBg,
            border: `1px solid ${c.border}`,
            boxShadow: "0 12px 32px rgba(15,23,42,0.14)",
            fontFamily: FONT,
          }}
        >
          <span className="flex-shrink-0 flex items-center justify-center rounded-full" style={{ width: 24, height: 24, background: "rgba(115,201,183,0.18)" }}>
            <Check className="w-3.5 h-3.5" strokeWidth={3} style={{ color: "#0F7A63" }} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold" style={{ color: c.text }}>Request submitted</div>
            <div className="text-[12px] mt-0.5" style={{ color: c.muted, lineHeight: 1.5 }}>
              A copy has been emailed to your inbox.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setToastOpen(false)}
            className="p-1 rounded-md flex-shrink-0"
            style={{ color: c.muted, background: "transparent", border: "none", cursor: "pointer" }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
