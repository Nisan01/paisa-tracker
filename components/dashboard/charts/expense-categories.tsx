"use client";

import { useRef, useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface ExpenseCategoriesProps {
  data: CategoryData[];
}

function useContainerWidth(debounceMs: number = 400) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        for (const entry of entries) {
          setDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      }, debounceMs);
    });

    resizeObserver.observe(container);
    return () => {
      resizeObserver.disconnect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [debounceMs]);

  return { containerRef, ...dimensions };
}

export function ExpenseCategories({ data }: ExpenseCategoriesProps) {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  const { containerRef, width } = useContainerWidth(400);
  const hasData = data.length > 0;

  return (
    <div className="bg-card border border-border rounded-xl p-5 h-[380px] min-w-0 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 isolate"
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

        <div className="flex-1 flex items-center justify-center h-[33vh]">
          <p className="text-sm text-muted-foreground">No expense data available</p>
        </div>) : (

        <div className="flex items-center gap-2">


          <div ref={containerRef} className="flex-1 h-[280px]">

            <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100} >
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
                  formatter={(value: number) => [`Rs ${value.toLocaleString()}`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
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