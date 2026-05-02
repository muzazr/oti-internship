import {
    getAllTeachers,
    getTeacherById,
    updateTeacher,
    deleteTeacher,
} from "./teachers.service.js"
import { successResponse } from "../../shared/utils/response.js"
import { AppError } from "../../shared/utils/AppError.js"

export async function listTeachers(req, res, next) {
    try {
        const teachers = await getAllTeachers()
        return successResponse(res, "Teachers retrieved", teachers)
    } catch (error) {
        next(error)
    }
}

export async function getMyProfile(req, res, next) {
    try {
        const teacher = await getTeacherById(req.user.id)
        return successResponse(res, "Profile retrieved", teacher)
    } catch (error) {
        next(error)
    }
}

export async function getTeacher(req, res, next) {
    try {
        const teacher = await getTeacherById(req.params.id)
        return successResponse(res, "Teacher retrieved", teacher)
    } catch (error) {
        next(error)
    }
}

export async function updateMyProfile(req, res, next) {
    try {
        const updated = await updateTeacher(req.user.id, req.body)
        return successResponse(res, "Profile updated", updated)
    } catch (error) {
        next(error)
    }
}

export async function removeTeacher(req, res, next) {
    try {
        const { id } = req.params

        // Prevent self-deletion
        if (id === req.user.id) {
            throw new AppError("You cannot delete your own account via this endpoint", 400)
        }

        await deleteTeacher(id)
        return successResponse(res, "Teacher deleted successfully")
    } catch (error) {
        next(error)
    }
}