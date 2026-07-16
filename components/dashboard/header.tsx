"use client";

import { cn } from "@/lib/utils";
import type { Section } from "@/app/dashboard/page";
import { Bell, Calendar, ArrowRight, ArrowRightLeft, X, LogOut, Mail, UserRound } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { signOut, useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";

interface HeaderProps {
  activeSection: Section;
  refreshLoans: number;
}

interface NearDueLoan {
  id: string;
  personName: string;
  type: "lent" | "borrowed";
  remainingAmount: string;
  dueDate: string | null;
}

type NearDueLoanResponse = {
  loans?: NearDueLoan[];
};

const sectionTitles: Record<Section, string> = {
  overview: "Overview",
  accounts: "Accounts",
  transactions: "Transactions",
  loans: "Loans",
  budgets: "Budgets",
  trips: "Trips",
  analysis: "Analysis",
  settings: "Settings",
};

export function Header({ activeSection, refreshLoans }: HeaderProps) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [nearDueLoans, setNearDueLoans] = useState<NearDueLoan[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const accountCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [seenNotificationKey, setSeenNotificationKey] = useState<string | null>(null);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isAccountClosing, setIsAccountClosing] = useState(false);
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const closeAccountMenu = useCallback(() => {
    if (!isAccountOpen || isAccountClosing) return;

    setIsAccountClosing(true);
    accountCloseTimerRef.current = setTimeout(() => {
      setIsAccountOpen(false);
      setIsAccountClosing(false);
      accountCloseTimerRef.current = null;
    }, 520);
  }, [isAccountClosing, isAccountOpen]);

  const toggleAccountMenu = () => {
    if (isAccountOpen) {
      closeAccountMenu();
      return;
    }

    if (accountCloseTimerRef.current) {
      clearTimeout(accountCloseTimerRef.current);
      accountCloseTimerRef.current = null;
    }

    setIsAccountClosing(false);
    setIsAccountOpen(true);
  };

  const fetchNearDueLoans = useCallback(async () => {
    try {
      setLoadingNotifications(true);

      const res = await fetch(`/api/dashboard/loan?userId=${userId}&nearDueDays=20`);
      const data = (await res.json()) as NearDueLoanResponse;

      if (data.loans) {
        const formatted = data.loans.map((loan) => ({
          id: loan.id,
          personName: loan.personName,
          type: loan.type,
          remainingAmount: loan.remainingAmount,
          dueDate: loan.dueDate,
        }));
        setNearDueLoans(formatted);
      }
    } catch (err) {
      console.error("Failed to fetch near-due loans", err);
    } finally {
      setLoadingNotifications(false);
    }
  }, [userId]);


  useEffect(() => {
    if (status === "authenticated" && userId) {
      queueMicrotask(() => {
        void fetchNearDueLoans();
      });
    }
  }, [status, userId, refreshLoans, fetchNearDueLoans]);


  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }

      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        closeAccountMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeAccountMenu]);

  useEffect(() => {
    return () => {
      if (accountCloseTimerRef.current) {
        clearTimeout(accountCloseTimerRef.current);
      }
    };
  }, []);

  const getDaysRemaining = (dueDate: string | null) => {
    if (!dueDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysLabel = (days: number) => {
    if (days < 0) return "Overdue";
    if (days === 0) return "Due today";
    if (days === 1) return "1 day left";
    return `${days} days left`;
  };

  const getBadgeDisplay = () => {
    const count = nearDueLoans.length;
    if (count === 0) return "0";
    if (count === 1) return "1";
    if (count === 2) return "2";
    return "2+";
  };

  const notificationKey = `${refreshLoans}:${nearDueLoans
    .map((loan) => `${loan.id}-${loan.dueDate ?? ""}-${loan.remainingAmount}`)
    .join("|")}`;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <header className="h-16 border-b border-border bg-background   sticky top-0 z-30 flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-semibold text-foreground">
          {sectionTitles[activeSection]}
        </h1>
        <div className="hidden md:flex items-center gap-2 text-sm ">
          <Calendar className="w-4 h-4 text-yellow-500" />
          <span className="text-gray-200">Last 30 days</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
    

        {/* Notifications */}
        <div className="relative " ref={notificationRef}>
          <button
            className="relative w-9 h-9 flex items-center cursor-pointer justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-mist-600 transition-all duration-200"
            onClick={() => {
              setIsNotificationOpen(!isNotificationOpen);
              setSeenNotificationKey(notificationKey);
            }}
          >
            <Bell className="w-5 h-5 text-yellow-500" />
            {nearDueLoans.length > 0 && seenNotificationKey !== notificationKey && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full px-1">
                {getBadgeDisplay()}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotificationOpen && (
            <div
              className="absolute right-0 top-12 w-80
  rounded-lg border border-white/10
  bg-white/2 backdrop-blur-2xl
  shadow-2xl shadow-black/20
  overflow-hidden   animate-in slide-in-from-top-2 z-20"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="font-semibold text-foreground">Due Soon</h3>
                <button
                  onClick={() => setIsNotificationOpen(false)}
                  className="text-muted-foreground hover:text-foreground  transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-[300px] overflow-y-auto">
                {loadingNotifications ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : nearDueLoans.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm ">
                    No upcoming due dates
                  </div>
                ) : (
                  nearDueLoans.map((loan) => {
                    const days = getDaysRemaining(loan.dueDate);
                    const isOverdue = days !== null && days < 0;

                    return (
                      <div
                        key={loan.id}
                        className="px-4 py-3  hover:bg-black/60 transition-colors border-b border-border last:border-0"
                      >
                        <div className="flex  items-center justify-between mb-1">
                          <span className="font-medium text-foreground text-sm">
                            {loan.personName}
                          </span>
                          <span
                            className={cn(
                              "text-xs font-medium",
                              isOverdue ? "text-destructive" : "text-foreground/60"
                            )}
                          >
                            {days !== null ? getDaysLabel(days) : "No due date"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {loan.type === "lent" ? (
                              <ArrowRight className="w-3 h-3 text-yellow-500" />
                            ) : (
                              <ArrowRightLeft className="w-3 h-3 text-destructive" />
                            )}
                            <span
                              className={cn(
                                "text-xs",
                                loan.type === "lent" ? "text-yellow-500" : "text-destructive"
                              )}
                            >
                              {loan.type === "lent" ? "Lent" : "Borrowed"}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            Rs {parseFloat(loan.remainingAmount).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User account */}
        <div className="relative" ref={accountRef}>
          {status === "loading" ? (
            <Skeleton className="w-9 h-9 rounded-lg" />
          ) : (
            <button
              type="button"
              aria-label="Open account menu"
              aria-expanded={isAccountOpen}
              onClick={toggleAccountMenu}
              className="w-9 h-9 cursor-pointer rounded-lg overflow-hidden bg-secondary ring-2 ring-transparent hover:ring-accent/50 transition-all duration-200"
            >
              <div className="w-full h-full bg-gradient-to-br from-accent/80 to-chart-1 flex items-center justify-center text-xs font-semibold text-accent-foreground">
                {session?.user?.name?.charAt(0) || "PT"}
              </div>
            </button>
          )}

          {isAccountOpen && (
            <div
              className={cn(
                "absolute right-0 top-12 w-72 rounded-xl border border-white/15 bg-white/[0.07] shadow-[0_24px_80px_-28px_rgba(0,0,0,0.85)] backdrop-blur-2xl overflow-hidden z-30 ring-1 ring-white/10",
                isAccountClosing ? "account-menu-slide-out" : "account-menu-slide"
              )}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.04]">
                <div className="flex items-center gap-2">
                  <UserRound className="w-4 h-4 text-yellow-500" />
                  <h3 className="text-sm font-semibold text-foreground">Profile</h3>
                </div>
                <button
                  type="button"
                  onClick={closeAccountMenu}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close account menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-4 py-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br from-accent/80 to-chart-1 flex items-center justify-center text-sm font-semibold text-accent-foreground">
                    {session?.user?.name?.charAt(0) || "PT"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {session?.user?.name || "PaisaTracker User"}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{session?.user?.email || "No email available"}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/signIn" })}
                  className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
                >
                  <span>Logout</span>
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
