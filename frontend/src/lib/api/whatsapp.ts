/**
 * WhatsApp Bot Integration
 *
 * Sends notifications via backend endpoint which communicates
 * with Meta WhatsApp Business API.
 */

import { supabase } from "@/lib/supabase";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/**
 * Get auth token for API calls
 */
async function getAuthToken(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");
  return session.access_token;
}

/**
 * Send assignment notification to all students in specified classes via WhatsApp Bot.
 * Calls backend endpoint which handles Meta Graph API communication.
 *
 * @param assignmentId - The assignment UUID
 * @param classIds - Array of class UUIDs whose students should be notified
 * @returns Object with sent, failed, total counts
 */
export async function sendAssignmentNotification(
  assignmentId: string,
  classIds: string[]
): Promise<{ sent: number; failed: number; total: number }> {
  const token = await getAuthToken();

  const response = await fetch(
    `${API_BASE}/whatsapp/notify-assignment/${assignmentId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ class_ids: classIds }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error("[WA Notification] Failed:", error);
    throw new Error(
      error.message || "Failed to send WhatsApp notifications"
    );
  }

  const result = await response.json();
  return result.data; // { sent, failed, total }
}

/**
 * Send invite notification when a student is added to a class.
 * TODO: Move to backend endpoint in future iteration
 */
export async function sendStudentInvite(
  phoneNumber: string,
  studentName: string,
  _className: string,
  _teacherName: string
): Promise<boolean> {
  console.log(
    `[WA Bot] Would send invite to ${phoneNumber} for ${studentName}`
  );
  return true;
}

/**
 * Send grade notification to a student via WhatsApp Bot.
 * TODO: Move to backend endpoint in future iteration
 */
export async function sendGradeNotification(
  phoneNumber: string,
  studentName: string,
  _assignmentTitle: string,
  _score: number,
  _feedback: string | null
): Promise<boolean> {
  console.log(
    `[WA Bot] Would send grade notification to ${phoneNumber} for ${studentName}`
  );
  return true;
}
