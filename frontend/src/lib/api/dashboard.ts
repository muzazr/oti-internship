import { supabase } from "@/lib/supabase";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

export interface DashboardStats {
  stats: {
    total_students: number;
    active_assignments: number;
    deadlines_today: number;
    submitted: number;
    not_submitted: number;
    participation_rate: number;
  };
  weekly_trend: Array<{
    day: string;
    count: number;
  }>;
  recent_submissions: Array<{
    id: string;
    student_name: string;
    student_initials: string;
    class_name: string;
    subject_name: string;
    submitted_at: string;
    status: string;
  }>;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/dashboard/stats`, { headers });

  if (!res.ok) {
    throw new Error("Failed to fetch dashboard stats");
  }

  const json = await res.json();
  return json.data;
}

export async function fetchUserProfile(): Promise<UserProfile> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/auth/me`, { headers });

  if (!res.ok) {
    throw new Error("Failed to fetch user profile");
  }

  const json = await res.json();
  return json.data;
}
