"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

interface Loan {
  id: string;
  person: string;
  amount: number;
  remaining: number;
  dueDate: string;
  type: "lent" | "borrowed";
  status: "active" | "pending" | "paid";
}

interface LoanOverviewProps {
  loans: Loan[];
}

export function LoanOverview({ loans }: LoanOverviewProps) {
  const lentLoans = loans.filter((l) => l.type === "lent");
  const borrowedLoans = loans.filter((l) => l.type === "borrowed");
  const totalLent = lentLoans.reduce((acc, l) => acc + l.remaining, 0);
  const totalBorrowed = borrowedLoans.reduce((acc, l) => acc + l.remaining, 0);

  return (
    <Card className="border-border bg-card animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Loan Overview</CardTitle>
          <button className="text-sm text-accent hover:text-accent/80 flex items-center gap-1 transition-colors">
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
            <p className="text-xs text-muted-foreground mb-1">You Lent</p>
            <p className="text-lg font-semibold text-accent">Rs {totalLent.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-xs text-muted-foreground mb-1">You Borrowed</p>
            <p className="text-lg font-semibold text-destructive">Rs {totalBorrowed.toLocaleString()}</p>
          </div>
        </div>

        {/* Loan list */}
        <div className="space-y-3">
          {loans.slice(0, 3).map((loan, index) => (
            <div
              key={loan.id}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border hover:border-accent/30 transition-colors animate-in fade-in slide-in-from-left-2"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    loan.type === "lent" ? "bg-accent/10" : "bg-destructive/10"
                  }`}
                >
                  {loan.type === "lent" ? (
                    <ArrowRight className="w-5 h-5 text-accent rotate-180" />
                  ) : (
                    <ArrowRight className="w-5 h-5 text-destructive" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{loan.person}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Due: {loan.dueDate}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        loan.status === "active"
                          ? "border-accent/50 text-accent"
                          : loan.status === "pending"
                          ? "border-warning/50 text-warning"
                          : "border-muted-foreground/50 text-muted-foreground"
                      }`}
                    >
                      {loan.status === "active" && <AlertCircle className="w-3 h-3 mr-1" />}
                      {loan.status === "paid" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                      {loan.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                      {loan.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">
                  Rs {loan.remaining.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  of Rs {loan.amount.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
