/**
 * WhatsApp Bot Integration — Placeholder
 *
 * API key is pre-configured in .env as NEXT_PUBLIC_WA_BOT_API_KEY
 * Teacher doesn't need to input anything — bot works automatically.
 *
 * TODO: Replace placeholder with actual Meta WhatsApp Business API call
 * when you get the API details from your backend team.
 */

const WA_API_KEY = process.env.NEXT_PUBLIC_WA_BOT_API_KEY;

/**
 * Send a WhatsApp message to a single phone number.
 */
export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string
): Promise<boolean> {
  if (!WA_API_KEY) {
    console.log("[WA Bot] API key not configured, skipping notification");
    return true; // Still count as success
  }

  try {
    // TODO: Replace with actual Meta WhatsApp Business API call
    // POST https://graph.facebook.com/v18.0/{phone_number_id}/messages
    // Headers: { Authorization: `Bearer ${WA_API_KEY}`, Content-Type: "application/json" }
    // Body: {
    //   messaging_product: "whatsapp",
    //   to: phoneNumber,
    //   type: "text",
    //   text: { body: message }
    // }

    console.log(`[WA Bot] Would send to ${phoneNumber}: ${message}`);
    return true;
  } catch (error) {
    console.error("[WA Bot] Failed to send message:", error);
    return false;
  }
}

/**
 * Send invite notification when a student is added to a class.
 */
export async function sendStudentInvite(
  phoneNumber: string,
  studentName: string,
  className: string,
  teacherName: string
): Promise<boolean> {
  const message = `Halo ${studentName}, kamu telah ditambahkan ke kelas ${className} oleh ${teacherName}. Silakan cek tugas aktif di MitBridge.`;
  return sendWhatsAppMessage(phoneNumber, message);
}

/**
 * Send assignment notification to all students in a class.
 */
export async function sendAssignmentNotification(
  students: Array<{ whatsapp_number: string | null; full_name: string }>,
  assignmentTitle: string,
  className: string,
  deadline: string | null
): Promise<void> {
  const deadlineText = deadline
    ? new Date(deadline).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "belum ditentukan";

  for (const student of students) {
    if (!student.whatsapp_number) continue;
    const message = `Tugas baru: "${assignmentTitle}" telah dibuat di kelas ${className}. Deadline: ${deadlineText}. Silakan kerjakan segera.`;
    await sendWhatsAppMessage(student.whatsapp_number, message);
  }
}
