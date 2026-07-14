import QueryProvider from "@/providers/QueryProvider/QueryProvider";
import { Query } from "@tanstack/react-query";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen  min-w-0 bg-background">
      <QueryProvider>
        {children}
      </QueryProvider>
    </div>
  );
}