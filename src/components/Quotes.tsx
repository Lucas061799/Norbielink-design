"use client";

import { useState } from "react";
import { DatePicker } from "./DatePicker";
import { Search, Plus, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ChevronsUpDown, RefreshCw, Download, MessageSquare, MessageCircle, Mail, Phone, Printer, Minus, Maximize2, FileText, FolderOpen, Eye, X, MoreVertical, Calendar, RotateCcw, MoreHorizontal, Check, Columns3, Pencil, Send, UserPlus, ArrowUpRight, Trash2, Sparkles, AlertTriangle, HelpCircle } from "lucide-react";

const FONT = "var(--font-montserrat), Montserrat, sans-serif";

interface QuoteRow {
  id: string;
  created: string;
  submissionId: string;
  applicant: string;
  dba: string;
  effective: string;
  lob: string;
  status: string;
  producer: string;
}

const mockQuotes: QuoteRow[] = [
  { id: "1",  created: "05/01/2024", submissionId: "QAA123456789",   applicant: "Elvis Prestley", dba: "NASA",                   effective: "05/01/2024", lob: "General Liability",    status: "Add'l Insured Request", producer: "Elvis Prestley" },
  { id: "2",  created: "01/01/2024", submissionId: "QAN555666123",   applicant: "Jane Smith",     dba: "VRG Plumbing, LLC",      effective: "01/01/2024", lob: "Worker's Comp",        status: "Sold/Issued",           producer: "Jane Smith" },
  { id: "3",  created: "06/15/2024", submissionId: "QMWC123456789",  applicant: "Joe Smith",      dba: "California Auto Sales",  effective: "06/15/2024", lob: "General Liability",    status: "Declined",              producer: "Joe Smith" },
  { id: "4",  created: "07/01/2024", submissionId: "QMWC111222333",  applicant: "Elvis Prestley", dba: "Restaurant R' Us",       effective: "07/01/2024", lob: "Vacant Risks",         status: "Incomplete",            producer: "Elvis Prestley" },
  { id: "5",  created: "07/01/2024", submissionId: "QMWC111222333",  applicant: "Elvis Prestley", dba: "Restaurant R' Us",       effective: "07/01/2024", lob: "Worker's Comp",        status: "Incomplete",            producer: "Elvis Prestley" },
  { id: "6",  created: "07/01/2024", submissionId: "QMWC111222333",  applicant: "Joe Smith",      dba: "Restaurant R' Us",       effective: "07/01/2024", lob: "General Liability",    status: "Incomplete",            producer: "Joe Smith" },
  { id: "7",  created: "03/01/2025", submissionId: "QAA987654321-1", applicant: "Elvis Prestley", dba: "Iron Gate Fencing",      effective: "03/01/2025", lob: "Vacant Risks",         status: "Upcoming Renewals",     producer: "Elvis Prestley" },
  { id: "8",  created: "03/01/2025", submissionId: "QAA987654321-1", applicant: "Joe Smith",      dba: "Iron Gate Fencing",      effective: "03/01/2025", lob: "Vacant Risks",         status: "Pending/Action Req.",   producer: "Joe Smith" },
  { id: "9",  created: "02/14/2025", submissionId: "QAA246813579",   applicant: "Maria Garcia",   dba: "Sunset Bakery",          effective: "02/14/2025", lob: "Business Owners",      status: "Sold/Issued",           producer: "Maria Garcia" },
  { id: "10", created: "02/20/2025", submissionId: "QMWC246813580",  applicant: "David Chen",     dba: "Dragon Express Logistics", effective: "02/20/2025", lob: "Commercial Auto",    status: "Pending",               producer: "David Chen" },
  { id: "11", created: "04/05/2025", submissionId: "QAN135792468",   applicant: "Sarah Johnson",  dba: "BlueSky Consulting",     effective: "04/05/2025", lob: "Professional Liability", status: "Approved",            producer: "Sarah Johnson" },
  { id: "12", created: "11/12/2024", submissionId: "QMWC998877665",  applicant: "Michael Brown",  dba: "Brown & Sons Roofing",   effective: "11/12/2024", lob: "Worker's Comp",        status: "Sold/Issued",           producer: "Michael Brown" },
  { id: "13", created: "09/03/2024", submissionId: "QAA112233445",   applicant: "Linda Wilson",   dba: "Wilson Dental Group",    effective: "09/03/2024", lob: "Professional Liability", status: "Upcoming Renewals",    producer: "Linda Wilson" },
  { id: "14", created: "12/18/2024", submissionId: "QMP778899001",   applicant: "Elvis Prestley", dba: "Prestley Properties",    effective: "12/18/2024", lob: "Property",             status: "Pending",               producer: "Elvis Prestley" },
  { id: "15", created: "10/25/2024", submissionId: "QCY554433221",   applicant: "Jane Smith",     dba: "Smith Tech Solutions",   effective: "10/25/2024", lob: "Cyber Liability",      status: "Sold/Issued",           producer: "Jane Smith" },
  { id: "16", created: "08/14/2024", submissionId: "QBR667788990",   applicant: "Joe Smith",      dba: "Smith Construction Co.", effective: "08/14/2024", lob: "Builder's Risk",       status: "Declined",              producer: "Joe Smith" },
  { id: "17", created: "01/28/2025", submissionId: "QEX445566778",   applicant: "Robert Taylor",  dba: "Taylor Manufacturing",   effective: "01/28/2025", lob: "Excess",               status: "Pending/Action Req.",   producer: "Robert Taylor" },
  { id: "18", created: "04/10/2025", submissionId: "QBD223344556",   applicant: "Amanda Martinez", dba: "Martinez Contracting",  effective: "04/10/2025", lob: "Bonds",                status: "Approved",              producer: "Amanda Martinez" },
  { id: "19", created: "03/22/2025", submissionId: "QEF889900112",   applicant: "Maria Garcia",   dba: "Garcia Landscaping",     effective: "03/22/2025", lob: "Equipment Floater",    status: "Incomplete",            producer: "Maria Garcia" },
  { id: "20", created: "04/18/2025", submissionId: "QAA778899123",   applicant: "David Chen",     dba: "Dragon Express Logistics", effective: "04/18/2025", lob: "General Liability",  status: "Pending",               producer: "David Chen" },
  { id: "21", created: "04/20/2025", submissionId: "QAN334455667",   applicant: "Sarah Johnson",  dba: "BlueSky Consulting",     effective: "04/20/2025", lob: "Worker's Comp",        status: "Add'l Insured Request", producer: "Sarah Johnson" },
  { id: "22", created: "04/21/2025", submissionId: "QMWC556677889",  applicant: "Michael Brown",  dba: "Brown & Sons Roofing",   effective: "04/21/2025", lob: "General Liability",    status: "Sold/Issued",           producer: "Michael Brown" },
];

const ALL_LOBS = ["All LOBs","General Liability","Worker's Comp","Vacant Risks","Business Owners","Professional Liability","Excess","Bonds","Commercial Auto","Property","Cyber Liability","Builder's Risk","Equipment Floater"];
const QUOTE_STATUSES = ["All Statuses","Sold/Issued","Pending","Approved","Incomplete","Declined","Add'l Insured Request","Upcoming Renewals","Pending/Action Req."];

// Status palette: each status has its own distinct hue so the dot is meaningful
// at a glance. Brand teal + magenta still anchor "done" and "urgent action";
// the other slots use semantic colors (amber/red/blue/orange/emerald/gray).
const STATUS_DOT: Record<string, string> = {
  "Sold/Issued":           "#73C9B7", // brand teal — closed/bound
  "Approved":              "#10B981", // emerald — success/affirmative
  "Pending":               "#F59E0B", // amber — waiting
  "Incomplete":            "#9CA3AF", // gray — missing data
  "Declined":              "#EF4444", // red — terminal failure
  "Pending/Action Req.":   "#A614C3", // brand magenta — urgent action
  "Add'l Insured Request": "#ACD697", // brand sage green — info/request
  "Upcoming Renewals":     "#F97316", // orange — timeline / upcoming
};

// Used by the detail view's heading accent — same palette as the dots.
const STATUS_COLORS: Record<string, string> = STATUS_DOT;

type SortKey = "createdDate" | "submissionId" | "dba" | "effectiveDate";

export default function Quotes({ isDark }: { isDark: boolean }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [applicantFilter, setApplicantFilter] = useState<Set<string>>(new Set());
  const [applicantOpen, setApplicantOpen] = useState(false);
  const [applicantSearch, setApplicantSearch] = useState("");
  const [lobFilter, setLobFilter] = useState<Set<string>>(new Set());
  const [lobOpen, setLobOpen] = useState(false);
  const [lobSearch, setLobSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusSearch, setStatusSearch] = useState("");
  const [producerFilter, setProducerFilter] = useState<Set<string>>(new Set());
  const [producerOpen, setProducerOpen] = useState(false);
  const [producerSearch, setProducerSearch] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState("Past 30 Days");
  const [dateOpen, setDateOpen] = useState(false);
  // Custom-range sub-picker: shown inline inside the dropdown when the user picks
  // "Custom Range". `customFrom` / `customTo` use the native <input type="date">
  // YYYY-MM-DD format; applyCustomRange() reformats to "Mon D – Mon D" for the button.
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [customPickerOpen, setCustomPickerOpen] = useState(false);
  const [pageSizeOpen, setPageSizeOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "tsv" | "xlsx" | "json">("csv");
  const [exportFormatMenuOpen, setExportFormatMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  // Export modal — column selection + scope + preview
  type ExportColKey = "created" | "submissionId" | "applicant" | "dba" | "effective" | "lob" | "status" | "producer";
  const ALL_EXPORT_COLS: { key: ExportColKey; label: string; get: (q: QuoteRow) => string }[] = [
    { key: "created",      label: "Created",       get: q => q.created },
    { key: "submissionId", label: "Submission ID", get: q => q.submissionId },
    { key: "applicant",    label: "Applicant",     get: q => q.applicant },
    { key: "dba",          label: "DBA",           get: q => q.dba },
    { key: "effective",    label: "Effective",     get: q => q.effective },
    { key: "lob",          label: "LOB",           get: q => q.lob },
    { key: "status",       label: "Status",        get: q => q.status },
    { key: "producer",     label: "Producer",      get: q => q.producer },
  ];
  const DEFAULT_EXPORT_COLS: ExportColKey[] = ["created","submissionId","applicant","dba","effective","lob","status","producer"];
  const [exportCols, setExportCols] = useState<Set<ExportColKey>>(new Set(DEFAULT_EXPORT_COLS));
  const [exportScope, setExportScope] = useState<"filtered" | "all">("filtered");
  // Row-action menu state
  const [rowMenuOpen, setRowMenuOpen] = useState<string | null>(null);
  // Reassign modal
  const [reassignModalFor, setReassignModalFor] = useState<QuoteRow | null>(null);
  const [reassignSearch, setReassignSearch] = useState("");
  const [reassignSelected, setReassignSelected] = useState<string | null>(null);
  const [reassignToast, setReassignToast] = useState<string | null>(null);
  const handleRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
    // Also clear every user-applied filter so a single tap resets the table.
    setSearch("");
    setApplicantFilter(new Set());
    setLobFilter(new Set());
    setStatusFilter(new Set());
    setProducerFilter(new Set());
    setDateRange("Past 30 Days");
    setCustomFrom("");
    setCustomTo("");
    setCustomPickerOpen(false);
    setHiddenCols(new Set());
    setSortKey("createdDate");
    setSortDir("desc");
    setPage(1);
  };
  const COLUMNS: Array<{ key: string; label: string; width: string }> = [
    { key: "created",      label: "Created",       width: "1fr"    },
    { key: "submissionId", label: "Submission ID", width: "1.4fr"  },
    { key: "applicant",    label: "Applicant",     width: "1.15fr" },
    { key: "dba",          label: "DBA",           width: "1.6fr"  },
    { key: "effective",    label: "Effective",     width: "1.05fr" },
    { key: "lob",          label: "LOB",           width: "1.15fr" },
    { key: "status",       label: "Status",        width: "1.2fr"  },
    { key: "producer",     label: "Producer",      width: "1.15fr" },
  ];
  const visibleCols = COLUMNS.filter(c => !hiddenCols.has(c.key));
  const gridTemplate = visibleCols.map(c => c.width).join(" ");

  // Detail view state
  const [view, setView] = useState<"list" | "detail">("list");
  const [selected, setSelected] = useState<QuoteRow | null>(null);
  const [detailTab, setDetailTab] = useState<"uw" | "docs">("uw");
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [actionOpen, setActionOpen] = useState(false);
  const [actionValue, setActionValue] = useState("");
  const [notePanel, setNotePanel] = useState<{ ref: string; date: string; body: string } | null>(null);

  const c = {
    text:         isDark ? "#F9FAFB" : "#1F2937",
    muted:        isDark ? "#8B8FA8" : "#6B7280",
    sub:          isDark ? "#6B7280" : "#9CA3AF",
    cardBg:       isDark ? "#191D35" : "#fff",
    border:       isDark ? "rgba(255,255,255,0.08)" : "#E5E7EB",
    borderSoft:   isDark ? "rgba(255,255,255,0.04)" : "#F3F4F6",
    borderStrong: isDark ? "rgba(255,255,255,0.18)" : "#D1D5DB",
    mutedBg:      isDark ? "rgba(255,255,255,0.03)" : "#FAFAFB",
    hoverBg:      isDark ? "rgba(255,255,255,0.04)" : "#F9FAFB",
    inputBg:      isDark ? "rgba(255,255,255,0.05)" : "#fff",
    chipBg:       isDark ? "rgba(255,255,255,0.05)" : "#F9FAFB",
    accent:       "#A614C3",
    accentSoft:   isDark ? "rgba(166,20,195,0.15)" : "#F5E8FB",
    linkColor:    isDark ? "#4ECDC4" : "#A614C3",
    success:      "#73C9B7",
    successBg:    isDark ? "rgba(115,201,183,0.15)" : "#E8F7F3",
    warn:         "#F59E0B",
    warnBg:       isDark ? "rgba(245,158,11,0.15)" : "#FEF3C7",
    danger:       "#EF4444",
    dangerBg:     isDark ? "rgba(239,68,68,0.15)" : "#FEE2E2",
    textDim:      isDark ? "#6B7280" : "#9CA3AF",
  };
  const btnGrad = isDark
    ? "radial-gradient(171.32% 99.33% at 33.13% -9%, #282550 0%, #191735 55.82%, rgba(0,0,0,0.3) 74%, rgba(0,0,0,0) 100%), linear-gradient(88.34deg, #5C2ED4 0.11%, #A614C3 63.8%)"
    : "linear-gradient(90deg,#5C2ED4 0%,#A614C3 65%)";

  const closeAllDropdowns = () => { setApplicantOpen(false); setLobOpen(false); setStatusOpen(false); setProducerOpen(false); setHelpOpen(false); setViewOpen(false); setDateOpen(false); setCustomPickerOpen(false); setPageSizeOpen(false); setRowMenuOpen(null); };
  const toggleSet = (set: Set<string>, v: string, setter: (s: Set<string>) => void) => { const n = new Set(set); n.has(v) ? n.delete(v) : n.add(v); setter(n); };

  const uniqueApplicants = Array.from(new Set(mockQuotes.map(q => q.applicant))).sort();
  const uniqueProducers  = Array.from(new Set(mockQuotes.map(q => q.producer))).sort();

  const filtered = mockQuotes.filter(q => {
    if (search) {
      const q2 = search.toLowerCase();
      if (!(
        q.submissionId.toLowerCase().includes(q2) ||
        q.applicant.toLowerCase().includes(q2) ||
        q.dba.toLowerCase().includes(q2) ||
        q.lob.toLowerCase().includes(q2) ||
        q.producer.toLowerCase().includes(q2)
      )) return false;
    }
    if (applicantFilter.size > 0 && !applicantFilter.has(q.applicant)) return false;
    if (lobFilter.size > 0 && !lobFilter.has(q.lob)) return false;
    if (statusFilter.size > 0 && !statusFilter.has(q.status)) return false;
    if (producerFilter.size > 0 && !producerFilter.has(q.producer)) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    // Group by status when a multi-status card is active (e.g. "Sold & Approved",
    // "Action Required"). Rows with the same status cluster together; within each
    // group the user's chosen column sort still applies below.
    if (statusFilter.size > 1 && a.status !== b.status) {
      return a.status < b.status ? -1 : 1;
    }
    let av: string | number = ""; let bv: string | number = "";
    if (sortKey === "createdDate")         { av = new Date(a.created).getTime();   bv = new Date(b.created).getTime(); }
    else if (sortKey === "effectiveDate")  { av = new Date(a.effective).getTime(); bv = new Date(b.effective).getTime(); }
    else if (sortKey === "submissionId")   { av = a.submissionId; bv = b.submissionId; }
    else if (sortKey === "dba")            { av = a.dba; bv = b.dba; }
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
  const pageItems = sorted.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(d => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("asc"); }
  };

  const SortArrows = ({ col }: { col: SortKey }) => (
    <span className="inline-flex ml-0.5">
      <svg width="14" height="9" viewBox="0 0 14 9" fill="none">
        <path d="M4 8V1M4 1L2 3M4 1L6 3" stroke={sortKey === col && sortDir === "asc" ? (isDark ? "#fff" : "#374151") : c.sub} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 1V8M10 8L8 6M10 8L12 6" stroke={sortKey === col && sortDir === "desc" ? (isDark ? "#fff" : "#374151") : c.sub} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  );

  const FilterCaret = ({ active }: { active: boolean }) => (
    <span className="inline-flex ml-1">
      <svg width="7" height="5" viewBox="0 0 7 5" fill="none">
        <path d="M3.5 5L0.5 0H6.5L3.5 5Z" fill={active ? "#A614C3" : c.sub}/>
      </svg>
    </span>
  );

  // ── DETAIL VIEW ──
  if (view === "detail" && selected) {
    const expirationDate = (() => {
      const [m, d, y] = selected.effective.split("/");
      return `${m}/${d}/${Number(y) + 1}`;
    })();

    // Reuses the top-level STATUS_DOT palette so the detail header pill
    // matches the table row's dot color for the same status.
    const statusClr = STATUS_DOT[selected.status] ?? c.muted;

    const mockComments = [
      { id: "c1", date: "11/20/2024 2:09:48 PM", ref: "QCN03262409" },
      { id: "c2", date: "11/20/2024 2:09:48 PM", ref: "QCN03262409" },
      { id: "c3", date: "11/20/2024 2:09:48 PM", ref: "QCN03262409" },
    ];
    const mockDocs = [
      { id: "d1", name: "Application.pdf",      type: "Application",  date: "11/20/2024 2:09:48 PM", size: "2.4 MB" },
      { id: "d2", name: "Quote Summary.pdf",    type: "Quote",        date: "11/20/2024 2:09:48 PM", size: "1.2 MB" },
      { id: "d3", name: "Endorsement Form.pdf", type: "Endorsement",  date: "11/20/2024 2:09:48 PM", size: "0.8 MB" },
    ];

    const rowBg = c.mutedBg;
    const toggleComment = (id: string) => {
      const n = new Set(expandedComments);
      n.has(id) ? n.delete(id) : n.add(id);
      setExpandedComments(n);
    };

    return (
      <div className="flex flex-col flex-1 min-h-0" style={{ fontFamily: FONT }} onClick={() => setActionOpen(false)}>
        {/* Section title — sits directly below the topbar */}
        <div className="flex flex-col justify-center flex-shrink-0 mb-12"
          style={{ height: 71, borderBottom: `0.87px solid ${isDark ? "rgba(255,255,255,0.08)" : "#E5E7EB"}`, marginLeft: -48, marginRight: -48, paddingLeft: 28, paddingRight: 28 }}>
          <h1 className="text-[22px] font-normal" style={{ fontFamily: FONT, color: c.text }}>Quotes</h1>
        </div>

        {/* Back button — outside the card */}
        <div className="flex-shrink-0 mb-4">
          <button onClick={() => { setView("list"); setSelected(null); setActionValue(""); setExpandedComments(new Set()); }}
            className="flex items-center gap-1.5 text-[12px] font-medium transition-colors"
            style={{ fontFamily: FONT, color: c.muted }}
            onMouseEnter={e => (e.currentTarget.style.color = c.text)}
            onMouseLeave={e => (e.currentTarget.style.color = c.muted)}>
            <ChevronLeft className="w-4 h-4" />Back to Quotes
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 min-h-0 overflow-y-auto" style={{ marginLeft: -4, marginRight: -4, paddingLeft: 4, paddingRight: 4, paddingBottom: 48 }}>
          {/* ── Unified detail card ── */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: c.cardBg, border: `1px solid ${c.border}`, boxShadow: isDark ? "none" : "0 1px 3px rgba(15,23,42,0.04)" }}>
            {/* Top gradient strip */}
            <div style={{ height: 4, background: "linear-gradient(90deg,#5C2ED4 0%,#A614C3 65%)" }} />

            {/* Header — DBA + status + submission ID + Start a Quote */}
            <div className="flex items-start justify-between gap-4 px-8 pt-7 pb-6">
              <div className="min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-[22px] font-bold leading-tight" style={{ fontFamily: FONT, color: c.text }}>{selected.dba}</h1>
                  <span className="inline-flex items-center gap-1.5 px-2 py-[3px] rounded-md text-[11px] font-medium"
                    style={{ fontFamily: FONT, background: c.chipBg, color: c.text, border: `1px solid ${c.borderSoft}` }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: statusClr }} />
                    {selected.status}
                  </span>
                </div>
                <p className="text-[13px] mt-1" style={{ fontFamily: FONT, color: c.muted }}>
                  {selected.lob} · <span style={{ color: c.linkColor, fontWeight: 600 }}>{selected.submissionId}</span>
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="relative" style={{ width: 220 }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => setActionOpen(o => !o)}
                    className="w-full flex items-center justify-between gap-2 transition-colors outline-none"
                    style={{ fontFamily: FONT, background: c.inputBg, border: `1px solid ${c.border}`, color: actionValue ? c.text : c.sub, padding: "9px 14px", borderRadius: 10, fontSize: 13, cursor: "pointer" }}>
                    <span>{actionValue || "I would like to..."}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${actionOpen ? "rotate-180" : ""}`} style={{ color: c.muted }} />
                  </button>
                  {actionOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-20 rounded-lg shadow-lg overflow-hidden"
                      style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
                      {["Reassign Producer", "Edit/Issue"].map(a => (
                        <button key={a} onClick={() => { setActionValue(a); setActionOpen(false); }}
                          className="w-full text-left px-3 py-2 text-[13px] transition-colors"
                          style={{ fontFamily: FONT, color: c.text }}
                          onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          {a}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  className="flex items-center gap-2 text-[13px] font-semibold text-white"
                  style={{ fontFamily: FONT, background: btnGrad, padding: "9px 18px", borderRadius: 10, transition: "filter 0.15s", boxShadow: "0 4px 14px rgba(166,20,195,0.25)" }}
                  onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.12)")}
                  onMouseLeave={e => (e.currentTarget.style.filter = "none")}>
                  <Plus className="w-4 h-4" />Start a Quote
                </button>
              </div>
            </div>

            {/* Info row — 4 evenly distributed data fields */}
            <div className="px-8 py-6 grid" style={{ borderTop: `1px solid ${c.border}`, background: c.cardBg, gridTemplateColumns: "repeat(4, 1fr)" }}>
              {[
                { label: "Effective Date",  value: selected.effective },
                { label: "Expiration Date", value: expirationDate },
                { label: "Producer",        value: selected.producer },
                { label: "Total Premium",   value: "$40,000" },
              ].map((f, i, arr) => (
                <div key={f.label} className="px-6 first:pl-0" style={i !== arr.length - 1 ? { borderRight: `1px solid ${c.border}` } : undefined}>
                  <div className="text-[11px] uppercase mb-1.5" style={{ fontFamily: FONT, color: c.muted, fontWeight: 600, letterSpacing: "0.06em" }}>{f.label}</div>
                  <div className="text-[16px] font-semibold" style={{ fontFamily: FONT, color: c.text }}>{f.value}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 px-8" style={{ borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}` }}>
              {([
                { k: "uw" as const,   label: "UW Comments", Icon: MessageCircle, iconSize: "w-[13.5px] h-[13.5px]" },
                { k: "docs" as const, label: "Documents",   Icon: FolderOpen,   iconSize: "w-[15px] h-[15px]" },
              ]).map(({ k, label, Icon, iconSize }) => (
                <button key={k} onClick={() => setDetailTab(k)}
                  className="flex items-center gap-1.5 px-4 py-3 text-[13px] font-normal relative transition-colors"
                  style={{ fontFamily: FONT, color: detailTab === k ? (isDark ? "#fff" : "#A614C3") : c.muted, letterSpacing: "0.01em" }}
                  onMouseEnter={e => { if (detailTab !== k) e.currentTarget.style.color = c.text; }}
                  onMouseLeave={e => { if (detailTab !== k) e.currentTarget.style.color = c.muted; }}>
                  <Icon className={iconSize} style={{ color: detailTab === k ? "#A614C3" : undefined }} />
                  {label}
                  {detailTab === k && <div className="absolute bottom-[-1px] left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg,#5C2ED4 0%,#A614C3 65%)" }} />}
                </button>
              ))}
            </div>

            {/* Tab content — inside the unified card */}
            <div className="px-8 py-6">
              {detailTab === "uw" && (
                <div className="flex flex-col gap-3">
                  {mockComments.map(cm => {
                    const expanded = expandedComments.has(cm.id);
                    const body = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna";
                    return (
                      <div key={cm.id} className="rounded-lg overflow-hidden"
                        style={{ background: rowBg, border: `1px solid ${c.border}` }}>
                        <button onClick={() => toggleComment(cm.id)}
                          className="w-full flex items-center justify-between px-6 py-3.5 text-left">
                          <div className="flex items-center gap-16">
                            <span className="text-[13px]" style={{ fontFamily: FONT, color: c.text }}>{cm.date}</span>
                            <span className="text-[13px] font-semibold" style={{ fontFamily: FONT, color: c.linkColor }}>{cm.ref}</span>
                          </div>
                          {expanded
                            ? <Minus className="w-4 h-4" style={{ color: "#A614C3" }} />
                            : <Plus  className="w-4 h-4" style={{ color: "#A614C3" }} />}
                        </button>
                        {expanded && (
                          <div className="mx-4 mb-4 rounded-lg overflow-hidden" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
                            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${c.border}` }}>
                              <div className="text-[12px] font-semibold uppercase" style={{ fontFamily: FONT, color: c.muted, letterSpacing: "0.08em" }}>Text of Email</div>
                              <div className="flex items-center gap-4">
                                <button className="flex items-center gap-1.5 text-[12px] font-semibold transition-opacity hover:opacity-70" style={{ fontFamily: FONT, color: "#A614C3", letterSpacing: "0.06em" }}>
                                  <Printer className="w-4 h-4" />PRINT
                                </button>
                                <button onClick={() => setNotePanel({ ref: cm.ref, date: cm.date, body })} className="transition-opacity hover:opacity-70">
                                  <Maximize2 className="w-4 h-4" style={{ color: "#A614C3" }} />
                                </button>
                              </div>
                            </div>
                            <div className="px-5 py-4 text-[13px] leading-relaxed" style={{ fontFamily: FONT, color: c.text }}>
                              {body}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {detailTab === "docs" && (
                <div className="rounded-xl overflow-hidden" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
                  <div className="grid px-5 py-3 gap-4" style={{ gridTemplateColumns: "1fr 1fr 1fr 60px", borderBottom: `1px solid ${c.border}`, background: c.mutedBg }}>
                    {["Document Name", "Type", "Date", "View"].map((h, i) => (
                      <div key={i} className="text-[11px] font-bold uppercase tracking-wider" style={{ fontFamily: FONT, color: c.muted, textAlign: i === 3 ? "center" : "left" }}>{h}</div>
                    ))}
                  </div>
                  {mockDocs.map((d, i, arr) => (
                    <div key={d.id} className="grid px-5 py-3.5 items-center gap-4 transition-colors"
                      style={{ gridTemplateColumns: "1fr 1fr 1fr 60px", borderBottom: i !== arr.length - 1 ? `1px solid ${c.border}` : "none" }}
                      onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(239,68,68,0.1)" }}>
                          <FileText className="w-4 h-4" style={{ color: "#EF4444" }} />
                        </div>
                        <span className="text-[13px] font-medium truncate" style={{ fontFamily: FONT, color: c.text }}>{d.name}</span>
                      </div>
                      <div className="text-[12px] px-2 py-0.5 rounded-lg" style={{ fontFamily: FONT, color: isDark ? "#4ECDC4" : "#A614C3", background: "rgba(168,85,247,0.08)", display: "inline-block", width: "fit-content" }}>{d.type}</div>
                      <div className="text-[12px]" style={{ fontFamily: FONT, color: c.muted }}>{d.date}</div>
                      <button title="View" className="flex items-center justify-center transition-opacity hover:opacity-70" style={{ color: "#A614C3" }}>
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Side note panel */}
        {notePanel && (
          <>
            <div onClick={() => setNotePanel(null)}
              className="fixed inset-0 z-40 transition-opacity"
              style={{ background: "rgba(0,0,0,0.35)" }} />
            <div className="fixed top-0 right-0 bottom-0 z-50 flex flex-col"
              style={{ width: 480, maxWidth: "90vw", background: c.cardBg, borderLeft: `1px solid ${c.border}`, boxShadow: "-8px 0 30px rgba(0,0,0,0.12)" }}>
              <div className="flex items-center justify-between px-6 pt-6 pb-5 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-wider" style={{ fontFamily: FONT, color: c.muted, fontWeight: 600, letterSpacing: "0.08em" }}>Text of Email</div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[13px] font-semibold" style={{ fontFamily: FONT, color: c.linkColor }}>{notePanel.ref}</span>
                    <span className="text-[12px]" style={{ fontFamily: FONT, color: c.muted }}>{notePanel.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button className="flex items-center gap-1.5 text-[12px] font-semibold transition-opacity hover:opacity-70" style={{ fontFamily: FONT, color: "#A614C3", letterSpacing: "0.06em" }}>
                    <Printer className="w-4 h-4" />PRINT
                  </button>
                  <button onClick={() => setNotePanel(null)} className="p-1 rounded-md transition-colors"
                    onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <X className="w-4 h-4" style={{ color: c.muted }} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-6 pt-8 pb-6 text-[14px] leading-relaxed" style={{ fontFamily: FONT, color: c.text }}>
                {notePanel.body}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Counts per status — for the quick-filter KPI cards.
  // "Sold & Approved" folds Sold/Issued + Approved together so the sales team sees a
  // single closed-business signal (bound OR underwriter-approved-and-about-to-bind).
  const pendingCount       = mockQuotes.filter(q => q.status === "Pending").length;
  const soldCount          = mockQuotes.filter(q => q.status === "Sold/Issued" || q.status === "Approved").length;
  // "Action Required" folds together every status that requires the agent to do something:
  // Pending/Action Req. (explicit), Add'l Insured Request (outstanding request), and
  // Incomplete (submission still missing info). One card, one clear queue of what to work on.
  const actionReqCount     = mockQuotes.filter(q =>
    q.status === "Pending/Action Req." || q.status === "Add'l Insured Request" || q.status === "Incomplete"
  ).length;
  const statusSummary: { keys: string[]; label: string; sub: string; count: number }[] = [
    // "Total Quotes" (All Statuses) intentionally removed — the breakdown cards (Pending /
    // Sold & Approved / Action Required) are the actionable signals; a total count of every
    // submission doesn't drive any decision and pushed the row to 5 KPIs + 1 CTA, which felt
    // crowded. The Start-a-Quote CTA tile (rendered after this map) now completes a clean
    // 4-tile row alongside the 3 status breakdowns.
    { keys: ["Pending"],                                                       label: "Pending",          sub: "In progress",          count: pendingCount   },
    { keys: ["Sold/Issued", "Approved"],                                       label: "Sold & Approved",  sub: "Bound this period",    count: soldCount      },
    { keys: ["Pending/Action Req.", "Add'l Insured Request", "Incomplete"],    label: "Action Required",  sub: "Needs your attention", count: actionReqCount },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0" style={{ fontFamily: FONT }} onClick={closeAllDropdowns}>
      {/* Section title — sits directly below the topbar. Title-only by design; the page's
          primary action (Start a Quote) lives at the right end of the toolbar where the
          filter / table-action controls are clustered, fenced off by a vertical divider so
          it reads as a distinct primary action rather than just another button. */}
      <div className="flex flex-col justify-center flex-shrink-0 mb-12"
        style={{ height: 71, borderBottom: `0.87px solid ${isDark ? "rgba(255,255,255,0.08)" : "#E5E7EB"}`, marginLeft: -48, marginRight: -48, paddingLeft: 28, paddingRight: 28 }}>
        <h1 className="text-[22px] font-normal" style={{ fontFamily: FONT, color: c.text }}>Quotes</h1>
      </div>

      {/* Start a Quote — promoted to a 5th tile inside the KPI grid below (no dedicated row).
          The brand gradient + white text inside an otherwise neutral row of count cards makes
          it visually pop without floating in an empty band. */}

      {/* Toolbar — date scope + search, then a divider, then Refresh / View / Export.
          Stays as a standalone row above the table (NOT visually fused with the card).
          Visual order (CSS `order`): CTA row = 1, KPI = 2, toolbar = 3, table = 4. */}
      <div className="flex items-center gap-3 pb-4 mb-3 flex-shrink-0 flex-wrap" style={{ order: 3 }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
          {/* Date scope */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => { closeAllDropdowns(); setDateOpen(o => !o); }}
              className="flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              style={{ background: c.cardBg, border: `1px solid ${c.border}`, color: c.text }}
              onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = c.cardBg)}
            >
              <Calendar className="w-3.5 h-3.5" style={{ color: c.muted }} />
              {dateRange}
              <ChevronDown className="w-3 h-3 transition-transform duration-200" style={{ opacity: 0.6, transform: dateOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
            </button>
            {dateOpen && (() => {
              // Custom range affordance sits below the presets; picking it swaps in
              // two <input type="date"> fields + Apply button. The applied range shows
              // as "Mon D – Mon D" in the trigger button label.
              const DATE_PRESETS = ["Past 7 Days", "Past 30 Days", "Past 90 Days", "Past 6 Months", "Past 12 Months", "All Time"];
              const isCustomActive = !DATE_PRESETS.includes(dateRange);
              return (
              <div
                className="absolute left-0 z-30 rounded-lg overflow-hidden min-w-[200px]"
                style={{
                  top: "calc(100% + 6px)",
                  background: c.cardBg,
                  border: `1px solid ${c.border}`,
                  boxShadow: "0 12px 28px rgba(15,23,42,0.10), 0 4px 8px rgba(15,23,42,0.04)",
                }}
              >
                <div className="py-1">
                {DATE_PRESETS.map(opt => {
                  const active = opt === dateRange;
                  return (
                    <button
                      key={opt}
                      onClick={() => { setDateRange(opt); setCustomPickerOpen(false); setDateOpen(false); }}
                      className="w-full px-2.5 py-1.5 text-left text-[12px] flex items-center gap-2 cursor-pointer transition-colors"
                      style={{ color: active ? c.accent : c.text, fontWeight: active ? 600 : 500, background: "transparent" }}
                      onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <Check className="w-3 h-3 flex-shrink-0" style={{ opacity: active ? 1 : 0, color: c.accent }} />
                      <span className="whitespace-nowrap">{opt}</span>
                    </button>
                  );
                })}
                <button
                  onClick={() => { setCustomPickerOpen(true); setDateOpen(false); }}
                  className="w-full px-2.5 py-1.5 text-left text-[12px] flex items-center gap-2 cursor-pointer transition-colors"
                  style={{ color: (isCustomActive || customPickerOpen) ? c.accent : c.text, fontWeight: (isCustomActive || customPickerOpen) ? 600 : 500, background: "transparent" }}
                  onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <Check className="w-3 h-3 flex-shrink-0" style={{ opacity: isCustomActive ? 1 : 0, color: c.accent }} />
                  <span className="whitespace-nowrap">Custom Range</span>
                </button>
                </div>
              </div>
              );
            })()}
          </div>

          {/* Custom-range inline picker — appears next to the date button when the user
              picks "Custom Range" from the dropdown. Sits in the toolbar instead of inside
              the dropdown so the two DatePickers have room to breathe and the popups can
              open without clipping. */}
          {customPickerOpen && (() => {
            const inputStyle: React.CSSProperties = {
              background: c.cardBg, border: `1px solid ${c.border}`, color: c.text,
              fontFamily: FONT, fontSize: 12, padding: "6px 30px 6px 10px",
              borderRadius: 8, width: 132, outline: "none",
            };
            const formatDate = (mmddyyyy: string) => {
              const [mm, dd, yyyy] = mmddyyyy.split("/");
              if (!mm || !dd || !yyyy) return mmddyyyy;
              return new Date(+yyyy, +mm - 1, +dd).toLocaleDateString("en-US", { month: "short", day: "numeric" });
            };
            const applyCustomRange = () => {
              if (!customFrom || !customTo) return;
              setDateRange(`${formatDate(customFrom)} – ${formatDate(customTo)}`);
              setCustomPickerOpen(false);
            };
            const canApply = !!customFrom && !!customTo;
            return (
              // flex-wrap so the whole picker can flow to a second line on narrow
              // viewports; each label+DatePicker + the Apply/close pair stay glued together
              // as an atomic sub-group so we never split a label from its input.
              <div className="flex items-center gap-x-3 gap-y-2 flex-wrap" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[11px] font-semibold" style={{ color: c.muted }}>From</span>
                  <DatePicker value={customFrom} onChange={setCustomFrom} inputStyle={inputStyle} c={c} btnGrad={btnGrad} font={{ fontFamily: FONT }} />
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[11px] font-semibold" style={{ color: c.muted }}>To</span>
                  <DatePicker value={customTo} onChange={setCustomTo} inputStyle={inputStyle} c={c} btnGrad={btnGrad} font={{ fontFamily: FONT }} />
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    disabled={!canApply}
                    onClick={applyCustomRange}
                    className="text-[12px] font-semibold px-3 py-1.5 rounded-lg text-white transition-opacity"
                    style={{ background: btnGrad, fontFamily: FONT, opacity: canApply ? 1 : 0.5, cursor: canApply ? "pointer" : "not-allowed" }}
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomPickerOpen(false)}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: c.muted }}
                    onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    aria-label="Close custom range"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })()}

          {/* View columns — paired with Date because they're both "scope" controls (which data, which columns) */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => { closeAllDropdowns(); setViewOpen(o => !o); }}
              className="flex items-center gap-1.5 text-[12.5px] font-medium px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              style={{ background: viewOpen ? c.hoverBg : c.cardBg, border: `1px solid ${c.border}`, color: c.text }}
              onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = viewOpen ? c.hoverBg : c.cardBg)}
              title="Show / hide columns"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: c.muted }}><rect width="5" height="5" x="2" y="2" rx="1"/><rect width="5" height="5" x="9.5" y="2" rx="1"/><rect width="5" height="5" x="17" y="2" rx="1"/><rect width="5" height="5" x="2" y="9.5" rx="1"/><rect width="5" height="5" x="9.5" y="9.5" rx="1"/><rect width="5" height="5" x="17" y="9.5" rx="1"/><rect width="5" height="5" x="2" y="17" rx="1"/><rect width="5" height="5" x="9.5" y="17" rx="1"/><rect width="5" height="5" x="17" y="17" rx="1"/></svg>
              View
            </button>
            {viewOpen && (
              <div className="absolute left-0 top-full mt-1 z-30 w-[220px] rounded-xl shadow-xl overflow-hidden"
                style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
                <div className="px-4 py-2.5 text-[11px] uppercase tracking-wider font-semibold"
                  style={{ fontFamily: FONT, color: c.muted, borderBottom: `1px solid ${c.border}`, letterSpacing: "0.06em" }}>
                  Show Columns
                </div>
                <div className="py-1.5 max-h-[280px] overflow-y-auto">
                  {COLUMNS.map(col => {
                    const visible = !hiddenCols.has(col.key);
                    return (
                      <label key={col.key} className="flex items-center gap-2.5 px-4 py-2 cursor-pointer transition-colors"
                        onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        onClick={() => setHiddenCols(prev => { const s = new Set(prev); s.has(col.key) ? s.delete(col.key) : s.add(col.key); return s; })}>
                        <div className="flex items-center justify-center w-4 h-4 rounded flex-shrink-0"
                          style={{ border: `1.5px solid ${c.borderStrong}`, background: c.cardBg }}>
                          {visible && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        <span className="text-[12px]" style={{ fontFamily: FONT, color: c.text }}>{col.label}</span>
                      </label>
                    );
                  })}
                </div>
                <button onClick={() => setHiddenCols(new Set())}
                  className="w-full flex items-center justify-center gap-2 py-3 text-[12px] font-semibold transition-colors"
                  style={{ fontFamily: FONT, color: "#A614C3", borderTop: `1px solid ${c.border}` }}
                  onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <RefreshCw className="w-3.5 h-3.5" />Show All
                </button>
              </div>
            )}
          </div>

          {/* Search — grows to fill leftover space, but can also shrink down to a usable
              min-width when the toolbar is crowded (custom range + other filters). */}
          <div className="relative flex-1 min-w-[180px]" style={{ maxWidth: 300 }}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: c.textDim }} />
            <input
              placeholder="Search by ID, client, or producer…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-transparent outline-none text-[12px]"
              style={{
                fontFamily: FONT,
                background: c.cardBg,
                border: `1px solid ${c.border}`,
                borderRadius: 8,
                padding: "6.5px 12px 6.5px 32px",
                color: c.text,
              }}
            />
          </div>

          {/* Help — sits next to Search since it's what you reach for when you can't find what you're looking for */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => { closeAllDropdowns(); setHelpOpen(o => !o); }}
              title="Need help?"
              className="flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              style={{ background: helpOpen ? c.hoverBg : c.cardBg, border: `1px solid ${c.border}`, color: c.text }}
              onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = helpOpen ? c.hoverBg : c.cardBg)}
            >
              <HelpCircle className="w-3.5 h-3.5" style={{ color: c.muted }} />
              Help
            </button>
            {helpOpen && (
              // Anchored to the RIGHT edge of the Help button so the 260px panel opens
              // leftward — keeps it tucked under the toolbar instead of spilling over the
              // table columns to the right.
              <div className="absolute right-0 z-30 w-[260px] rounded-xl shadow-xl py-3"
                style={{ background: c.cardBg, border: `1px solid ${c.border}`, top: "calc(100% + 6px)" }}>
                <p className="px-4 pb-3 text-[12.5px]" style={{ fontFamily: FONT, color: c.muted }}>Can&apos;t find what you&apos;re looking for?</p>
                <div className="px-2 space-y-1.5">
                  {[
                    { icon: MessageSquare, title: "Start a Chat", sub: "Get instant help", subColor: c.muted },
                    { icon: Mail,          title: "Send Email",  sub: "We'll respond soon", subColor: c.muted },
                  ].map(({ icon: Icon, title, sub, subColor }) => (
                    <button key={title}
                      className="flex items-center gap-3 w-full text-left rounded-lg transition-colors"
                      style={{ fontFamily: FONT, border: `1px solid ${c.border}`, padding: "8px 10px", background: "transparent" }}
                      onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <div className="flex items-center justify-center flex-shrink-0"
                        style={{ width: 30, height: 30, borderRadius: 8, background: isDark ? "rgba(166,20,195,0.15)" : "rgba(166,20,195,0.08)" }}>
                        <Icon className="w-4 h-4" strokeWidth={1.75} style={{ stroke: "url(#helpIconGrad)" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold" style={{ fontFamily: FONT, color: c.text }}>{title}</div>
                        <div className="text-[11.5px]" style={{ fontFamily: FONT, color: subColor }}>{sub}</div>
                      </div>
                    </button>
                  ))}
                </div>
                <svg width="0" height="0" className="absolute">
                  <defs>
                    <linearGradient id="helpIconGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#5C2ED4" />
                      <stop offset="100%" stopColor="#A614C3" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            )}
          </div>

        {/* Refresh — sits with the filter controls in the same flex-wrap so on narrow
            viewports it wraps alongside Search / Help instead of dropping onto its own
            line. `ml-auto` pushes it (and Export) to the far right on wide viewports. */}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          title="Refresh quotes"
          className="flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed ml-auto"
          style={{ background: c.cardBg, border: `1px solid ${c.border}`, color: c.text, opacity: refreshing ? 0.7 : 1 }}
          onMouseEnter={e => { if (!refreshing) e.currentTarget.style.background = c.hoverBg; }}
          onMouseLeave={e => (e.currentTarget.style.background = c.cardBg)}
        >
          <RefreshCw className="w-3.5 h-3.5" style={{ color: c.muted, animation: refreshing ? "spin-q 0.9s linear infinite" : "none" }} />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>

        {/* Export — opens full preview/scope/columns modal */}
        <button
          onClick={() => setExportOpen(true)}
          title="Export quotes"
          className="flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          style={{ fontFamily: FONT, background: c.cardBg, border: `1px solid ${c.border}`, color: c.text }}
          onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
          onMouseLeave={e => (e.currentTarget.style.background = c.cardBg)}
        >
          <Download className="w-3.5 h-3.5" style={{ color: c.muted }} />
          Export
        </button>

        </div>

        {/* Start a Quote lives in its own row above the KPI strip (see the "Primary CTA row"
            block above the KPI block). This toolbar stays focused on filter / table-action
            controls and is visually fused with the table card below (matching background, no
            seam between toolbar and table). */}
      </div>

      {/* KPI strip — clickable status cards (matches Overview's KpiCard pattern).
          Visual order: CTA row = 1, KPI = 2, toolbar = 3, table = 4. */}
      <div
        className="grid gap-3 mb-5 flex-shrink-0"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", order: 2 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Start a Quote — primary-action tile. Same shape and dimensions as the KPI cards so
            it sits naturally in the grid, but uses the brand gradient + white text + a chunkier
            plus icon (in place of a number) so it visually reads as "action" rather than "stat".
            Placed FIRST in the row so the eye lands on the primary action before the stat cards.
            Hover = brightness-only, matching the standard brand-gradient button treatment used
            elsewhere in the app (no lift / shadow growth — kept simple and consistent). */}
        <button
          className="rounded-2xl px-5 py-4 text-left cursor-pointer flex flex-col justify-between"
          style={{
            background: btnGrad,
            color: "#fff",
            border: "none",
            transition: "filter 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.08)"; }}
          onMouseLeave={e => { e.currentTarget.style.filter = "none"; }}
        >
          <div className="flex items-start justify-between gap-3 mb-0.5">
            <div className="text-[15px] font-semibold">Start a Quote</div>
            <div className="flex-shrink-0">
              <Plus className="w-6 h-6" strokeWidth={2.5} />
            </div>
          </div>
          <div className="text-[11px]" style={{ opacity: 0.9 }}>
            New submission
          </div>
        </button>
        {statusSummary.map((s) => {
          // A card is "active" when the filter set is exactly its keys — supports both
          // single-status cards (Pending, Action Required) and multi-status cards (Sold
          // & Approved = Sold/Issued + Approved).
          const active = statusFilter.size === s.keys.length && s.keys.every(k => statusFilter.has(k));
          return (
            <button
              key={s.label}
              onClick={() => {
                if (active) setStatusFilter(new Set());              // toggle off — clear filter
                else        setStatusFilter(new Set(s.keys));        // apply this card's status set
                setPage(1);
              }}
              className="rounded-2xl px-5 py-4 text-left cursor-pointer transition-all"
              style={{
                background: c.cardBg,
                border: `1px solid ${active ? c.accent : c.border}`,
              }}
              onMouseEnter={e => {
                // Hover only nudges the border darker — no bg tint, so the transition
                // into the active state (purple border, still cardBg background) is clean
                // and doesn't leave a stuck gray fill.
                if (!active) {
                  e.currentTarget.style.borderColor = c.borderStrong;
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.borderColor = c.border;
                }
              }}
            >
              {/* Top: title + big count on the right */}
              <div className="flex items-start justify-between gap-3 mb-0.5">
                <div className="text-[15px] font-semibold truncate" style={{ color: c.text }}>
                  {s.label}
                </div>
                <div
                  className="text-[24px] font-semibold leading-none tracking-tight flex-shrink-0"
                  style={{ color: active ? c.accent : c.text }}
                >
                  {s.count}
                </div>
              </div>
              {/* Subtitle */}
              <div className="text-[11px]" style={{ color: c.muted }}>
                {s.sub}
              </div>
            </button>
          );
        })}
      </div>

      {reassignToast && (
        <div
          className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-lg text-[12.5px] font-medium flex items-center gap-2"
          style={{ fontFamily: FONT, background: c.text, color: c.cardBg, boxShadow: "0 8px 24px rgba(15,23,42,0.18)" }}
        >
          <Check className="w-3.5 h-3.5" />
          {reassignToast}
        </div>
      )}

      {/* Reassign Quote Modal — full dialog with searchable agent picker (matches Agencies pattern) */}
      {reassignModalFor && (() => {
        const q = reassignModalFor;
        const candidates = uniqueProducers.filter(name => name !== q.producer);
        const filtered = candidates.filter(name => !reassignSearch || name.toLowerCase().includes(reassignSearch.toLowerCase()));
        const lobAgents = mockQuotes.filter(x => x.lob === q.lob && x.producer !== q.producer).map(x => x.producer);
        const suggested = Array.from(new Set(lobAgents))[0] ?? null;
        const closeModal = () => { setReassignModalFor(null); setReassignSearch(""); setReassignSelected(null); };
        const confirmReassign = () => {
          if (!reassignSelected) return;
          setReassignToast(`Reassigned to ${reassignSelected}`);
          closeModal();
          setTimeout(() => setReassignToast(null), 2200);
        };
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }} onClick={closeModal}>
            <div className="rounded-2xl shadow-2xl flex flex-col" style={{ background: c.cardBg, border: `1px solid ${c.border}`, width: 540, maxWidth: "92vw", maxHeight: "82vh" }} onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
                <div className="min-w-0">
                  <h3 className="text-[16px] font-bold" style={{ fontFamily: FONT, color: c.text }}>Reassign Quote</h3>
                  <p className="text-[12px] mt-0.5 truncate" style={{ fontFamily: FONT, color: c.muted }}>
                    {q.submissionId} · {q.dba} · Currently <span style={{ color: c.text, fontWeight: 600 }}>{q.producer}</span>
                  </p>
                </div>
                <button onClick={closeModal} className="p-1.5 rounded-md transition-colors flex-shrink-0" style={{ color: c.muted }}
                  onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ fontFamily: FONT, color: c.muted }}>Search User</p>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-3" style={{ border: `1px solid ${c.border}`, background: c.mutedBg }}>
                  <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.muted }} />
                  <input
                    autoFocus
                    value={reassignSearch}
                    onChange={e => setReassignSearch(e.target.value)}
                    placeholder="Search by name, email, or role…"
                    className="flex-1 outline-none text-[13px] bg-transparent"
                    style={{ fontFamily: FONT, color: c.text }}
                  />
                </div>

                {/* Suggested */}
                {suggested && (!reassignSearch || suggested.toLowerCase().includes(reassignSearch.toLowerCase())) && (
                  <div className="mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ fontFamily: FONT, color: c.muted }}>Suggested</p>
                    <button
                      onClick={() => setReassignSelected(suggested)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all"
                      style={{
                        background: reassignSelected === suggested ? c.accentSoft : c.cardBg,
                        border: `1px solid ${reassignSelected === suggested ? c.accent : c.border}`,
                      }}
                    >
                      <Sparkles className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.accent }} />
                      <span className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{ background: c.accentSoft, color: c.accent }}>
                        {suggested.split(" ").map(w => w[0]).join("").slice(0, 2)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold truncate" style={{ fontFamily: FONT, color: c.text }}>{suggested}</div>
                        <div className="text-[11px]" style={{ fontFamily: FONT, color: c.muted }}>Best fit · handles {q.lob}</div>
                      </div>
                      {reassignSelected === suggested && <Check className="w-4 h-4 flex-shrink-0" style={{ color: c.accent }} />}
                    </button>
                  </div>
                )}

                {/* All users */}
                {filtered.length > 0 ? (
                  <>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ fontFamily: FONT, color: c.muted }}>
                      Active Users ({filtered.length})
                    </p>
                    <div className="space-y-1">
                      {filtered.map(name => {
                        const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2);
                        const isSelected = reassignSelected === name;
                        return (
                          <button
                            key={name}
                            onClick={() => setReassignSelected(name)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all"
                            style={{
                              background: isSelected ? c.accentSoft : "transparent",
                              border: `1px solid ${isSelected ? c.accent : "transparent"}`,
                            }}
                            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = c.hoverBg; }}
                            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                          >
                            <span className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{ background: c.accentSoft, color: c.accent }}>
                              {initials}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-semibold truncate" style={{ fontFamily: FONT, color: c.text }}>{name}</div>
                              <div className="text-[11px]" style={{ fontFamily: FONT, color: c.muted }}>Agent · {name.toLowerCase().replace(/\s/g, ".")}@norbielink.com</div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 flex-shrink-0" style={{ color: c.accent }} />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : reassignSearch ? (
                  <p className="text-[12px] py-6 text-center" style={{ fontFamily: FONT, color: c.muted }}>
                    No users match &ldquo;{reassignSearch}&rdquo;.
                  </p>
                ) : (
                  <p className="text-[12px] py-6 text-center" style={{ fontFamily: FONT, color: c.muted }}>
                    Start typing to find a user from {candidates.length} active users.
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderTop: `1px solid ${c.border}` }}>
                <button onClick={closeModal}
                  className="px-4 py-2 rounded-lg text-[12px] font-semibold transition-colors"
                  style={{ fontFamily: FONT, color: c.text, border: `1px solid ${c.border}`, background: c.cardBg }}
                  onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = c.cardBg)}>
                  Cancel
                </button>
                <button onClick={confirmReassign} disabled={!reassignSelected}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold text-white transition-all"
                  style={{ fontFamily: FONT, background: btnGrad, opacity: reassignSelected ? 1 : 0.5, cursor: reassignSelected ? "pointer" : "not-allowed" }}
                  onMouseEnter={e => { if (reassignSelected) e.currentTarget.style.filter = "brightness(1.1)"; }}
                  onMouseLeave={e => (e.currentTarget.style.filter = "none")}>
                  <UserPlus className="w-3.5 h-3.5" />Reassign Quote
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Export Quotes Modal — scope + columns + preview + format */}
      {exportOpen && (() => {
        const exportRows = exportScope === "all" ? mockQuotes : sorted;
        const selectedCols = ALL_EXPORT_COLS.filter(col => exportCols.has(col.key));
        const previewRows = exportRows.slice(0, 5);
        // Accept an optional format so the format-menu items can fire the download in one click
        // with the just-picked format (state updates are async, so we can't rely on exportFormat).
        const triggerExport = (overrideFormat?: "csv" | "tsv" | "xlsx" | "json") => {
          if (selectedCols.length === 0) return;
          const fmt = overrideFormat ?? exportFormat;
          const headerRow = selectedCols.map(col => col.label);
          const dataRows = exportRows.map(q => selectedCols.map(col => col.get(q)));
          let text = ""; let mime = "text/csv;charset=utf-8"; let ext = "csv";
          if (fmt === "csv") {
            const escape = (v: string) => /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
            text = [headerRow, ...dataRows].map(r => r.map(escape).join(",")).join("\n");
            mime = "text/csv;charset=utf-8"; ext = "csv";
          } else if (fmt === "tsv") {
            text = [headerRow, ...dataRows].map(r => r.join("\t")).join("\n");
            mime = "text/tab-separated-values;charset=utf-8"; ext = "tsv";
          } else if (fmt === "xlsx") {
            const escape = (v: string) => /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
            text = [headerRow, ...dataRows].map(r => r.map(escape).join(",")).join("\n");
            mime = "application/vnd.ms-excel"; ext = "xlsx";
          } else {
            const objects = exportRows.map(q => {
              const obj: Record<string, string> = {};
              selectedCols.forEach(col => { obj[col.label] = col.get(q); });
              return obj;
            });
            text = JSON.stringify(objects, null, 2);
            mime = "application/json;charset=utf-8"; ext = "json";
          }
          const blob = new Blob([text], { type: mime });
          const url = URL.createObjectURL(blob);
          const fname = `quotes-${new Date().toISOString().slice(0,10)}.${ext}`;
          const a = document.createElement("a"); a.href = url; a.download = fname;
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
          URL.revokeObjectURL(url);
          setExportOpen(false);
        };
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setExportOpen(false)}>
            <div className="rounded-2xl shadow-2xl flex flex-col" style={{ background: c.cardBg, border: `1px solid ${c.border}`, width: 620, maxWidth: "92vw", maxHeight: "86vh" }} onClick={e => e.stopPropagation()}>
              {/* Header — h2 font-bold, generic subtitle (no live row/column counts) */}
              <div className="px-6 py-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
                <div>
                  <h2 className="text-[16px] font-bold" style={{ fontFamily: FONT, color: c.text }}>Export Quotes</h2>
                  <p className="text-[12px] mt-0.5" style={{ fontFamily: FONT, color: c.muted }}>
                    Based on your current view
                  </p>
                </div>
                <button onClick={() => setExportOpen(false)} className="p-1.5 rounded-md transition-colors" style={{ color: c.muted }}
                  onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body — stacked vertically (no sidebar) */}
              <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
                {/* Scope */}
                <div className="mb-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ fontFamily: FONT, color: c.muted }}>Scope</p>
                  <div className="grid grid-cols-2 gap-2">
                    {([["filtered", `Current view (${sorted.length})`], ["all", `All quotes (${mockQuotes.length})`]] as ["filtered"|"all", string][]).map(([key, label]) => {
                      const active = exportScope === key;
                      return (
                        <button key={key} onClick={() => setExportScope(key)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] transition-colors"
                          style={{ fontFamily: FONT, background: active ? c.accentSoft : "transparent", color: active ? c.accent : c.text, border: `1px solid ${active ? "rgba(166,20,195,0.25)" : c.border}` }}>
                          <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0" style={{ border: `1.5px solid ${active ? c.accent : c.border}` }}>
                            {active && <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.accent }} />}
                          </span>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Columns — togglable chip pills, 4-column grid for L/R alignment */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ fontFamily: FONT, color: c.muted }}>Columns ({exportCols.size})</p>
                    <div className="flex items-center gap-2 text-[11px] font-semibold" style={{ fontFamily: FONT }}>
                      <button onClick={() => setExportCols(new Set(ALL_EXPORT_COLS.map(c => c.key)))} className="cursor-pointer transition-colors" style={{ color: c.accent }}>All</button>
                      <span style={{ color: c.border }}>·</span>
                      <button onClick={() => setExportCols(new Set())} className="cursor-pointer transition-colors" style={{ color: c.muted }}>None</button>
                    </div>
                  </div>
                  <div className="grid gap-0.5" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                    {ALL_EXPORT_COLS.map(col => {
                      const checked = exportCols.has(col.key);
                      return (
                        <label
                          key={col.key}
                          className="flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer transition-colors select-none"
                          onClick={() => setExportCols(prev => { const s = new Set(prev); if (s.has(col.key)) s.delete(col.key); else s.add(col.key); return s; })}
                          onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        >
                          <div className="flex items-center justify-center w-4 h-4 rounded flex-shrink-0"
                            style={{ border: `1.5px solid ${c.borderStrong}`, background: c.cardBg }}>
                            {checked && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                          <span className="text-[12px] truncate" style={{ fontFamily: FONT, color: c.text }}>{col.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Eye className="w-3.5 h-3.5" style={{ color: c.muted }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ fontFamily: FONT, color: c.muted }}>Preview</span>
                  </div>
                  <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${c.border}` }}>
                    {selectedCols.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-32 gap-2">
                        <AlertTriangle className="w-5 h-5" style={{ color: c.muted }} />
                        <span className="text-[12px]" style={{ fontFamily: FONT, color: c.muted }}>Select at least one column to preview.</span>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-[12px]" style={{ fontFamily: FONT, borderCollapse: "collapse" }}>
                          <thead style={{ background: c.mutedBg }}>
                            <tr>
                              {selectedCols.map(col => (
                                <th key={col.key} className="text-left px-4 py-2.5 font-semibold whitespace-nowrap"
                                  style={{ color: c.text, fontSize: 11.5, borderBottom: `1px solid ${c.border}` }}>
                                  {col.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {previewRows.map((q, i) => (
                              <tr key={q.id}>
                                {selectedCols.map(col => (
                                  <td key={col.key} className="px-4 py-2.5 align-middle whitespace-nowrap" style={{ color: c.text, borderBottom: i < previewRows.length - 1 ? `1px solid ${c.border}` : "none" }}>
                                    {col.get(q) || <span style={{ color: c.muted }}>—</span>}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {exportRows.length > previewRows.length && selectedCols.length > 0 && (
                      <div className="px-4 py-2.5 text-center text-[11px]" style={{ color: c.muted, fontFamily: FONT, borderTop: `1px solid ${c.border}`, background: c.mutedBg }}>
                        + {exportRows.length - previewRows.length} more {exportRows.length - previewRows.length === 1 ? "row" : "rows"} included on download
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer — Reset · meta · Cancel · split Download button (with format chooser) */}
              <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderTop: `1px solid ${c.border}` }}>
                <div className="flex items-center gap-3">
                  <button onClick={() => { setExportCols(new Set(DEFAULT_EXPORT_COLS)); setExportFormat("csv"); setExportScope("filtered"); }}
                    className="flex items-center gap-1.5 text-[11.5px] font-semibold transition-colors"
                    style={{ fontFamily: FONT, color: c.accent }}>
                    <RotateCcw className="w-3 h-3" />Reset
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setExportOpen(false)}
                    className="px-4 py-2 rounded-lg text-[12px] font-semibold transition-colors"
                    style={{ fontFamily: FONT, color: c.text, border: `1px solid ${c.border}`, background: c.cardBg }}
                    onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                    onMouseLeave={e => (e.currentTarget.style.background = c.cardBg)}>
                    Cancel
                  </button>

                  {/* Split button: main "Download X" + caret to switch format — one continuous gradient across both halves */}
                  <div
                    className="relative flex items-stretch rounded-lg overflow-hidden transition-all"
                    style={{
                      background: btnGrad,
                      opacity: selectedCols.length === 0 ? 0.5 : 1,
                      pointerEvents: selectedCols.length === 0 ? "none" : "auto",
                    }}
                    onMouseEnter={e => { if (selectedCols.length > 0) e.currentTarget.style.filter = "brightness(1.08)"; }}
                    onMouseLeave={e => (e.currentTarget.style.filter = "none")}
                  >
                    <button onClick={() => triggerExport()} disabled={selectedCols.length === 0}
                      className="flex items-center gap-1.5 pl-4 pr-3.5 py-2 text-[12px] font-semibold text-white"
                      style={{
                        fontFamily: FONT,
                        background: "transparent",
                        cursor: selectedCols.length === 0 ? "not-allowed" : "pointer",
                        borderRight: "1px solid rgba(255,255,255,0.25)",
                      }}>
                      <Download className="w-3.5 h-3.5" />
                      Download {exportFormat === "csv" ? "CSV" : exportFormat === "tsv" ? "TSV" : exportFormat === "xlsx" ? "Excel" : "JSON"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setExportFormatMenuOpen(o => !o)}
                      title="Change format"
                      className="px-2 text-white flex items-center justify-center"
                      style={{ fontFamily: FONT, background: "transparent", cursor: "pointer" }}>
                      <ChevronDown className="w-3.5 h-3.5" style={{ transform: exportFormatMenuOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms" }} />
                    </button>

                    {exportFormatMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setExportFormatMenuOpen(false)} />
                        <div className="absolute right-0 bottom-[calc(100%+6px)] z-50 rounded-lg overflow-hidden min-w-[220px]"
                          style={{ background: c.cardBg, border: `1px solid ${c.border}`, boxShadow: "0 12px 28px rgba(15,23,42,0.12), 0 4px 8px rgba(15,23,42,0.06)" }}>
                          {([
                            ["csv",  "CSV",   "Comma-separated · opens in Excel / Sheets"],
                            ["tsv",  "TSV",   "Tab-separated · paste-friendly"],
                            ["xlsx", "Excel", ".xlsx workbook"],
                            ["json", "JSON",  "Structured · for scripts / APIs"],
                          ] as ["csv"|"tsv"|"xlsx"|"json", string, string][]).map(([key, label, desc]) => {
                            const active = exportFormat === key;
                            return (
                              <button key={key}
                                onClick={() => {
                                  // Picking a format both updates the default AND fires the download
                                  // immediately — matches the bulk-upload template's split-button UX.
                                  setExportFormat(key);
                                  setExportFormatMenuOpen(false);
                                  triggerExport(key);
                                }}
                                className="w-full flex items-start gap-2 px-3 py-2.5 text-left transition-colors"
                                style={{ fontFamily: FONT, background: active ? c.accentSoft : "transparent" }}
                                onMouseEnter={e => { if (!active) e.currentTarget.style.background = c.hoverBg; }}
                                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                                <span className="w-3.5 h-3.5 mt-0.5 rounded-full flex items-center justify-center flex-shrink-0" style={{ border: `1.5px solid ${active ? c.accent : c.border}` }}>
                                  {active && <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.accent }} />}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[12px] font-semibold" style={{ color: active ? c.accent : c.text }}>{label}</div>
                                  <div className="text-[10.5px]" style={{ color: c.muted }}>{desc}</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <style jsx global>{`
        @keyframes spin-q {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
      `}</style>

      {/* Table — grid layout matching Clients quotes.
          Visual order: CTA row = 1, KPI = 2, toolbar = 3, table = 4. */}
      <div className="rounded-2xl flex flex-col flex-1 min-h-0 overflow-hidden" style={{ background: c.cardBg, border: `1px solid ${c.border}`, marginBottom: 16, order: 4 }}>
        {/* Header + body share ONE scroll context so column widths align even when the body scrolls */}
        <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="grid px-5 py-3 gap-4 sticky top-0 z-10" style={{ gridTemplateColumns: gridTemplate, borderBottom: `1px solid ${c.border}`, background: c.mutedBg, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
          {/* Created */}
          {!hiddenCols.has("created") && (
          <button onClick={e => { e.stopPropagation(); toggleSort("createdDate"); }}
            className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer select-none text-left"
            style={{ fontFamily: FONT, color: c.muted }}>
            Created<SortArrows col="createdDate" />
          </button>
          )}
          {/* Submission ID */}
          {!hiddenCols.has("submissionId") && (
          <button onClick={e => { e.stopPropagation(); toggleSort("submissionId"); }}
            className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer select-none text-left"
            style={{ fontFamily: FONT, color: c.muted }}>
            Submission ID<SortArrows col="submissionId" />
          </button>
          )}
          {/* Applicant filter */}
          {!hiddenCols.has("applicant") && (
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => { closeAllDropdowns(); setApplicantOpen(o => !o); }}
              className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer select-none"
              style={{ fontFamily: FONT, color: applicantFilter.size > 0 ? "#A614C3" : c.muted }}>
              Applicant<FilterCaret active={applicantFilter.size > 0} />
            </button>
            {applicantOpen && (
              <div className="absolute top-full mt-1 z-30 rounded-xl shadow-lg overflow-hidden min-w-[220px]"
                style={{ background: c.cardBg, border: `1px solid ${c.border}`, left: 0 }}>
                <div className="p-2" style={{ borderBottom: `1px solid ${c.border}` }}>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                    style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#F9FAFB", border: `1px solid ${c.border}` }}>
                    <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.muted }} />
                    <input value={applicantSearch} onChange={e => setApplicantSearch(e.target.value)} placeholder="Search Applicant"
                      className="outline-none text-[12px] flex-1 bg-transparent" style={{ fontFamily: FONT, color: c.text }} />
                  </div>
                </div>
                <div className="px-3 py-2" style={{ borderBottom: `1px solid ${c.border}` }}>
                  <button className="flex items-center gap-2 text-[12px] w-full text-left" style={{ fontFamily: FONT, color: c.text }}
                    onClick={() => { const all = uniqueApplicants; setApplicantFilter(applicantFilter.size === all.length ? new Set() : new Set(all)); }}>
                    <div className="flex items-center justify-center w-4 h-4 rounded flex-shrink-0"
                      style={{ border: `1.5px solid ${c.borderStrong}`, background: c.cardBg }}>
                      {applicantFilter.size === uniqueApplicants.length && uniqueApplicants.length > 0 &&
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    Select All
                  </button>
                </div>
                <div className="max-h-[180px] overflow-y-auto py-1">
                  {uniqueApplicants.filter(a => !applicantSearch || a.toLowerCase().includes(applicantSearch.toLowerCase())).map(applicant => (
                    <button key={applicant} className="flex items-center gap-2 px-3 py-1.5 text-[12px] w-full text-left transition-colors"
                      style={{ fontFamily: FONT, color: c.text }}
                      onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      onClick={() => toggleSet(applicantFilter, applicant, setApplicantFilter)}>
                      <div className="flex items-center justify-center w-4 h-4 rounded flex-shrink-0"
                        style={{ border: `1.5px solid ${c.borderStrong}`, background: c.cardBg }}>
                        {applicantFilter.has(applicant) &&
                          <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      {applicant}
                    </button>
                  ))}
                </div>
                <button onClick={() => { setApplicantFilter(new Set()); setApplicantSearch(""); }}
                  className="w-full flex items-center justify-center gap-2 py-3 text-[12px] font-semibold transition-colors"
                  style={{ fontFamily: FONT, color: "#A614C3", borderTop: `1px solid ${c.border}` }}
                  onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <RefreshCw className="w-3.5 h-3.5" />Reset Filter
                </button>
              </div>
            )}
          </div>
          )}
          {/* DBA */}
          {!hiddenCols.has("dba") && (
          <button onClick={e => { e.stopPropagation(); toggleSort("dba"); }}
            className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer select-none text-left"
            style={{ fontFamily: FONT, color: c.muted }}>
            DBA<SortArrows col="dba" />
          </button>
          )}
          {/* Effective */}
          {!hiddenCols.has("effective") && (
          <button onClick={e => { e.stopPropagation(); toggleSort("effectiveDate"); }}
            className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer select-none text-left"
            style={{ fontFamily: FONT, color: c.muted }}>
            Effective<SortArrows col="effectiveDate" />
          </button>
          )}
          {/* LOB filter — multi-select with search, matches the Applicant pattern */}
          {!hiddenCols.has("lob") && (() => {
            const LOB_OPTIONS = ALL_LOBS.filter(l => l !== "All LOBs");
            return (
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button onClick={() => { closeAllDropdowns(); setLobOpen(o => !o); }}
                className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer select-none"
                style={{ fontFamily: FONT, color: lobFilter.size > 0 ? "#A614C3" : c.muted }}>
                LOB<FilterCaret active={lobFilter.size > 0} />
              </button>
              {lobOpen && (
                <div className="absolute top-full mt-1 z-30 rounded-xl shadow-lg overflow-hidden min-w-[220px]"
                  style={{ background: c.cardBg, border: `1px solid ${c.border}`, left: 0 }}>
                  <div className="p-2" style={{ borderBottom: `1px solid ${c.border}` }}>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                      style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#F9FAFB", border: `1px solid ${c.border}` }}>
                      <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.muted }} />
                      <input value={lobSearch} onChange={e => setLobSearch(e.target.value)} placeholder="Search LOB"
                        className="outline-none text-[12px] flex-1 bg-transparent" style={{ fontFamily: FONT, color: c.text }} />
                    </div>
                  </div>
                  <div className="px-3 py-2" style={{ borderBottom: `1px solid ${c.border}` }}>
                    <button className="flex items-center gap-2 text-[12px] w-full text-left" style={{ fontFamily: FONT, color: c.text }}
                      onClick={() => { setLobFilter(lobFilter.size === LOB_OPTIONS.length ? new Set() : new Set(LOB_OPTIONS)); }}>
                      <div className="flex items-center justify-center w-4 h-4 rounded flex-shrink-0"
                        style={{ border: `1.5px solid ${c.borderStrong}`, background: c.cardBg }}>
                        {lobFilter.size === LOB_OPTIONS.length && LOB_OPTIONS.length > 0 &&
                          <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      Select All
                    </button>
                  </div>
                  <div className="max-h-[180px] overflow-y-auto py-1">
                    {LOB_OPTIONS.filter(l => !lobSearch || l.toLowerCase().includes(lobSearch.toLowerCase())).map(lob => (
                      <button key={lob} className="flex items-center gap-2 px-3 py-1.5 text-[12px] w-full text-left transition-colors"
                        style={{ fontFamily: FONT, color: c.text }}
                        onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        onClick={() => toggleSet(lobFilter, lob, setLobFilter)}>
                        <div className="flex items-center justify-center w-4 h-4 rounded flex-shrink-0"
                          style={{ border: `1.5px solid ${c.borderStrong}`, background: c.cardBg }}>
                          {lobFilter.has(lob) &&
                            <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        {lob}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => { setLobFilter(new Set()); setLobSearch(""); }}
                    className="w-full flex items-center justify-center gap-2 py-3 text-[12px] font-semibold transition-colors"
                    style={{ fontFamily: FONT, color: "#A614C3", borderTop: `1px solid ${c.border}` }}
                    onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <RefreshCw className="w-3.5 h-3.5" />Reset Filter
                  </button>
                </div>
              )}
            </div>
            );
          })()}
          {/* Status filter — multi-select with search, matches the Applicant pattern */}
          {!hiddenCols.has("status") && (() => {
            const STATUS_OPTIONS = QUOTE_STATUSES.filter(s => s !== "All Statuses");
            return (
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button onClick={() => { closeAllDropdowns(); setStatusOpen(o => !o); }}
                className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer select-none"
                style={{ fontFamily: FONT, color: statusFilter.size > 0 ? "#A614C3" : c.muted }}>
                Status<FilterCaret active={statusFilter.size > 0} />
              </button>
              {statusOpen && (
                <div className="absolute top-full mt-1 z-30 rounded-xl shadow-lg overflow-hidden min-w-[220px]"
                  style={{ background: c.cardBg, border: `1px solid ${c.border}`, left: 0 }}>
                  <div className="p-2" style={{ borderBottom: `1px solid ${c.border}` }}>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                      style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#F9FAFB", border: `1px solid ${c.border}` }}>
                      <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.muted }} />
                      <input value={statusSearch} onChange={e => setStatusSearch(e.target.value)} placeholder="Search Status"
                        className="outline-none text-[12px] flex-1 bg-transparent" style={{ fontFamily: FONT, color: c.text }} />
                    </div>
                  </div>
                  <div className="px-3 py-2" style={{ borderBottom: `1px solid ${c.border}` }}>
                    <button className="flex items-center gap-2 text-[12px] w-full text-left" style={{ fontFamily: FONT, color: c.text }}
                      onClick={() => { setStatusFilter(statusFilter.size === STATUS_OPTIONS.length ? new Set() : new Set(STATUS_OPTIONS)); }}>
                      <div className="flex items-center justify-center w-4 h-4 rounded flex-shrink-0"
                        style={{ border: `1.5px solid ${c.borderStrong}`, background: c.cardBg }}>
                        {statusFilter.size === STATUS_OPTIONS.length && STATUS_OPTIONS.length > 0 &&
                          <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      Select All
                    </button>
                  </div>
                  <div className="max-h-[180px] overflow-y-auto py-1">
                    {STATUS_OPTIONS.filter(s => !statusSearch || s.toLowerCase().includes(statusSearch.toLowerCase())).map(status => (
                      <button key={status} className="flex items-center gap-2 px-3 py-1.5 text-[12px] w-full text-left transition-colors"
                        style={{ fontFamily: FONT, color: c.text }}
                        onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        onClick={() => toggleSet(statusFilter, status, setStatusFilter)}>
                        <div className="flex items-center justify-center w-4 h-4 rounded flex-shrink-0"
                          style={{ border: `1.5px solid ${c.borderStrong}`, background: c.cardBg }}>
                          {statusFilter.has(status) &&
                            <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        {status}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => { setStatusFilter(new Set()); setStatusSearch(""); }}
                    className="w-full flex items-center justify-center gap-2 py-3 text-[12px] font-semibold transition-colors"
                    style={{ fontFamily: FONT, color: "#A614C3", borderTop: `1px solid ${c.border}` }}
                    onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <RefreshCw className="w-3.5 h-3.5" />Reset Filter
                  </button>
                </div>
              )}
            </div>
            );
          })()}
          {/* Producer filter */}
          {!hiddenCols.has("producer") && (
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => { closeAllDropdowns(); setProducerOpen(o => !o); }}
              className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer select-none"
              style={{ fontFamily: FONT, color: producerFilter.size > 0 ? "#A614C3" : c.muted }}>
              Producer<FilterCaret active={producerFilter.size > 0} />
            </button>
            {producerOpen && (
              <div className="absolute top-full mt-1 z-30 rounded-xl shadow-lg overflow-hidden min-w-[220px]"
                style={{ background: c.cardBg, border: `1px solid ${c.border}`, right: 0 }}>
                <div className="p-2" style={{ borderBottom: `1px solid ${c.border}` }}>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                    style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#F9FAFB", border: `1px solid ${c.border}` }}>
                    <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.muted }} />
                    <input value={producerSearch} onChange={e => setProducerSearch(e.target.value)} placeholder="Search Producer"
                      className="outline-none text-[12px] flex-1 bg-transparent" style={{ fontFamily: FONT, color: c.text }} />
                  </div>
                </div>
                <div className="px-3 py-2" style={{ borderBottom: `1px solid ${c.border}` }}>
                  <button className="flex items-center gap-2 text-[12px] w-full text-left" style={{ fontFamily: FONT, color: c.text }}
                    onClick={() => { const all = uniqueProducers; setProducerFilter(producerFilter.size === all.length ? new Set() : new Set(all)); }}>
                    <div className="flex items-center justify-center w-4 h-4 rounded flex-shrink-0"
                      style={{ border: `1.5px solid ${c.borderStrong}`, background: c.cardBg }}>
                      {producerFilter.size === uniqueProducers.length && uniqueProducers.length > 0 &&
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    Select All
                  </button>
                </div>
                <div className="max-h-[180px] overflow-y-auto py-1">
                  {uniqueProducers.filter(p => !producerSearch || p.toLowerCase().includes(producerSearch.toLowerCase())).map(producer => (
                    <button key={producer} className="flex items-center gap-2 px-3 py-1.5 text-[12px] w-full text-left transition-colors"
                      style={{ fontFamily: FONT, color: c.text }}
                      onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      onClick={() => toggleSet(producerFilter, producer, setProducerFilter)}>
                      <div className="flex items-center justify-center w-4 h-4 rounded flex-shrink-0"
                        style={{ border: `1.5px solid ${c.borderStrong}`, background: c.cardBg }}>
                        {producerFilter.has(producer) &&
                          <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      {producer}
                    </button>
                  ))}
                </div>
                <button onClick={() => { setProducerFilter(new Set()); setProducerSearch(""); }}
                  className="w-full flex items-center justify-center gap-2 py-3 text-[12px] font-semibold transition-colors"
                  style={{ fontFamily: FONT, color: "#A614C3", borderTop: `1px solid ${c.border}` }}
                  onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <RefreshCw className="w-3.5 h-3.5" />Reset Filter
                </button>
              </div>
            )}
          </div>
          )}
        </div>
        {/* Rows */}
        <div>
          {pageItems.length === 0 ? (
            <div className="py-16 text-center text-[13px]" style={{ fontFamily: FONT, color: c.muted }}>
              No quotes found
            </div>
          ) : pageItems.map((q, i, arr) => (
            <div key={q.id} className="grid px-5 py-3.5 items-center gap-4 transition-colors cursor-pointer"
              style={{ gridTemplateColumns: gridTemplate, borderBottom: i !== arr.length - 1 ? `1px solid ${c.border}` : "none" }}
              onClick={() => { setSelected(q); setView("detail"); setDetailTab("uw"); setExpandedComments(new Set(["c1", "c2"])); setActionValue(""); }}
              onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              {!hiddenCols.has("created")      && <div className="text-[12px] truncate" style={{ fontFamily: FONT, color: c.text }}>{q.created}</div>}
              {!hiddenCols.has("submissionId") && <div className="text-[12px] font-semibold truncate" style={{ fontFamily: FONT, color: c.linkColor }}>{q.submissionId}</div>}
              {!hiddenCols.has("applicant")    && <div className="text-[12px] truncate" style={{ fontFamily: FONT, color: c.text }} title={q.applicant}>{q.applicant}</div>}
              {!hiddenCols.has("dba")          && <div className="text-[12px] truncate" style={{ fontFamily: FONT, color: c.text }} title={q.dba}>{q.dba}</div>}
              {!hiddenCols.has("effective")    && <div className="text-[12px] truncate" style={{ fontFamily: FONT, color: c.text }}>{q.effective}</div>}
              {!hiddenCols.has("lob")          && <div className="text-[12px] truncate" style={{ fontFamily: FONT, color: c.text }} title={q.lob}>{q.lob}</div>}
              {!hiddenCols.has("status")       && (
                <div className="flex items-center">
                  <span
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-[3px] rounded-md whitespace-nowrap"
                    style={{
                      fontFamily: FONT,
                      background: c.chipBg,
                      color: c.text,
                      border: `1px solid ${c.borderSoft}`,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: STATUS_DOT[q.status] ?? c.muted }}
                    />
                    {q.status}
                  </span>
                </div>
              )}
              {!hiddenCols.has("producer")     && <div className="text-[12px] truncate" style={{ fontFamily: FONT, color: c.text }} title={q.producer}>{q.producer}</div>}
            </div>
          ))}
        </div>
        </div>{/* /scroll area */}

        {/* Pagination — matches Overview's Renewals card pattern */}
        {(() => {
          const rangeStart = filtered.length === 0 ? 0 : (page - 1) * itemsPerPage + 1;
          const rangeEnd = Math.min(page * itemsPerPage, filtered.length);
          const atFirst = page === 1;
          const atLast = page === totalPages;
          return (
            <div
              className="flex items-center justify-between gap-3 px-5 py-3 flex-wrap"
              style={{ borderTop: `1px solid ${c.borderSoft}` }}
            >
              <span className="text-[11.5px]" style={{ fontFamily: FONT, color: c.muted }}>
                {rangeStart} – {rangeEnd} of {filtered.length} {filtered.length === 1 ? "quote" : "quotes"}
              </span>
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                {/* Page-size selector — custom popover matching toolbar dropdowns */}
                <div className="relative">
                  <button
                    onClick={() => { closeAllDropdowns(); setPageSizeOpen(o => !o); }}
                    className="flex items-center gap-1.5 pl-2.5 pr-2 py-1.5 rounded-lg cursor-pointer transition-colors text-[11.5px] font-medium"
                    style={{ fontFamily: FONT, background: c.cardBg, border: `1px solid ${c.border}`, color: c.text }}
                    onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                    onMouseLeave={e => (e.currentTarget.style.background = c.cardBg)}
                  >
                    1 – {itemsPerPage}
                    <ChevronDown className="w-3 h-3 transition-transform duration-200" style={{ opacity: 0.6, transform: pageSizeOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
                  </button>
                  {pageSizeOpen && (
                    <div
                      className="absolute right-0 z-30 rounded-lg overflow-hidden py-1 min-w-[110px]"
                      style={{
                        bottom: "calc(100% + 6px)",
                        background: c.cardBg,
                        border: `1px solid ${c.border}`,
                        boxShadow: "0 12px 28px rgba(15,23,42,0.10), 0 4px 8px rgba(15,23,42,0.04)",
                      }}
                    >
                      {[10, 20, 50].map(n => {
                        const active = itemsPerPage === n;
                        return (
                          <button
                            key={n}
                            onClick={() => { setItemsPerPage(n); setPage(1); setPageSizeOpen(false); }}
                            className="w-full px-2.5 py-1.5 text-left text-[11.5px] flex items-center gap-2 cursor-pointer transition-colors"
                            style={{ color: active ? c.accent : c.text, fontWeight: active ? 600 : 500, background: "transparent" }}
                            onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                          >
                            <Check className="w-3 h-3 flex-shrink-0" style={{ opacity: active ? 1 : 0, color: c.accent }} />
                            <span className="whitespace-nowrap">1 – {n}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={atFirst}
                  className="text-[11.5px] font-medium px-3 py-1.5 rounded-lg transition-colors"
                  style={{
                    fontFamily: FONT,
                    border: `1px solid ${c.border}`,
                    color: c.text,
                    background: c.cardBg,
                    opacity: atFirst ? 0.5 : 1,
                    cursor: atFirst ? "not-allowed" : "pointer",
                  }}
                  onMouseEnter={e => { if (!atFirst) e.currentTarget.style.background = c.hoverBg; }}
                  onMouseLeave={e => (e.currentTarget.style.background = c.cardBg)}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={atLast}
                  className="text-[11.5px] font-medium px-3 py-1.5 rounded-lg transition-colors"
                  style={{
                    fontFamily: FONT,
                    border: `1px solid ${c.border}`,
                    color: c.text,
                    background: c.cardBg,
                    opacity: atLast ? 0.5 : 1,
                    cursor: atLast ? "not-allowed" : "pointer",
                  }}
                  onMouseEnter={e => { if (!atLast) e.currentTarget.style.background = c.hoverBg; }}
                  onMouseLeave={e => (e.currentTarget.style.background = c.cardBg)}
                >
                  Next
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
