"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
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
  Search,
  Plus,
  Target,
  AlertCircle,
  CheckCircle2,
  Edit,
  TrendingDown,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface Budget {
  id: string;
  category: string;
  budget: number;
  spent: number;
  period: "monthly" | "weekly";
}

interface Transaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  category: string;
}

type RawTransaction = {
  id: string;
  amount?: string | number | null;
  type: "income" | "expense";
  category: string;
};

type RawBudget = {
  id: string;
  category: string;
  amount: string | number;
  period: "monthly" | "weekly";
};

type TransactionsResponse = {
  transactions?: RawTransaction[];
};

type BudgetsResponse = {
  budgets?: RawBudget[];
};

type AddBudgetPayload = {
  userId: string;
  category: string;
  amount: number;
  period: "monthly" | "weekly";
};

export function BudgetsSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<"all" | "monthly" | "weekly">("all");

  const [isSaving, setIsSaving] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newBudgetCategory, setNewBudgetCategory] = useState("");
  const [newBudgetAmount, setNewBudgetAmount] = useState("");
  const [newBudgetPeriod, setNewBudgetPeriod] = useState<"monthly" | "weekly">("monthly");

  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const categories = [
    "Food",
    "Transport",
    "Bills",
    "Entertainment",
    "Shopping",
    "Health",
    "Education",
    "Savings",
    "Travel",
    "Rent"
  ];

  const fetchTransactions = async (): Promise<Transaction[]> => {
    const res = await fetch(`/api/dashboard/transaction?userId=${session?.user?.id}`);
    if (!res.ok) throw new Error("Failed to fetch transactions");
    const data = (await res.json()) as TransactionsResponse;

    return (data.transactions || []).map((t) => ({
      id: t.id,
      amount: parseFloat(t.amount || "0"),
      type: t.type,
      category: t.category,
    }));
  };

  const fetchBudgets = async (): Promise<RawBudget[]> => {
    const res = await fetch(`/api/dashboard/budget?userId=${session?.user?.id}`);
    if (!res.ok) throw new Error("Failed to fetch budgets");
    const data = (await res.json()) as BudgetsResponse;
    return data.budgets ?? [];
  };

  const { data: transactionList = [], isLoading: isTxLoading } = useQuery({
    queryKey: ["transactions", session?.user?.id],
    queryFn: fetchTransactions,
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 5,
  });

  const { data: budgetsData = [], isLoading: isBudgetsLoading } = useQuery({
    queryKey: ["budgets", session?.user?.id],
    queryFn: fetchBudgets,
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 5,
  });

  const budgetList: Budget[] = (budgetsData || []).map((b) => {
    const spent = transactionList
      .filter(
        (tx) =>
          tx.type === "expense" &&
          tx.category.toLowerCase() === b.category.toLowerCase()
      )
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      id: b.id,
      category: b.category,
      budget: parseFloat(b.amount),
      spent,
      period: b.period,
    };
  });

  const loading = isTxLoading || isBudgetsLoading;
  const isData = budgetList.length > 0;

  const addBudgetMutation = useMutation({
    mutationFn: async (payload: AddBudgetPayload) => {
      const res = await fetch("/api/dashboard/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create budget");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Budget added successfully!");
      queryClient.invalidateQueries({
        queryKey: ["budgets", session?.user?.id],
      });
      setIsAddDialogOpen(false);
      setNewBudgetCategory("");
      setNewBudgetAmount("");
      setNewBudgetPeriod("monthly");
    },
    onError: () => {
      toast.error("Failed to add budget");
    },
    onSettled: () => setIsSaving(false),
  });

  const handleAddBudget = () => {
    if (!session?.user?.id) {
      toast.error("Missing user session");
      return;
    }

    if (!newBudgetCategory || !newBudgetAmount) return;

    setIsSaving(true);
    addBudgetMutation.mutate({
      userId: session.user.id,
      category: newBudgetCategory,
      amount: parseFloat(newBudgetAmount),
      period: newBudgetPeriod,
    });
  };

  const filteredBudgets = budgetList.filter((b) => {
    const matchesSearch = b.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPeriod = selectedPeriod === "all" || b.period === selectedPeriod;
    return matchesSearch && matchesPeriod;
  });

  const totalBudget = budgetList.reduce((a, b) => a + b.budget, 0);
  const totalSpent = budgetList.reduce((a, b) => a + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overBudgetCount = budgetList.filter((b) => b.spent > b.budget).length;

  const getBudgetStatus = (spent: number, budget: number) => {
    const p = (spent / budget) * 100;

    if (p < 50)
      return { label: "On Track", color: "text-green-500", bar: "bg-green-500", bg: "bg-green-500/10", border: "border-green-500/30", icon: CheckCircle2 };

    if (p <= 80)
      return { label: "Warning", color: "text-yellow-500", bar: "bg-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30", icon: AlertCircle };

    return { label: "Over Budget", color: "text-destructive", bar: "bg-destructive", bg: "bg-destructive/10", border: "border-destructive/30", icon: AlertCircle };
  };

  const hasBudgets = budgetList.length > 0;

  return (
    <div className="space-y-6">
   
   <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    
        <div
          className="hidden md:block group relative bg-card border border-border rounded-xl p-5 hover:border-accent/50 transition-all duration-500 overflow-hidden animate-in fade-in slide-in-from-bottom-4"
          style={{ animationDelay: `${1 * 100}ms`, animationFillMode: "both" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-2">Total <br className="inline md:hidden"/> Budget</p>
              <p className="text-lg md:text-2xl font-bold text-foreground tracking-tight">
              Rs &nbsp;&nbsp;{totalBudget.toLocaleString()}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                                <Target className="w-5 h-5 text-foreground" />

            </div>
          </div>
        </div>
        <div
          className="group relative bg-card border border-border rounded-xl p-5 hover:border-accent/50 transition-all duration-500 overflow-hidden animate-in fade-in slide-in-from-bottom-4"
          style={{ animationDelay: `${1 * 100}ms`, animationFillMode: "both" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-2">Total <br className="inline md:hidden"/> Spent</p>
              <p className="text-lg md:text-2xl font-bold text-foreground tracking-tight">
                 Rs &nbsp;&nbsp;{totalSpent.toLocaleString()}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-destructive" />
            </div>
          </div>
        </div>

        <div
          className="group relative bg-card border border-border rounded-xl p-5 hover:border-accent/50 transition-all duration-500 overflow-hidden animate-in fade-in slide-in-from-bottom-4"
          style={{ animationDelay: `${2 * 100}ms`, animationFillMode: "both" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-2">Total <br className="inline md:hidden"/> Remaining</p>
              <p className="text-lg md:text-2xl font-bold text-foreground tracking-tight">
                  Rs {totalRemaining.toLocaleString()}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>
      </div>

     

    
      <div className="flex flex-col  sm:flex-row items-start items-center  justify-between gap-4">
        <div className="flex w-full items-center gap-3 flex-wrap">
          <div className="relative w-full md:w-auto md:flex md:items-center ">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search budgets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 md:w-[280px] w-full bg-secondary border-border"
            />
          </div>
          <div className="flex items-center md:justify-between gap-2 mt-2 md:mt-0 flex-1 min-w-[240px]">
            {["all", "monthly", "weekly"].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period as typeof selectedPeriod)}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Button>
            ))}

            <Button
              size="sm"
              className="ml-auto"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add <span className="hidden md:inline">Budget</span>
            </Button>
          </div>
        </div>
        {overBudgetCount > 0 && (
          <Badge variant="outline" className="border-destructive/50 text-destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            {overBudgetCount} over budget
          </Badge>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-border bg-card">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-16 mt-2" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !isData && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Target className="w-10 h-10 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground mb-1">No budgets yet</p>
          <p className="text-sm text-muted-foreground mb-4">Set a budget to start tracking</p>
          <Button onClick={() => setIsAddDialogOpen(true)} className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Add Budget
          </Button>
        </div>
      )}

      {/* Budgets Cards Grid */}
      {!loading && isData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {filteredBudgets.map((budget, index) => {
            const status = getBudgetStatus(budget.spent, budget.budget);
            const Icon = status.icon;
            const percentage = Math.round((budget.spent / budget.budget) * 100);
            const remaining = budget.budget - budget.spent;

            return (
              <Card
                key={budget.id}
                className="border-border bg-card hover:border-accent/50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{budget.category}</h3>
                      <Badge variant="outline" className="mt-1 text-xs capitalize">
                        {budget.period}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`${status.bg} ${status.border} ${status.color}`}
                      >
                        <Icon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Rs {budget.spent.toLocaleString()} of Rs {budget.budget.toLocaleString()}
                      </span>
                      <span className={`text-sm font-semibold ${status.color}`}>{percentage}%</span>
                    </div>
                    <Progress
                      value={Math.min(percentage, 100)}
                      className="h-3"
                      indicatorClassName={status.bar}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {budget.spent > budget.budget ? "Over by" : "Left"} Rs {Math.abs(remaining).toLocaleString()}
                      </span>
                      {remaining > 0 && (
                        <span className="text-xs text-blue-300/80">Rs {remaining.toLocaleString()} available</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Budget Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white/13 backdrop-blur-3xl">
          <DialogHeader>
            <DialogTitle>Add Budget</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={newBudgetCategory} onValueChange={setNewBudgetCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                placeholder="0"
                value={newBudgetAmount}
                onChange={(e) => setNewBudgetAmount(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Period</label>
              <Select
                value={newBudgetPeriod}
                onValueChange={(value) =>
                  setNewBudgetPeriod(value as "monthly" | "weekly")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddBudget} disabled={isSaving}>
              {isSaving ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
