import axios from "axios"
import { env } from "../../config/env.js"
import { supabaseAdmin } from "../../config/supabase.js"
import * as studentsService from "../students/students.service.js"
import * as uploadLinksService from "../upload-links/uploadLinks.service.js"

const REGISTRATION_ACTION = "WAITING_STUDENT_CODE"
const SESSION_TTL_MS = 60 * 60 * 1000
const registrationSessions = new Map()

const MENU_MESSAGE = `Halo 👋
Selamat datang di Bot Pengumpulan Tugas.

Silakan pilih:
1. Kirim Tugas
2. Daftar Tugas
3. Daftarkan Diri

Balas dengan angka 1, 2, atau 3.`

const UNKNOWN_COMMAND_MESSAGE = `Perintah belum dikenali.

Silakan pilih:
1. Kirim Tugas
2. Daftar Tugas
3. Daftarkan Diri

Balas dengan angka 1, 2, atau 3.`

export async function sendWhatsAppTextMessage(to, body) {
    if (!env.WHATSAPP_ACCESS_TOKEN) {
        throw new Error("WHATSAPP_ACCESS_TOKEN is missing")
    }

    if (!env.WHATSAPP_PHONE_NUMBER_ID) {
        throw new Error("WHATSAPP_PHONE_NUMBER_ID is missing")
    }

    const url = `https://graph.facebook.com/${env.META_GRAPH_API_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`

    const payload = {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: {
            preview_url: false,
            body,
        },
    }

    const response = await axios.post(url, payload, {
        headers: {
            Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
        },
    })

    return response.data
}

export async function handleIncomingTextMessage(from, rawText) {
    const text = normalizeText(rawText)
    const session = registrationSessions.get(from)

    if (session) {
        if (new Date(session.expires_at) < new Date()) {
            registrationSessions.delete(from)
            return `Sesi pendaftaran sudah berakhir.

Balas 3 untuk mulai daftar diri lagi.`
        }

        if (session.current_action === REGISTRATION_ACTION) {
            return handleStudentCodeInput(from, rawText?.trim())
        }
    }

    if (isMenuCommand(text)) {
        return MENU_MESSAGE
    }

    if (isSendAssignmentCommand(text)) {
        return handleSendAssignment(from)
    }

    if (isListAssignmentCommand(text)) {
        return handleListAssignments(from)
    }

    if (isRegistrationCommand(text)) {
        return handleRegistrationStart(from)
    }

    return UNKNOWN_COMMAND_MESSAGE
}

export function getNonTextMessageReply() {
    return `Untuk saat ini, bot hanya menerima pesan teks.

Ketik menu untuk melihat pilihan.`
}

async function handleRegistrationStart(from) {
    const existing = await studentsService.findByWhatsappNumber(from)

    if (existing) {
        return `Nomor WhatsApp kamu sudah terdaftar ✅

Nama: ${existing.full_name}
Kelas: ${formatClassName(existing)}

Sekarang kamu bisa memilih:
1. Kirim Tugas
2. Daftar Tugas`
    }

    registrationSessions.set(from, {
        current_action: REGISTRATION_ACTION,
        whatsapp_number: from,
        expires_at: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
    })

    return `Silakan kirim NIS/NISN kamu.

Contoh:
1234567890

Pastikan data siswa sudah didaftarkan oleh guru di sistem.`
}

async function handleStudentCodeInput(from, studentCode) {
    const student = await studentsService.findByStudentCode(studentCode)
    registrationSessions.delete(from)

    if (!student) {
        return `NIS/NISN tidak ditemukan.

Pastikan NIS/NISN yang kamu kirim sudah benar.
Jika masih gagal, hubungi guru untuk memastikan datamu sudah dimasukkan ke sistem.

Balas 3 untuk mencoba daftar lagi.`
    }

    if (student.whatsapp_number && student.whatsapp_number !== from) {
        return `NIS/NISN ini sudah terhubung dengan nomor WhatsApp lain.

Jika ini salah, hubungi guru untuk memperbaiki data.`
    }

    const registeredStudent = student.whatsapp_number === from
        ? student
        : {
            ...student,
            ...(await studentsService.update(student.id, { whatsapp_number: from })),
            classes: student.classes,
        }

    return `Pendaftaran berhasil ✅

Nama: ${registeredStudent.full_name}
Kelas: ${formatClassName(registeredStudent)}

Sekarang kamu bisa menggunakan fitur:
1. Kirim Tugas
2. Daftar Tugas`
}

async function handleSendAssignment(from) {
    const student = await studentsService.findByWhatsappNumber(from)

    if (!student) {
        return `Nomor WhatsApp kamu belum terdaftar.

Silakan daftarkan diri terlebih dahulu.
Balas 3 untuk Daftarkan Diri.`
    }

    const assignments = await findActiveAssignmentsForStudent(student)

    if (assignments.length === 0) {
        return `Belum ada tugas aktif untuk kelas ${formatClassName(student)}.

Ketik menu untuk melihat pilihan.`
    }

    const assignment = assignments[0]
    const link = await uploadLinksService.generateLink(assignment.id, student.id, "whatsapp_bot")
    const uploadUrl = `${env.FRONTEND_URL}/upload/${link.token}`

    return `Halo ${student.full_name}.

Silakan upload tugas melalui link berikut:

${uploadUrl}

Link ini berlaku selama 1 jam.
Setelah upload berhasil, status tugasmu akan tercatat di dashboard guru.`
}

async function handleListAssignments(from) {
    const student = await studentsService.findByWhatsappNumber(from)

    if (!student) {
        return `Nomor WhatsApp kamu belum terdaftar.

Untuk melihat daftar tugas, kamu harus daftar diri terlebih dahulu.
Balas 3 untuk Daftarkan Diri.`
    }

    const assignments = await findActiveAssignmentsForStudent(student)

    if (assignments.length === 0) {
        return `Daftar tugas untuk ${student.full_name}:

Belum ada tugas aktif untuk kelas ${formatClassName(student)}.

Ketik menu untuk melihat pilihan.`
    }

    const statuses = await findSubmissionStatuses(student.id, assignments.map((assignment) => assignment.id))
    const assignmentLines = assignments
        .map((assignment, index) => {
            const subjectName = assignment.subjects?.name || "-"
            const status = formatSubmissionStatus(statuses.get(assignment.id))

            return `${index + 1}. ${assignment.title}
   Mapel: ${subjectName}
   Status: ${status}`
        })
        .join("\n\n")

    return `Daftar tugas untuk ${student.full_name}:

${assignmentLines}

Balas 1 untuk kirim tugas.`
}

async function findActiveAssignmentsForStudent(student) {
    if (!student?.class_id) return []

    const { data, error } = await supabaseAdmin
        .from("assignments")
        .select(`
            id, title, status, deadline, created_at,
            subjects(name),
            assignment_classes!inner(class_id)
        `)
        .eq("assignment_classes.class_id", student.class_id)
        .eq("status", "published")
        .order("created_at", { ascending: false })

    if (error) throw error

    return (data || []).filter((assignment) => assignment.status !== "closed" && assignment.status !== "archived")
}

async function findSubmissionStatuses(studentId, assignmentIds) {
    const statuses = new Map()
    if (assignmentIds.length === 0) return statuses

    const { data, error } = await supabaseAdmin
        .from("submissions")
        .select("assignment_id, status")
        .eq("student_id", studentId)
        .in("assignment_id", assignmentIds)

    if (error) throw error

    for (const submission of data || []) {
        statuses.set(submission.assignment_id, submission.status)
    }

    return statuses
}

function isMenuCommand(text) {
    return ["halo", "hai", "hi", "menu", "mulai", "start"].includes(text)
}

function isSendAssignmentCommand(text) {
    return ["1", "kirim tugas", "upload tugas"].includes(text)
}

function isListAssignmentCommand(text) {
    return ["2", "daftar tugas", "lihat tugas"].includes(text)
}

function isRegistrationCommand(text) {
    return ["3", "daftarkan diri", "daftar diri", "registrasi"].includes(text)
}

function normalizeText(text) {
    return (text || "").trim().toLowerCase()
}

function formatClassName(student) {
    return student.classes?.name || "-"
}

function formatSubmissionStatus(status) {
    if (!status) return "Belum dikumpulkan"
    if (status === "submitted") return "Sudah dikumpulkan"
    if (status === "late") return "Terlambat"
    if (status === "graded") return "Sudah dinilai"
    return status
}

// ============================================================
// Assignment Notification - Send WA to students when teacher creates assignment
// ============================================================

/**
 * Send assignment notification to all students in specified classes.
 * Generates unique upload link per student.
 *
 * @param {string} assignmentId - The assignment UUID
 * @param {string[]} classIds - Array of class UUIDs to notify
 * @param {string} teacherId - The teacher's profile UUID
 * @returns {Promise<{sent: number, failed: number, total: number}>}
 */
export async function notifyStudentsNewAssignment(assignmentId, classIds, teacherId) {
    // 1. Fetch assignment details
    const { data: assignment, error: assignmentError } = await supabaseAdmin
        .from("assignments")
        .select("id, title, description, deadline, subjects(name)")
        .eq("id", assignmentId)
        .single()

    if (assignmentError || !assignment) {
        throw new Error("Assignment not found")
    }

    // 2. Fetch all students in target classes who have whatsapp_number
    const { data: students, error: studentsError } = await supabaseAdmin
        .from("students")
        .select("id, full_name, whatsapp_number, class_id, classes(name)")
        .in("class_id", classIds)
        .not("whatsapp_number", "is", null)

    if (studentsError) throw studentsError

    if (!students || students.length === 0) {
        return { sent: 0, failed: 0, total: 0 }
    }

    // 3. Generate upload links for all students
    const studentIds = students.map((s) => s.id)
    const links = await uploadLinksService.generateLinks(assignmentId, studentIds, "whatsapp_bot")

    // Create a map: studentId -> token
    const linkMap = new Map()
    for (const link of links) {
        linkMap.set(link.student_id, link.token)
    }

    // 4. Send WA messages
    let sent = 0
    let failed = 0

    console.log(`[WA Notif] Sending to ${students.length} students...`)

    for (const student of students) {
        try {
            const token = linkMap.get(student.id)
            const uploadUrl = `${env.FRONTEND_URL}/upload/${token}`
            const message = formatAssignmentNotification(assignment, student, uploadUrl)

            console.log(`[WA Notif] Sending to ${student.full_name} (${student.whatsapp_number})...`)
            const result = await sendWhatsAppTextMessage(student.whatsapp_number, message)
            console.log(`[WA Notif] ✅ Sent to ${student.whatsapp_number}:`, result.messages?.[0]?.id)
            sent++
        } catch (error) {
            console.error(`[WA Notif] ❌ Failed to send WA to ${student.whatsapp_number}:`, error.message)
            console.error(`[WA Notif] Error details:`, error.response?.data || error)
            failed++
        }
    }

    // 5. Send summary to teacher if whatsapp_notifications enabled
    await sendTeacherSummary(teacherId, assignment.title, sent, failed, students.length)

    return { sent, failed, total: students.length }
}

/**
 * Format the assignment notification message with emojis.
 */
function formatAssignmentNotification(assignment, student, uploadUrl) {
    const subjectName = assignment.subjects?.name || "-"
    const description = assignment.description
        ? assignment.description.substring(0, 200) + (assignment.description.length > 200 ? "..." : "")
        : "-"
    const deadlineText = assignment.deadline
        ? new Date(assignment.deadline).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
        : "Belum ditentukan"

    return `📚 *Tugas Baru!*

📝 *Judul:* ${assignment.title}
📖 *Mapel:* ${subjectName}
📋 *Deskripsi:* ${description}
⏰ *Deadline:* ${deadlineText}

🔗 *Upload tugas:* ${uploadUrl}

_Link berlaku 30 menit. Jika link tidak dapat diakses, ketik 1 untuk mendapatkan link baru._`
}

/**
 * Send summary notification to teacher's WhatsApp.
 */
async function sendTeacherSummary(teacherId, assignmentTitle, sent, failed, total) {
    try {
        // Check if teacher has whatsapp_notifications enabled
        const { data: profile, error } = await supabaseAdmin
            .from("profiles")
            .select("phone_number, whatsapp_notifications")
            .eq("id", teacherId)
            .single()

        if (error || !profile) return
        if (!profile.whatsapp_notifications) return
        if (!profile.phone_number) return

        const failedLine = failed > 0 ? `\n❌ Gagal: ${failed} siswa` : ""

        const message = `✅ *Notifikasi Tugas Terkirim*

📝 Tugas: "${assignmentTitle}"
📤 Terkirim: ${sent}/${total} siswa${failedLine}

_Siswa yang belum punya nomor WA tidak akan menerima notifikasi._`

        await sendWhatsAppTextMessage(profile.phone_number, message)
    } catch (error) {
        console.error("Failed to send teacher summary:", error.message)
        // Don't throw - this is non-critical
    }
}
