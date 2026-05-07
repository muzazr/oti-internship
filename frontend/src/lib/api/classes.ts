import { supabase } from "@/lib/supabase";

// Types
export interface ClassData {
  id: string;
  name: string;
  teacher_id: string;
  subject_id?: string | null;
  academic_year: string | null;
  created_at: string;
  updated_at: string | null;
  subjects?: { id: string; name: string } | null;
  students: { count: number }[];
}

export interface SubjectData {
  id: string;
  name: string;
  teacher_id: string;
  created_at: string;
}

export interface CreateClassPayload {
  name: string;
  subject_id?: string | null;
}

// Helper to get current session + teacher ID
async function getSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");
  return session;
}

// Ensure the logged-in user has a profile row in the profiles table.
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

// Fetch all classes for the teacher
export async function fetchClasses(): Promise<ClassData[]> {
  const session = await getSession();
  const teacherId = session.user.id;

  const { data, error } = await supabase
    .from("classes")
    .select("*, subjects(id, name), students(count)")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as ClassData[]) || [];
}

// Fetch all subjects for the teacher
export async function fetchSubjects(): Promise<SubjectData[]> {
  const session = await getSession();
  const teacherId = session.user.id;

  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("teacher_id", teacherId)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as SubjectData[]) || [];
}

// Create a new class
export async function createClass(
  payload: CreateClassPayload
): Promise<ClassData> {
  const teacherId = await ensureProfile();

  const insertData: Record<string, unknown> = {
    name: payload.name,
    teacher_id: teacherId,
  };

  if (payload.subject_id) {
    insertData.subject_id = payload.subject_id;
  }

  const { data, error } = await supabase
    .from("classes")
    .insert(insertData)
    .select("*, subjects(id, name), students(count)")
    .single();

  if (error) throw new Error(error.message);
  return data as ClassData;
}

// Create a new subject
export async function createSubject(name: string): Promise<SubjectData> {
  const teacherId = await ensureProfile();

  const { data, error } = await supabase
    .from("subjects")
    .insert({ name, teacher_id: teacherId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as SubjectData;
}

// Delete a class — deletes related data first, then the class itself
export async function deleteClass(classId: string): Promise<void> {
  const session = await getSession();
  const teacherId = session.user.id;

  // 1. Delete students in this class
  await supabase.from("students").delete().eq("class_id", classId);

  // 2. Delete assignment_classes references
  await supabase.from("assignment_classes").delete().eq("class_id", classId);

  // 3. Delete the class — verify it actually got deleted
  const { data, error } = await supabase
    .from("classes")
    .delete()
    .eq("id", classId)
    .eq("teacher_id", teacherId)
    .select("id");

  if (error) throw new Error(error.message);

  // If no rows were deleted, the class either doesn't exist or RLS blocked it
  if (!data || data.length === 0) {
    // Double-check: is the class still there?
    const { data: stillExists } = await supabase
      .from("classes")
      .select("id")
      .eq("id", classId)
      .single();

    if (stillExists) {
      throw new Error("Gagal menghapus kelas. Coba lagi.");
    }
    // If it doesn't exist anymore, it was already deleted — that's fine
  }
}
