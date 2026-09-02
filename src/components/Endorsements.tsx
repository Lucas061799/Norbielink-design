"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, ChevronLeft, ChevronRight, ArrowUpRight, X, XCircle, Send, ClipboardList, Clock, CheckCircle2, Check } from "lucide-react";
import EndorsementBoard, { type EndorsementKey, ALL_ENDORSEMENT_TYPE_LABELS } from "./EndorsementBoard";

const FONT = "var(--font-montserrat), Montserrat, sans-serif";

type SearchBy = "Select" | "Policy Number" | "DBA" | "Applicant Name" | "Bond Number";
type View = "search" | "results" | "all-requests" | "form" | "success";

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
// Unified 15-status vocabulary shared with Quotes + Policies dropdowns.
type PolicyStatus =
  | "Incomplete" | "Submitted" | "Under Review" | "Requested Info"
  | "Declined" | "File Closed" | "Cancelled"
  | "Renewal Pending" | "Renewal Created"
  | "Approved" | "Bound"
  | "Paid-Bind Incomplete" | "Submission Incomplete"
  | "Issued" | "Bind Incomplete";
const SEARCH_RESULTS: SearchResult[] = [
  { submissionId: "VIC00003362",     policyNumber: "7038911131",     applicant: "Byrne Insurance Group",      lob: "Victor",         dba: "--",                                status: "Cancelled",             effective: "07/19/2026" },
  { submissionId: "VIC00003355",     policyNumber: "P102117404",     applicant: "MONTICELLO STAFFING LLC",                lob: "Victor",         dba: "--",                                status: "Bound",                 effective: "07/20/2026" },
  { submissionId: "QMWC0750104-E47", policyNumber: "WCB11144570800", applicant: "SB DE Production Test 2 LLC",            lob: "Worker's Comp",  dba: "SB DE Production Test 2 LLC",       status: "Bound",                 effective: "05/11/2026" },
  { submissionId: "QMWC0748621-E43", policyNumber: "WCB11144570700", applicant: "SB PA Production Test 3",                lob: "Worker's Comp",  dba: "SB PA Production Test 3",           status: "Submission Incomplete", effective: "05/29/2026" },
  { submissionId: "QMWC0754121-E48", policyNumber: "WCB11144570600", applicant: "SB Test 2 LLC",                          lob: "Worker's Comp",  dba: "SB Test 2 LLC",                     status: "Incomplete",            effective: "05/11/2026" },
  { submissionId: "QMWC0638232-E1",  policyNumber: "CWC03611900",    applicant: "OJM RENOVATIONS LLC",                    lob: "Worker's Comp",  dba: "OJM RENOVATIONS",                   status: "Cancelled",             effective: "09/26/2025" },
  { submissionId: "QMWC0583874-E1",  policyNumber: "CWC01145503",    applicant: "DG Construction LLC",                    lob: "Worker's Comp",  dba: "DG Construction",                   status: "Submission Incomplete", effective: "09/11/2025" },
  { submissionId: "QMWC0583845-E1",  policyNumber: "CWC01144203",    applicant: "DRYWALL SOLUTIONS LTD (A Corp)",         lob: "Worker's Comp",  dba: "DRYWALL SOLUTIONS LTD",             status: "Incomplete",            effective: "09/11/2025" },
  { submissionId: "QMWC0579022-E2",  policyNumber: "CWC01115103",    applicant: "Liam Russell",                           lob: "Worker's Comp",  dba: "R Pro Marlin Plumbing",             status: "Cancelled",             effective: "09/06/2025" },
  { submissionId: "QMWC0579023-E2",  policyNumber: "CWC01114603",    applicant: "WHITE GRAPE PAINTING INC",               lob: "Worker's Comp",  dba: "WHITE GRAPE PAINTING INC",          status: "Bound",                 effective: "09/06/2025" },
  { submissionId: "QMWC0612344-E1",  policyNumber: "CWC02233401",    applicant: "Harbor Marine Co.",                      lob: "Worker's Comp",  dba: "Harbor Marine",                     status: "Bound",                 effective: "08/22/2025" },
  { submissionId: "QMWC0620011-E1",  policyNumber: "CWC02241802",    applicant: "Sunrise Bakery LLC",                     lob: "Worker's Comp",  dba: "Sunrise Bakery",                    status: "Bound",                 effective: "08/15/2025" },
  { submissionId: "QMWC0611893-E1",  policyNumber: "CWC02220505",    applicant: "Metro Construction Inc",                 lob: "Worker's Comp",  dba: "Metro Construction",                status: "Incomplete",            effective: "08/01/2025" },
  { submissionId: "VIC00003401",     policyNumber: "7038933210",     applicant: "Acme Logistics LLC",                     lob: "Victor",         dba: "Acme Logistics",                    status: "Bound",                 effective: "07/28/2025" },
  { submissionId: "QMWC0599221-E1",  policyNumber: "CWC02015902",    applicant: "Redwood Landscaping",                    lob: "Worker's Comp",  dba: "Redwood Landscaping",               status: "Submission Incomplete", effective: "07/15/2025" },
  { submissionId: "QMWC0587123-E1",  policyNumber: "CWC01988307",    applicant: "Beacon Roofing Group",                   lob: "Worker's Comp",  dba: "Beacon Roofing",                    status: "Bound",                 effective: "06/30/2025" },
  { submissionId: "QMWC0575840-E1",  policyNumber: "CWC01875501",    applicant: "Silverline Plumbing Corp",               lob: "Worker's Comp",  dba: "Silverline Plumbing",               status: "Cancelled",             effective: "06/12/2025" },
  { submissionId: "VIC00003388",     policyNumber: "P102998214",     applicant: "Northgate Property Mgmt",                lob: "Victor",         dba: "Northgate PM",                      status: "Incomplete",            effective: "05/24/2025" },
  { submissionId: "QMWC0564012-E1",  policyNumber: "CWC01712208",    applicant: "Everglade Cleaning Svcs",                lob: "Worker's Comp",  dba: "Everglade Cleaning",                status: "Bound",                 effective: "05/10/2025" },
  { submissionId: "QMWC0552911-E1",  policyNumber: "CWC01640904",    applicant: "Peak Performance HVAC",                  lob: "Worker's Comp",  dba: "Peak HVAC",                         status: "Cancelled",             effective: "04/25/2025" },
  { submissionId: "QMWC0548023-E1",  policyNumber: "CWC01592013",    applicant: "Bluewater Marine Contractors",           lob: "Worker's Comp",  dba: "Bluewater Marine",                  status: "Submission Incomplete", effective: "04/09/2025" },
];

const SEARCH_OPTIONS: SearchBy[] = ["Select", "Policy Number", "DBA", "Applicant Name", "Bond Number"];

// Mock feed for the search-view "Recent endorsement requests" card. Flip
// to [] (or filter down) to preview the empty state. Real data would come
// from the requests API keyed to the current agency. The `seed` on each
// row feeds EndorsementBoard's submitted-recap view so clicking a row
// lands the user on the actual cards + values that were submitted, not
// on a shared demo batch.
type RecentSeed = {
  selected: EndorsementKey[];
  values: Record<string, Record<number, string>>;
  submittedOn?: string;
};
type RecentRequest = { id: string; insured: string; lob: string; type: string; date: string; status: string; seed: RecentSeed };
const recentRequests: RecentRequest[] = [
  {
    id: "VIC00004421", insured: "Acme Logistics", lob: "Worker's Comp", type: "Class Code / Payroll", date: "Apr 18, 2026", status: "Processing",
    seed: {
      submittedOn: "Apr 18, 2026",
      selected: ["classcode"],
      values: {
        classcode: {
          0: "04/18/2026",
          1: "Added Class Code 5474 (Painting NOC) for a new interior-painting crew starting Q2.",
          2: "1220 W Fulton Market", 3: "Chicago", 4: "IL", 5: "60607",
        },
      },
    },
  },
  {
    id: "VIC00004387", insured: "Sunrise Bakery", lob: "General Liability", type: "Change Address", date: "Apr 12, 2026", status: "Completed",
    seed: {
      submittedOn: "Apr 12, 2026",
      selected: ["mailing"],
      values: {
        mailing: { 0: "04/12/2026", 1: "412 Baker St", 2: "Portland", 3: "OR", 4: "97205" },
      },
    },
  },
  {
    id: "VIC00004356", insured: "Metro Construction", lob: "Worker's Comp", type: "Named Insured / DBA", date: "Apr 08, 2026", status: "Completed",
    seed: {
      submittedOn: "Apr 08, 2026",
      selected: ["namedinsured"],
      values: {
        namedinsured: {
          0: "04/08/2026",
          1: "Metro Construction LLC", 2: "Metro Construction",
          3: "Metro Construction & Design LLC", 4: "Metro C&D",
          5: "Rebranded after Q1 acquisition; both legal name and DBA updated.",
        },
      },
    },
  },
  {
    id: "VIC00004329", insured: "Harbor Marine Co.", lob: "Commercial Auto", type: "Update Limits", date: "Mar 30, 2026", status: "Completed",
    seed: {
      submittedOn: "Mar 30, 2026",
      selected: ["limits"],
      values: {
        limits: { 0: "03/30/2026", 1: "$1,000,000 / $1,000,000 / $1,000,000" },
      },
    },
  },
  {
    id: "VIC00004298", insured: "Cedar Ridge Roofing", lob: "Worker's Comp", type: "Waiver of Subrogation", date: "Mar 22, 2026", status: "Processing",
    seed: {
      submittedOn: "Mar 22, 2026",
      selected: ["waiver"],
      values: {
        waiver: { 0: "03/22/2026", 1: "Blanket" },
      },
    },
  },
  {
    id: "VIC00004271", insured: "Northwind Electric", lob: "Worker's Comp", type: "Officer Exclusion / Inclusion", date: "Mar 15, 2026", status: "Completed",
    seed: {
      submittedOn: "Mar 15, 2026",
      selected: ["officer"],
      values: {
        officer: { 0: "03/15/2026", 1: "Jordan", 2: "Reeves", 3: "President", 4: "Excluded" },
      },
    },
  },
  {
    id: "VIC00004244", insured: "Peak Landscaping", lob: "General Liability", type: "Cancellation Request", date: "Mar 08, 2026", status: "Cancelled",
    seed: {
      submittedOn: "Mar 08, 2026",
      selected: ["cancel"],
      values: {
        cancel: { 0: "03/08/2026", 1: "Business closing at end of season; agent will hand-deliver Acord 35." },
      },
    },
  },
  {
    id: "VIC00004219", insured: "Skyline Freight", lob: "Commercial Auto", type: "FEIN", date: "Feb 28, 2026", status: "Completed",
    seed: {
      submittedOn: "Feb 28, 2026",
      selected: ["fein"],
      values: {
        fein: { 0: "02/28/2026", 1: "12-3456789", 2: "Skyline Freight Holdings LLC", 3: "Skyline Freight" },
      },
    },
  },
  {
    id: "VIC00004202", insured: "Blue Harbor Diner", lob: "General Liability", type: "Reinstatement Request", date: "Feb 20, 2026", status: "Completed",
    seed: {
      submittedOn: "Feb 20, 2026",
      selected: ["reinstate"],
      values: {
        reinstate: { 0: "02/20/2026", 1: "Premium paid in full; reinstate effective today." },
      },
    },
  },
  {
    id: "VIC00004187", insured: "Ironclad Fabrication", lob: "Worker's Comp", type: "XMOD", date: "Feb 12, 2026", status: "Completed",
    seed: {
      submittedOn: "Feb 12, 2026",
      selected: ["xmod"],
      values: {
        xmod: { 0: "02/12/2026", 1: "0.87", 2: "Ironclad Fabrication Inc", 3: "Ironclad Fab" },
      },
    },
  },
];

export default function Endorsements({ isDark, layout = "3col", skipSearch = false }: { isDark: boolean; layout?: "3col" | "2col"; skipSearch?: boolean }) {
  // When `skipSearch` is on, land directly on the intake with the first
  // sample policy pre-selected. Used by the Design Option variants so
  // clicking the sidebar link jumps straight to the intake.
  const [view, setView] = useState<View>(skipSearch ? "form" : "search");

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
  const [intakePolicy, setIntakePolicy] = useState<SearchResult | null>(skipSearch ? SEARCH_RESULTS[0] : null);
  // When true, EndorsementBoard opens directly in its submitted recap state —
  // used by "View Existing" so users see the review page for a prior request.
  const [viewingExisting, setViewingExisting] = useState(false);
  // Seed used when the user clicks a specific row in the Recent card. Null
  // falls back to EndorsementBoard's built-in demo batch (used by the
  // generic "View Existing" chooser from the search results).
  const [submittedSeed, setSubmittedSeed] = useState<RecentSeed | null>(null);
  // All Requests view — status chip filter + in-page search over Request
  // ID / Insured. Kept flat here (not URL-synced) since the view is
  // ephemeral and users hop back to the Recent card frequently.
  const [reqStatusFilter, setReqStatusFilter] = useState<"All" | "Processing" | "Completed" | "Cancelled">("All");
  const [reqSearch, setReqSearch] = useState("");
  // Column sort for the All Requests table. Clicking a header cycles
  // asc → desc → cleared so users can quickly reorder by any column.
  type ReqSortKey = "id" | "lob" | "type" | "date" | "status";
  const [reqSort, setReqSort] = useState<{ key: ReqSortKey | null; dir: "asc" | "desc" }>({ key: "date", dir: "desc" });
  const cycleReqSort = (key: ReqSortKey) => {
    setReqSort(cur => {
      if (cur.key !== key) return { key, dir: "asc" };
      if (cur.dir === "asc") return { key, dir: "desc" };
      return { key: null, dir: "asc" };
    });
  };
  // Pagination for the All Requests table. Kept separate from the
  // search-results pagination so paging in one doesn't reset the other.
  const [reqPage, setReqPage] = useState(1);
  const [reqPerPage, setReqPerPage] = useState(10);
  const [reqPageSizeOpen, setReqPageSizeOpen] = useState(false);
  // TYPE column filter dropdown on the All Requests table. Empty set =
  // no filter (show all types). Checkboxes across the distinct types
  // present in the visible 12-month window.
  const [reqTypeFilter, setReqTypeFilter] = useState<Set<string>>(new Set());
  const [reqTypeOpen, setReqTypeOpen] = useState(false);
  const [reqTypeSearch, setReqTypeSearch] = useState("");
  const reqTypeRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!reqTypeOpen) return;
    const onDown = (e: MouseEvent) => {
      if (reqTypeRef.current && !reqTypeRef.current.contains(e.target as Node)) setReqTypeOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [reqTypeOpen]);
  // Search-results STATUS column filter. Empty set = show all. Options are
  // limited to the six statuses the platform surfaces for policy submissions
  // (per the Policies filter shown to the user).
  const [resultsStatusFilter, setResultsStatusFilter] = useState<Set<string>>(new Set());
  const [resultsStatusOpen, setResultsStatusOpen] = useState(false);
  const [resultsStatusSearch, setResultsStatusSearch] = useState("");
  const RESULTS_STATUS_OPTIONS = ["File Closed", "Cancelled", "Renewal Created", "Bound", "Paid-Bind Incomplete", "Issued"];
  const resultsStatusRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!resultsStatusOpen) return;
    const onDown = (e: MouseEvent) => {
      if (resultsStatusRef.current && !resultsStatusRef.current.contains(e.target as Node)) setResultsStatusOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [resultsStatusOpen]);

  // Pagination — matches the Policies table footer (10 / 20 / 50 per page).
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pageSizeOpen, setPageSizeOpen] = useState(false);

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

  const closeAll = () => { setSearchByOpen(false); setPageSizeOpen(false); };

  const filteredResults = SEARCH_RESULTS;
  const totalPages   = Math.max(1, Math.ceil(filteredResults.length / itemsPerPage));
  const currentPage  = Math.min(page, totalPages);
  const pagedResults = filteredResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const rangeStart   = filteredResults.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const rangeEnd     = Math.min(currentPage * itemsPerPage, filteredResults.length);

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
    setViewingExisting(false);
    setChooseOpen(false);
    setView("form");
  };

  // "View Existing" — open the intake surface but jump straight to its
  // submitted-recap view. Mock seeds a sample Contact Info change so the
  // recap has something to show; a real backend hookup would hydrate with
  // the previously-submitted request's data.
  const handleChooseExisting = () => {
    if (pendingResult) setIntakePolicy(pendingResult);
    // Chooser path uses the built-in demo batch, not a per-row seed.
    setSubmittedSeed(null);
    setViewingExisting(true);
    setChooseOpen(false);
    setView("form");
  };

  // Row click on the Recent card: same landing as View Existing but the
  // recap is seeded from the specific row so users see the cards + values
  // they actually submitted for that request.
  const handleChooseRecent = (r: RecentRequest) => {
    // Ensure the board has a policy anchor even if the user never picked
    // one from a search — recent rows can be clicked from the empty
    // search-view landing page.
    if (!intakePolicy) setIntakePolicy(SEARCH_RESULTS[0]);
    setSubmittedSeed(r.seed);
    setViewingExisting(true);
    setView("form");
  };

  const handleSubmit = () => setView("success");

  const handleBack = () => {
    // If the form was opened from a Recent-card row (submittedSeed set),
    // return to the All Requests view instead of the policy search — the
    // user is browsing their own submissions, not searching for a policy.
    if (submittedSeed) { setView("all-requests"); return; }
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
      {/* Section title — hidden in form view so the intake's own top bar
          reads as the page header without redundancy. */}
      {view !== "form" && (
        <div className="flex flex-col justify-center flex-shrink-0 mb-12"
          style={{ height: 71, borderBottom: `0.87px solid ${isDark ? "rgba(255,255,255,0.08)" : "#E5E7EB"}`, marginLeft: -48, marginRight: -48, paddingLeft: 28, paddingRight: 28 }}>
          <h1 className="text-[22px] font-normal" style={{ fontFamily: FONT, color: c.text }}>Endorsements</h1>
        </div>
      )}

      {view === "form" && intakePolicy && (
        <EndorsementBoard
          key={viewingExisting ? `existing-${submittedSeed ? recentRequests.findIndex(x => x.seed === submittedSeed) : "chooser"}` : "new"}
          isDark={isDark}
          onBack={handleBack}
          initialSubmitted={viewingExisting}
          submittedSeed={viewingExisting && submittedSeed ? submittedSeed : undefined}
          onNewRequest={() => { setViewingExisting(false); setSubmittedSeed(null); }}
        />
      )}

      {view !== "form" && (
      <div
        className={view === "results" || view === "all-requests" ? "flex-1 min-h-0 flex flex-col" : "flex-1 min-h-0 overflow-y-auto"}
        style={view === "results" || view === "all-requests" ? undefined : { paddingBottom: 48 }}
      >
        {(view === "search" || view === "results") && (
          <div className={view === "results" ? "flex flex-col gap-3 flex-1 min-h-0" : "flex flex-col gap-6"}>
          {view === "results" && (
            <div className="flex-shrink-0">
              <button onClick={() => setView("search")}
                className="inline-flex items-center gap-1.5 text-[12.5px] font-medium transition-colors"
                style={{ fontFamily: FONT, color: c.muted }}
                onMouseEnter={e => (e.currentTarget.style.color = c.text)}
                onMouseLeave={e => (e.currentTarget.style.color = c.muted)}>
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
            </div>
          )}
          {/* Card keeps `overflow: visible` so the Search By dropdown can
              spill past the card's bottom edge. The razz stroke lives in
              its own absolute wrapper below, which carries the overflow-
              hidden + rounded corners it needs to clip the stroke into a
              rounded top-corner shape. */}
          <div className="rounded-2xl flex-shrink-0 relative"
            style={{
              background: c.cardBg,
              border: `1px solid ${c.border}`,
              boxShadow: isDark ? "none" : "0 1px 3px rgba(15,23,42,0.04)",
            }}>
            <div
              aria-hidden
              className="rounded-2xl overflow-hidden pointer-events-none"
              style={{ position: "absolute", top: -1, left: -1, right: -1, bottom: -1 }}
            >
              <div
                style={{
                  // Negative offsets pull the overlay out into the border
                  // area so the razz fill reaches the outermost edge of the
                  // card; the wrapper's overflow-hidden + rounded-2xl then
                  // clips it into the rounded top corners.
                  position: "absolute", top: 0, left: 0, right: 0, height: 4,
                  background: "linear-gradient(90deg,#5C2ED4 0%,#A614C3 65%)",
                }}
              />
            </div>
            <div className={view === "results" ? "px-6 py-4" : "px-8 py-8"}>
              {view !== "results" && (
                <>
                  <div className="text-[15px] font-semibold mb-1" style={{ color: c.text }}>Find a Policy to Endorse</div>
                  <div className="text-[13px] mb-6" style={{ color: c.muted }}>Search by policy number, submission ID, or insured name.</div>
                </>
              )}

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
              { icon: Search,        title: "1. Find Your Policy",     body: "Search by policy number, submission ID, or insured name — we'll pull it up instantly." },
              { icon: ClipboardList, title: "2. Tell Us What Changed", body: "Add coverage, update limits, swap a vehicle — just describe the change and attach docs." },
              { icon: Send,          title: "3. We Route It",          body: "Once you submit, our team reviews your request and routes it to the right carrier team." },
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

          {/* Recent Policies — a small preview of the same policies table that
              appears on the results view. Clicking a row opens the chooser
              modal (New Request / View Existing). Recent Endorsement
              Requests feed is deferred to Phase 2. */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: c.cardBg, border: `1px solid ${c.border}`, boxShadow: isDark ? "none" : "0 1px 3px rgba(15,23,42,0.04)" }}>
            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: `1px solid ${c.border}` }}>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: c.muted }} />
                <span className="text-[14px] font-semibold" style={{ fontFamily: FONT, color: c.text }}>Recent Policies</span>
              </div>
              <button
                onClick={() => setView("results")}
                className="text-[12px] font-semibold transition-opacity hover:opacity-70"
                style={{ fontFamily: FONT, color: "#A614C3" }}>View all</button>
            </div>
            {(() => {
              // Match the Policies table exactly (px-5, plain-div headers,
              // truncating row cells, status pill flush with STATUS
              // header). Users see this as the same table shape.
              // Status + Effective are narrower than the text columns
              // so the pill and date sit close together instead of
              // leaving a wide gap between them.
              const grid = "1fr 1fr 1fr 1fr 1fr 0.85fr 0.75fr";
              return (
                <div>
                  <div className="grid px-5 py-3 gap-4"
                    style={{ gridTemplateColumns: grid, borderBottom: `1px solid ${c.border}`, background: c.mutedBg }}>
                    {["Submission ID", "Policy Number", "Applicant", "LOB", "DBA", "Status", "Effective"].map(h => (
                      <div key={h} className="text-[11px] font-bold uppercase tracking-wider"
                        style={{ fontFamily: FONT, color: c.muted, textAlign: h === "Effective" ? "right" : "left" }}>{h}</div>
                    ))}
                  </div>
                  {SEARCH_RESULTS.slice(0, 5).map((r, i, arr) => {
                    const statusDot = r.status === "Bound"                 ? "#73C9B7"
                                    : r.status === "Incomplete"            ? "#F59E0B"
                                    : r.status === "Submission Incomplete" ? "#F59E0B"
                                    :                                        "#EF4444";
                    return (
                      <button key={r.submissionId + "-" + i} onClick={() => handleSelectResult(r)}
                        className="grid px-5 py-3.5 items-center gap-4 transition-colors w-full text-left cursor-pointer"
                        style={{
                          gridTemplateColumns: grid,
                          borderBottom: i !== arr.length - 1 ? `1px solid ${c.border}` : "none",
                          background: "transparent",
                          fontFamily: FONT,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        <div className="text-[12px] font-semibold truncate" style={{ fontFamily: FONT, color: c.text }}>{r.submissionId}</div>
                        <div className="text-[12px] truncate" style={{ fontFamily: FONT, color: c.text }}>{r.policyNumber}</div>
                        <div className="text-[12px] truncate" style={{ fontFamily: FONT, color: c.text }} title={r.applicant}>{r.applicant}</div>
                        <div className="text-[12px] truncate" style={{ fontFamily: FONT, color: c.text }}>{r.lob}</div>
                        <div className="text-[12px] truncate" style={{ fontFamily: FONT, color: c.text }} title={r.dba}>{r.dba}</div>
                        <div className="flex items-center">
                          {/* Pull the pill left by border + horizontal
                              padding + dot + gap so the status TEXT
                              lines up with the STATUS header text. */}
                          <span
                            className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-[3px] rounded-md whitespace-nowrap"
                            style={{ fontFamily: FONT, background: c.mutedBg, color: c.text, border: `1px solid ${c.border}`, marginLeft: -21 }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: statusDot }} />
                            {r.status}
                          </span>
                        </div>
                        <div className="text-[12px] truncate text-right" style={{ fontFamily: FONT, color: c.text }}>{r.effective}</div>
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </div>
          </>)}

          {view === "results" && (<>
            {/* Results table — the persistent search card above already gives the user
                a way to change the query, so we skip the "Results for X — N matches"
                summary row.

                Sort arrows + status chip mirror the Policies / Quotes list styling so
                the results here read as part of the same table system. */}
            <div className="rounded-2xl overflow-hidden flex flex-col flex-1 min-h-0"
              style={{ background: c.cardBg, border: `1px solid ${c.border}`, boxShadow: isDark ? "none" : "0 1px 3px rgba(15,23,42,0.04)" }}>
              {/* Header + body share ONE scroll context so column widths stay
                  aligned when the body scrolls (Policies pattern). */}
              <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="grid px-6 py-3 gap-4 sticky top-0 z-10"
                style={{ gridTemplateColumns: "1.3fr 1.2fr 1.6fr 1fr 1.4fr 0.9fr 0.9fr", borderBottom: `1px solid ${c.border}`, background: c.mutedBg }}>
                {["Submission ID", "Policy Number", "Applicant", "LOB", "DBA", "Status", "Effective"].map(h => {
                  return (
                    <div key={h}
                      className="flex items-center text-[11px] font-bold uppercase tracking-wider"
                      style={{ fontFamily: FONT, color: c.muted }}
                    >
                      {h}
                      <span className="inline-flex ml-0.5">
                        <svg width="14" height="9" viewBox="0 0 14 9" fill="none">
                          <path d="M4 8V1M4 1L2 3M4 1L6 3" stroke={c.sub} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 1V8M10 8L8 6M10 8L12 6" stroke={c.sub} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </div>
                  );
                })}
              </div>
              {pagedResults.map((r, i, arr) => {
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
                      {/* Matches the Policies table status pill (neutral chip
                          + border + colored dot + dark text). Shifted -21px
                          so the STATUS text sits flush with the header text,
                          not offset by the pill's border+padding+dot+gap. */}
                      <span
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-[3px] rounded-md whitespace-nowrap"
                        style={{ fontFamily: FONT, background: c.mutedBg, color: c.text, border: `1px solid ${c.border}`, marginLeft: -21 }}
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
              </div>{/* /scroll body */}

              {/* Pagination footer — pinned at the bottom of the card. */}
              {(() => {
                const atFirst = currentPage === 1;
                const atLast  = currentPage === totalPages;
                return (
                  <div
                    className="flex items-center justify-between gap-3 px-5 py-3 flex-wrap"
                    style={{ borderTop: `1px solid ${c.border}` }}
                    onClick={e => e.stopPropagation()}
                  >
                    <span className="text-[11.5px]" style={{ fontFamily: FONT, color: c.muted }}>
                      {rangeStart} – {rangeEnd} of {filteredResults.length} {filteredResults.length === 1 ? "policy" : "policies"}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <button
                          onClick={() => { closeAll(); setPageSizeOpen(o => !o); }}
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
                                  style={{ fontFamily: FONT, color: active ? "#A614C3" : c.text, fontWeight: active ? 600 : 500, background: "transparent" }}
                                  onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                >
                                  <Check className="w-3 h-3 flex-shrink-0" style={{ opacity: active ? 1 : 0, color: "#A614C3" }} />
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
          </>)}
          </div>
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

        {view === "all-requests" && (() => {
          // Rolling 12-month window — anything older is hidden. Uses a
          // fixed reference date (today) so the demo is deterministic;
          // real data would call `new Date()` here.
          const now = new Date();
          const cutoff = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).getTime();
          const within12mo = recentRequests.filter(r => Date.parse(r.date) >= cutoff);
          // Filter + search over the full requests feed. Status "All"
          // short-circuits the status test; empty search keeps everyone.
          const filteredUnsorted = within12mo.filter(r => {
            if (reqStatusFilter !== "All" && r.status !== reqStatusFilter) return false;
            if (reqTypeFilter.size > 0 && !reqTypeFilter.has(r.type)) return false;
            const q = reqSearch.trim().toLowerCase();
            if (!q) return true;
            return r.id.toLowerCase().includes(q) || r.lob.toLowerCase().includes(q);
          });
          // Full catalog for the filter dropdown so users can pick any
          // endorsement type — not just the ones present in the current
          // 12-month window (avoids the dropdown silently omitting rare
          // types with no recent activity).
          const uniqueTypes = ALL_ENDORSEMENT_TYPE_LABELS;
          // Copy before sort so we don't mutate the mock feed's order.
          const filtered = reqSort.key === null ? filteredUnsorted : [...filteredUnsorted].sort((a, b) => {
            const k = reqSort.key!;
            const av = k === "date" ? Date.parse(a.date) : String(a[k] ?? "").toLowerCase();
            const bv = k === "date" ? Date.parse(b.date) : String(b[k] ?? "").toLowerCase();
            if (av < bv) return reqSort.dir === "asc" ? -1 : 1;
            if (av > bv) return reqSort.dir === "asc" ? 1 : -1;
            return 0;
          });
          const HEADER_KEYS: { label: string; key: ReqSortKey }[] = [
            { label: "Submission ID", key: "id" },
            { label: "Line of Business", key: "lob" },
            { label: "Type",          key: "type" },
            { label: "Submitted",     key: "date" },
            { label: "Status",        key: "status" },
          ];
          const chips: ("All" | "Processing" | "Completed" | "Cancelled")[] = ["All", "Processing", "Completed", "Cancelled"];
          const countFor = (k: "All" | "Processing" | "Completed" | "Cancelled") =>
            k === "All" ? within12mo.length : within12mo.filter(r => r.status === k).length;
          return (
            <div className="flex flex-col gap-3 flex-1 min-h-0">
              {/* Back to search sits as a slim row above the card. */}
              <div className="flex-shrink-0">
                <button onClick={() => setView("search")}
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-medium transition-colors"
                  style={{ fontFamily: FONT, color: c.muted }}
                  onMouseEnter={e => (e.currentTarget.style.color = c.text)}
                  onMouseLeave={e => (e.currentTarget.style.color = c.muted)}>
                  <ChevronLeft className="w-3.5 h-3.5" /> Back
                </button>
              </div>

              {/* Header card: title + status chips + search. Razz gradient
                  stroke overlay at the top matches the search card. The
                  outer card stays overflow-visible so the TYPE filter
                  dropdown can spill past its bottom edge; the stroke
                  wrapper below owns the overflow-hidden + rounded corners
                  it needs to clip the strip. */}
              <div className="rounded-2xl flex-shrink-0 relative"
                style={{ background: c.cardBg, border: `1px solid ${c.border}`, boxShadow: isDark ? "none" : "0 1px 3px rgba(15,23,42,0.04)" }}>
                <div
                  aria-hidden
                  className="rounded-2xl overflow-hidden pointer-events-none"
                  style={{ position: "absolute", top: -1, left: -1, right: -1, bottom: -1 }}
                >
                  <div
                    style={{
                      position: "absolute", top: 0, left: 0, right: 0, height: 4,
                      background: "linear-gradient(90deg,#5C2ED4 0%,#A614C3 65%)",
                    }}
                  />
                </div>
                <div className="px-6 pt-5 pb-3 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[15px] font-semibold" style={{ color: c.text }}>All Endorsement Requests</div>
                    <div className="text-[12.5px] mt-0.5" style={{ color: c.muted }}>Review the status of every request you&apos;ve submitted.</div>
                  </div>
                  <button onClick={() => setView("results")}
                    className="flex-shrink-0 inline-flex items-center gap-1 text-[12px] font-semibold transition-opacity hover:opacity-70"
                    style={{ fontFamily: FONT, color: "#A614C3" }}>
                    View All Policies
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="px-6 pb-4 flex items-center justify-between gap-4 flex-wrap" style={{ borderTop: `1px solid ${c.border}`, paddingTop: 12 }}>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {chips.map(k => {
                      const active = reqStatusFilter === k;
                      return (
                        <button key={k} onClick={() => setReqStatusFilter(k)}
                          className="inline-flex items-center gap-1.5 text-[12px] font-medium transition-colors"
                          style={{
                            fontFamily: FONT,
                            padding: "6px 12px",
                            borderRadius: 999,
                            border: active ? "1px solid transparent" : `1px solid ${c.border}`,
                            background: active
                              ? `linear-gradient(${c.cardBg}, ${c.cardBg}) padding-box, linear-gradient(to right, #5C2ED4 0%, #A614C3 65%) border-box`
                              : "transparent",
                            color: active ? "#A614C3" : c.muted,
                          }}
                          onMouseEnter={e => { if (!active) e.currentTarget.style.background = c.hoverBg; }}
                          onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                          {k}
                          <span className="text-[11px]" style={{ color: active ? "#A614C3" : c.sub }}>{countFor(k)}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="relative flex" style={{ minWidth: 280 }}>
                    <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: c.muted }} />
                    <input
                      value={reqSearch}
                      onChange={e => setReqSearch(e.target.value)}
                      placeholder="Search Submission ID or Line of Business..."
                      className="flex-1 outline-none w-full"
                      style={{ fontFamily: FONT, background: c.inputBg, border: `1px solid ${c.border}`, borderRadius: 10, color: c.text, padding: "8px 14px 8px 34px", fontSize: 13 }}
                    />
                  </div>
                </div>
              </div>

              {/* Results table */}
              <div className="rounded-2xl overflow-hidden flex flex-col flex-1 min-h-0"
                style={{ background: c.cardBg, border: `1px solid ${c.border}`, boxShadow: isDark ? "none" : "0 1px 3px rgba(15,23,42,0.04)" }}>
                <div className="flex-1 min-h-0 overflow-y-auto">
                  <div className="grid px-6 py-3 gap-4 sticky top-0 z-10"
                    style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", borderBottom: `1px solid ${c.border}`, background: c.mutedBg }}>
                    {HEADER_KEYS.map(h => {
                      const isActive = reqSort.key === h.key;
                      const isTypeCol = h.key === "type";
                      // TYPE column matches the Policies table pattern:
                      // single button + tiny down caret, dropdown with
                      // search + Select All + checkbox list + Reset. No
                      // separate sort arrows on this column.
                      if (isTypeCol) {
                        const filteredTypes = uniqueTypes.filter(t => !reqTypeSearch || t.toLowerCase().includes(reqTypeSearch.toLowerCase()));
                        const allChecked = reqTypeFilter.size === uniqueTypes.length && uniqueTypes.length > 0;
                        return (
                          <div key={h.key} className="relative" ref={reqTypeRef} onClick={e => e.stopPropagation()}>
                            <button onClick={() => setReqTypeOpen(o => !o)}
                              className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer select-none"
                              style={{ fontFamily: FONT, color: reqTypeFilter.size > 0 ? "#A614C3" : c.muted }}>
                              {h.label}
                              <span className="inline-flex ml-1">
                                <svg width="7" height="5" viewBox="0 0 7 5" fill="none">
                                  <path d="M3.5 5L0.5 0H6.5L3.5 5Z" fill={reqTypeFilter.size > 0 ? "#A614C3" : c.sub} />
                                </svg>
                              </span>
                            </button>
                            {reqTypeOpen && (
                              <div className="absolute top-full mt-1 z-30 rounded-xl shadow-lg overflow-hidden min-w-[240px]"
                                style={{ background: c.cardBg, border: `1px solid ${c.border}`, left: 0, textTransform: "none", letterSpacing: "normal" }}>
                                <div className="p-2" style={{ borderBottom: `1px solid ${c.border}` }}>
                                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                                    style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#F9FAFB", border: `1px solid ${c.border}` }}>
                                    <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.muted }} />
                                    <input value={reqTypeSearch} onChange={e => setReqTypeSearch(e.target.value)} placeholder="Search type"
                                      className="outline-none text-[12px] flex-1 bg-transparent" style={{ fontFamily: FONT, color: c.text }} />
                                  </div>
                                </div>
                                <div className="px-3 py-2" style={{ borderBottom: `1px solid ${c.border}` }}>
                                  <button className="flex items-center gap-2 text-[12px] w-full text-left" style={{ fontFamily: FONT, color: c.text }}
                                    onClick={() => setReqTypeFilter(allChecked ? new Set() : new Set(uniqueTypes))}>
                                    <div className="flex items-center justify-center w-4 h-4 rounded flex-shrink-0"
                                      style={{ border: `1.5px solid ${c.border}`, background: c.cardBg }}>
                                      {allChecked && (
                                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                      )}
                                    </div>
                                    Select All
                                  </button>
                                </div>
                                <div className="max-h-[180px] overflow-y-auto py-1">
                                  {filteredTypes.map(t => {
                                    const checked = reqTypeFilter.has(t);
                                    return (
                                      <button key={t} className="flex items-center gap-2 px-3 py-1.5 text-[12px] w-full text-left transition-colors"
                                        style={{ fontFamily: FONT, color: c.text }}
                                        onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                        onClick={() => setReqTypeFilter(prev => { const next = new Set(prev); if (next.has(t)) next.delete(t); else next.add(t); return next; })}>
                                        <div className="flex items-center justify-center w-4 h-4 rounded flex-shrink-0"
                                          style={{ border: `1.5px solid ${c.border}`, background: c.cardBg }}>
                                          {checked && (
                                            <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#A614C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                          )}
                                        </div>
                                        {t}
                                      </button>
                                    );
                                  })}
                                </div>
                                <button onClick={() => { setReqTypeFilter(new Set()); setReqTypeSearch(""); }}
                                  className="w-full flex items-center justify-center gap-2 py-3 text-[12px] font-semibold transition-colors"
                                  style={{ fontFamily: FONT, color: "#A614C3", background: "transparent", borderTop: `1px solid ${c.border}` }}
                                  onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                                  Reset Filter
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      }
                      return (
                        <button key={h.key} onClick={() => cycleReqSort(h.key)}
                          className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer select-none text-left"
                          style={{ fontFamily: FONT, color: c.muted, background: "transparent" }}>
                          {h.label}
                          <span className="inline-flex ml-0.5">
                            <svg width="14" height="9" viewBox="0 0 14 9" fill="none" aria-hidden>
                              <path d="M4 8V1M4 1L2 3M4 1L6 3" stroke={isActive && reqSort.dir === "asc" ? (isDark ? "#fff" : "#374151") : c.sub} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M10 1V8M10 8L8 6M10 8L12 6" stroke={isActive && reqSort.dir === "desc" ? (isDark ? "#fff" : "#374151") : c.sub} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                      <span className="inline-flex items-center justify-center mb-3"
                        style={{ width: 44, height: 44, borderRadius: 9999, background: c.mutedBg, border: `1px solid ${c.border}` }}>
                        <Clock className="w-5 h-5" style={{ color: c.muted }} />
                      </span>
                      <div className="text-[14px] font-semibold mb-1" style={{ fontFamily: FONT, color: c.text }}>
                        {reqTypeFilter.size > 0
                          ? (reqTypeFilter.size === 1
                              ? `No ${Array.from(reqTypeFilter)[0]} requests`
                              : "No requests match the selected types")
                          : "No requests match"}
                      </div>
                      <div className="text-[12px] max-w-[360px]" style={{ fontFamily: FONT, color: c.muted }}>
                        {reqTypeFilter.size > 0
                          ? "None have been submitted in the last 12 months. Clear the filter to widen the view."
                          : "Try clearing the search or switching the status filter."}
                      </div>
                      {(reqTypeFilter.size > 0 || reqSearch || reqStatusFilter !== "All") && (
                        <button
                          onClick={() => { setReqTypeFilter(new Set()); setReqSearch(""); setReqStatusFilter("All"); }}
                          className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
                          style={{ fontFamily: FONT, color: "#A614C3", background: "transparent", border: `1px solid ${c.border}` }}
                          onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          Clear all filters
                        </button>
                      )}
                    </div>
                  ) : (
                    filtered.slice((Math.min(reqPage, Math.max(1, Math.ceil(filtered.length / reqPerPage))) - 1) * reqPerPage, Math.min(reqPage, Math.max(1, Math.ceil(filtered.length / reqPerPage))) * reqPerPage).map((r, i, arr) => {
                      const statusColor = r.status === "Processing"
                        ? { color: "#B45309", bg: isDark ? "rgba(245,158,11,0.15)" : "rgba(245,158,11,0.12)" }
                        : r.status === "Cancelled"
                        ? { color: "#B91C1C", bg: isDark ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.10)" }
                        : { color: "#0F7A63", bg: isDark ? "rgba(115,201,183,0.15)" : "rgba(115,201,183,0.12)" };
                      return (
                        <button key={r.id} onClick={() => handleChooseRecent(r)}
                          className="grid px-6 py-3.5 items-center gap-4 transition-colors w-full text-left"
                          style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", borderBottom: i !== arr.length - 1 ? `1px solid ${c.border}` : "none", background: "transparent", fontFamily: FONT, cursor: "pointer" }}
                          onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          <div className="text-[12px] font-semibold" style={{ color: c.text }}>{r.id}</div>
                          <div className="text-[12px]" style={{ color: c.text }}>{r.lob}</div>
                          <div className="text-[12px] truncate" style={{ color: c.muted }}>
                        {r.type}
                        {r.seed.selected.length === 2 && (
                          <span style={{ color: c.sub }}> + 1 more</span>
                        )}
                        {r.seed.selected.length > 2 && (
                          <span style={{ color: c.sub }}> /...</span>
                        )}
                      </div>
                          <div className="text-[12px]" style={{ color: c.muted }}>{r.date}</div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit"
                            style={{ background: statusColor.bg }}>
                            {r.status === "Processing"
                              ? <Clock className="w-3 h-3" style={{ color: statusColor.color }} />
                              : r.status === "Cancelled"
                              ? <XCircle className="w-3 h-3" style={{ color: statusColor.color }} />
                              : <CheckCircle2 className="w-3 h-3" style={{ color: statusColor.color }} />}
                            <span className="text-[11px] font-semibold" style={{ color: statusColor.color }}>{r.status}</span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Pagination footer — pinned at the bottom of the card,
                    same shape as the search-results footer so both tables
                    read as part of the same system. */}
                {(() => {
                  const totalReqPages = Math.max(1, Math.ceil(filtered.length / reqPerPage));
                  const currentReqPage = Math.min(reqPage, totalReqPages);
                  const reqRangeStart = filtered.length === 0 ? 0 : (currentReqPage - 1) * reqPerPage + 1;
                  const reqRangeEnd = Math.min(currentReqPage * reqPerPage, filtered.length);
                  const atFirst = currentReqPage === 1;
                  const atLast = currentReqPage === totalReqPages;
                  return (
                    <div
                      className="flex items-center justify-between gap-3 px-5 py-3 flex-wrap"
                      style={{ borderTop: `1px solid ${c.border}` }}
                      onClick={e => e.stopPropagation()}
                    >
                      <span className="text-[11.5px]" style={{ fontFamily: FONT, color: c.muted }}>
                        {reqRangeStart} – {reqRangeEnd} of {filtered.length} {filtered.length === 1 ? "request" : "requests"}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <button
                            onClick={() => setReqPageSizeOpen(o => !o)}
                            className="flex items-center gap-1.5 pl-2.5 pr-2 py-1.5 rounded-lg cursor-pointer transition-colors text-[11.5px] font-medium"
                            style={{ fontFamily: FONT, background: c.cardBg, border: `1px solid ${c.border}`, color: c.text }}
                            onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                            onMouseLeave={e => (e.currentTarget.style.background = c.cardBg)}
                          >
                            1 – {reqPerPage}
                            <ChevronDown className="w-3 h-3 transition-transform duration-200" style={{ opacity: 0.6, transform: reqPageSizeOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
                          </button>
                          {reqPageSizeOpen && (
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
                                const active = reqPerPage === n;
                                return (
                                  <button
                                    key={n}
                                    onClick={() => { setReqPerPage(n); setReqPage(1); setReqPageSizeOpen(false); }}
                                    className="w-full px-2.5 py-1.5 text-left text-[11.5px] flex items-center gap-2 cursor-pointer transition-colors"
                                    style={{ fontFamily: FONT, color: active ? "#A614C3" : c.text, fontWeight: active ? 600 : 500, background: "transparent" }}
                                    onMouseEnter={e => (e.currentTarget.style.background = c.hoverBg)}
                                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                  >
                                    <Check className="w-3 h-3 flex-shrink-0" style={{ opacity: active ? 1 : 0, color: "#A614C3" }} />
                                    <span className="whitespace-nowrap">1 – {n}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => setReqPage(p => Math.max(1, p - 1))}
                          disabled={atFirst}
                          className="text-[11.5px] font-medium px-3 py-1.5 rounded-lg transition-colors"
                          style={{ fontFamily: FONT, border: `1px solid ${c.border}`, color: c.text, background: c.cardBg, opacity: atFirst ? 0.5 : 1, cursor: atFirst ? "not-allowed" : "pointer" }}
                          onMouseEnter={e => { if (!atFirst) e.currentTarget.style.background = c.hoverBg; }}
                          onMouseLeave={e => (e.currentTarget.style.background = c.cardBg)}
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setReqPage(p => Math.min(totalReqPages, p + 1))}
                          disabled={atLast}
                          className="text-[11.5px] font-medium px-3 py-1.5 rounded-lg transition-colors"
                          style={{ fontFamily: FONT, border: `1px solid ${c.border}`, color: c.text, background: c.cardBg, opacity: atLast ? 0.5 : 1, cursor: atLast ? "not-allowed" : "pointer" }}
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
        })()}

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
      )}
    </div>
  );
}
