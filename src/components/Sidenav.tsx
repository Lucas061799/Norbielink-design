"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import norbielinkLogo from "@/assets/norbielink-logo.png";
import norbielinkLogoDark from "@/assets/norbielink-logo-dark.png";
import norbieface from "@/assets/norbieface.png";
import jungleBg from "@/assets/sidebar-bg.png";
import {
  LayoutGrid, Sparkles, FileText, Shield,
  Briefcase, CreditCard, BookOpen, FileEdit,
  Wrench, HelpCircle, UserCog, Building2, Globe, ChevronDown, Users,
  User, LogOut, X, Images, Pencil, ZoomIn, ZoomOut, AlertTriangle,
} from "lucide-react";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: string;
  hasChevron?: boolean;
  isDark?: boolean;
  onClick?: () => void;
}

function NavItem({ icon, label, active, badge, hasChevron, isDark, onClick }: NavItemProps) {
  const [hovered, setHovered] = useState(false);

  const getStyle = () => {
    if (active) {
      return isDark
        ? { background: "linear-gradient(to bottom, #191D35 0%, #582A75 48%, #9D37BC 100%)", border: "1px solid rgba(166,20,195,0.8)", boxShadow: "0 0 8px rgba(166,20,195,0.5)" }
        : { background: "linear-gradient(white,white) padding-box, linear-gradient(to right,#5C2ED4 0%,#A614C3 65%) border-box", border: "1px solid transparent", boxShadow: "0 0 8px rgba(166,20,195,0.4)" };
    }
    if (hovered) {
      return isDark
        ? { background: "linear-gradient(to bottom, #191D35 0%, #582A75 48%, #9D37BC 100%)", border: "1px solid transparent" }
        : { background: "linear-gradient(white,white) padding-box, linear-gradient(to right,#5C2ED4 0%,#A614C3 65%) border-box", border: "1px solid transparent" };
    }
    return { border: "1px solid transparent" };
  };

  const isHoveredDark = hovered && isDark && !active;
  const isActiveDark = active && isDark;
  const iconColor  = isActiveDark ? "#A614C3" : active ? "#A614C3" : isHoveredDark ? "#ffffff" : isDark ? "#8B8FA8" : "#9CA3AF";
  const textColor  = isActiveDark ? "#ffffff" : active ? "#2D3653" : isHoveredDark ? "#ffffff" : isDark ? "#8B8FA8" : "#6B7280";
  const chevronColor = isActiveDark ? "#ffffff" : isHoveredDark ? "#ffffff" : isDark ? "#8B8FA8" : "#9CA3AF";

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-full flex items-center gap-3 px-3 py-[7px] rounded-xl text-left transition-all cursor-pointer"
      style={getStyle()}
    >
      <span className="w-[18px] h-[18px] flex-shrink-0" style={{ color: iconColor }}>
        {icon}
      </span>
      <span className="flex-1 font-medium text-[13px] whitespace-nowrap truncate" style={{ color: textColor }}>
        {label}
      </span>
      {badge && (
        isDark ? (
          <span
            className="text-[10px] font-semibold px-[7px] py-[2px] rounded-full leading-tight"
            style={isActiveDark ? {
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.4)",
              color: "#ffffff",
            } : {
              background: "linear-gradient(#1E2240, #1E2240) padding-box, linear-gradient(to right,#5C2ED4 0%,#A614C3 65%) border-box",
              border: "1px solid transparent",
              color: "#C084FC",
            }}
          >
            {badge}
          </span>
        ) : (
          <span className="text-[10px] font-semibold px-[6px] py-[1px] rounded-full leading-tight" style={{ border: "1px solid #74C3B7", color: "#74C3B7" }}>
            {badge}
          </span>
        )
      )}
      {hasChevron && (
        <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: chevronColor }} />
      )}
    </button>
  );
}

interface SidenavProps {
  isDark?: boolean;
  onToggleDark?: () => void;
  activeItem?: string;
  onActiveChange?: (item: string) => void;
  // Super admin role — surfaced as a toggle inside the profile modal. Lifted
  // to DashboardShell so the same value drives both the sidenav toggle and
  // the internal Agencies "Accounting" tab visibility.
  isSuperAdmin?: boolean;
  onToggleSuperAdmin?: () => void;
}

export default function Sidenav({ isDark = false, onToggleDark, activeItem = "Marketplace", onActiveChange, isSuperAdmin = false, onToggleSuperAdmin }: SidenavProps) {
  const [legacyView, setLegacyView] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);
  // Profile modal — opens on both "Profile" and "Sign Out" for the demo.
  // Two steps: "overview" (avatar + Change Profile Picture + User ID editor) and "photo" (drag/drop + crop).
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileStep, setProfileStep] = useState<"overview" | "photo">("overview");
  const [profileDrag, setProfileDrag] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  // User Name = First Name + Last Name (what the user picks). User ID = system-assigned identifier with numbers (read-only).
  // Stored as two separate fields so first / last can be addressed independently downstream
  // (e.g. "Hi John" greetings, sortable by last name, etc.).
  const [firstName, setFirstName] = useState("John");
  const [lastName,  setLastName]  = useState("Smith");
  const [savedFirstName, setSavedFirstName] = useState("John");
  const [savedLastName,  setSavedLastName]  = useState("Smith");
  const userId = "johnsmith01"; // system-assigned, shown as @userId, never edited by the user
  // Inline validation (required-field) for the User Name fields. Duplicates are allowed.
  const [userNameError, setUserNameError] = useState<string | null>(null);
  // Top-right success toast that appears after a successful profile save.
  const [profileToast, setProfileToast] = useState<{ title: string; description: string } | null>(null);
  useEffect(() => {
    if (!profileToast) return;
    const t = setTimeout(() => setProfileToast(null), 4000);
    return () => clearTimeout(t);
  }, [profileToast]);
  // Photo crop controls — zoom and offset within the crop circle.
  const [imageZoom, setImageZoom]       = useState(1);
  const [imageOffsetX, setImageOffsetX] = useState(0);
  const [imageOffsetY, setImageOffsetY] = useState(0);
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const resetCrop = () => { setImageZoom(1); setImageOffsetX(0); setImageOffsetY(0); };
  // Display name is the saved First + Last. Initials are the first character of each
  // so the avatar chip and the sidebar button stay in sync when the user edits their name.
  const displayName = `${savedFirstName} ${savedLastName}`.trim();
  const initials = ((savedFirstName[0] ?? "") + (savedLastName[0] ?? "")).toUpperCase();

  // Close the My Account menu on outside click.
  useEffect(() => {
    if (!accountOpen) return;
    const handler = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [accountOpen]);

  const darkMode = isDark;

  const navItems = [
    { label: "Marketplace",       icon: <LayoutGrid className="w-[18px] h-[18px]" /> },
    { label: "Appetite Assistant", icon: <Sparkles  className="w-[16px] h-[16px]" /> },
    { label: "Quotes",            icon: <FileText   className="w-[18px] h-[18px]" /> },
    { label: "Policies",          icon: <Shield     className="w-[18px] h-[18px]" /> },
    { label: "Clients",           icon: <Users      className="w-[18px] h-[18px]" /> },
    { label: "ProSuite",          icon: <Briefcase  className="w-[18px] h-[18px]" />, badge: "PRO", hasChevron: true },
    { label: "Make a Payment",    icon: <CreditCard className="w-[18px] h-[18px]" /> },
    { label: "Accounting",        icon: <BookOpen   className="w-[18px] h-[18px]" />, hasChevron: true },
    { label: "Endorsements",      icon: <FileEdit   className="w-[18px] h-[18px]" /> },
    { label: "Tools & Resources", icon: <Wrench     className="w-[18px] h-[18px]" />, hasChevron: true },
    { label: "Support",           icon: <HelpCircle className="w-[18px] h-[18px]" /> },
    { label: "Admin",             icon: <UserCog    className="w-[18px] h-[18px]" /> },
    { label: "Agencies",          icon: <Building2  className="w-[18px] h-[18px]" /> },
    { label: "Website",           icon: <Globe      className="w-[18px] h-[18px]" /> },
  ];

  return (
    <aside
      className="w-[220px] min-h-screen flex flex-col relative overflow-hidden flex-shrink-0 transition-colors duration-300"
      style={{
        background: isDark ? "#191D35" : "#ffffff",
        borderRight: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #F3F4F6",
      }}
    >
      {/* Jungle bg — full image, no crop */}
      <Image
        src={jungleBg} alt=""
        className="absolute bottom-0 left-0 w-full pointer-events-none select-none"
        style={{ height: "auto", opacity: 1, clipPath: "inset(0 1px 0 0)" }}
      />

      {/* Logo */}
      <div className="px-4 pt-5 pb-3 relative z-10">
        <Image src={isDark ? norbielinkLogoDark : norbielinkLogo} alt="Norbielink" className="h-7 w-auto" />
      </div>

      {/* User Profile */}
      <div className={`px-3 pb-3 relative ${accountOpen ? "z-40" : "z-10"}`} ref={accountRef}>
        <button onClick={() => setAccountOpen(o => !o)}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-xl transition-colors"
          style={{ background: accountOpen ? (isDark ? "rgba(255,255,255,0.06)" : "#F9FAFB") : "transparent" }}
          onMouseEnter={e => { if (!accountOpen) e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : "#F9FAFB"; }}
          onMouseLeave={e => { if (!accountOpen) e.currentTarget.style.background = "transparent"; }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden relative"
            style={{
              border: profilePreview ? `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "#E5E7EB"}` : "2.5px solid #73C9B7",
              background: profilePreview ? "transparent" : (isDark ? "rgba(115,201,183,0.18)" : "rgba(115,201,183,0.10)"),
            }}>
            {profilePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profilePreview} alt="Avatar"
                className="absolute"
                style={{
                  left: "50%", top: "50%",
                  transform: `translate(-50%, -50%) translate(${imageOffsetX * 0.22}px, ${imageOffsetY * 0.22}px) scale(${imageZoom})`,
                  transformOrigin: "center",
                  width: "100%", height: "100%",
                  objectFit: "cover",
                }} />
            ) : (
              <span
                style={{
                  fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  background: "linear-gradient(135deg, #73C9B7 0%, #4FA897 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {initials}
              </span>
            )}
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="text-[13px] font-bold truncate leading-tight" style={{ color: isDark ? "#F9FAFB" : "#2D3653" }}>
              {displayName}
            </div>
            <div className="text-[11px] leading-tight truncate" style={{ color: isDark ? "#8B8FA8" : "#9CA3AF" }}>
              ProSuite Member
            </div>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${accountOpen ? "rotate-180" : ""}`}
            style={{ color: isDark ? "#8B8FA8" : "#9CA3AF" }} />
        </button>

        {/* My Account dropdown */}
        {accountOpen && (
          <div className="absolute z-50"
            style={{
              left: 12, right: 12, top: "calc(100% - 4px)",
              fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
              background: isDark ? "#1E2240" : "#fff",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "#E5E7EB"}`,
              borderRadius: 12,
              boxShadow: "0 12px 32px rgba(0,0,0,0.14)",
              padding: 4,
            }}>
            <div className="px-3 py-2"
              style={{ borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#F3F4F6"}` }}>
              <span className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: isDark ? "#8B8FA8" : "#9CA3AF", letterSpacing: "0.06em" }}>My Account</span>
            </div>
            {([
              { label: "Profile",  Icon: User,   onClick: () => { setAccountOpen(false); setProfileStep("overview"); setProfileOpen(true); } },
              { label: "Sign Out", Icon: LogOut, onClick: () => { setAccountOpen(false); setProfileStep("overview"); setProfileOpen(true); } },
            ] as const).map(({ label, Icon, onClick }) => {
              const dropBg = isDark ? "#1E2240" : "#ffffff";
              return (
                <button key={label} onClick={onClick}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all"
                  style={{
                    color: isDark ? "#F9FAFB" : "#2D3653",
                    background: "transparent",
                    border: "1px solid transparent",
                  }}
                  onMouseEnter={e => {
                    // Gradient-border + purple glow — same treatment as the active nav item (e.g. Admin)
                    e.currentTarget.style.background = `linear-gradient(${dropBg}, ${dropBg}) padding-box, linear-gradient(to right, #5C2ED4 0%, #A614C3 65%) border-box`;
                    e.currentTarget.style.boxShadow = "0 0 8px rgba(166,20,195,0.4)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.boxShadow = "none";
                  }}>
                  <Icon className="w-4 h-4 flex-shrink-0" style={{ color: isDark ? "#8B8FA8" : "#6B7280" }} strokeWidth={1.75} />
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 mb-2 relative z-10" style={{ borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#F3F4F6"}` }} />

      {/* Nav Items */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto relative z-10" style={{ scrollbarWidth: "none" }}>
        {navItems.map((item) => (
          <NavItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            active={activeItem === item.label}
            badge={item.badge}
            hasChevron={item.hasChevron}
            isDark={isDark}
            onClick={() => onActiveChange?.(item.label)}
          />
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 pb-4 pt-2 space-y-2 relative z-10">

        {/* Chat with Norbie — always has border + subtle bg */}
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
          style={{
            background: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.7)",
            border: isDark ? "1.5px solid rgba(255,255,255,0.12)" : "1.5px solid #E5E7EB",
          }}
        >
          <Image src={norbieface} alt="Norbie" className="w-8 h-8 rounded-full flex-shrink-0 object-cover" />
          <div className="text-left">
            <div className="text-[12px] font-semibold" style={{ color: isDark ? "#F9FAFB" : "#2D3653" }}>
              Chat with Norbie
            </div>
            <div className="text-[10px]" style={{ color: isDark ? "#8B8FA8" : "#9CA3AF" }}>AI Assistant</div>
          </div>
        </button>

        {/* Divider */}
        <div style={{ borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#F3F4F6"}` }} />

        {/* Dark Mode — no border */}
        <button
          onClick={onToggleDark}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
          style={{ background: isDark ? "rgba(255,255,255,0.06)" : "transparent" }}
        >
          <div className="w-9 h-5 rounded-full relative transition-all shrink-0"
            style={{ background: isDark ? "#E8622A" : "#D1D5DB" }}>
            <div className="absolute top-0.5 w-4 h-4 rounded-full shadow transition-all flex items-center justify-center bg-white"
              style={{ left: isDark ? "19px" : "2px" }}>
              {isDark ? (
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                </svg>
              ) : (
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              )}
            </div>
          </div>
          <span style={{ fontSize: "13px", fontWeight: 400, color: isDark ? "#F9FAFB" : "#6B7280" }}>Dark Mode</span>
        </button>

        {/* Legacy View — no border, no icon in knob */}
        <button
          onClick={() => setLegacyView(!legacyView)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
          style={{ background: legacyView && isDark ? "rgba(255,255,255,0.06)" : "transparent" }}
        >
          <div className="w-9 h-5 rounded-full relative transition-all shrink-0"
            style={{ background: legacyView ? "#E8622A" : "#D1D5DB" }}>
            <div className="absolute top-0.5 w-4 h-4 rounded-full shadow-sm bg-white transition-all"
              style={{ left: legacyView ? "19px" : "2px" }} />
          </div>
          <span style={{ fontSize: "13px", fontWeight: 400, color: isDark ? "#F9FAFB" : "#6B7280" }}>Legacy View</span>
        </button>

        {/* Super Admin — role toggle. On unlocks the internal Agencies
            "Accounting" tab (ITC record view/edit). Sits with the other
            session toggles because it's a preview-time role switch, not a
            profile setting. Uses the purple brand accent on-state so it
            reads as a permission toggle rather than a UI-mode toggle. */}
        <button
          onClick={() => onToggleSuperAdmin?.()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
          style={{ background: isSuperAdmin && isDark ? "rgba(255,255,255,0.06)" : "transparent" }}
        >
          <div className="w-9 h-5 rounded-full relative transition-all shrink-0"
            style={{ background: isSuperAdmin ? "#A614C3" : "#D1D5DB" }}>
            <div className="absolute top-0.5 w-4 h-4 rounded-full shadow-sm bg-white transition-all"
              style={{ left: isSuperAdmin ? "19px" : "2px" }} />
          </div>
          <span style={{ fontSize: "13px", fontWeight: 400, color: isDark ? "#F9FAFB" : "#6B7280" }}>Super Admin</span>
        </button>

      </div>

      {/* Profile picture modal */}
      {profileOpen && (() => {
        const cardBg = isDark ? "#191D35" : "#ffffff";
        const text   = isDark ? "#F9FAFB" : "#1F2937";
        const muted  = isDark ? "#8B8FA8" : "#6B7280";
        const border = isDark ? "rgba(255,255,255,0.12)" : "#E5E7EB";
        const subtle = isDark ? "rgba(255,255,255,0.04)" : "#F9FAFB";
        const handlePick = (file?: File) => {
          if (!file) return;
          const url = URL.createObjectURL(file);
          setProfilePreview(url);
          resetCrop();
        };
        const close = () => { setProfileOpen(false); setProfileDrag(false); setProfilePreview(null); resetCrop(); setUserNameError(null); };
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6"
            style={{ background: "rgba(0,0,0,0.45)" }}
            onClick={close}>
            <div className="rounded-2xl flex flex-col"
              style={{
                fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                background: cardBg, border: `1px solid ${border}`,
                width: "min(560px, 92vw)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.20)",
              }}
              onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-start justify-between px-6 pt-5 pb-4"
                style={{ borderBottom: `1px solid ${border}` }}>
                <h3 className="text-[16px] font-bold" style={{ color: text }}>
                  {profileStep === "overview" ? "Profile" : "Add a Profile Photo"}
                </h3>
                <button onClick={close}
                  className="flex-shrink-0 transition-colors"
                  style={{ background: "transparent", border: "none", color: muted, cursor: "pointer", padding: 2 }}
                  aria-label="Close">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Step 1 — Profile overview */}
              {profileStep === "overview" && (
                <>
                  {/* Identity hero — clean centered layout, no colored background */}
                  <div className="relative flex flex-col items-center px-6 pt-8 pb-5">
                    <button onClick={() => { setProfileStep("photo"); setProfileDrag(false); }}
                      className="relative group flex-shrink-0 mb-3"
                      style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer" }}
                      aria-label="Change profile picture">
                      <div className="w-[88px] h-[88px] rounded-full flex items-center justify-center overflow-hidden transition-all relative"
                        style={{
                          border: profilePreview ? `1px solid ${border}` : "3px solid #73C9B7",
                          background: profilePreview ? "transparent" : (isDark ? "rgba(115,201,183,0.18)" : "rgba(115,201,183,0.10)"),
                        }}>
                        {profilePreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={profilePreview} alt="Avatar"
                            className="absolute"
                            style={{
                              left: "50%", top: "50%",
                              transform: `translate(-50%, -50%) translate(${imageOffsetX * 0.52}px, ${imageOffsetY * 0.52}px) scale(${imageZoom})`,
                              transformOrigin: "center",
                              width: "100%", height: "100%",
                              objectFit: "cover",
                            }} />
                        ) : (
                          <span style={{
                            fontSize: 28, fontWeight: 600, letterSpacing: "0.02em",
                            background: "linear-gradient(135deg, #73C9B7 0%, #4FA897 100%)",
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                          }}>{initials}</span>
                        )}
                      </div>
                      {/* Edit chip — clean circle that contrasts against the modal in both themes */}
                      <span className="absolute flex items-center justify-center transition-all group-hover:shadow-md"
                        style={{
                          right: 0, bottom: 2,
                          width: 28, height: 28, borderRadius: 9999,
                          background: isDark ? "#F9FAFB" : "#ffffff",
                          border: `1px solid ${isDark ? "rgba(0,0,0,0.10)" : "#E5E7EB"}`,
                          boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.35)" : "0 2px 6px rgba(15,23,42,0.12)",
                        }}>
                        <Pencil className="w-3 h-3" style={{ color: "#A614C3" }} strokeWidth={2} />
                      </span>
                    </button>
                    {/* User ID is the prominent identity — it's the unique handle that never
                        changes. The display name + member status sits below as secondary info.
                        "User ID:" label kept at lighter weight + muted color so the focus lands
                        on the ID itself, not the label. */}
                    <div className="text-[18px] font-bold leading-tight" style={{ color: text }}>
                      <span style={{ fontWeight: 500, color: muted }}>User ID:</span> {userId}
                    </div>
                    <div className="text-[12px] mt-0.5" style={{ color: muted }}>
                      {displayName} · ProSuite Member
                    </div>
                  </div>


                  {/* User Name — split into First + Last Name. "User Name" is the section
                      header; each input gets its own small caption so the user can still tell
                      which is which after the placeholder disappears. No input sanitizer —
                      users may have names with accented characters, periods (e.g. "John A."),
                      or other punctuation we shouldn't pre-filter. Validation only checks
                      that both fields are non-empty on save. */}
                  <div className="px-6 pt-2 pb-2">
                    <label className="text-[12px] font-semibold block mb-1.5" style={{ color: text }}>User Name</label>
                    <div className="flex gap-2">
                      <div className="flex-1 min-w-0">
                        <label className="text-[11px] block mb-1" style={{ color: muted }}>First Name</label>
                        <input value={firstName}
                          onChange={e => {
                            setFirstName(e.target.value);
                            if (userNameError) setUserNameError(null);
                          }}
                          placeholder="First Name"
                          className="w-full px-3 py-2 rounded-lg text-[13px] outline-none transition-colors"
                          style={{
                            background: cardBg,
                            border: `1px solid ${userNameError ? "#EF4444" : border}`,
                            color: text,
                          }}
                          onFocus={e => { if (!userNameError) e.currentTarget.style.borderColor = "#A614C3"; }}
                          onBlur={e => { e.currentTarget.style.borderColor = userNameError ? "#EF4444" : border; }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="text-[11px] block mb-1" style={{ color: muted }}>Last Name</label>
                        <input value={lastName}
                          onChange={e => {
                            setLastName(e.target.value);
                            if (userNameError) setUserNameError(null);
                          }}
                          placeholder="Last Name"
                          className="w-full px-3 py-2 rounded-lg text-[13px] outline-none transition-colors"
                          style={{
                            background: cardBg,
                            border: `1px solid ${userNameError ? "#EF4444" : border}`,
                            color: text,
                          }}
                          onFocus={e => { if (!userNameError) e.currentTarget.style.borderColor = "#A614C3"; }}
                          onBlur={e => { e.currentTarget.style.borderColor = userNameError ? "#EF4444" : border; }} />
                      </div>
                    </div>
                    {userNameError && (
                      <div className="text-[11px] mt-1.5 flex items-center gap-1.5" style={{ color: "#EF4444", lineHeight: "16px" }}>
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
                        {userNameError}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Step 2 — Photo upload (drag/drop OR crop adjuster) */}
              {profileStep === "photo" && (
                <>
                  {!profilePreview ? (
                    /* Drag and drop zone — only shown when no image picked yet */
                    <div className="px-6 pt-5 pb-4">
                      <label className="flex flex-col items-center justify-center cursor-pointer transition-colors rounded-xl"
                        style={{
                          background: profileDrag ? "rgba(168,85,247,0.06)" : subtle,
                          border: `1.5px dashed ${profileDrag ? "#A614C3" : border}`,
                          padding: "36px 16px",
                        }}
                        onDragOver={e => { e.preventDefault(); setProfileDrag(true); }}
                        onDragLeave={() => setProfileDrag(false)}
                        onDrop={e => { e.preventDefault(); setProfileDrag(false); handlePick(e.dataTransfer.files?.[0]); }}>
                        <input type="file" className="hidden" accept="image/jpeg,image/png,image/gif"
                          onChange={e => handlePick(e.target.files?.[0] ?? undefined)} />
                        <span className="flex items-center justify-center mb-3"
                          style={{ width: 48, height: 48, borderRadius: 12, background: isDark ? "rgba(255,255,255,0.04)" : "#F3F4F6" }}>
                          <Images className="w-6 h-6" style={{ color: muted }} strokeWidth={1.5} />
                        </span>
                        <div className="text-[14px] font-medium mb-2" style={{ color: text }}>Drag and drop your photo</div>
                        <span className="px-3 py-1.5 rounded-lg text-[12px] font-medium"
                          style={{
                            background: isDark ? "rgba(255,255,255,0.06)" : "#fff",
                            border: `1px solid ${isDark ? "rgba(255,255,255,0.16)" : "#E5E7EB"}`,
                            color: text,
                          }}>
                          Upload Photo
                        </span>
                        <div className="text-[11px] mt-2" style={{ color: muted }}>JPG, PNG or GIF · Max 5MB</div>
                      </label>
                    </div>
                  ) : (
                    /* Crop adjuster — click + drag to reposition, slider to zoom */
                    <div className="px-6 pt-5 pb-3">
                      <div className="flex flex-col items-center">
                        <div className="relative select-none mb-4"
                          style={{
                            width: 160, height: 160, borderRadius: 9999,
                            overflow: "hidden",
                            border: `2px solid ${border}`,
                            background: subtle,
                            cursor: dragRef.current ? "grabbing" : "grab",
                          }}
                          onMouseDown={e => {
                            dragRef.current = { startX: e.clientX, startY: e.clientY, baseX: imageOffsetX, baseY: imageOffsetY };
                            const onMove = (ev: MouseEvent) => {
                              if (!dragRef.current) return;
                              setImageOffsetX(dragRef.current.baseX + (ev.clientX - dragRef.current.startX));
                              setImageOffsetY(dragRef.current.baseY + (ev.clientY - dragRef.current.startY));
                            };
                            const onUp = () => {
                              dragRef.current = null;
                              window.removeEventListener("mousemove", onMove);
                              window.removeEventListener("mouseup", onUp);
                            };
                            window.addEventListener("mousemove", onMove);
                            window.addEventListener("mouseup", onUp);
                          }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={profilePreview} alt="Adjust"
                            draggable={false}
                            className="absolute pointer-events-none"
                            style={{
                              left: "50%", top: "50%",
                              transform: `translate(-50%, -50%) translate(${imageOffsetX}px, ${imageOffsetY}px) scale(${imageZoom})`,
                              transformOrigin: "center",
                              width: "100%", height: "100%",
                              objectFit: "cover",
                            }} />
                        </div>

                        {/* Custom-styled zoom slider with brand-gradient fill + bordered thumb */}
                        <style>{`
                          .nl-zoom-slider {
                            -webkit-appearance: none;
                            appearance: none;
                            height: 6px;
                            border-radius: 9999px;
                            outline: none;
                            background: linear-gradient(to right,
                              #A614C3 0%, #A614C3 var(--fill, 0%),
                              ${isDark ? "rgba(255,255,255,0.12)" : "#E5E7EB"} var(--fill, 0%),
                              ${isDark ? "rgba(255,255,255,0.12)" : "#E5E7EB"} 100%);
                          }
                          .nl-zoom-slider::-webkit-slider-thumb {
                            -webkit-appearance: none;
                            appearance: none;
                            width: 18px; height: 18px; border-radius: 9999px;
                            background: ${cardBg};
                            border: 2.5px solid #A614C3;
                            box-shadow: 0 2px 5px rgba(166,20,195,0.25);
                            cursor: grab; transition: transform 0.1s;
                          }
                          .nl-zoom-slider::-webkit-slider-thumb:active { cursor: grabbing; transform: scale(1.1); }
                          .nl-zoom-slider::-moz-range-thumb {
                            width: 18px; height: 18px; border-radius: 9999px;
                            background: ${cardBg};
                            border: 2.5px solid #A614C3;
                            box-shadow: 0 2px 5px rgba(166,20,195,0.25);
                            cursor: grab;
                          }
                        `}</style>

                        {/* Zoom slider row — clean, contained, full-width within the centered column */}
                        <div className="w-full max-w-[320px] flex items-center gap-3 mb-4">
                          <ZoomOut className="w-3.5 h-3.5 flex-shrink-0" style={{ color: muted }} strokeWidth={2} />
                          <input
                            type="range" min={1} max={3} step={0.01} value={imageZoom}
                            onChange={e => setImageZoom(Number(e.target.value))}
                            className="nl-zoom-slider flex-1 block"
                            style={{ "--fill": `${((imageZoom - 1) / 2) * 100}%` } as React.CSSProperties}
                          />
                          <ZoomIn className="w-3.5 h-3.5 flex-shrink-0" style={{ color: muted }} strokeWidth={2} />
                        </div>

                        {/* Action buttons — bordered ghost style matching the modal's Cancel/Back button language */}
                        {(() => {
                          const darkGhostBg = "linear-gradient(rgba(255,255,255,0.10) -0.44%, rgba(192,192,192,0.10) 49.45%, rgba(172,172,172,0.10) 99.33%)";
                          const darkGhostHoverBg = "linear-gradient(rgba(255,255,255,0.16) -0.44%, rgba(192,192,192,0.16) 49.45%, rgba(172,172,172,0.16) 99.33%)";
                          return (
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={resetCrop}
                                className="px-4 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
                                style={{
                                  border: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : border}`,
                                  background: isDark ? darkGhostBg : "transparent",
                                  color: text, cursor: "pointer",
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = isDark ? darkGhostHoverBg : subtle)}
                                onMouseLeave={e => (e.currentTarget.style.background = isDark ? darkGhostBg : "transparent")}>
                                Reset
                              </button>
                              <label
                                className="px-4 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer"
                                style={{
                                  border: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : border}`,
                                  background: isDark ? darkGhostBg : "transparent",
                                  color: text,
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = isDark ? darkGhostHoverBg : subtle)}
                                onMouseLeave={e => (e.currentTarget.style.background = isDark ? darkGhostBg : "transparent")}>
                                <input type="file" className="hidden" accept="image/jpeg,image/png,image/gif"
                                  onChange={e => handlePick(e.target.files?.[0] ?? undefined)} />
                                Change photo
                              </label>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Preview */}
                  <div className="px-6 pb-2">
                    <div className="text-[12px] font-semibold mb-2" style={{ color: muted }}>Preview</div>
                    <div className="flex items-center gap-3 rounded-xl px-3.5 py-3"
                      style={{ border: `1px solid ${border}`, background: subtle }}>
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden relative"
                        style={{
                          border: profilePreview ? `1px solid ${border}` : "2.5px solid #73C9B7",
                          background: profilePreview ? "transparent" : (isDark ? "rgba(115,201,183,0.18)" : "rgba(115,201,183,0.10)"),
                        }}>
                        {profilePreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={profilePreview} alt="Preview"
                            className="absolute"
                            style={{
                              left: "50%", top: "50%",
                              transform: `translate(-50%, -50%) translate(${imageOffsetX * 0.3}px, ${imageOffsetY * 0.3}px) scale(${imageZoom})`,
                              transformOrigin: "center",
                              width: "100%", height: "100%",
                              objectFit: "cover",
                            }} />
                        ) : (
                          <span style={{
                            fontSize: 14, fontWeight: 600, letterSpacing: "0.02em",
                            background: "linear-gradient(135deg, #73C9B7 0%, #4FA897 100%)",
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                          }}>{initials}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-bold" style={{ color: text }}>{displayName}</div>
                        <div className="text-[12px]" style={{ color: muted, marginTop: 1 }}>
                          <span style={{ fontWeight: 600 }}>User ID:</span> {userId} · ProSuite Member
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between gap-2 px-6 pb-5 pt-4">
                {(() => {
                  // Ghost-button gradient used elsewhere in dark mode (e.g. Import Users) — subtle gray gradient.
                  const darkGhostBg = "linear-gradient(rgba(255,255,255,0.10) -0.44%, rgba(192,192,192,0.10) 49.45%, rgba(172,172,172,0.10) 99.33%)";
                  const darkGhostHoverBg = "linear-gradient(rgba(255,255,255,0.16) -0.44%, rgba(192,192,192,0.16) 49.45%, rgba(172,172,172,0.16) 99.33%)";
                  return (
                    <button onClick={() => { if (profileStep === "photo") setProfileStep("overview"); else close(); }}
                      className="px-4 py-2 rounded-lg text-[12px] font-medium transition-colors"
                      style={{
                        border: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : border}`,
                        color: text,
                        background: isDark ? darkGhostBg : "transparent",
                        cursor: "pointer",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = isDark ? darkGhostHoverBg : subtle)}
                      onMouseLeave={e => (e.currentTarget.style.background = isDark ? darkGhostBg : "transparent")}>
                      {profileStep === "photo" ? "Back" : "Cancel"}
                    </button>
                  );
                })()}
                <button onClick={() => {
                    if (profileStep === "photo") { setProfileStep("overview"); return; }
                    // Overview step Save. User Name allows duplicates — no uniqueness check.
                    // Trim both fields once so " John " === "John" doesn't look like a change.
                    const fn = firstName.trim();
                    const ln = lastName.trim();
                    if (fn === savedFirstName && ln === savedLastName) { close(); return; } // no change
                    if (!fn || !ln) {
                      setUserNameError("First name and last name are both required.");
                      return;
                    }
                    setSavedFirstName(fn);
                    setSavedLastName(ln);
                    setFirstName(fn);
                    setLastName(ln);
                    setUserNameError(null);
                    setProfileToast({ title: "Profile saved", description: `Your user name has been updated to "${fn} ${ln}".` });
                    close();
                  }}
                  className="px-5 py-2 rounded-lg text-[12px] font-semibold text-white transition-all"
                  style={{
                    background: isDark
                      ? "radial-gradient(171.32% 99.33% at 33.13% -9%, #282550 0%, #191735 55.82%, rgba(0,0,0,0.3) 74%, rgba(0,0,0,0) 100%), linear-gradient(88.34deg, #5C2ED4 0.11%, #A614C3 63.8%)"
                      : "linear-gradient(90deg,#5C2ED4 0%,#A614C3 65%)",
                    border: "none", cursor: "pointer",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.10)")}
                  onMouseLeave={e => (e.currentTarget.style.filter = "none")}>
                  Save
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Success toast — matches the Agencies "Draft saved" toast pattern (top-[68px] right-6, auto-dismiss, no X) */}
      {profileToast && (
        <div className="fixed top-[68px] right-6 z-50 flex items-center gap-3"
          style={{
            fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
            background: isDark ? "#1E2240" : "#fff",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "#E5E7EB"}`,
            borderRadius: 12,
            boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
            padding: "12px 14px",
            minWidth: 320, maxWidth: 420,
          }}>
          <span className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 26, height: 26, borderRadius: 9999,
              background: isDark ? "rgba(168,85,247,0.22)" : "rgba(166,20,195,0.10)",
            }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#D946EF" : "#A614C3"} strokeWidth={2.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold" style={{ color: isDark ? "#F9FAFB" : "#1F2937" }}>{profileToast.title}</div>
            <div className="text-[12px] mt-0.5" style={{ color: isDark ? "#8B8FA8" : "#6B7280" }}>{profileToast.description}</div>
          </div>
        </div>
      )}
    </aside>
  );
}
