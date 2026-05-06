import { supabase } from "@/lib/supabase";

// Types
export interface ClassInfo {
  id: string;
  name: string;
  teacher_id: string;
  subject_id?: string | null;
  academic_year: string | null;
  created_at: string;
  subjects?: { id: string; name: string } | null;
}

export interface TeacherProfile {
  id: string;
  full_name: string;
  role: string;
}

export interface Student {
  id: string;
  full_name: string;
  class_id: string;
  student_code: string | null;
  whatsapp_number: string | null;
  created_at: string;
}

// Helper
async function getSession() {
  // Try to refresh session first
  const {
    data: { session },
  } = await supabase.auth.refreshSession();
  
  if (session) return session;
  
  // Fallback to getSession
  const {
    data: { session: fallbackSession },
  } = await supabase.auth.getSession();
  
  if (!fallbackSession) throw new Error("Not authenticated");
  return fallbackSession;
}

async function ensureProfile(): Promise<string> {
  const session = await getSession();
  const userId = session.user.id;
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();
  if (existing) return userId;

  const fullName =
    session.user.user_metadata?.full_name ||
    session.user.email?.split("@")[0] ||
    "Teacher";
  const { error } = await supabase.from("profiles").insert({
    id: userId,
    full_name: fullName,
    role: "teacher",
  });
  if (error && !error.message.includes("duplicate")) {
    throw new Error(`Failed to create profile: ${error.message}`);
  }
  return userId;
}

// Fetch class info by ID (with subject name)
export async function fetchClassById(classId: string): Promise<ClassInfo> {
  const { data, error } = await supabase
    .from("classes")
    .select("*, subjects(id, name)")
    .eq("id", classId)
    .single();

  if (error) throw new Error(error.message);
  return data as ClassInfo;
}

// Fetch teacher profile by ID
export async function fetchTeacherProfile(
  teacherId: string
): Promise<TeacherProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", teacherId)
    .single();
  if (error) throw new Error(error.message);
  return data as TeacherProfile;
}

// Fetch all students in a class
export async function fetchStudentsByClass(
  classId: string
): Promise<Student[]> {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("class_id", classId)
    .order("full_name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as Student[]) || [];
}

// Add a student to a class via backend API
export async function addStudent(
  classId: string,
  fullName: string,
  whatsappNumber: string
): Promise<Student> {
  try {
    const session = await getSession();
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

    // Auto-generate student_code from WA number + timestamp
    const studentCode = `WA${whatsappNumber.replace(/\D/g, "").slice(-8)}${Date.now().toString(36).slice(-4)}`;

    console.log("[addStudent] Calling API:", {
      url: `${API_BASE}/students`,
      classId,
      fullName,
      studentCode,
      whatsappNumber,
    });

    const response = await fetch(`${API_BASE}/students`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        class_id: classId,
        full_name: fullName,
        student_code: studentCode,
        whatsapp_number: whatsappNumber || null,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: `HTTP ${response.status}: ${response.statusText}` }));
      console.error("[addStudent] Error:", {
        status: response.status,
        statusText: response.statusText,
        error: err,
      });
      
      // Handle specific error cases
      if (response.status === 401) {
        throw new Error("Session expired. Please refresh the page and login again.");
      }
      
      throw new Error(err.message || `Failed to add student (${response.status})`);
    }

    const result = await response.json();
    console.log("[addStudent] Success:", result.data);
    return result.data as Student;
  } catch (error) {
    console.error("[addStudent] Exception:", error);
    throw error;
  }
}

// Delete a student via backend API
export async function deleteStudent(studentId: string): Promise<void> {
  const session = await getSession();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  const response = await fetch(`${API_BASE}/students/${studentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to delete student");
  }
}
