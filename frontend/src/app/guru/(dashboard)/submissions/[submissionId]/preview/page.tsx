"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { FileViewer } from "@/components/guru/dashboard/submissions/preview/file-viewer";
import { GradingPanel } from "@/components/guru/dashboard/submissions/preview/grading-panel";
import { StudentNavigationFooter } from "@/components/guru/dashboard/submissions/preview/student-navigation-footer";
import { GradeResultAlert } from "@/components/guru/dashboard/submissions/preview/grade-result-alert";
import {
  fetchSubmissionDetail,
  fetchAllSubmissionsForAssignment,
  gradeSubmission,
  saveDraftGrade,
  type SubmissionDetail,
  type SubmissionWithStudent,
} from "@/lib/api/submissions";
import { sendGradeNotification } from "@/lib/api/whatsapp";

export default function SubmissionPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params.submissionId as string;

  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [allSubmissions, setAllSubmissions] = useState<SubmissionWithStudent[]>(
    []
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error" | null>(null);

  const loadSubmission = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const detail = await fetchSubmissionDetail(id);
      setSubmission(detail);

      // Load all submissions for this assignment (for navigation)
      if (detail.assignment_id) {
        const all = await fetchAllSubmissionsForAssignment(
          detail.assignment_id
        );
        setAllSubmissions(all);
        const idx = all.findIndex((s) => s.id === id);
        if (idx >= 0) setCurrentIndex(idx);
      }
    } catch (err) {
      console.error("Failed to load submission:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Auth guard
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/guru/login");
        return;
      }
      loadSubmission(submissionId);
    });
  }, [submissionId, router, loadSubmission]);

  const handleSubmitGrade = async (
    score: number,
    feedback: string,
    sendWA: boolean
  ) => {
    if (!submission) return;
    setIsSubmitting(true);
    try {
      // 1. Grade the submission
      await gradeSubmission(submission.id, score, feedback);

      // 2. If WA checkbox is checked, send notification
      if (sendWA) {
        const studentPhone =
          submission.students?.whatsapp_number || null;
        const studentName =
          submission.students?.full_name || "Siswa";
        const assignmentTitle =
          submission.assignments?.title || "Tugas";

        if (studentPhone) {
          const waSuccess = await sendGradeNotification(
            studentPhone,
            studentName,
            assignmentTitle,
            score,
            feedback
          );
          setAlertType(waSuccess ? "success" : "error");
        } else {
          // No phone number — still show success (grade was saved)
          setAlertType("success");
        }
      }

      // Reload to reflect graded status
      await loadSubmission(submission.id);
    } catch (err) {
      console.error("Failed to grade:", err);
      if (sendWA) {
        setAlertType("error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async (score: number, feedback: string) => {
    if (!submission) return;
    setIsSubmitting(true);
    try {
      await saveDraftGrade(submission.id, score, feedback);
      await loadSubmission(submission.id);
    } catch (err) {
      console.error("Failed to save draft:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAlertClose = () => {
    setAlertType(null);
    router.push("/guru/dashboard");
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevSubmission = allSubmissions[currentIndex - 1];
      router.push(`/guru/submissions/${prevSubmission.id}/preview`);
    }
  };

  const handleNext = () => {
    if (currentIndex < allSubmissions.length - 1) {
      const nextSubmission = allSubmissions[currentIndex + 1];
      router.push(`/guru/submissions/${nextSubmission.id}/preview`);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-base text-[#94A3B8]">Submission not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col -m-4 lg:-m-8">
      {/* Main Content: file viewer + grading panel side by side */}
      <div className="flex flex-1 gap-6 overflow-y-auto px-8 py-6">
        {/* Left: File Viewer */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <FileViewer
            files={submission.submission_files || []}
            studentName={submission.students?.full_name || "Student"}
            courseName={submission.assignments?.title || "Assignment"}
            assignmentTitle={submission.assignments?.title || "Assignment"}
          />
        </div>

        {/* Right: Grading Panel */}
        <GradingPanel
          studentName={submission.students?.full_name || "Student"}
          studentCode={submission.students?.student_code || null}
          submissionStatus={submission.status}
          submittedAt={submission.submitted_at}
          deadline={null}
          initialScore={submission.score}
          initialFeedback={submission.feedback}
          onSubmitGrade={handleSubmitGrade}
          onSaveDraft={handleSaveDraft}
          isSubmitting={isSubmitting}
        />
      </div>

      {/* Footer: Student Navigation */}
      {allSubmissions.length > 0 && (
        <StudentNavigationFooter
          currentIndex={currentIndex}
          totalStudents={allSubmissions.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      )}

      {/* WA Grade Result Alert */}
      {alertType && (
        <GradeResultAlert variant={alertType} onClose={handleAlertClose} />
      )}
    </div>
  );
}
