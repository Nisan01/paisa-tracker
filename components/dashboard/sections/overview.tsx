"use client";

import { IncomeExpenseChart } from "@/components/dashboard/charts/income-expense-chart";
import { ExpenseCategories } from "@/components/dashboard/charts/expense-categories";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { BudgetProgress } from "@/components/dashboard/budget-progress";

import {
  Wallet,
  PiggyBank,
} from "lucide-react";

import { useSession } from "next-auth/react";
import { LoanStatus } from "@/components/dashboard/loan-status";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import type { Section } from "@/app/dashboard/page";

type Props = {
  onNavigate: (section: Section) => void;
};

interface OverviewData {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;

  transactionsData: OverviewTransaction[];
  allTransactionsData: OverviewTransaction[];
  budgetsData: OverviewBudget[];

  balanceChangeRate: number;
  loanData: OverviewLoan[];
}

type OverviewTransaction = {
  id?: string;
  description?: string | null;
  amount?: string | number | null;
  type?: "income" | "expense" | string;
  category?: string | null;
  date?: string | Date | null;
};

type OverviewBudget = {
  category?: string | null;
  amount?: string | number | null;
};

type OverviewLoan = {
  id: string;
  userId: string;
  personName: string;
  totalAmount: string | number;
  remainingAmount: string | number;
  dueDate: string | Date;
  type: "lent" | "borrowed";
  status: "active" | "pending" | "paid";
  notes?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type Account = {
  balance?: string | number | null;
};

type AccountsResponse = {
  accounts?: Account[];
};

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatCurrency(value: number): string {
  if (value >= 10000000) return `Rs. ${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `Rs. ${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `Rs. ${(value / 1000).toFixed(1)}K`;
  return `Rs. ${value}`;
}

export function OverviewSection({ onNavigate }: Props) {
  const { data: session, status } = useSession();

  const fetchOverview = async (): Promise<OverviewData> => {
    if (!session?.user?.id) {
      throw new Error("No user session");
    }

    const res = await fetch("/api/dashboard/overview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentUserId: session.user.id,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to fetch overview");
    }

    return res.json();
  };

  const fetchAccounts = async (): Promise<AccountsResponse> => {
    const res = await fetch(
      `/api/dashboard/account?userId=${session?.user?.id}`
    );

    if (!res.ok) throw new Error("Failed to fetch accounts");

    return res.json();
  };

  const { data: accountsData } = useQuery({
    queryKey: ["accounts", session?.user?.id],
    queryFn: fetchAccounts,
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: overviewData,
    isLoading: isLoadingData,
    error,
  } = useQuery({
    queryKey: ["overview", session?.user?.id],
    queryFn: fetchOverview,

    enabled: !!session?.user?.id,

    staleTime: 1000 * 60 * 2,
  });

  // ======================
  // SAFE VALUES
  // ======================
  const accountList = accountsData?.accounts || [];
  const income = overviewData?.totalIncome || 0;
  const expenses = overviewData?.totalExpenses || 0;

  const totalBalance = accountList.reduce(
    (sum, acc) => sum + Number(acc.balance || 0),
    0
  );

  const savingsRate =
    income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;

  // ======================
  // BUDGET TRANSFORM
  // ======================
  const transformedBudgets =
    (overviewData?.budgetsData || []).map((budget) => {
      const spent = (overviewData?.allTransactionsData || [])
        .filter(
          (tx) =>
            tx.type === "expense" &&
            tx.category?.toLowerCase() === budget.category?.toLowerCase()
        )
        .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

      return {
        category: budget.category || "Uncategorized",
        budget: Number(budget.amount || 0),
        spent,
      };
    });

  const transactions = overviewData?.transactionsData || [];
  const allTransactions = overviewData?.allTransactionsData || [];
  const currentYear = new Date().getFullYear();
  const now = new Date();
  const currentMonth = now.getMonth();
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const getMonthTotals = (year: number, month: number) => {
    return allTransactions
      .filter((tx) => {
        if (!tx.date) return false;
        const date = new Date(tx.date);
        return date.getFullYear() === year && date.getMonth() === month;
      })
      .reduce(
        (acc: { income: number; expense: number }, tx) => {
          const amount = Math.abs(Number(tx.amount || 0));
          if (tx.type === "income") acc.income += amount;
          if (tx.type === "expense") acc.expense += amount;
          return acc;
        },
        { income: 0, expense: 0 }
      );
  };

  const currentTotals = getMonthTotals(currentYear, currentMonth);
  const previousTotals = getMonthTotals(previousYear, previousMonth);

  const formatChange = (current: number, previous: number) => {
    if (!previous) {
      return current ? 100 : 0;
    }

    return ((current - previous) / previous) * 100;
  };

  const incomeChange = formatChange(
    currentTotals.income,
    previousTotals.income
  );

  const expenseChange = formatChange(
    currentTotals.expense,
    previousTotals.expense
  );

  const currentSavingsRate =
    currentTotals.income > 0
      ? ((currentTotals.income - currentTotals.expense) /
          currentTotals.income) *
        100
      : 0;

  const previousSavingsRate =
    previousTotals.income > 0
      ? ((previousTotals.income - previousTotals.expense) /
          previousTotals.income) *
        100
      : 0;

  const savingsRateChange = currentSavingsRate - previousSavingsRate;

  // ======================
  // GROUP TRANSACTIONS
  // ======================
  const grouped: Record<number, { income: number; expense: number }> = {};

  for (const tx of transactions) {
    if (!tx.date) continue;

    const date = new Date(tx.date);
    if (date.getFullYear() !== currentYear) continue;

    const month = date.getMonth();
    const amount = Number(tx.amount || 0);

    if (!grouped[month]) {
      grouped[month] = { income: 0, expense: 0 };
    }

    if (tx.type === "income") {
      grouped[month].income += amount;
    }

    if (tx.type === "expense") {
      grouped[month].expense += amount;
    }
  }

  // ======================
  // CHART DATA
  // ======================
  const chartData = months.map((month, index) => ({
    month,
    income: grouped[index]?.income || 0,
    expense: grouped[index]?.expense || 0,
  }));



  const colorList = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
  ];

  const budgetData =
    overviewData?.budgetsData.map((b, index) => ({
      name: b.category || "Uncategorized",
      value: Number(b.amount || 0),
      color: colorList[index % colorList.length],
    })) || [];

  const recentTransactions = (overviewData?.transactionsData || [])
    .slice(0, 4)
    .map((tx, index) => ({
      id: tx.id || `transaction-${index}`,
      description: tx.description || "Transaction",
      amount: Number(tx.amount || 0),
      type: (tx.type === "income" ? "income" : "expense") as "income" | "expense",
      category: tx.category || "Uncategorized",
      date: tx.date ? new Date(tx.date).toISOString() : new Date().toISOString(),
    }));

  const loanStatusData = (overviewData?.loanData || []).map((loan) => ({
    ...loan,
    totalAmount: Number(loan.totalAmount || 0),
    remainingAmount: Number(loan.remainingAmount || 0),
    dueDate: new Date(loan.dueDate).toISOString(),
    createdAt: new Date(loan.createdAt).toISOString(),
    updatedAt: new Date(loan.updatedAt).toISOString(),
  }));

  if (error) {
    return <div>Failed to load overview data.</div>;
  }
  // ======================
  // LOADING UI
  // ======================
  if (status === "loading" || isLoadingData) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-6"
            >
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-32" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div
              key={`chart-${i}`}
              className="bg-card border border-border rounded-xl p-6 min-h-[40vh]"
            >
              <Skeleton className="h-5 w-36 mb-4" />
              <Skeleton className="h-52 w-full" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[55vh]">
          {[1, 2].map((i) => (
            <div
              key={`panel-${i}`}
              className="bg-card border border-border rounded-xl p-6"
            >
              <Skeleton className="h-5 w-40 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((row) => (
                  <Skeleton key={`row-${i}-${row}`} className="h-10 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((row) => (
              <Skeleton key={`loan-${row}`} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ======================
  // MAIN UI
  // ======================
  return (
    <div className="space-y-6 ">

     

       <div className="grid grid-cols-2  md:grid-cols-4 gap-4">

        <div className="group relative bg-mist-300/10 border border-border rounded-xl p-5 hover:border-accent/50 transition-all duration-500 overflow-hidden animate-in fade-in slide-in-from-bottom-4"
        style={
          { animationDelay: `${0 * 100}ms`, animationFillMode: "both" }
        }>
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-2">Total <br className="inline md:hidden" /> Balance</p>
              <p className="text-lg md:text-2xl font-bold text-foreground tracking-tight">
                {formatCurrency(totalBalance)}
              </p>
         
            </div>
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Wallet className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="group relative bg-purple-500/15 border border-border rounded-xl p-5 hover:border-accent/50 transition-all duration-500 overflow-hidden animate-in fade-in slide-in-from-bottom-4"
         style={
          { animationDelay: `${1 * 100}ms`, animationFillMode: "both" }
        }>
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="md:text-2xl text-sm text-muted-foreground font-medium mb-2">Savings <br className="md:hidden inline" /> Rate</p>
              <p className="text-lg font-bold text-foreground tracking-tight">$ {savingsRate}%</p>
         
            </div>
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>

          <div className="group relative bg-green-500/15 border border-border rounded-xl p-5 hover:border-accent/50 transition-all duration-500 overflow-hidden animate-in fade-in slide-in-from-bottom-4"
        style={
          { animationDelay: `${0 * 100}ms`, animationFillMode: "both" }
        }>
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-2">Total <br className="inline md:hidden" /> Income</p>
              <p className="text-lg md:text-2xl font-bold text-foreground tracking-tight">
                {formatCurrency(income)}
              </p>
         
            </div>
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Wallet className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
        </div>

          <div className="group relative bg-red-500/15 border border-border rounded-xl p-5 hover:border-accent/50 transition-all duration-500 overflow-hidden animate-in fade-in slide-in-from-bottom-4"
        style={
          { animationDelay: `${0 * 100}ms`, animationFillMode: "both" }
        }>
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-2">Total <br className="inline md:hidden" /> Expenses</p>
              <p className="text-lg md:text-2xl font-bold text-foreground tracking-tight">
                {formatCurrency(expenses)}
              </p>
         
            </div>
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Wallet className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
        </div>


      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncomeExpenseChart data={chartData} onNavigateSection={onNavigate} />
        <ExpenseCategories data={budgetData} onNavigateSection={onNavigate} />
      </div>

      {/* BOTTOM SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[55vh]">
        <RecentTransactions
          transactions={recentTransactions}
          onNavigateSection={onNavigate}
        />

        <BudgetProgress
          budgets={transformedBudgets}
          onNavigateSection={onNavigate}
        />
      </div>

      {/* LOANS */}
      <LoanStatus loans={loanStatusData} />
    </div>
  );
}
