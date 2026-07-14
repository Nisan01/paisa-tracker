"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowRightLeft, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

interface Loan {
  id: string;
  userId: string;
  personName: string;
  totalAmount: number;
  remainingAmount: number;
  dueDate: string;
  type: "lent" | "borrowed";
  status: "active" | "pending" | "paid";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface LoanStatusProps {
  loans: Loan[];
}

export function LoanStatus({ loans }: LoanStatusProps) {


  const lentLoans = loans
    .filter((l) => l.type === "lent" && l.status !== "paid")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const borrowedLoans = loans
    .filter((l) => l.type === "borrowed" && l.status !== "paid")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const totalLent = lentLoans.reduce(
    (acc, l) => acc + Number(l.remainingAmount || 0),
    0
  ); const totalBorrowed = borrowedLoans.reduce((acc, l) => acc + Number(l.remainingAmount || 0), 0);

  const getTimeLeft = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const days = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (days < 0) return { text: `${Math.abs(days)}d overdue`, urgent: true, overdue: true };
    if (days <= 30) {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      if (months === 0) return { text: `${days}d`, urgent: days <= 7, overdue: false };
      if (remainingDays === 0) return { text: `${months}mo`, urgent: months <= 1, overdue: false };
      return { text: `${months}mo ${remainingDays}d`, urgent: months <= 1, overdue: false };
    }
    const months = Math.floor(days / 30);
    return { text: `${months}mo`, urgent: false, overdue: false };
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

const formatAmount = (amount: number) => {
  if (amount >= 1_000_000_000) {
    return (amount / 1_000_000_000).toFixed(1).replace(".0", "") + "B";
  }

  if (amount >= 1_000_000) {
    return (amount / 1_000_000).toFixed(1).replace(".0", "") + "M";
  }

  if (amount >= 1_000) {
    return (amount / 1_000).toFixed(1).replace(".0", "") + "K";
  }

  return amount.toString();
};

  const LoanItem = ({ loan }: { loan: Loan }) => {
    const time = getTimeLeft(loan.dueDate);

    return (
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${loan.type === "lent" ? "bg-accent/60" : "bg-destructive/10"}`}>
            {loan.type === "lent" ? (
              <ArrowRightLeft className="w-4 h-4 text-green-500 rotate-180" />
            ) : (
              <ArrowRightLeft className="w-4 h-4 text-destructive" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{loan.personName}</p>
            <p className="text-xs text-muted-foreground">Due {formatDate(loan.dueDate)}</p>
          </div>
        </div>
  <div className="flex items-center justify-end gap-3 flex-shrink-0">
  <p className="w-20 text-right text-sm font-semibold text-foreground">
    Rs {formatAmount(loan.remainingAmount)}
  </p>

  <div className="w-24 flex justify-end">
    {time.urgent && (
      <div
        className={`inline-flex items-center gap-1 h-6 rounded-full px-2 text-xs font-medium whitespace-nowrap ${
          time.overdue
            ? "bg-destructive/10 text-destructive"
            : "bg-yellow-500/10 text-yellow-500"
        }`}
      >
        {time.overdue ? (
          <AlertCircle className="h-3 w-3" />
        ) : (
          <Clock className="h-3 w-3" />
        )}
        {time.text}
      </div>
    )}
  </div>
</div>
      </div>
    );
  };

  return (
    <Card className="border-border ">
      <div className="p-4 border-b-2  bg-secondary/30">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Loan Dues </h2>
       
        </div>
      </div>

      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <ArrowRightLeft className="w-4 h-4 text-green-500 rotate-180" />
          <span className="text-xs font-semibold text-green-500 uppercase tracking-wider">Loan Lent ({lentLoans.length})</span>
        </div>
        {lentLoans.length > 0 ? (
          <div className="space-y-1">
            {lentLoans.map((loan) => <LoanItem key={loan.id} loan={loan} />)}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-2">No lent loans</p>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <ArrowRightLeft className="w-4 h-4 text-destructive" />
          <span className="text-xs font-semibold text-destructive uppercase tracking-wider">Loan Borrowed ({borrowedLoans.length})</span>
        </div>
        {borrowedLoans.length > 0 ? (
          <div className="space-y-1">
            {borrowedLoans.map((loan) => <LoanItem key={loan.id} loan={loan} />)}
          </div>
        ) : (
          <p className="w-full text-center mb-2 text-sm text-muted-foreground py-2">No borrowed loans</p>
        )}
      </div>
    </Card>
  );
}
