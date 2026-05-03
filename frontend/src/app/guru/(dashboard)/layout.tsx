"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/guru/dashboard/sidebar";
import { Header } from "@/components/guru/dashboard/header";
import { QueryProvider } from "@/components/providers/query-provider";
import { supabase } from "@/lib/supabase";
import { getUnreadCount } from "@/lib/api/notifications";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("Guru");
  const [userRole, setUserRole] = useState("Guru");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function loadUserData() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/guru/login");
        return;
      }

      const userId = session.user.id;

      // Fetch profile data
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, first_name, last_name, avatar_url, role")
          .eq("id", userId)
          .single();

        if (profile) {
          const displayName =
            profile.first_name && profile.last_name
              ? `${profile.first_name} ${profile.last_name}`.trim()
              : profile.full_name || "Guru";
          setUserName(displayName);
          setUserRole(profile.role === "guru" ? "Guru" : profile.role || "Guru");
          if (profile.avatar_url) {
            setAvatarUrl(profile.avatar_url);
          }
        }
      } catch {
        // Profile might not have new columns yet, fallback to full_name
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, role")
            .eq("id", userId)
            .single();

          if (profile) {
            setUserName(profile.full_name || "Guru");
            setUserRole(profile.role === "guru" ? "Guru" : profile.role || "Guru");
          }
        } catch {
          // Silently fail - use defaults
        }
      }

      // Fetch unread notification count
      try {
        const count = await getUnreadCount();
        setUnreadCount(count);
      } catch {
        // Notifications table might not exist yet
      }
    }

    loadUserData();

    // Subscribe to realtime notifications for badge updates
    const channel = supabase
      .channel("notifications-count")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        () => {
          // Increment unread count when new notification arrives
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

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
          <Header
            userName={userName}
            userRole={userRole}
            avatarUrl={avatarUrl}
            unreadCount={unreadCount}
            onMenuClick={() => setSidebarOpen(true)}
          />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </QueryProvider>
  );
}
