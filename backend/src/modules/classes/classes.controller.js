import * as classesService from "./classes.service.js"
import { asyncHandler } from "../../shared/utils/asyncHandler.js"
import { successResponse, errorResponse } from "../../shared/utils/response.js"
import { AppError } from "../../shared/utils/AppError.js"

export const listClasses = asyncHandler(async (req, res) => {
    const data = await classesService.findAllByTeacher(req.user.id)

    return successResponse(res, "Classes retrieved successfully", data)
})

// get
export const getClass = asyncHandler(async (req, res) => {
    const { id } = req.params

    const data = await classesService.findById(id, req.user.id)

    if (!data) {
        throw new AppError("Class not found", 404)
    }

    return successResponse(res, "Class retrieved successfully", data)
})

// post
export const createClass = asyncHandler(async (req, res) => {
    const data = await classesService.create({
        ...req.body,
        teacher_id: req.user.id,
    })

    return successResponse(res, "Class created successfully", data, 201)
})

// update
export const updateClass = asyncHandler(async (req, res) => {
    const { id } = req.params

    const data = await classesService.update(id, req.user.id, req.body)

    if (!data) {
        throw new AppError("Class not found or you do not have permission", 404)
    }

    return successResponse(res, "Class updated successfully", data)
})

// delete
export const deleteClass = asyncHandler(async (req, res) => {
    try {
        await classesService.remove(req.params.id, req.user.id)

        return successResponse(res, "Class deleted successfully")
    } catch (error) {
        if (error.code === "23503") {
            throw new AppError(
                "Cannot delete class: students still exist in this class. Remove all students first.",
                409
            )
        }
        throw error
    }
})