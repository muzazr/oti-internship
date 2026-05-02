import { QueryProvider } from "@/components/providers/query-provider";

export const metadata = {
  title: "Dashboard - MitBridge",
  description: "Teacher Dashboard - MitBridge Educator Portal",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <QueryProvider>{children}</QueryProvider>;
}
