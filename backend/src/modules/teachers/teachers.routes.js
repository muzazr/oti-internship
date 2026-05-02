import express from "express"
import { requireAuth } from "../auth/auth.middleware.js"
import { validate, validateParams } from "../../shared/middlewares/validate.js"
import { updateTeacherSchema, teacherIdParamSchema } from "./teachers.schema.js"
import {
    listTeachers,
    getMyProfile,
    getTeacher,
    updateMyProfile,
    removeTeacher,
} from "./teachers.controller.js"

const router = express.Router()

// All routes require authentication
router.use(requireAuth)

// GET /teachers — list all teachers
router.get("/", listTeachers)

// GET /teachers/me — get own profile
// PATCH /teachers/me — update own profile
router
    .route("/me")
    .get(getMyProfile)
    .patch(validate(updateTeacherSchema), updateMyProfile)

// GET /teachers/:id — get teacher by ID
// DELETE /teachers/:id — delete teacher by ID
router
    .route("/:id")
    .get(validateParams(teacherIdParamSchema), getTeacher)
    .delete(validateParams(teacherIdParamSchema), removeTeacher)

export default router