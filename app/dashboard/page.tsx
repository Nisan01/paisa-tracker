"use client";


import { useState } from "react";

import { cn } from "@/lib/utils";

import { Sidebar } from "@/components/dashboard/sidebar";

import { Header } from "@/components/dashboard/header";

import { OverviewSection } from "@/components/dashboard/sections/overview";

import { PipelineSection } from "@/components/dashboard/sections/pipeline";

import { AccountsSection } from "@/components/dashboard/sections/accounts";

import { TransactionsSection } from "@/components/dashboard/sections/transactions";

import { LoansSection } from "@/components/dashboard/sections/loans";

import { BudgetsSection } from "@/components/dashboard/sections/budgets";

import { SettingsSection } from "@/components/dashboard/sections/settings";

import { TripsSection } from "@/components/dashboard/sections/trips";
import { AnalysisSection } from "@/components/dashboard/sections/analysis";


export type Section = "overview" | "accounts" | "transactions" | "loans" | "budgets" | "trips" | "analysis" | "settings";


export default function Dashboard() {

  const [activeSection, setActiveSection] = useState<Section>("overview");

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [refreshLoans, setRefreshLoans] = useState(0);

  const goToSection = (section: Section) => {
    setActiveSection(section);
  };

  const renderSection = () => {

    switch (activeSection) {

      case "overview":

        return <OverviewSection onNavigate={goToSection} />;

      case "accounts":

        return <AccountsSection onNavigate={goToSection} />;

      case "transactions":

        return <TransactionsSection onNavigate={goToSection} />;

      case "loans":

        return <LoansSection refreshTrigger={refreshLoans}
          onLoanChange={() => setRefreshLoans(prev => prev + 1)} />;

      case "budgets":

        return <BudgetsSection />;

      case "trips":

        return <TripsSection />;

      case "analysis":

        return <AnalysisSection onNavigate={goToSection} />;

      case "settings":

        return <SettingsSection />;

      default:

        return <OverviewSection />;

    }

  };


  return (

    <div className="flex min-h-screen bg-background">

      <Sidebar

        activeSection={activeSection}

        onSectionChange={setActiveSection}

        collapsed={sidebarCollapsed}

        onCollapsedChange={setSidebarCollapsed}

      />

      <div
        className={cn(
          "flex-1 min-w-0 flex flex-col transition-[padding-left] duration-300 ease-out",

        )}

        style={{
          paddingLeft: sidebarCollapsed ? "4rem" : "16rem",
        }}
      >

        <Header activeSection={activeSection} refreshLoans={refreshLoans} />

        <main className="flex-1 min-w-0 overflow-auto p-6">        <div

          key={activeSection}

          className="animate-in fade-in slide-in-from-bottom-4 duration-500"

        >

          {renderSection()}

        </div>

        </main>

      </div>

    </div>

  );

} 