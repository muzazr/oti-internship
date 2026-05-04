import { supabase } from "@/lib/supabase";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AnalyticsClass {
  id: string;
  name: string;
}

export interface AnalyticsAssignment {
  id: string;
  title: string;
}

export interface StudentRecap {
  id: string;
  name: string;
  avgScore: number;
  submitted: number;
  late: number;
  notSubmitted: number;
}

export interface ParticipationItem {
  assignment: string;
  sudah: number;
  terlambat: number;
  belum: number;
}

export interface AnalyticsStats {
  averageScore: number;
  submitted: number;
  late: number;
  notSubmitted: number;
  totalStudents: number;
}

export interface AnalyticsData {
  classes: AnalyticsClass[];
  assignments: AnalyticsAssignment[];
  students: StudentRecap[];
  participation: ParticipationItem[];
  stats: AnalyticsStats;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getTeacherId(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");
  return session.user.id;
}

// ─── Main analytics data fetch ───────────────────────────────────────────────

export async function fetchAnalyticsData(
  selectedClassId: string, // "all" or specific class ID
  selectedAssignmentId: string // "all" or specific assignment ID
): Promise<AnalyticsData> {
  const teacherId = await getTeacherId();

  // 1. Get teacher's classes
  const { data: allClasses, error: classesError } = await supabase
    .from("classes")
    .select("id, name")
    .eq("teacher_id", teacherId)
    .order("name", { ascending: true });

  if (classesError) throw new Error(classesError.message);

  const classes = (allClasses as AnalyticsClass[]) || [];

  if (classes.length === 0) {
    return emptyAnalyticsData(classes);
  }

  // 2. Determine which class IDs to use
  const targetClassIds =
    selectedClassId === "all"
      ? classes.map((c) => c.id)
      : [selectedClassId];

  // 3. Get students in target classes
  const { data: studentsRaw, error: studentsError } = await supabase
    .from("students")
    .select("id, full_name, class_id")
    .in("class_id", targetClassIds)
    .order("full_name", { ascending: true });

  if (studentsError) throw new Error(studentsError.message);

  const students = studentsRaw || [];

  // 4. Get assignment_classes links for target classes
  const { data: assignmentLinks, error: linksError } = await supabase
    .from("assignment_classes")
    .select("assignment_id, class_id")
    .in("class_id", targetClassIds);

  if (linksError) throw new Error(linksError.message);

  if (!assignmentLinks || assignmentLinks.length === 0) {
    return emptyAnalyticsData(classes, [], students.length);
  }

  // Deduplicate assignment IDs
  const allAssignmentIds = [
    ...new Set(assignmentLinks.map((l) => l.assignment_id)),
  ];

  // 5. Get assignments
  const { data: assignmentsRaw, error: assignmentsError } = await supabase
    .from("assignments")
    .select("id, title, deadline, status")
    .in("id", allAssignmentIds)
    .eq("teacher_id", teacherId)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (assignmentsError) throw new Error(assignmentsError.message);

  let assignments = (assignmentsRaw || []) as Array<{
    id: string;
    title: string;
    deadline: string | null;
    status: string;
  }>;

  if (assignments.length === 0) {
    return emptyAnalyticsData(classes, [], students.length);
  }

  // Build assignment list for dropdown (before filtering by specific assignment)
  const assignmentOptions: AnalyticsAssignment[] = assignments.map((a) => ({
    id: a.id,
    title: a.title,
  }));

  // 6. Filter by specific assignment if selected
  if (selectedAssignmentId !== "all") {
    assignments = assignments.filter((a) => a.id === selectedAssignmentId);
  }

  const targetAssignmentIds = assignments.map((a) => a.id);

  if (targetAssignmentIds.length === 0) {
    return emptyAnalyticsData(classes, assignmentOptions, students.length);
  }

  // 7. Get all submissions for target assignments
  const { data: submissionsRaw, error: submissionsError } = await supabase
    .from("submissions")
    .select("id, student_id, assignment_id, status, score")
    .in("assignment_id", targetAssignmentIds);

  if (submissionsError) throw new Error(submissionsError.message);

  const submissions = submissionsRaw || [];

  // 8. Build student ID set (for filtering submissions to only our students)
  const studentIdSet = new Set(students.map((s) => s.id));

  // 9. Build per-student submission map
  // Map: studentId -> Map(assignmentId -> { status, score })
  const studentSubmissionMap = new Map<
    string,
    Map<string, { status: string; score: number | null }>
  >();

  for (const sub of submissions) {
    if (!studentIdSet.has(sub.student_id)) continue;

    if (!studentSubmissionMap.has(sub.student_id)) {
      studentSubmissionMap.set(sub.student_id, new Map());
    }
    studentSubmissionMap.get(sub.student_id)!.set(sub.assignment_id, {
      status: sub.status,
      score: sub.score,
    });
  }

  // 10. Compute per-student recap
  const studentRecaps: StudentRecap[] = students.map((student) => {
    const subMap = studentSubmissionMap.get(student.id) || new Map();

    let submittedCount = 0;
    let lateCount = 0;
    let totalScore = 0;
    let gradedCount = 0;

    for (const assignmentId of targetAssignmentIds) {
      const sub = subMap.get(assignmentId);
      if (!sub) {
        // No submission = not submitted
        continue;
      }

      if (sub.status === "late") {
        lateCount++;
      } else {
        // "submitted" or "graded"
        submittedCount++;
      }

      if (sub.score !== null && sub.score !== undefined) {
        totalScore += sub.score;
        gradedCount++;
      }
    }

    const notSubmittedCount =
      targetAssignmentIds.length - submittedCount - lateCount;
    const avgScore = gradedCount > 0 ? totalScore / gradedCount : 0;

    return {
      id: student.id,
      name: student.full_name,
      avgScore,
      submitted: submittedCount,
      late: lateCount,
      notSubmitted: Math.max(0, notSubmittedCount),
    };
  });

  // 11. Compute per-assignment participation
  // Build classId -> Set(studentIds)
  const classStudentMap = new Map<string, Set<string>>();
  for (const student of students) {
    if (!classStudentMap.has(student.class_id)) {
      classStudentMap.set(student.class_id, new Set());
    }
    classStudentMap.get(student.class_id)!.add(student.id);
  }

  // Build assignmentId -> Set(classIds)
  const assignmentClassMap = new Map<string, Set<string>>();
  for (const link of assignmentLinks) {
    if (!assignmentClassMap.has(link.assignment_id)) {
      assignmentClassMap.set(link.assignment_id, new Set());
    }
    assignmentClassMap.get(link.assignment_id)!.add(link.class_id);
  }

  const participation: ParticipationItem[] = assignments.map((assignment) => {
    // Get students who should have this assignment (via linked classes)
    const linkedClassIds = assignmentClassMap.get(assignment.id) || new Set();
    const relevantStudentIds = new Set<string>();
    for (const classId of linkedClassIds) {
      const studentsInClass = classStudentMap.get(classId);
      if (studentsInClass) {
        for (const sid of studentsInClass) {
          relevantStudentIds.add(sid);
        }
      }
    }

    let sudah = 0;
    let terlambat = 0;
    let belum = 0;

    for (const studentId of relevantStudentIds) {
      const subMap = studentSubmissionMap.get(studentId);
      const sub = subMap?.get(assignment.id);

      if (!sub) {
        belum++;
      } else if (sub.status === "late") {
        terlambat++;
      } else {
        sudah++;
      }
    }

    // Truncate long assignment titles for chart display
    const displayTitle =
      assignment.title.length > 20
        ? assignment.title.substring(0, 18) + "..."
        : assignment.title;

    return {
      assignment: displayTitle,
      sudah,
      terlambat,
      belum,
    };
  });

  // 12. Compute summary stats
  const totalSubmitted = studentRecaps.reduce((sum, s) => sum + s.submitted, 0);
  const totalLate = studentRecaps.reduce((sum, s) => sum + s.late, 0);
  const totalNotSubmitted = studentRecaps.reduce(
    (sum, s) => sum + s.notSubmitted,
    0
  );

  const studentsWithScores = studentRecaps.filter((s) => s.avgScore > 0);
  const overallAvgScore =
    studentsWithScores.length > 0
      ? studentsWithScores.reduce((sum, s) => sum + s.avgScore, 0) /
        studentsWithScores.length
      : 0;

  return {
    classes,
    assignments: assignmentOptions,
    students: studentRecaps,
    participation,
    stats: {
      averageScore: overallAvgScore,
      submitted: totalSubmitted,
      late: totalLate,
      notSubmitted: totalNotSubmitted,
      totalStudents: students.length,
    },
  };
}

// ─── Empty data helper ───────────────────────────────────────────────────────

function emptyAnalyticsData(
  classes: AnalyticsClass[],
  assignments: AnalyticsAssignment[] = [],
  totalStudents: number = 0
): AnalyticsData {
  return {
    classes,
    assignments,
    students: [],
    participation: [],
    stats: {
      averageScore: 0,
      submitted: 0,
      late: 0,
      notSubmitted: 0,
      totalStudents,
    },
  };
}
