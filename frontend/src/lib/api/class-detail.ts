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
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");
  return session;
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

// Add a student to a class
export async function addStudent(
  classId: string,
  fullName: string,
  whatsappNumber: string
): Promise<Student> {
  await ensureProfile();
  const { data, error } = await supabase
    .from("students")
    .insert({
      class_id: classId,
      full_name: fullName,
      whatsapp_number: whatsappNumber,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Student;
}

// Delete a student
export async function deleteStudent(studentId: string): Promise<void> {
  const { error } = await supabase
    .from("students")
    .delete()
    .eq("id", studentId);
  if (error) throw new Error(error.message);
}
