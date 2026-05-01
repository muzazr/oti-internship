import crypto from "crypto"
import * as submissionsService from "./submissions.service.js"
import * as uploadLinksService from "../upload-links/uploadLinks.service.js"
import { asyncHandler } from "../../shared/utils/asyncHandler.js"
import { successResponse } from "../../shared/utils/response.js"
import { AppError } from "../../shared/utils/AppError.js"

// POST /api/submissions/:token
export const submitAssignment = asyncHandler(async (req, res) => {
    const { token } = req.params

    // validate token
    const link = await uploadLinksService.findByToken(token)

    if (!link) {
        throw new AppError("Invalid upload link", 404)
    }

    if (link.revoked_at) {
        throw new AppError("This upload link has been revoked", 410)
    }

    if (new Date(link.expires_at) < new Date()) {
        throw new AppError("This upload link has expired", 410)
    }

    const assignment = link.assignments
    if (!assignment || assignment.status === "closed" || assignment.status === "archived") {
        throw new AppError("This assignment is no longer accepting submissions", 410)
    }

    // determine submission status
    const now = new Date()
    const isLate = assignment.deadline && now > new Date(assignment.deadline)

    if (isLate && !assignment.allow_late_submission) {
        throw new AppError("The deadline has passed and late submissions are not allowed", 400)
    }

    // validate files
    const files = req.files || []
    const linksRaw = req.body.links ? JSON.parse(req.body.links) : []
    const note = req.body.note || null

    if (!assignment.accepts_file && files.length > 0) {
        throw new AppError("This assignment does not accept file submissions", 400)
    }

    if (!assignment.accepts_link && linksRaw.length > 0) {
        throw new AppError("This assignment does not accept link submissions", 400)
    }

    if (files.length === 0 && linksRaw.length === 0) {
        throw new AppError("At least one file or link must be submitted", 400)
    }

    if (files.length > assignment.max_files) {
        throw new AppError(`Maximum ${assignment.max_files} files allowed`, 400)
    }

    for (const file of files) {
        if (file.size > assignment.max_file_size_mb * 1024 * 1024) {
            throw new AppError(`File "${file.originalname}" exceeds the ${assignment.max_file_size_mb}MB limit`, 400)
        }
    }

    // create/update submission
    const submissionData = {
        assignment_id: link.assignment_id,
        student_id: link.student_id,
        upload_link_id: link.id,
        status: isLate ? "late" : "submitted",
        note,
        submitted_at: now.toISOString(),
    }

    const submission = await submissionsService.createSubmission(submissionData)

    // clean up old files/links if re-submitting
    await submissionsService.deleteExistingFiles(submission.id)

    // upload files to Supabase Storage
    for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const uniqueName = `${crypto.randomUUID()}_${file.originalname}`
        const storagePath = `assignments/${link.assignment_id}/students/${link.student_id}/submissions/${submission.id}/${uniqueName}`

        await submissionsService.uploadFileToStorage(file.buffer, storagePath, file.mimetype)

        await submissionsService.insertFileMetadata({
            submission_id: submission.id,
            bucket: "submissions",
            file_path: storagePath,
            original_file_name: file.originalname,
            mime_type: file.mimetype,
            file_size_bytes: file.size,
            file_order: i + 1,
        })
    }

    // insert submitted links
    if (linksRaw.length > 0) {
        const linkRows = linksRaw.map((l) => ({
            submission_id: submission.id,
            url: l.url,
            label: l.label || null,
        }))

        await submissionsService.insertSubmittedLinks(linkRows)
    }

    // mark upload link as used
    await uploadLinksService.markUsed(link.id)

    return successResponse(res, "Submission uploaded successfully", { id: submission.id }, 201)
})

// GET /api/submissions/:id
export const getSubmission = asyncHandler(async (req, res) => {
    const submission = await submissionsService.findById(req.params.id)

    if (!submission) {
        throw new AppError("Submission not found", 404)
    }

    // verify teacher owns the assignment
    if (submission.assignments.teacher_id !== req.user.id) {
        throw new AppError("Submission not found or you do not have permission", 404)
    }

    // generate signed URLs for files
    if (submission.submission_files && submission.submission_files.length > 0) {
        for (const file of submission.submission_files) {
            try {
                file.signed_url = await submissionsService.getSignedUrl(file.bucket, file.file_path)
            } catch {
                file.signed_url = null
            }
        }
    }

    return successResponse(res, "Submission retrieved successfully", submission)
})

// PATCH /api/submissions/:id/grade (protected — teacher grades)
export const gradeSubmission = asyncHandler(async (req, res) => {
    const { score, feedback } = req.body

    // verify submission exists and teacher owns assignment
    const submission = await submissionsService.findById(req.params.id)

    if (!submission) {
        throw new AppError("Submission not found", 404)
    }

    if (submission.assignments.teacher_id !== req.user.id) {
        throw new AppError("Submission not found or you do not have permission", 404)
    }

    const data = await submissionsService.grade(req.params.id, req.user.id, score, feedback)

    return successResponse(res, "Submission graded successfully", data)
})