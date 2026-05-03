import { supabase } from "@/lib/supabase";

// Types
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  type: "submission" | "class" | "assignment" | "system";
  is_read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Helper to get current session
async function getSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");
  return session;
}

/**
 * Fetch notifications for the current user
 */
export async function fetchNotifications(
  limit: number = 20
): Promise<Notification[]> {
  const session = await getSession();
  const userId = session.user.id;

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data as Notification[]) || [];
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<number> {
  const session = await getSession();
  const userId = session.user.id;

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) return 0;
  return count || 0;
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<void> {
  const session = await getSession();
  const userId = session.user.id;

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) throw new Error(error.message);
}

/**
 * Create a notification for a user
 */
export async function createNotification(
  userId: string,
  title: string,
  type: Notification["type"],
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    title,
    type,
    metadata,
  });

  if (error) {
    // Don't throw - notification creation should not block main operations
    console.warn("Failed to create notification:", error.message);
  }
}

/**
 * Helper: format relative time for notification display
 */
export function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit yang lalu`;
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  if (diffDays < 7) return `${diffDays} hari yang lalu`;

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
