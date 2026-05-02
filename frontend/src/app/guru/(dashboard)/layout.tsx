import { Sidebar } from "@/components/guru/dashboard/sidebar";
import { Header } from "@/components/guru/dashboard/header";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#FAF8FF] p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
