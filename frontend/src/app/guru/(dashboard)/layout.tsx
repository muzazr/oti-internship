"use client";

import { useState } from "react";
import { Sidebar } from "@/components/guru/dashboard/sidebar";
import { Header } from "@/components/guru/dashboard/header";
import { QueryProvider } from "@/components/providers/query-provider";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <QueryProvider>
      <div className="flex h-screen overflow-hidden bg-[#FAF8FF]">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <Header onMenuClick={() => setSidebarOpen(true)} />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </QueryProvider>
  );
}
