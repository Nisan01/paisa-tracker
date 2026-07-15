"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import type { Section } from "@/app/dashboard/page";
import { PieChart as PieIcon } from "lucide-react";

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface ExpenseCategoriesProps {
  data: CategoryData[];
  onNavigateSection?: (section: Section) => void;
}

export function ExpenseCategories({ data, onNavigateSection }: ExpenseCategoriesProps) {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  const hasData = data.length > 0;

  return (
    <div className="bg-card border border-border rounded-xl p-5 min-h-[380px] min-w-0 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 isolate"
      style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground">
          Expense Categories
        </h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Breakdown by spending category
        </p>
      </div>


      {!hasData ? (

        <div className="flex-1 flex flex-col items-center justify-center h-[33vh]">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <PieIcon className="w-10 h-10 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground mb-1">No expenses yet</p>
          <p className="text-sm text-muted-foreground mb-4">Add a transaction to see categories</p>
          {onNavigateSection && (
            <Button size="sm" onClick={() => onNavigateSection("transactions")}>
              Add Expense
            </Button>
          )}
        </div>) : (

        <div className="md:flex items-center gap-2 min-w-0">


          <ChartContainer className="flex-1 h-[280px] min-h-[280px] min-w-0">

            <ResponsiveContainer
              width="100%"
              height={280}
              minWidth={100}
              minHeight={200}
              initialDimension={{ width: 280, height: 280 }}
            >
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={18}
                  outerRadius={105}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.10 0.002 260)",
                    border: "1px solid oklch(0.18 0.002 260)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [
                    `Rs ${Number(value || 0).toLocaleString()}`,
                    "",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="flex-1 space-y-2">
            {data.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-foreground">
                    Rs {(item.value / 1000).toFixed(1)}k
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
                  </span>
                </div>
              </div>
            ))}
            <div className="pt-2 mt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Total</span>
                <span className="text-sm font-semibold text-foreground">
                  Rs {total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
