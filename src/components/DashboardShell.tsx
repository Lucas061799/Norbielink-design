"use client";

import { useState } from "react";
import Sidenav from "@/components/Sidenav";
import TopBar from "@/components/TopBar";
import Clients from "@/components/Clients";
import Agencies from "@/components/Agencies";
import Quotes from "@/components/Quotes";
import Policies from "@/components/Policies";
import Endorsements from "@/components/Endorsements";
import Marketplace from "@/components/Marketplace";
import Website from "@/components/Website";
import Pricing from "@/components/Pricing";

interface DashboardShellProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export default function DashboardShell({ children, pageTitle }: DashboardShellProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [activePage, setActivePage] = useState("Marketplace");

  if (activePage === "Website") {
    return (
      <div className="h-screen w-screen overflow-hidden">
        <Website isDark={darkMode} />
      </div>
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case "Marketplace":
        return <Marketplace isDark={darkMode} />;
      case "Clients":
        return <Clients isDark={darkMode} />;
      case "Agencies":
        // `key` is intentionally distinct from the Admin case so React mounts a
        // FRESH Agencies instance per segment. Without the key, both cases render
        // <Agencies> at the same tree position and React reuses the instance —
        // which leaks state (bookRolled, inactiveUserIds, etc.) from one
        // perspective to the other (internal staff mutations would show up in
        // the agency's own client portal).
        return <Agencies key="agencies-internal" isDark={darkMode} />;
      case "Admin":
        // External-client view: same Agency detail surface, scoped to the user's
        // own (mock) agency. Distinct `key` from the Agencies case — see above.
        return <Agencies key="agencies-client" isDark={darkMode} clientMode />;
      case "Quotes":
        return <Quotes isDark={darkMode} />;
      case "Policies":
        return <Policies isDark={darkMode} />;
      case "Endorsements":
        return <Endorsements isDark={darkMode} />;
      case "Pricing":
        return <Pricing isDark={darkMode} />;
      default:
        // Un-routed / placeholder segments (Marketplace, Appetite Assistant, Make a
        // Payment, Accounting, Tools & Resources, Support, …) just render whatever
        // children the parent passed. No section-title bar — designed pages own
        // their own title; an orphan title above an empty body just looks broken.
        return <>{children}</>;
    }
  };

  return (
    <div
      className="flex h-screen overflow-hidden transition-colors duration-300"
      style={{ background: darkMode ? "#0F1120" : "#ffffff" }}
    >
      <Sidenav
        isDark={darkMode}
        onToggleDark={() => setDarkMode(!darkMode)}
        activeItem={activePage}
        onActiveChange={setActivePage}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar isDark={darkMode} activePage={activePage} />
        <main
          className="flex-1 overflow-hidden transition-colors duration-300 px-12"
          style={(() => { const fullHeightPages = ["Clients", "Agencies", "Admin", "Quotes", "Policies", "Endorsements"]; const isFullHeight = fullHeightPages.includes(activePage); return { background: darkMode ? "#0F1120" : "#ffffff", paddingTop: isFullHeight ? 0 : 24, paddingBottom: isFullHeight ? 48 : 24, display: isFullHeight ? "flex" : "block", flexDirection: "column" as const, overflowY: isFullHeight ? "hidden" : "auto", height: isFullHeight ? "100%" : "auto" }; })()}
        >
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
