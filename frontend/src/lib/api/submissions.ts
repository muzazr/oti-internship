import { supabase } from "@/lib/supabase";

// Types
export interface SubmissionFile {
  id: string;
  submission_id: string;
  bucket: string;
  file_path: string;
  original_file_name: string;
  mime_type: string;
  file_size_bytes: number;
  file_order: number;
  signed_url?: string | null;
}

export interface SubmissionLink {
  id: string;
  submission_id: string;
  url: string;
  label: string | null;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  upload_link_id: string | null;
  status: "submitted" | "late" | "graded";
  note: string | null;
  score: number | null;
  feedback: string | null;
  graded_by: string | null;
  graded_at: string | null;
  submitted_at: string;
  updated_at: string | null;
}

export interface SubmissionWithStudent extends Submission {
  students: {
    id: string;
    full_name: string;
    student_code: string | null;
    whatsapp_number: string | null;
  };
}

export interface SubmissionDetail extends Submission {
  students: {
    id: string;
    full_name: string;
    student_code: string | null;
    whatsapp_number: string | null;
  };
  assignments: {
    id: string;
    title: string;
    teacher_id: string;
  };
  submission_files: SubmissionFile[];
  submission_links: SubmissionLink[];
}

export interface StudentSubmissionStatus {
  student: {
    id: string;
    full_name: string;
    student_code: string | null;
  };
  submission: SubmissionWithStudent | null;
  hasSubmitted: boolean;
}

export interface AssignmentWithGradingProgress {
  id: string;
  title: string;
  deadline: string | null;
  status: string;
  gradedCount: number;
  totalStudents: number;
}

export interface ClassWithAssignments {
  id: string;
  name: string;
  subject_name: string | null;
  assignments: AssignmentWithGradingProgress[];
}

// Helper
async function getSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");
  return session;
}

// Fetch all classes with their assignments and grading progress
export async function fetchClassesWithAssignments(): Promise<
  ClassWithAssignments[]
> {
  const session = await getSession();
  const teacherId = session.user.id;

  // Get only this teacher's classes
  const { data: classes, error: classesError } = await supabase
    .from("classes")
    .select("id, name")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });

  if (classesError) throw new Error(classesError.message);
  if (!classes || classes.length === 0) return [];

  const result: ClassWithAssignments[] = [];

  for (const cls of classes) {
    // Get assignments linked to this class (with subject info)
    const { data: links } = await supabase
      .from("assignment_classes")
      .select("assignment_id")
      .eq("class_id", cls.id);

    if (!links || links.length === 0) {
      result.push({
        id: cls.id,
        name: cls.name,
        subject_name: null,
        assignments: [],
      });
      continue;
    }

    const assignmentIds = links.map((l) => l.assignment_id);

    // Get assignments with subject name
    const { data: assignments } = await supabase
      .from("assignments")
      .select("id, title, deadline, status, subject_id, subjects(name)")
      .in("id", assignmentIds)
      .order("created_at", { ascending: false });

    if (!assignments) {
      result.push({
        id: cls.id,
        name: cls.name,
        subject_name: null,
        assignments: [],
      });
      continue;
    }

    // Derive subject name from the first assignment that has one
    let subjectName: string | null = null;
    for (const a of assignments) {
      const subRaw = a.subjects as unknown;
      if (subRaw && typeof subRaw === "object" && "name" in subRaw) {
        subjectName = (subRaw as { name: string }).name;
        break;
      }
    }

    // Get student count for this class
    const { count: studentCount } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("class_id", cls.id);

    const totalStudents = studentCount || 0;

    // Get grading progress for each assignment
    const assignmentsWithProgress: AssignmentWithGradingProgress[] = [];

    for (const assignment of assignments) {
      const { count: gradedCount } = await supabase
        .from("submissions")
        .select("*", { count: "exact", head: true })
        .eq("assignment_id", assignment.id)
        .eq("status", "graded");

      assignmentsWithProgress.push({
        id: assignment.id,
        title: assignment.title,
        deadline: assignment.deadline,
        status: assignment.status,
        gradedCount: gradedCount || 0,
        totalStudents,
      });
    }

    result.push({
      id: cls.id,
      name: cls.name,
      subject_name: subjectName,
      assignments: assignmentsWithProgress,
    });
  }

  return result;
}

// Fetch students with their submission status for a given assignment + class
export async function fetchStudentSubmissions(
  assignmentId: string,
  classId: string
): Promise<StudentSubmissionStatus[]> {
  await getSession();

  // Get all students in the class
  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("id, full_name, student_code")
    .eq("class_id", classId)
    .order("full_name", { ascending: true });

  if (studentsError) throw new Error(studentsError.message);
  if (!students || students.length === 0) return [];

  // Get all submissions for this assignment
  const { data: submissions } = await supabase
    .from("submissions")
    .select("*")
    .eq("assignment_id", assignmentId);

  const submissionMap = new Map<string, SubmissionWithStudent>();
  if (submissions) {
    for (const sub of submissions) {
      submissionMap.set(sub.student_id, sub as SubmissionWithStudent);
    }
  }

  return students.map((student) => {
    const submission = submissionMap.get(student.id) || null;
    return {
      student: {
        id: student.id,
        full_name: student.full_name,
        student_code: student.student_code,
      },
      submission,
      hasSubmitted: submission !== null,
    };
  });
}

// Fetch a single submission with full details (files, links, student, assignment)
export async function fetchSubmissionDetail(
  submissionId: string
): Promise<SubmissionDetail> {
  const session = await getSession();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/submissions/${submissionId}`,
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to fetch submission");
  }

  const json = await res.json();
  return json.data as SubmissionDetail;
}

// Grade a submission (finalize)
export async function gradeSubmission(
  submissionId: string,
  score: number,
  feedback: string | null
): Promise<void> {
  const session = await getSession();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/submissions/${submissionId}/grade`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ score, feedback }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to grade submission");
  }
}

// Save draft grade (update score/feedback without changing status to graded)
export async function saveDraftGrade(
  submissionId: string,
  score: number,
  feedback: string | null
): Promise<void> {
  await getSession();

  const { error } = await supabase
    .from("submissions")
    .update({
      score,
      feedback,
      updated_at: new Date().toISOString(),
    })
    .eq("id", submissionId);

  if (error) throw new Error(error.message);
}

// Fetch all submissions for an assignment (for student navigation in preview)
export async function fetchAllSubmissionsForAssignment(
  assignmentId: string
): Promise<SubmissionWithStudent[]> {
  await getSession();

  const { data, error } = await supabase
    .from("submissions")
    .select(
      `
      *,
      students(id, full_name, student_code, whatsapp_number)
    `
    )
    .eq("assignment_id", assignmentId)
    .order("submitted_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as SubmissionWithStudent[]) || [];
}
