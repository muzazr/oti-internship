import * as studentsService from "./students.service.js"
import { asyncHandler } from "../../shared/utils/asyncHandler.js"
import { successResponse } from "../../shared/utils/response.js"
import { AppError } from "../../shared/utils/AppError.js"

// get list students
export const listStudents = asyncHandler(async (req, res) => {
    const { class_id } = req.validatedQuery

    const ownerClass = await studentsService.verifyClassOwnership(class_id, req.user.id)

    if (!ownerClass) {
        throw new AppError("Class not found or you do not have permission", 404)
    }

    const data = await studentsService.findAllByClass(class_id)

    return successResponse(res, "Students retrieved successfully", data)
})

export const getStudent = asyncHandler(async (req, res) => {
    const student = await studentsService.findById(req.params.id)

    if (!student) {
        throw new AppError("Student not found", 404)
    }

    if (student.classes.teacher_id !== req.user.id) {
        throw new AppError("Student not found or you do not have permission", 404)
    }

    return successResponse(res, "Student retrieved successfully", student)
})

// create student
export const createStudent = asyncHandler(async (req, res) => {
    const { class_id } = req.body

    const ownerClass = await studentsService.verifyClassOwnership(class_id, req.user.id)

    if (!ownerClass) {
        throw new AppError("Class not found or you do not have permission", 404)
    }

    const data = await studentsService.create(req.body)

    return successResponse(res, "Student created successfully", data, 201)
})

// update student
export const updateStudent = asyncHandler(async (req, res) => {
    const existing = await studentsService.findById(req.params.id)

    if (!existing) {
        throw new AppError("Student not found", 404)
    }

    if (existing.classes.teacher_id !== req.user.id) {
        throw new AppError("Student not found or you do not have permission", 404)
    }

    const data = await studentsService.update(req.params.id, req.body)

    return successResponse(res, "Student updated successfully", data)
})

export const deleteStudent = asyncHandler(async (req, res) => {
    const existing = await studentsService.findById(req.params.id)

    if (!existing) {
        throw new AppError("Student not found", 404)
    }

    if (existing.classes.teacher_id !== req.user.id) {
        throw new AppError("Student not found or you do not have permission", 404)
    }

    try {
        await studentsService.remove(req.params.id)

        return successResponse(res, "Student deleted successfully")
    } catch (error) {
        if (error.code === "23503") {
            throw new AppError(
                "Cannot delete student: submissions or upload links still reference this student.",
                409
            )
        }
        throw error
    }
})