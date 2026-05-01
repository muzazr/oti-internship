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
        throw new AppError("This upload link has expired", 410)
    }

    // check assignment status
    const assignment = link.assignments
    if (!assignment || assignment.status === "closed" || assignment.status === "archived") {
        throw new AppError("This assignment is no longer accepting submissions", 410)
    }

    // return safe info for frontend
    return successResponse(res, "Upload link is valid", {
        student_name: link.students.full_name,
        student_code: link.students.student_code,
        assignment_title: assignment.title,
        assignment_description: assignment.description,
        assignment_instruction: assignment.instruction,
        deadline: assignment.deadline,
        accepts_file: assignment.accepts_file,
        accepts_link: assignment.accepts_link,
        max_files: assignment.max_files,
        max_file_size_mb: assignment.max_file_size_mb,
        allow_late_submission: assignment.allow_late_submission,
        already_used: !!link.used_at,
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