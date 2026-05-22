"use client";

import React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import type { Section } from "@/app/dashboard/page";

import {
  LayoutDashboard,
  Building2,
  ArrowLeftRight,
  Handshake,
  Target,
  Plane,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react";

interface SidebarProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

const navItems: {
  id: Section;
  label: string;
  icon: React.ElementType;
}[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "accounts", label: "Accounts", icon: Building2 },
    { id: "transactions", label: "Transactions", icon: ArrowLeftRight },
    { id: "loans", label: "Loans", icon: Handshake },
    { id: "budgets", label: "Budgets", icon: Target },
    { id: "trips", label: "Trips", icon: Plane },
    { id: "analysis", label: "Analysis", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

export function Sidebar({
  activeSection,
  onSectionChange,
  collapsed,
  onCollapsedChange,
}: SidebarProps) {
  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ease-out ${collapsed ? "w-16" : "w-64"
        }`}

    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-amber-500/10">
            <Image
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
              loading="eager"
              className="object-cover w-full h-full mt-[1px]"
            />
          </div>

          <span
            className={cn(
              "font-semibold text-lg text-sidebar-foreground whitespace-nowrap transition-opacity duration-300",
              collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
            )}
          >
            PaisaTracker
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex cursor-pointer items-center gap-3 p-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-sidebar-accent text-yellow-500"
                  : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 shrink-0 transition-transform duration-200",
                  isActive
                    ? "text-yellow-600 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                    : "group-hover:scale-110"
                )}
              />

              <span
                className={cn(
                  "whitespace-nowrap transition-all duration-300",
                  collapsed ? "opacity-0 max-w-0" : "opacity-100 max-w-[200px]"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>


      {/* Collapse button */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => {
            onCollapsedChange(!collapsed);
          }}


          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
        >
          <span
            className={cn(
              "transition-opacity duration-300",
              collapsed ? "opacity-0" : "opacity-100"
            )}
          >
            <ChevronLeft className="w-5 h-5" />
          </span>

          <span
            className={cn(
              "transition-opacity duration-300",
              collapsed ? "opacity-100" : "opacity-0 hidden"
            )}
          >
            <ChevronRight className="w-5 h-5 ml-9 cursor-pointer" />
          </span>

          <span
            className={cn(
              "whitespace-nowrap cursor-pointer transition-opacity duration-300",
              collapsed ? "opacity-0" : "opacity-100"
            )}
          >
            Collapse
          </span>
        </button>
      </div>
    </aside>
  );
}