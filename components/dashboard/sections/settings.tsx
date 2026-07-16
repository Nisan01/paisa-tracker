"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  UserCog,
  Trash2,
  Wallet,
  ArrowRightLeft,
  AlertTriangle,
  Loader2,
  ReceiptText,
  ChartPie,
  Plane,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

export function SettingsSection() {
  const { data: session } = useSession();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [openDialogKey, setOpenDialogKey] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const userName = session?.user?.name || "";
  const userEmail = session?.user?.email || "";

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleDeleteAccounts = async () => {
    if (!session?.user?.id) return;
    const userId = session.user.id;
    setIsDeleting("accounts");
    try {
      const res = await fetch(`/api/dashboard/account?userId=${userId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("All accounts deleted successfully!");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["accounts", userId] }),
        queryClient.invalidateQueries({ queryKey: ["transactions", userId] }),
      ]);
    } catch {
      toast.error("Failed to delete accounts");
    } finally {
      setIsDeleting(null);
      setOpenDialogKey(null);
    }
  };

  const handleDeleteTransactions = async () => {
    if (!session?.user?.id) return;
    const userId = session.user.id;
    setIsDeleting("transactions");
    try {
      const res = await fetch(`/api/dashboard/transaction?userId=${userId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("All transactions deleted successfully!");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["transactions", userId] }),
        queryClient.invalidateQueries({ queryKey: ["accounts", userId] }),
      ]);
    } catch {
      toast.error("Failed to delete transactions");
    } finally {
      setIsDeleting(null);
      setOpenDialogKey(null);
    }
  };

  const handleDeleteLoans = async () => {
    if (!session?.user?.id) return;
    const userId = session.user.id;
    setIsDeleting("loans");
    try {
      const res = await fetch(`/api/dashboard/loan?userId=${userId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("All loans deleted successfully!");
      await queryClient.invalidateQueries({ queryKey: ["loans", userId] });
    } catch {
      toast.error("Failed to delete loans");
    } finally {
      setIsDeleting(null);
      setOpenDialogKey(null);
    }
  };

  const handleDeleteBudgets = async () => {
    if (!session?.user?.id) return;
    const userId = session.user.id;
    setIsDeleting("budgets");
    try {
      const res = await fetch(`/api/dashboard/budget?userId=${userId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("All budgets deleted successfully!");
      await queryClient.invalidateQueries({ queryKey: ["budgets", userId] });
    } catch {
      toast.error("Failed to delete budgets");
    } finally {
      setIsDeleting(null);
      setOpenDialogKey(null);
    }
  };

  const handleDeleteTrips = async () => {
    if (!session?.user?.id) return;
    const userId = session.user.id;
    setIsDeleting("trips");
    try {
      const res = await fetch(`/api/dashboard/trip?userId=${userId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("All trips deleted successfully!");
      await queryClient.invalidateQueries({ queryKey: ["trips", userId] });
    } catch {
      toast.error("Failed to delete trips");
    } finally {
      setIsDeleting(null);
      setOpenDialogKey(null);
    }
  };

  const dangerItems = [
    {
      icon: Wallet,
      label: "Delete all accounts",
      desc: "Removes all bank accounts and wallets",
      key: "accounts",
      title: "Delete All Accounts?",
      dialogDesc: "This will permanently delete all your accounts. This action cannot be undone.",
      fn: handleDeleteAccounts,
    },
    {
      icon: ArrowRightLeft,
      label: "Delete all transactions",
      desc: "Removes all income and expense records",
      key: "transactions",
      title: "Delete All Transactions?",
      dialogDesc: "This will permanently delete all your transactions. This action cannot be undone.",
      fn: handleDeleteTransactions,
    },
    {
      icon: ReceiptText,
      label: "Delete all loans",
      desc: "Removes all lent and borrowed money records",
      key: "loans",
      title: "Delete All Loans?",
      dialogDesc: "This will permanently delete all your loans. This action cannot be undone.",
      fn: handleDeleteLoans,
    },
    {
      icon: ChartPie,
      label: "Delete all budgets",
      desc: "Removes all your budget plans and limits",
      key: "budgets",
      title: "Delete All Budgets?",
      dialogDesc: "This will permanently delete all your budgets. This action cannot be undone.",
      fn: handleDeleteBudgets,
    },
    {
      icon: Plane,
      label: "Delete all trips",
      desc: "Removes all your trips and expenses",
      key: "trips",
      title: "Delete All Trips?",
      dialogDesc: "This will permanently delete all your trips and expenses. This action cannot be undone.",
      fn: handleDeleteTrips,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <UserCog className="w-5 h-5 text-yellow-500" />
        <h2 className="text-lg font-semibold text-foreground">Settings</h2>
      </div>

      {/* Profile Section — sidebar + form */}
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">

        {/* Sidebar avatar card */}
        <Card className="border-border bg-card flex flex-col items-center text-center gap-3 p-5">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-gradient-to-br from-accent/80 to-chart-1 text-accent-foreground text-xl font-semibold">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground">{userName || "—"}</p>
            <p className="text-xs text-muted-foreground mt-0.5 break-all">{userEmail || "—"}</p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-secondary border border-border text-muted-foreground">
            Free plan
          </span>
        </Card>

        {/* Form card */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3 px-5 pt-5">
            <CardTitle className="text-base font-semibold text-foreground">
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs text-muted-foreground uppercase tracking-wide">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={userName}
                  disabled
                  className="bg-secondary border-border h-9 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs text-muted-foreground uppercase tracking-wide">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={userEmail}
                  disabled
                  className="bg-secondary border-border h-9 text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Danger Zone */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3 px-5 pt-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <CardTitle className="text-base font-semibold text-foreground">Danger Zone</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            All actions are permanent and cannot be undone
          </p>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-3">
          {dangerItems.map(({ icon: Icon, label, desc, key, title, dialogDesc, fn }) => (
            <div
              key={key}
              className="flex items-center justify-between gap-4 p-3 rounded-lg bg-secondary/50 border border-border"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
              <AlertDialog
                open={openDialogKey === key}
                onOpenChange={(open) => {
                  if (isDeleting === key) return;
                  setOpenDialogKey(open ? key : null);
                }}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-destructive/40 text-destructive hover:bg-destructive/10 shrink-0 h-8 px-3 text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{dialogDesc}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting === key}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(event) => {
                        event.preventDefault();
                        fn();
                      }}
                      className="bg-destructive hover:bg-destructive/90"
                      disabled={isDeleting === key}
                    >
                      {isDeleting === key ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Delete all"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  );
}
