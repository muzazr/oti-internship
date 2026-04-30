import express from "express"
import { requireAuth } from "../auth/auth.middleware.js"
import { validate, validateParams } from "../../shared/middlewares/validate.js"
import { createSubjectSchema, updateSubjectSchema, subjectIdParamSchema } from "./subjects.schema.js"
import {
    listSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
} from "./subjects.controller.js"

const router = express.Router()

router.use(requireAuth)

router.get("/", listSubjects)

router.post("/", validate(createSubjectSchema), createSubject)

router.patch("/:id", validateParams(subjectIdParamSchema), validate(updateSubjectSchema), updateSubject)

router.delete("/:id", validateParams(subjectIdParamSchema), deleteSubject)

export default router
