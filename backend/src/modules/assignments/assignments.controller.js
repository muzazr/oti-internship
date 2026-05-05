import * as assignmentsService from "./assignments.service.js"
import { asyncHandler } from "../../shared/utils/asyncHandler.js"
import { successResponse } from "../../shared/utils/response.js"
import { AppError } from "../../shared/utils/AppError.js"

export const listAssignments = asyncHandler(async (req, res) => {
    const data = await assignmentsService.findAllByTeacher(req.user.id)
    return successResponse(res, "Assignments retrieved successfully", data)
})

export const getAssignment = asyncHandler(async (req, res) => {
    const data = await assignmentsService.findById(req.params.id, req.user.id)

    if (!data) {
        throw new AppError("Assignment not found", 404)
    }

    return successResponse(res, "Assignment retrieved successfully", data)
})

export const createAssignment = asyncHandler(async (req, res) => {
    const { class_ids, ...assignmentFields } = req.body

    console.log("REQ USER:", req.user?.id)
    console.log("REQ BODY:", req.body)
    console.log("CLASS IDS:", class_ids)
    console.log("ASSIGNMENT FIELDS:", assignmentFields)

    const allOwned = await assignmentsService.verifyClassesOwnership(class_ids, req.user.id)

    console.log("ALL CLASSES OWNED:", allOwned)

    if (!allOwned) {
        throw new AppError("One or more classes not found or you do not have permission", 400)
    }

    const payload = {
        ...assignmentFields,
        teacher_id: req.user.id,
        status: "draft",
    }

    console.log("CREATE ASSIGNMENT PAYLOAD:", payload)

    const data = await assignmentsService.create(payload, class_ids)

    return successResponse(res, "Assignment created successfully", data, 201)
})

export const updateAssignment = asyncHandler(async (req, res) => {
    const { class_ids, ...updateFields } = req.body

    // if class_ids provided, verify ownership
    if (class_ids) {
        const allOwned = await assignmentsService.verifyClassesOwnership(class_ids, req.user.id)
        if (!allOwned) {
            throw new AppError("One or more classes not found or you do not have permission", 400)
        }
    }

    const data = await assignmentsService.update(req.params.id, req.user.id, updateFields)

    if (!data) {
        throw new AppError("Assignment not found or you do not have permission", 404)
    }

    // update target classes if provided
    if (class_ids) {
        await assignmentsService.setAssignmentClasses(data.id, class_ids)
    }

    // return full data
    const full = await assignmentsService.findById(data.id, req.user.id)
    return successResponse(res, "Assignment updated successfully", full)
})

export const deleteAssignment = asyncHandler(async (req, res) => {
    try {
        await assignmentsService.remove(req.params.id, req.user.id)
        return successResponse(res, "Assignment deleted successfully")
    } catch (error) {
        if (error.code === "23503") {
            throw new AppError(
                "Cannot delete assignment: submissions or upload links still reference this assignment.",
                409
            )
        }
        throw error
    }
})

export const publishAssignment = asyncHandler(async (req, res) => {
    const data = await assignmentsService.publish(req.params.id, req.user.id)

    if (!data) {
        throw new AppError("Assignment not found, already published, or you do not have permission", 404)
    }

    return successResponse(res, "Assignment published successfully", data)
})