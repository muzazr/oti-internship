import * as uploadLinksService from "./uploadLinks.service.js"
import { asyncHandler } from "../../shared/utils/asyncHandler.js"
import { successResponse } from "../../shared/utils/response.js"
import { AppError } from "../../shared/utils/AppError.js"
import { env } from "../../config/env.js"

// POST /api/upload-links (protected)
export const generateUploadLinks = asyncHandler(async (req, res) => {
    const { assignment_id, student_ids, source } = req.body

    // verify teacher owns the assignment
    const assignment = await uploadLinksService.verifyAssignmentOwnership(assignment_id, req.user.id)
    if (!assignment) {
        throw new AppError("Assignment not found or you do not have permission", 404)
    }

    // verify students belong to assignment's target classes
    const valid = await uploadLinksService.verifyStudentsInAssignmentClasses(assignment_id, student_ids)
    if (!valid) {
        throw new AppError("One or more students are not in the assignment's target classes", 400)
    }

    const links = await uploadLinksService.generateLinks(assignment_id, student_ids, source)

    // attach frontend URLs
    const linksWithUrls = links.map((link) => ({
        ...link,
        upload_url: `${env.FRONTEND_URL}/upload/${link.token}`,
    }))

    return successResponse(res, "Upload links generated successfully", linksWithUrls, 201)
})

// GET /api/upload-links/:token (public)
export const validateToken = asyncHandler(async (req, res) => {
    const { token } = req.params

    const link = await uploadLinksService.findByToken(token)

    if (!link) {
        throw new AppError("Invalid upload link", 404)
    }

    // check revoked
    if (link.revoked_at) {
        throw new AppError("This upload link has been revoked", 410)
    }

    // check expired
    if (new Date(link.expires_at) < new Date()) {
        throw new AppError(
            "Link upload sudah kedaluwarsa. Silakan kembali ke WhatsApp dan pilih Kirim Tugas untuk mendapatkan link baru.",
            410
        )
    }

    if (link.used_at) {
        throw new AppError("This upload link has already been used", 410)
    }

    // check assignment status
    const assignment = link.assignments
    if (!assignment || assignment.status === "closed" || assignment.status === "archived") {
        throw new AppError("This assignment is no longer accepting submissions", 410)
    }

    // Get subject name - fallback to class subject if assignment has none
    let subjectName = assignment.subjects?.name || null
    if (!subjectName && link.students?.class_id) {
        const { data: classData } = await (await import("../../config/supabase.js")).supabaseAdmin
            .from("classes")
            .select("subjects(name)")
            .eq("id", link.students.class_id)
            .single()
        subjectName = classData?.subjects?.name || null
    }

    // return safe info for frontend
    return successResponse(res, "Upload link is valid", {
        student_name: link.students.full_name,
        student_code: link.students.student_code,
        class_name: link.students.classes?.name || null,
        assignment_title: assignment.title,
        assignment_description: assignment.description,
        assignment_instruction: assignment.instruction,
        assignment_attachment_url: assignment.attachment_url || null,
        assignment_subject: subjectName,
        deadline: assignment.deadline,
        accepts_file: assignment.accepts_file,
        accepts_link: assignment.accepts_link,
        max_files: assignment.max_files,
        max_file_size_mb: assignment.max_file_size_mb,
        allow_late_submission: assignment.allow_late_submission,
        already_used: !!link.used_at,
        submission: link.submission || null,
    })
})

// POST /api/upload-links/:token/access (public)
export const recordAccess = asyncHandler(async (req, res) => {
    const { token } = req.params

    const link = await uploadLinksService.findByToken(token)
    if (!link) {
        throw new AppError("Invalid upload link", 404)
    }

    await uploadLinksService.markAccessed(token)

    return successResponse(res, "Access recorded")
})

// GET /api/upload-links/:token/pending (public)
export const getPendingAssignments = asyncHandler(async (req, res) => {
    const { token } = req.params

    const link = await uploadLinksService.findByToken(token)
    if (!link) {
        throw new AppError("Invalid upload link", 404)
    }

    const studentId = link.student_id
    const classId = link.students?.class_id

    if (!classId) {
        return successResponse(res, "No pending assignments", { assignments: [], count: 0 })
    }

    // Get all published assignments for this student's class
    const { data: assignments, error: assignError } = await (await import("../../config/supabase.js")).supabaseAdmin
        .from("assignments")
        .select(`
            id, title, deadline, created_at,
            subjects(name),
            assignment_classes!inner(class_id)
        `)
        .eq("assignment_classes.class_id", classId)
        .eq("status", "published")
        .order("deadline", { ascending: true })

    if (assignError || !assignments) {
        return successResponse(res, "No pending assignments", { assignments: [], count: 0 })
    }

    // Get submissions for this student
    const assignmentIds = assignments.map(a => a.id)
    const { data: submissions } = await (await import("../../config/supabase.js")).supabaseAdmin
        .from("submissions")
        .select("assignment_id, status")
        .eq("student_id", studentId)
        .in("assignment_id", assignmentIds)

    const submittedIds = new Set(
        (submissions || [])
            .filter(s => s.status === "submitted" || s.status === "graded")
            .map(s => s.assignment_id)
    )

    // Filter only pending (not submitted)
    const pending = assignments
        .filter(a => !submittedIds.has(a.id))
        .map(a => ({
            id: a.id,
            title: a.title,
            subject: a.subjects?.name || null,
            deadline: a.deadline,
        }))

    return successResponse(res, "Pending assignments retrieved", {
        assignments: pending,
        count: pending.length,
    })
})
