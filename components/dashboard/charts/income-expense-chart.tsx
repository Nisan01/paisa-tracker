"use client";


import {

  AreaChart,

  Area,

  XAxis,

  YAxis,

  CartesianGrid,

  Tooltip,

  ResponsiveContainer,

} from "recharts";


import { useState, useEffect } from "react";
import { ChartContainer } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import type { Section } from "@/app/dashboard/page";
import { TrendingUp } from "lucide-react";




interface TrendData {

  month: string;

  income: number;

  expense: number;

}


interface IncomeExpenseChartProps {
  data: TrendData[];
  onNavigateSection?: (section: Section) => void;
}


export function IncomeExpenseChart({ data, onNavigateSection }: IncomeExpenseChartProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);

    return () => clearTimeout(timer);
  }, []);

  const hasData = data.some(d => d.income > 0 || d.expense > 0);

  return (

    <div className="bg-card border border-border rounded-xl p-5 h-[380px] w-full overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 isolate"
      style={{ animationDelay: "0.2s", animationFillMode: "both" }}>


      {/* Header */}

      <div className="flex items-center justify-between mb-5 shrink-0">

        <div>

          <h3 className="text-base font-semibold text-foreground">

            Income vs Expense Trends

          </h3>


          <p className="text-sm text-muted-foreground mt-0.5">

            Monthly income and expense comparison

          </p>

        </div>


        <div className="flex items-center gap-4 text-xs">

          <div className="flex items-center gap-1.5">

            <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />

            <span className="text-muted-foreground">

              Income

            </span>

          </div>


          <div className="flex items-center gap-1.5">

            <div className="w-2.5 h-2.5 rounded-full bg-[#00B7FF]" />

            <span className="text-muted-foreground">

              Expense

            </span>

          </div>

        </div>

      </div>


      {!hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <TrendingUp className="w-10 h-10 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground mb-1">No transactions yet</p>
          <p className="text-sm text-muted-foreground mb-4">Add your first transaction to start tracking</p>
          {onNavigateSection && (
            <Button size="sm" onClick={() => onNavigateSection("transactions")}>
              Add Transaction
            </Button>
          )}
        </div>
      ) : (
        <ChartContainer
          className={`h-[280px] min-h-[280px] w-full min-w-0 transition-opacity duration-700 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <ResponsiveContainer
            width="100%"
            height={280}
            minWidth={100}
            minHeight={200}
            initialDimension={{ width: 400, height: 280 }}
          >
            <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.68 0.16 220)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#00B7FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.72 0.15 175)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="oklch(0.72 0.15 175)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.18 0.002 260)" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "oklch(0.55 0 0)", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "oklch(0.55 0 0)", fontSize: 12 }}
                tickFormatter={(value) => `${value / 1000}k`}
                dx={-10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.10 0.002 260)",
                  border: "1px solid oklch(0.18 0.002 260)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "oklch(0.93 0 0)", fontWeight: 600 }}
                itemStyle={{ color: "oklch(0.55 0 0)" }}
                formatter={(value) => [
                  `$${(Number(value || 0) / 1000).toFixed(0)}k`,
                  "",
                ]}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#00FF45"
                strokeWidth={2}
                fill="url(#incomeGradient)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#00B7FF"
                strokeWidth={2}
                fill="url(#expenseGradient)"
                dot={false}
              />

            </AreaChart>

          </ResponsiveContainer>
        </ChartContainer>


      )}

    </div>

  );

}
