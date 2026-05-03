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

// Extract subject name from class name pattern like "Matematika - X IPA 1"
function extractSubjectFromClassName(className: string): string | null {
  // Pattern: "Subject - Class" (e.g., "Matematika - X IPA 1")
  const dashIndex = className.indexOf(" - ");
  if (dashIndex > 0) {
    return className.substring(0, dashIndex).trim();
  }
  return null;
}

// Fetch class info by ID (with subject name if available)
export async function fetchClassById(classId: string): Promise<ClassInfo> {
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .eq("id", classId)
    .single();

  if (error) throw new Error(error.message);

  const classData = data as ClassInfo;

  // Try to get subject from subjects table (if subject_id exists on class)
  if (classData.subject_id) {
    const { data: subject } = await supabase
      .from("subjects")
      .select("id, name")
      .eq("id", classData.subject_id)
      .single();
    if (subject) {
      classData.subjects = subject;
      return classData;
    }
  }

  // Fallback: try to find subject from teacher's subjects
  if (!classData.subjects) {
    const { data: subjects } = await supabase
      .from("subjects")
      .select("id, name")
      .eq("teacher_id", classData.teacher_id)
      .limit(1);
    if (subjects && subjects.length > 0) {
      classData.subjects = subjects[0];
      return classData;
    }
  }

  // Final fallback: extract subject name from class name pattern
  if (!classData.subjects) {
    const extracted = extractSubjectFromClassName(classData.name);
    if (extracted) {
      classData.subjects = { id: "", name: extracted };
    }
  }

  return classData;
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
