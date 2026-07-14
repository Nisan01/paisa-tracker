"use client";

import { Section } from "@/app/dashboard/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, Target } from "lucide-react";

interface Budget {
  category: string;
  budget: number;
  spent: number;
}

interface BudgetProgressProps {
  budgets: Budget[];
  onNavigateSection: (section: Section) => void;
}

export function BudgetProgress({ budgets, onNavigateSection }: BudgetProgressProps) {
  const getBudgetStatus = (percentage: number) => {
    if (percentage >= 100) return { color: "bg-destructive", icon: AlertCircle, text: "text-destructive" };
    if (percentage >= 80) return { color: "bg-destructive", icon: AlertCircle, text: "text-warning" };
    if (percentage >= 50) return { color: "bg-yellow-500/80", icon: AlertCircle, text: "text-yellow-500/80" };
    return { color: "bg-green-500", icon: CheckCircle2, text: "text-green-500" };
  };

  return (
    <Card className="border-border p-5 bg-card animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Budget Progress</CardTitle>
          <span onClick={() => onNavigateSection("budgets")} className="text-sm cursor-pointer text-muted-foreground">View All</span>
        </div>
      </CardHeader>

      {
        budgets.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center h-[33vh]">
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Target className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground mb-1">No budgets yet</p>
            <p className="text-sm text-muted-foreground mb-4">Set a budget to start tracking</p>
            <Button size="sm" onClick={() => onNavigateSection("budgets")}>
              Add Budget
            </Button>
          </div>) : (


          <CardContent className="space-y-4">
            {budgets.map((budget, index) => {
              const percentage = budget.budget > 0
                ? Math.round((budget.spent / budget.budget) * 100)
                : 0;
              const status = getBudgetStatus(percentage);
              const StatusIcon = status.icon;
              const remaining = budget.budget - budget.spent;

              return (
                <div
                  key={budget.category}
                  className="space-y-2 animate-in fade-in slide-in-from-left-2"
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{budget.category}</span>
                      {percentage >= 80 && (
                        <StatusIcon className={`w-4 h-4 ${status.text}`} />
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-foreground">
                        Rs {budget.spent.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        / Rs {budget.budget.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Progress
                      value={Math.min(percentage, 100)}
                      className="h-2"
                      indicatorClassName={status.color}
                    />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{percentage}% used</span>
                      <span className={status.text}>
                        Rs {remaining.toLocaleString()} left
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>)}
    </Card>
  );
}
