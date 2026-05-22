"use client";

import { useState, useEffect } from "react";
import { pdf } from "@react-pdf/renderer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  MapPin,
  Calendar,
  DollarSign,
  Plane,
  TrendingDown,
  Trash2,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Download,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TripReceiptPdf } from "@/components/dashboard/sections/trip-receipt-pdf";

interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  status: "upcoming" | "active" | "completed";
  createdAt: string;
}

interface TripExpense {
  id: string;
  tripId: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

const expenseCategories = [
  "Transport",
  "Accommodation",
  "Food",
  "Activities",
  "Shopping",
  "Other",
];

const tripColors = [
  { from: "#1a6e8a", to: "#0d4a63", pattern: "#5ecfef" },
  { from: "#2d6a2d", to: "#1a4a1a", pattern: "#7bc47b" },
  { from: "#7a3a6e", to: "#5a2552", pattern: "#c97bbf" },
  { from: "#b45309", to: "#7c3d0f", pattern: "#fbbf24" },
  { from: "#be123c", to: "#881337", pattern: "#fb7185" },
  { from: "#0f766e", to: "#0d5c55", pattern: "#5eead4" },
  { from: "#4338ca", to: "#2e1065", pattern: "#a5b4fc" },
  { from: "#c2410c", to: "#7c2d12", pattern: "#fb923c" },
  { from: "#0369a1", to: "#0c4a6e", pattern: "#7dd3fc" },
  { from: "#15803d", to: "#14532d", pattern: "#86efac" },
];

export function TripsSection() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [isAddTripOpen, setIsAddTripOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuTripId, setOpenMenuTripId] = useState<string | null>(null);
  const [exportingTripId, setExportingTripId] = useState<string | null>(null);

  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Food");

  const [newTripName, setNewTripName] = useState("");
  const [newTripDestination, setNewTripDestination] = useState("");
  const [newTripStartDate, setNewTripStartDate] = useState("");
  const [newTripEndDate, setNewTripEndDate] = useState("");
  const [newTripBudget, setNewTripBudget] = useState("");

  const formatTrips = (raw: any[]) =>
    raw.map((t) => ({
      id: t.id,
      name: t.name,
      destination: t.destination,
      startDate: t.startDate ? new Date(t.startDate).toISOString().split("T")[0] : "",
      endDate: t.endDate ? new Date(t.endDate).toISOString().split("T")[0] : "",
      budget: parseFloat(t.budget),
      spent: 0,
      status: t.status || "upcoming",
      createdAt: t.createdAt ? new Date(t.createdAt).toISOString().split("T")[0] : "",
    }));

  const fetchExpenses = async (formattedTrips: Trip[]) => {
    const allExpenses: TripExpense[] = [];
    for (const trip of formattedTrips) {
      const expRes = await fetch(`/api/dashboard/trip?tripId=${trip.id}`);
      const expData = await expRes.json();
      if (expData.expenses) {
        expData.expenses.forEach((e: any) => {
          allExpenses.push({
            id: e.id,
            tripId: e.tripId,
            description: e.description,
            amount: parseFloat(e.amount),
            category: e.category,
            date: e.date ? new Date(e.date).toISOString().split("T")[0] : "",
          });
        });
      }
    }
    return allExpenses;
  };

  const fetchTrips = async (): Promise<Trip[]> => {
    const res = await fetch(`/api/dashboard/trip?userId=${session?.user?.id}`);
    if (!res.ok) throw new Error("Failed to fetch trips");
    const data = await res.json();
    return formatTrips(data.trips || []);
  };

  const { data: trips = [], isLoading: isTripsLoading } = useQuery({
    queryKey: ["trips", session?.user?.id],
    queryFn: fetchTrips,
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 5,
  });

  const { data: expenses = [], isLoading: isExpensesLoading } = useQuery({
    queryKey: [
      "trip-expenses",
      session?.user?.id,
      trips.map((t) => t.id).join(","),
    ],
    queryFn: () => fetchExpenses(trips),
    enabled: trips.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  const loadingState = isTripsLoading || isExpensesLoading;
  const isData = trips.length > 0;

  const getRemaining = (trip: Trip | null): number => {
    if (!trip) return 0;
    const tripExpenses = expenses.filter((e) => e.tripId === trip.id);
    const totalSpent = tripExpenses.reduce((sum, e) => sum + e.amount, 0) + (parseFloat(expenseAmount) || 0);
    return Math.max(0, trip.budget - totalSpent);
  };

  const getTripStatus = (trip: Trip) => {
    const now = new Date();
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    if (trip.status === "completed") return { label: "Completed", dotColor: "#9ca3af", bg: "rgba(243,244,246,0.95)", color: "#4b5563", icon: CheckCircle2 };
    if (now < start) return { label: "Upcoming", dotColor: "#60a5fa", bg: "rgba(219,234,254,0.95)", color: "#1d4ed8", icon: Calendar };
    if (now >= start && now <= end) return { label: "Active", dotColor: "#4ade80", bg: "rgba(187,247,208,0.95)", color: "#15803d", icon: Sparkles };
    return { label: "Completed", dotColor: "#9ca3af", bg: "rgba(243,244,246,0.95)", color: "#4b5563", icon: CheckCircle2 };
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const getDaysInfo = (trip: Trip) => {
    const now = new Date();
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    if (trip.status === "completed") return "Completed";
    if (now < start) return `${Math.ceil((start.getTime() - now.getTime()) / 864e5)}d to go`;
    const left = Math.ceil((end.getTime() - now.getTime()) / 864e5);
    return left >= 0 ? `${left}d left` : "Ended";
  };

  const addTripMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/dashboard/trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create trip");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Trip created successfully!");
      queryClient.invalidateQueries({ queryKey: ["trips", session?.user?.id] });
      setIsAddTripOpen(false);
      setNewTripName("");
      setNewTripDestination("");
      setNewTripStartDate("");
      setNewTripEndDate("");
      setNewTripBudget("");
    },
    onError: () => {
      toast.error("Failed to create trip");
    },
    onSettled: () => setIsSaving(false),
  });

  const handleAddTrip = () => {
    if (!newTripName || !newTripDestination || !newTripBudget || !session?.user?.id) return;
    setIsSaving(true);
    addTripMutation.mutate({
      userId: session.user.id,
      name: newTripName,
      destination: newTripDestination,
      startDate: newTripStartDate,
      endDate: newTripEndDate,
      budget: parseFloat(newTripBudget),
    });
  };

  const openExpenseModal = (trip: Trip) => {
    setSelectedTrip(trip);
    setExpenseAmount("");
    setExpenseDescription("");
    setExpenseCategory("Food");
    setIsAddExpenseOpen(true);
  };

  const addExpenseMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/dashboard/trip?type=expense", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to add expense");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Expense added!");
      queryClient.invalidateQueries({
        queryKey: ["trip-expenses", session?.user?.id],
      });
      setIsAddExpenseOpen(false);
      setExpenseAmount("");
      setExpenseDescription("");
      setSelectedTrip(null);
    },
    onError: () => {
      toast.error("Failed to add expense");
    },
    onSettled: () => setIsSaving(false),
  });

  const handleAddExpense = () => {
    if (!selectedTrip || !expenseAmount || !expenseDescription) return;
    setIsSaving(true);
    addExpenseMutation.mutate({
      tripId: selectedTrip.id,
      description: expenseDescription,
      amount: parseFloat(expenseAmount),
      category: expenseCategory,
      date: new Date().toISOString(),
    });
  };

  const deleteTripMutation = useMutation({
    mutationFn: async (tripId: string) => {
      const res = await fetch(`/api/dashboard/trip?tripId=${tripId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete trip");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Trip deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["trips", session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["trip-expenses", session?.user?.id] });
      setIsDeleteDialogOpen(false);
      setTripToDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete trip");
    },
    onSettled: () => setIsSaving(false),
  });

  const handleDeleteTrip = () => {
    if (!tripToDelete) return;
    setIsSaving(true);
    deleteTripMutation.mutate(tripToDelete.id);
  };

  const handleExport = async (trip: Trip, tripExpenses: TripExpense[]) => {
    setOpenMenuTripId(null);
    setExportingTripId(trip.id);
    try {
      const doc = <TripReceiptPdf trip={trip} expenses={tripExpenses} />;
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `trip-${trip.name.toLowerCase().replace(/\s+/g, "-")}-receipt.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export PDF", error);
      toast.error("Failed to export PDF");
    } finally {
      setExportingTripId(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".trip-menu")) setOpenMenuTripId(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const totalTripBudget = trips.reduce((sum, t) => sum + t.budget, 0);
  const totalTripSpent = trips.reduce((sum, t) => {
    return sum + expenses.filter((e) => e.tripId === t.id).reduce((s, e) => s + e.amount, 0);
  }, 0);

  const filteredTrips = trips.filter(
    (trip) =>
      trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <Plane className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Trips</p>
                <p className="text-xl font-bold text-foreground">{trips.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/60 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-xl font-bold text-foreground">Rs {totalTripBudget.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-xl font-bold text-destructive">Rs {totalTripSpent.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Add */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search trips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-80 h-9 bg-card border-border"
          />
        </div>
        <Button onClick={() => setIsAddTripOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Trip
        </Button>
      </div>

      {/* Loading Skeletons */}
      {loadingState && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl  border border-border">
              <div className="animate-pulse rounded-2xl overflow-hidden bg-accent">
                {/* Colored Banner */}
                <Skeleton className="h-36 w-full" />

                {/* Body */}
                <div className="bg-card p-4 space-y-3 flex flex-col gap-2.5 flex-1">
                  {/* Dates row */}
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-16 " />
                  </div>

                  {/* Budget row */}
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-4 w-10" />
                  </div>

                  {/* Progress bar */}
                  <Skeleton className="h-1 w-full rounded-full" />

                  {/* Remaining row */}
                  <div className="flex items-center min-h-[10vh] justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loadingState && !isData && (
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-sm text-muted-foreground">No trips planned yet</p>
        </div>
      )}


      {/* Trip Cards Grid */}
      {!loadingState && isData && (
        <div className="relative">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTrips.map((trip, index) => {
              const tripExpenses = expenses.filter((e) => e.tripId === trip.id);

              const spent = tripExpenses.reduce(
                (sum, e) => sum + e.amount,
                0
              );

              const remaining = trip.budget - spent;

              const percentage = Math.min(
                Math.round((spent / trip.budget) * 100),
                100
              );

              const statusConfig = getTripStatus(trip);

              const colors =
                tripColors[index % tripColors.length];

              const pctColor =
                percentage > 90
                  ? "#ef4444"
                  : percentage > 75
                    ? "#f59e0b"
                    : "#22c55e";

              const remColor =
                remaining < trip.budget * 0.1
                  ? "#ef4444"
                  : "#22c55e";

              return (
                <div
                  key={trip.id}
                  className={cn(
                    "rounded-2xl relative border border-border flex flex-col  hover:-translate-y-1 transition-all duration-300",
                    openMenuTripId === trip.id && "z-30 after:absolute after:inset-0 after:bg-black/40 after:rounded-2xl after:backdrop-blur-[1px]"
                  )}
                >
                  <div className="overflow-hidden rounded-2xl">

                    {/* Colored Banner */}
                    <div
                      className="relative h-36 flex items-end p-3 overflow-hidden"
                      style={{ background: colors.from }}
                    >

                      {/* Circle Pattern */}
                      <svg
                        className="absolute inset-0 w-full h-full opacity-20"
                        viewBox="0 0 200 100"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="xMidYMid slice"
                      >
                        <circle
                          cx="160"
                          cy="20"
                          r="60"
                          fill={colors.pattern}
                        />

                        <circle
                          cx="30"
                          cy="80"
                          r="40"
                          fill={colors.pattern}
                        />

                        <circle
                          cx="100"
                          cy="50"
                          r="25"
                          fill={colors.pattern}
                        />
                      </svg>

                      {/* Gradient */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(to top, ${colors.to}cc, transparent 60%)`,
                        }}
                      />

                      {/* Status */}
                      <div
                        className="absolute top-2.5 right-2.5 flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-full"
                        style={{
                          background: statusConfig.bg,
                          color: statusConfig.color,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            background: statusConfig.dotColor,
                          }}
                        />

                        {statusConfig.label}
                      </div>

                      {/* Title */}
                      <div className="relative z-10">
                        <p className="text-sm font-medium text-white leading-tight">
                          {trip.name}
                        </p>

                        <p className="text-[11px] text-white/70 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5" />
                          {trip.destination}
                        </p>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="bg-card flex flex-col gap-2.5 p-4 flex-1">

                      {/* Dates */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />

                          {formatDate(trip.startDate)} –{" "}
                          {formatDate(trip.endDate)}
                        </span>

                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground">
                          {getDaysInfo(trip)}
                        </span>
                      </div>

                      {/* Budget */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            Rs {spent.toLocaleString()} of Rs{" "}
                            {trip.budget.toLocaleString()}
                          </span>

                          <span
                            className="font-medium"
                            style={{ color: pctColor }}
                          >
                            {percentage}%
                          </span>
                        </div>

                        <div className="h-1 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                              background: pctColor,
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            Remaining
                          </span>

                          <span
                            className="font-medium"
                            style={{ color: remColor }}
                          >
                            Rs {remaining.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Expenses */}
                      {tripExpenses.length > 0 ? (
                        <div className="space-y-1 max-h-24 min-h-24  overflow-y-auto pr-1">
                          {tripExpenses.map((exp) => (
                            <div
                              key={exp.id}
                              className="flex items-center justify-between text-xs px-2 py-1.5 rounded-md bg-secondary/50"
                            >
                              <span className="text-muted-foreground truncate flex-1 mr-2">
                                {exp.description}
                              </span>

                              <span className="text-destructive shrink-0 font-medium">
                                -Rs {exp.amount.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="w-full min-h-24 flex items-center justify-center">
                          <p className="text-xs text-muted-foreground italic flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            No expenses added yet
                          </p>
                        </div>
                      )
                      }

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-border mt-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8 text-xs"
                          onClick={() => openExpenseModal(trip)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Expense
                        </Button>

                        <div className="relative trip-menu">
                          <button
                            className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();

                              setOpenMenuTripId(
                                openMenuTripId === trip.id
                                  ? null
                                  : trip.id
                              );
                            }}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* MENU */}
                  {openMenuTripId === trip.id && (
                    <div className="trip-menu absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 bg-popover border border-border rounded-lg shadow-xl z-[60] overflow-hidden">
                      <button
                        className="w-full cursor-pointer px-3 py-2 text-left text-sm text-foreground hover:bg-secondary flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExport(trip, tripExpenses);
                        }}
                        disabled={exportingTripId === trip.id}
                      >
                        <Download className="w-4 h-4" />
                        {exportingTripId === trip.id ? "Preparing..." : "Export"}
                      </button>

                      <button
                        className="w-full cursor-pointer px-3 py-2 text-left text-sm text-destructive hover:bg-secondary flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();

                          setOpenMenuTripId(null);

                          setTripToDelete(trip);

                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Trip Dialog */}
      <Dialog open={isAddTripOpen} onOpenChange={setIsAddTripOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white/13 backdrop-blur-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plane className="w-5 h-5" /> Plan a New Trip
            </DialogTitle>
            <DialogDescription>
              Add a trip with dates, destination, and budget.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Trip Name</label>
              <Input placeholder="e.g., Pokhara Adventure" value={newTripName} onChange={(e) => setNewTripName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Destination</label>
              <Input placeholder="e.g., Pokhara, Nepal" value={newTripDestination} onChange={(e) => setNewTripDestination(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input type="date" value={newTripStartDate} onChange={(e) => setNewTripStartDate(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">End Date</label>
                <Input type="date" value={newTripEndDate} onChange={(e) => setNewTripEndDate(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Budget (Rs)</label>
              <Input type="number" placeholder="50000" value={newTripBudget} onChange={(e) => setNewTripBudget(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTripOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTrip} disabled={isSaving}>
              {isSaving ? "Creating..." : "Create Trip"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" /> Delete Trip
            </DialogTitle>
            <DialogDescription>
              This will remove the trip and its expenses.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">{tripToDelete?.name}</span>? This will
              also delete all expenses for this trip and cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsDeleteDialogOpen(false); setTripToDelete(null); }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTrip} disabled={isSaving}>
              {isSaving ? "Deleting..." : "Delete Trip"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
        <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" /> Add Expense — {selectedTrip?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedTrip && (
              <div className="p-4 bg-secondary rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trip Budget</span>
                  <span className="font-medium">Rs {selectedTrip.budget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Already Spent</span>
                  <span className="font-medium text-destructive">
                    Rs {expenses.filter((e) => e.tripId === selectedTrip.id).reduce((s, e) => s + e.amount, 0).toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="font-medium">Remaining</span>
                  <span className={`font-bold text-base ${getRemaining(selectedTrip) < selectedTrip.budget * 0.1 ? "text-destructive" : "text-green-500"}`}>
                    Rs {getRemaining(selectedTrip).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Amount (Rs)</label>
              <Input type="number" placeholder="0" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} className="text-lg" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Description</label>
              <Input placeholder="e.g., Hotel booking" value={expenseDescription} onChange={(e) => setExpenseDescription(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={expenseCategory} onValueChange={setExpenseCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddExpenseOpen(false)}>Cancel</Button>
            <Button onClick={handleAddExpense} disabled={isSaving || !expenseAmount || !expenseDescription}>
              {isSaving ? "Adding..." : "Add Expense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}