import crypto from "crypto"
import { supabaseAdmin } from "../../config/supabase.js"

const TOKEN_EXPIRY_HOURS = 1

export async function generateLinks(assignmentId, studentIds, source) {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)

    const rows = studentIds.map((studentId) => ({
        assignment_id: assignmentId,
        student_id: studentId,
        token: createUploadToken(studentId, assignmentId, now),
        source,
        created_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        used_at: null,
    }))

    const { data, error } = await supabaseAdmin
        .from("upload_links")
        .upsert(rows, { onConflict: "assignment_id,student_id", ignoreDuplicates: false })
        .select()

    if (error) throw error
    return data
}

export async function generateLink(assignmentId, studentId, source) {
    const [link] = await generateLinks(assignmentId, [studentId], source)
    return link
}

export async function findByToken(token) {
    const { data, error } = await supabaseAdmin
        .from("upload_links")
        .select(`
            *,
            assignments(
                id, title, description, instruction, deadline,
                status, allow_late_submission, max_files, max_file_size_mb,
                accepts_file, accepts_link
            ),
            students(id, full_name, student_code)
        `)
        .eq("token", token)
        .single()

    if (error) return null
    return data
}

export async function markAccessed(token) {
    const { error } = await supabaseAdmin
        .from("upload_links")
        .update({ last_accessed_at: new Date().toISOString() })
        .eq("token", token)

    if (error) throw error
}

export async function markUsed(id) {
    const { error } = await supabaseAdmin
        .from("upload_links")
        .update({ used_at: new Date().toISOString() })
        .eq("id", id)

    if (error) throw error
}

export async function verifyAssignmentOwnership(assignmentId, teacherId) {
    const { data, error } = await supabaseAdmin
        .from("assignments")
        .select("id")
        .eq("id", assignmentId)
        .eq("teacher_id", teacherId)
        .single()

    if (error) return null
    return data
}

export async function verifyStudentsInAssignmentClasses(assignmentId, studentIds) {
    // get class_ids for this assignment
    const { data: assignmentClasses, error: acError } = await supabaseAdmin
        .from("assignment_classes")
        .select("class_id")
        .eq("assignment_id", assignmentId)

    if (acError) throw acError

    const classIds = assignmentClasses.map((ac) => ac.class_id)

    if (classIds.length === 0) return false

    // check all students are in those classes
    const { data: students, error: sError } = await supabaseAdmin
        .from("students")
        .select("id")
        .in("id", studentIds)
        .in("class_id", classIds)

    if (sError) throw sError
    return students.length === studentIds.length
}

function createUploadToken(studentId, assignmentId, generatedAt) {
    const salt = crypto.randomBytes(32).toString("hex")
    return crypto
        .createHash("sha256")
        .update(`${studentId}:${assignmentId}:${generatedAt.toISOString()}:${salt}`)
        .digest("hex")
}
