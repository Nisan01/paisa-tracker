"use client";


import {

  AreaChart,

  Area,

  XAxis,

  YAxis,

  CartesianGrid,

  Tooltip,

  ResponsiveContainer,

  Legend,

} from "recharts";


import { useState, useEffect } from "react";
import { useContainerWidth } from "./useContainerWidth";




interface TrendData {

  month: string;

  income: number;

  expense: number;

}


interface IncomeExpenseChartProps {

  data: TrendData[];

}


export function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  const { ref, width } = useContainerWidth();

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);

    return () => clearTimeout(timer);
  }, []);

  const hasData = data.some(d => d.income > 0 || d.expense > 0);
  console.log(hasData)

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

        <div className="flex-1 flex items-center justify-center">

          <p className="text-sm text-muted-foreground">

            No data available

          </p>

        </div>

      ) : (
        <div
          className={`h-[280px] w-full transition-opacity duration-700 ${isLoaded ? "opacity-100" : "opacity-0"
            }`}
        >
          <ResponsiveContainer width="100%" height="100%" minWidth={100}>
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
                formatter={(value: number) => [`$${(value / 1000).toFixed(0)}k`, ""]}
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



        </div>


      )}

    </div>

  );

}