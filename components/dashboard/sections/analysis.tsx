"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { ArrowDownRight, ArrowUpRight, PieChart } from "lucide-react";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

interface Transaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  category: string;
}

const categoryColors = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#10b981",
  "#eab308",
  "#14b8a6",
];

export function AnalysisSection() {
  const { data: session } = useSession();
  const [analysisText, setAnalysisText] = useState("");

  const fetchTransactions = async (): Promise<Transaction[]> => {
    const res = await fetch(
      `/api/dashboard/transaction?userId=${session?.user?.id}`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch transactions");
    }

    const data = await res.json();

    return (data.transactions || []).map((t: any) => ({
      id: t.id,
      amount: parseFloat(t.amount || "0"),
      type: t.type,
      category: t.category || "Uncategorized",
    }));
  };

  const { data: txList = [], isLoading } = useQuery({
    queryKey: ["transactions", session?.user?.id],
    queryFn: fetchTransactions,
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 5,
  });

  const analyzeMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/dashboard/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to send analysis data");
      }

      return res.json();
    },
    onSuccess: (data: any) => {
      setAnalysisText(data?.analysis || "");
      toast.success("Analysis ready");
    },
    onError: () => {
      toast.error("Failed to send analysis data");
    },
  });

  const totalIncome = txList
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const totalExpense = txList
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const categoryTotals = txList
    .filter((tx) => tx.type === "expense")
    .reduce((acc, tx) => {
      const key = tx.category || "Uncategorized";
      acc[key] = (acc[key] || 0) + Math.abs(tx.amount);
      return acc;
    }, {} as Record<string, number>);

  const categoryList = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpense ? (amount / totalExpense) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const topCategory = categoryList[0];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border bg-card">
              <CardContent className="p-5">
                <Skeleton className="h-10 w-10 rounded-full mb-3" />
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <Skeleton className="h-5 w-48 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <PieChart className="w-5 h-5 text-yellow-500" />
        <h2 className="text-lg font-semibold text-foreground">Transaction Analysis</h2>
        <Badge variant="outline" className="text-xs">
          Based on {txList.length} transactions
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-xl font-bold text-foreground">
                  Rs {totalIncome.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-xl font-bold text-foreground">
                  Rs {totalExpense.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/60 flex items-center justify-center">
                <PieChart className="w-5 h-5 text-mist-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Top Category</p>
                <p className="text-xl font-bold text-foreground">
                  {topCategory?.category ?? "-"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Rs {topCategory?.amount.toLocaleString() ?? "0"} (
                  {topCategory ? Math.round(topCategory.percentage) : 0}%)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3 px-5 pt-5">
          <CardTitle className="text-base font-semibold text-foreground">
            Spending by Category
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {categoryList.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No expense data available.
            </p>
          ) : (
            <div className="space-y-4">
              {categoryList.map((cat, index) => (
                <div key={cat.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">
                      {cat.category}
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-medium text-foreground">
                        Rs {cat.amount.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({Math.round(cat.percentage)}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor:
                          categoryColors[index % categoryColors.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {analysisText && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-3 px-5 pt-5">
            <CardTitle className="text-base font-semibold text-foreground">
              Analysis Result
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="rounded-lg border border-border bg-secondary/40 p-4">
              <pre className="whitespace-pre-wrap text-sm text-foreground">
                {analysisText}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analyze */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3 px-5 pt-5">
          <CardTitle className="text-base font-semibold text-foreground">
            Analyze
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            AI insights will help you understand patterns and suggest actions.
          </p>
          <Button
            onClick={() => {
              setAnalysisText("");
              analyzeMutation.mutate({
                categories: categoryList.map((cat) => ({
                  category: cat.category,
                  expense: cat.amount,
                })),
              });
            }}
            disabled={analyzeMutation.isPending || categoryList.length === 0}
          >
            {analyzeMutation.isPending ? "Sending..." : "Analyze"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}