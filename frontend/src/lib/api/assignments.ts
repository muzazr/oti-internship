import { supabase } from "@/lib/supabase";
import { createNotification } from "@/lib/api/notifications";

// Types
export interface Assignment {
  id: string;
  teacher_id: string;
  subject_id: string | null;
  title: string;
  description: string | null;
  instruction: string | null;
  deadline: string | null;
  start_date: string | null;
  attachment_url: string | null;
  status: string;
  allow_late_submission: boolean;
  created_at: string;
  subjects?: { name: string } | null;
}

export interface AssignmentWithProgress extends Assignment {
  submittedCount: number;
  totalStudents: number;
}

export interface CreateAssignmentPayload {
  title: string;
  description?: string;
  attachment_url?: string;
  start_date?: string;
  deadline?: string;
  subject_id?: string;
  class_ids: string[];
  send_wa_notification?: boolean;
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

// Fetch assignments for a specific class
export async function fetchAssignmentsByClass(
  classId: string
): Promise<Assignment[]> {
  // Get assignment IDs linked to this class
  const { data: links, error: linksError } = await supabase
    .from("assignment_classes")
    .select("assignment_id")
    .eq("class_id", classId);

  if (linksError) throw new Error(linksError.message);
  if (!links || links.length === 0) return [];

  const assignmentIds = links.map((l) => l.assignment_id);

  const { data, error } = await supabase
    .from("assignments")
    .select("*, subjects(name)")
    .in("id", assignmentIds)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as Assignment[]) || [];
}

// Get submission count for an assignment
export async function getSubmissionCount(
  assignmentId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("assignment_id", assignmentId);

  if (error) return 0;
  return count || 0;
}

// Create a new assignment
export async function createAssignment(
  payload: CreateAssignmentPayload
): Promise<Assignment> {
  const teacherId = await ensureProfile();

  const { data: assignment, error: assignmentError } = await supabase
    .from("assignments")
    .insert({
      teacher_id: teacherId,
      subject_id: payload.subject_id || null,
      title: payload.title,
      description: payload.description || null,
      attachment_url: payload.attachment_url || null,
      start_date: payload.start_date || null,
      deadline: payload.deadline || null,
      status: "published",
    })
    .select()
    .single();

  if (assignmentError) throw new Error(assignmentError.message);

  // Link assignment to classes
  if (payload.class_ids.length > 0) {
    const rows = payload.class_ids.map((classId) => ({
      assignment_id: assignment.id,
      class_id: classId,
    }));
    const { error: linkError } = await supabase
      .from("assignment_classes")
      .insert(rows);
    if (linkError) throw new Error(linkError.message);
  }

  // Create notification for assignment creation
  createNotification(
    teacherId,
    `Tugas baru "${payload.title}" berhasil dibuat`,
    "assignment",
    { assignment_id: assignment.id, title: payload.title }
  );

  return assignment as Assignment;
}

// Update an existing assignment
export async function updateAssignment(
  assignmentId: string,
  payload: Partial<CreateAssignmentPayload>
): Promise<Assignment> {
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (payload.title !== undefined) updateData.title = payload.title;
  if (payload.description !== undefined)
    updateData.description = payload.description || null;
  if (payload.attachment_url !== undefined)
    updateData.attachment_url = payload.attachment_url || null;
  if (payload.start_date !== undefined)
    updateData.start_date = payload.start_date || null;
  if (payload.deadline !== undefined)
    updateData.deadline = payload.deadline || null;

  const { data, error } = await supabase
    .from("assignments")
    .update(updateData)
    .eq("id", assignmentId)
    .select("*, subjects(name)")
    .single();

  if (error) throw new Error(error.message);
  return data as Assignment;
}

// Delete an assignment
export async function deleteAssignment(assignmentId: string): Promise<void> {
  // Delete assignment_classes links first
  await supabase
    .from("assignment_classes")
    .delete()
    .eq("assignment_id", assignmentId);

  // Delete submissions
  await supabase
    .from("submissions")
    .delete()
    .eq("assignment_id", assignmentId);

  // Delete the assignment
  const { error } = await supabase
    .from("assignments")
    .delete()
    .eq("id", assignmentId);

  if (error) throw new Error(error.message);
}
