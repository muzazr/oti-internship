import * as subjectsService from "./subjects.service.js"
import { asyncHandler } from "../../shared/utils/asyncHandler.js"
import { successResponse } from "../../shared/utils/response.js"
import { AppError } from "../../shared/utils/AppError.js"

export const listSubjects = asyncHandler(async (req, res) => {
    const data = await subjectsService.findAllByTeacher(req.user.id)

    return successResponse(res, "Subjects retrieved successfully", data)
})

export const createSubject = asyncHandler(async (req, res) => {
    const data = await subjectsService.create({
        ...req.body,
        teacher_id: req.user.id,
    })

    return successResponse(res, "Subject created successfully", data, 201)
})

export const updateSubject = asyncHandler(async (req, res) => {
    const data = await subjectsService.update(req.params.id, req.user.id, req.body)

    if (!data) {
        throw new AppError("Subject not found or you do not have permission", 404)
    }

    return successResponse(res, "Subject updated successfully", data)
})

export const deleteSubject = asyncHandler(async (req, res) => {
    try {
        await subjectsService.remove(req.params.id, req.user.id)

        return successResponse(res, "Subject deleted successfully")
    } catch (error) {
        if (error.code === "23503") {
            throw new AppError(
                "Cannot delete subject: assignments still reference this subject.",
                409
            )
        }
        throw error
    }
})
