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

    const payload = {
        class_id: req.body.class_id,
        full_name: req.body.full_name,
        student_code: req.body.student_code,
        whatsapp_number: req.body.whatsapp_number || null,
    }

    console.log("REQ USER:", req.user.id)
    console.log("CREATE STUDENT PAYLOAD:", payload)

    try {
        const data = await studentsService.create(payload)
        return successResponse(res, "Student created successfully", data, 201)
    } catch (error) {
        if (error.code === "23505") {
            throw new AppError("Student code already exists", 409)
        }
        throw error
    }
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

    if (req.body.class_id && req.body.class_id !== existing.class_id) {
        const ownerClass = await studentsService.verifyClassOwnership(req.body.class_id, req.user.id)
        if (!ownerClass) {
            throw new AppError("New class not found or you do not have permission", 404)
        }
    }

    const payload = { ...req.body }
    if (payload.whatsapp_number === "") {
        payload.whatsapp_number = null
    }

    try {
        const data = await studentsService.update(req.params.id, payload)
        return successResponse(res, "Student updated successfully", data)
    } catch (error) {
        if (error.code === "23505") {
            throw new AppError("Student code already exists", 409)
        }
        throw error
    }
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