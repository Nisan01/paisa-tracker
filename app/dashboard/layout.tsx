import QueryProvider from "@/providers/QueryProvider/QueryProvider";
import Providers from "@/providers/SessionProvider/SessionProvider";
import React from "react";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen  min-w-0 bg-background">
      <Providers>
        <QueryProvider>
          {children}
        </QueryProvider>
      </Providers>
    </div>
  );
}
