import express from "express"
import { requireAuth } from "../auth/auth.middleware.js"
import { validate, validateParams, validateQuery } from "../../shared/middlewares/validate.js"
import {
    createStudentSchema,
    updateStudentSchema,
    studentIdParamSchema,
    listStudentsQuerySchema,
} from "./students.schema.js"
import {
    listStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,
} from "./students.controller.js"

const router = express.Router()

router.use(requireAuth)

router.get("/", validateQuery(listStudentsQuerySchema), listStudents)

router.post("/", validate(createStudentSchema), createStudent)

router.get("/:id", validateParams(studentIdParamSchema), getStudent)

router.patch("/:id", validateParams(studentIdParamSchema), validate(updateStudentSchema), updateStudent)

router.delete("/:id", validateParams(studentIdParamSchema), deleteStudent)

export default router