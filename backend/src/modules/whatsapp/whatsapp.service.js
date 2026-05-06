import axios from "axios"
import { env } from "../../config/env.js"
import { supabaseAdmin } from "../../config/supabase.js"
import * as studentsService from "../students/students.service.js"
import * as uploadLinksService from "../upload-links/uploadLinks.service.js"

// ============================================================
// Constants
// ============================================================

const SESSION_TTL_MS = 10 * 60 * 1000 // 10 menit
const sessions = new Map()

const NOT_REGISTERED_MESSAGE = `Halo! 👋
Selamat datang di Mitbridge Education Bot 🎓

Mohon maaf, kamu tidak bisa mengakses menu tugas karena kamu belum terdaftar. Silakan hubungi langsung guru kamu untuk didaftarkan ke sistem.`

// ============================================================
// Session Cleanup
// ============================================================

setInterval(() => {
    const now = Date.now()
    for (const [phone, session] of sessions.entries()) {
        if (now - session.created_at > SESSION_TTL_MS) {
            sessions.delete(phone)
        }
    }
}, 5 * 60 * 1000)

// ============================================================
// WhatsApp API - Send Message
// ============================================================

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
        text: { preview_url: false, body },
    }

    const response = await axios.post(url, payload, {
        headers: {
            Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
        },
    })

    return response.data
}

// ============================================================
// Main Message Handler
// ============================================================

export async function handleIncomingTextMessage(from, rawText) {
    const text = (rawText || "").trim().toLowerCase()

    // Step 1: Cek apakah nomor WA terdaftar di database
    const student = await studentsService.findByWhatsappNumber(from)

    // Kalau BELUM TERDAFTAR → selalu kirim pesan "hubungi guru"
    if (!student) {
        return NOT_REGISTERED_MESSAGE
    }

    // Step 2: Cek active session
    const session = sessions.get(from)
    if (session && (Date.now() - session.created_at < SESSION_TTL_MS)) {
        if (session.state === "SELECTING_ASSIGNMENT") {
            return await handleSelectAssignment(from, rawText.trim(), student)
        }
        if (session.state === "CHECKING_STATUS") {
            return await handleCheckStatusInput(from, rawText.trim(), session)
        }
    }

    // Clear expired session
    if (session) {
        sessions.delete(from)
    }

    // Step 3: Command menu - tampilkan greeting + menu
    if (["menu", "mulai", "start", "halo", "hai", "hi", "hello"].includes(text)) {
        sessions.delete(from)
        return getGreetingMessage(student)
    }

    // Step 4: Menu options
    if (text === "1") {
        return await handleOption1(from, student)
    }
    if (text === "2") {
        return await handleOption2(from, student)
    }
    if (text === "3") {
        return handleOption3(student)
    }

    // Default: tampilkan greeting + menu
    return getGreetingMessage(student)
}

export function getNonTextMessageReply() {
    return `Untuk saat ini, bot hanya menerima pesan teks.

Ketik *menu* untuk melihat pilihan.`
}

// ============================================================
// Greeting Message (Personalized)
// ============================================================

function getGreetingMessage(student) {
    return `Halo ${student.full_name}! 👋
Selamat datang di Mitbridge Education Bot 🎓

Gimana kabarnya? Masih semangat kan?
Karena kamu sudah semangat, yuk jangan lupa untuk mengerjakan tugasmu yaa. Jangan sampai ketinggalan!

Menu:
1️⃣ Kumpulkan Tugas
2️⃣ Status Tugas
3️⃣ Profil Saya

Balas dengan angka 1, 2, atau 3.`
}

// ============================================================
// OPSI 1: Kumpulkan Tugas
// ============================================================

async function handleOption1(from, student) {
    // Ambil tugas aktif
    const assignments = await findActiveAssignmentsForStudent(student)

    if (assignments.length === 0) {
        return `📚 Tidak ada tugas aktif saat ini.

Ketik *menu* untuk kembali.`
    }

    // Ambil submission statuses
    const statuses = await findSubmissionStatuses(student.id, assignments.map(a => a.id))

    // Filter hanya tugas yang BELUM dikumpulkan
    const pendingAssignments = assignments.filter(a => {
        const submission = statuses.get(a.id)
        return !submission || submission.status === "late"
    })

    if (pendingAssignments.length === 0) {
        return `✅ Semua tugas sudah dikumpulkan! Mantap! 🎉

Ketik *2* untuk cek status tugas.
Ketik *menu* untuk kembali.`
    }

    // Tampilkan list tugas belum dikumpulkan + deadline
    let message = `📚 *Tugas yang Belum Dikumpulkan:*\n\n`

    pendingAssignments.forEach((a, i) => {
        const deadline = a.deadline
            ? new Date(a.deadline).toLocaleDateString("id-ID", {
                day: "numeric", month: "long", year: "numeric",
                hour: "2-digit", minute: "2-digit",
            })
            : "Tidak ada deadline"

        const isLate = a.deadline && new Date(a.deadline) < new Date()

        message += `${i + 1}. ${a.title}\n`
        message += `   📖 Mapel: ${a.subjects?.name || "-"}\n`
        message += `   ⏰ Deadline: ${deadline}${isLate ? " ⚠️ TERLAMBAT" : ""}\n\n`
    })

    message += `Balas dengan *nomor tugas* (1-${pendingAssignments.length}) untuk mendapatkan link pengumpulan.\n\nKetik *menu* untuk kembali.`

    // Simpan session
    sessions.set(from, {
        state: "SELECTING_ASSIGNMENT",
        assignments: pendingAssignments,
        studentId: student.id,
        created_at: Date.now(),
    })

    return message
}

async function handleSelectAssignment(from, input, student) {
    const session = sessions.get(from)

    // Kalau user ketik menu
    if (input.toLowerCase() === "menu") {
        sessions.delete(from)
        return getGreetingMessage(student)
    }

    const selectedIndex = parseInt(input) - 1

    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= session.assignments.length) {
        return `❌ Nomor tidak valid. Balas dengan angka 1-${session.assignments.length}.

Ketik *menu* untuk kembali.`
    }

    const assignment = session.assignments[selectedIndex]

    try {
        // Generate link baru (fresh setiap kali)
        const link = await uploadLinksService.generateLink(
            assignment.id,
            session.studentId,
            "whatsapp_bot"
        )

        const uploadUrl = `${env.FRONTEND_URL}/upload/${link.token}`
        const deadline = assignment.deadline
            ? new Date(assignment.deadline).toLocaleDateString("id-ID", {
                day: "numeric", month: "long", year: "numeric",
                hour: "2-digit", minute: "2-digit",
            })
            : "Tidak ada deadline"

        // Clear session
        sessions.delete(from)

        return `📤 *Upload Tugas:* ${assignment.title}

📖 Mapel: ${assignment.subjects?.name || "-"}
⏰ Deadline: ${deadline}

🔗 *Link pengumpulan:*
${uploadUrl}

⏰ Link berlaku 30 menit.
📎 Klik link di atas untuk upload file tugas kamu.

Ketik *1* kapan saja untuk mendapatkan link baru.
Ketik *menu* untuk kembali.`
    } catch (error) {
        console.error("[WA Bot] Failed to generate link:", error)
        sessions.delete(from)
        return `❌ Gagal membuat link. Coba lagi.

Ketik *1* untuk coba lagi.
Ketik *menu* untuk kembali.`
    }
}

// ============================================================
// OPSI 2: Status Tugas
// ============================================================

async function handleOption2(from, student) {
    // Ambil semua tugas
    const assignments = await findActiveAssignmentsForStudent(student)

    if (assignments.length === 0) {
        return `📚 Tidak ada tugas saat ini.

Ketik *menu* untuk kembali.`
    }

    // Ambil submission statuses
    const statuses = await findSubmissionStatuses(student.id, assignments.map(a => a.id))

    // Generate upload links untuk tugas yang belum dikumpulkan
    const pendingAssignments = assignments.filter(a => {
        const submission = statuses.get(a.id)
        return !submission || submission.status === "late"
    })

    let linkMap = new Map()
    if (pendingAssignments.length > 0) {
        try {
            for (const a of pendingAssignments) {
                const link = await uploadLinksService.generateLink(a.id, student.id, "whatsapp_bot")
                linkMap.set(a.id, `${env.FRONTEND_URL}/upload/${link.token}`)
            }
        } catch (e) {
            console.error("[WA Bot] Failed to generate links for status:", e)
        }
    }

    // Format message
    let message = `📊 *Status Tugas - ${student.full_name}*\n`
    message += `🏫 Kelas: ${student.classes?.name || "-"}\n\n`

    assignments.forEach((a, i) => {
        const submission = statuses.get(a.id)
        let statusText = "⏳ Belum dikumpulkan"
        let extraInfo = ""

        if (submission) {
            if (submission.status === "submitted") {
                statusText = "✅ Sudah dikumpulkan"
            } else if (submission.status === "graded") {
                statusText = "✅ Sudah dinilai"
                if (submission.score) extraInfo += `\n   💯 Nilai: ${submission.score}`
            } else if (submission.status === "late") {
                statusText = "⚠️ Terlambat"
            }
        }

        // Link pengumpulan untuk yang belum dikumpulkan
        if (!submission || submission.status === "late") {
            const uploadUrl = linkMap.get(a.id)
            if (uploadUrl) {
                extraInfo += `\n   🔗 Link pengumpulan: ${uploadUrl}`
            }
        }

        message += `${i + 1}. ${a.title}\n`
        message += `   📖 ${a.subjects?.name || "-"}\n`
        message += `   ${statusText}${extraInfo}\n\n`
    })

    message += `Balas dengan *nomor tugas* untuk lihat detail.\n\nKetik *1* untuk kumpulkan tugas.\nKetik *menu* untuk kembali.`

    // Simpan session
    sessions.set(from, {
        state: "CHECKING_STATUS",
        assignments,
        statuses,
        studentId: student.id,
        created_at: Date.now(),
    })

    return message
}

async function handleCheckStatusInput(from, input, session) {
    // Kalau user ketik menu
    if (input.toLowerCase() === "menu") {
        sessions.delete(from)
        const student = await studentsService.findByWhatsappNumber(from)
        return getGreetingMessage(student)
    }

    const selectedIndex = parseInt(input) - 1

    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= session.assignments.length) {
        // Coba cari by nama tugas
        const matchedAssignment = session.assignments.find(a =>
            a.title.toLowerCase().includes(input.toLowerCase())
        )

        if (matchedAssignment) {
            sessions.delete(from)
            return showAssignmentDetail(matchedAssignment, session.statuses)
        }

        return `❌ Tugas tidak ditemukan. Balas dengan nomor (1-${session.assignments.length}) atau nama tugas.

Ketik *menu* untuk kembali.`
    }

    const assignment = session.assignments[selectedIndex]
    sessions.delete(from)
    return showAssignmentDetail(assignment, session.statuses)
}

function showAssignmentDetail(assignment, statuses) {
    const submission = statuses.get(assignment.id)

    let statusText = "⏳ Belum dikumpulkan"
    let extraInfo = ""

    if (submission) {
        if (submission.status === "submitted") {
            statusText = "✅ Sudah dikumpulkan"
            if (submission.submitted_at) {
                extraInfo += `\n📅 Dikumpulkan: ${new Date(submission.submitted_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`
            }
        } else if (submission.status === "graded") {
            statusText = "✅ Sudah dinilai"
            if (submission.score) extraInfo += `\n💯 *Nilai: ${submission.score}*`
            if (submission.feedback) extraInfo += `\n💬 Catatan guru: ${submission.feedback}`
        } else if (submission.status === "late") {
            statusText = "⚠️ Terlambat"
        }
    }

    const deadline = assignment.deadline
        ? new Date(assignment.deadline).toLocaleDateString("id-ID", {
            day: "numeric", month: "long", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        })
        : "Tidak ada deadline"

    return `📋 *Detail Tugas:* ${assignment.title}

📖 Mapel: ${assignment.subjects?.name || "-"}
⏰ Deadline: ${deadline}
📊 Status: ${statusText}${extraInfo}

Ketik *1* untuk kumpulkan tugas.
Ketik *2* untuk cek status lagi.
Ketik *menu* untuk kembali.`
}

// ============================================================
// OPSI 3: Profil Saya
// ============================================================

function handleOption3(student) {
    return `👤 *Profil Saya*

📛 Nama: ${student.full_name}
🏫 Kelas: ${student.classes?.name || "-"}
📱 Nomor WA: ${student.whatsapp_number || "-"}

Ketik *1* untuk kumpulkan tugas.
Ketik *2* untuk cek status tugas.
Ketik *menu* untuk kembali.`
}

// ============================================================
// Helper Functions
// ============================================================

async function findActiveAssignmentsForStudent(student) {
    if (!student?.class_id) return []

    const { data, error } = await supabaseAdmin
        .from("assignments")
        .select(`
            id, title, status, deadline, created_at, subject_id, attachment_url,
            subjects(name),
            assignment_classes!inner(class_id)
        `)
        .eq("assignment_classes.class_id", student.class_id)
        .eq("status", "published")
        .order("created_at", { ascending: false })

    if (error) {
        console.error("[WA Bot] Failed to fetch assignments:", error)
        return []
    }

    const assignments = (data || []).filter(a => a.status !== "closed" && a.status !== "archived")

    // Fallback: if no subject on assignment, get from class
    if (assignments.length > 0 && !assignments[0].subjects?.name) {
        const { data: classData } = await supabaseAdmin
            .from("classes")
            .select("subjects(name)")
            .eq("id", student.class_id)
            .single()

        const classSubjectName = classData?.subjects?.name || null
        if (classSubjectName) {
            assignments.forEach(a => {
                if (!a.subjects?.name) {
                    a.subjects = { name: classSubjectName }
                }
            })
        }
    }

    return assignments
}

async function findSubmissionStatuses(studentId, assignmentIds) {
    const statuses = new Map()
    if (!assignmentIds || assignmentIds.length === 0) return statuses

    const { data, error } = await supabaseAdmin
        .from("submissions")
        .select("assignment_id, status, score, feedback, submitted_at")
        .eq("student_id", studentId)
        .in("assignment_id", assignmentIds)

    if (error) {
        console.error("[WA Bot] Failed to fetch submissions:", error)
        return statuses
    }

    for (const submission of data || []) {
        statuses.set(submission.assignment_id, submission)
    }

    return statuses
}

// ============================================================
// Assignment Notification - Send WA to students when teacher creates assignment
// ============================================================

export async function notifyStudentsNewAssignment(assignmentId, classIds, teacherId) {
    // 1. Fetch assignment details
    const { data: assignment, error: assignmentError } = await supabaseAdmin
        .from("assignments")
        .select("id, title, description, deadline, subject_id, attachment_url, subjects(name)")
        .eq("id", assignmentId)
        .single()

    if (assignmentError || !assignment) {
        throw new Error("Assignment not found")
    }

    // Fallback: if assignment has no subject, get from class
    if (!assignment.subjects?.name && classIds.length > 0) {
        const { data: classData } = await supabaseAdmin
            .from("classes")
            .select("subjects(name)")
            .eq("id", classIds[0])
            .single()

        if (classData?.subjects?.name) {
            assignment.subjects = { name: classData.subjects.name }
        }
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
            failed++
        }
    }

    // 5. Send summary to teacher if whatsapp_notifications enabled
    await sendTeacherSummary(teacherId, assignment.title, sent, failed, students.length)

    return { sent, failed, total: students.length }
}

function formatAssignmentNotification(assignment, student, uploadUrl) {
    const subjectName = assignment.subjects?.name || "-"
    const description = assignment.description
        ? assignment.description.substring(0, 200) + (assignment.description.length > 200 ? "..." : "")
        : "-"
    const deadlineText = assignment.deadline
        ? new Date(assignment.deadline).toLocaleDateString("id-ID", {
            day: "numeric", month: "long", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        })
        : "Belum ditentukan"

    const attachmentLine = assignment.attachment_url
        ? `\n📎 *Lampiran Tugas:* ${assignment.attachment_url}`
        : ""

    return `📚 *Tugas Baru!*

📝 *Judul:* ${assignment.title}
📖 *Mapel:* ${subjectName}
📋 *Deskripsi:* ${description}${attachmentLine}
⏰ *Deadline:* ${deadlineText}

🔗 *Upload tugas:* ${uploadUrl}

_Link berlaku 30 menit. Jika link tidak dapat diakses, ketik 1 untuk mendapatkan link baru._`
}

async function sendTeacherSummary(teacherId, assignmentTitle, sent, failed, total) {
    try {
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
    }
}
