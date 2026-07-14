"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, ArrowRight, Wallet } from "lucide-react";
import type { Section } from "@/app/dashboard/page";
interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  onNavigateSection: (section: Section) => void;
}


function getDateOnly(dateString: string) {
  return dateString.split("T")[0];
}


export function RecentTransactions({ transactions, onNavigateSection }: RecentTransactionsProps) {
  return (
    <Card className="border-border bg-card animate-in fade-in slide-in-from-bottom-4 p-5 duration-500"
      style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
          <button onClick={() => onNavigateSection("transactions")} className="text-sm cursor-pointer text-mist-400 hover:text-mist-200 flex items-center gap-1 transition-colors">
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </CardHeader>

      {transactions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center h-[33vh]">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Wallet className="w-10 h-10 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground mb-1">No transactions yet</p>
          <p className="text-sm text-muted-foreground mb-4">Add your first transaction to start tracking</p>
          <Button size="sm" onClick={() => onNavigateSection("transactions")}
          >
            Add Transaction
          </Button>
        </div>) : (

        <CardContent className="space-y-3">
          {transactions.map((tx, index) => (
            <div
              key={tx.id}
              className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 animate-in fade-in slide-in-from-left-2"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === "income" ? "bg-accent/40" : "bg-destructive/10"
                    }`}
                >
                  {tx.type === "income" ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-destructive" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">{tx.category} • {getDateOnly(tx.date)}</p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`text-sm font-semibold ${tx.type === "income" ? "text-green-500" : "text-destructive"
                    }`}
                >
                  {tx.type === "income" ? "+" : "-"}{" "}
                  Rs {Math.abs(tx.amount).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </CardContent>)}
    </Card>
  );
}
