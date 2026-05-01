import express from "express"
import { requireAuth } from "../auth/auth.middleware.js"
import { validate, validateParams } from "../../shared/middlewares/validate.js"
import { createAssignmentSchema, updateAssignmentSchema, assignmentIdParamSchema } from "./assignments.schema.js"
import {
    listAssignments,
    getAssignment,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    publishAssignment,
} from "./assignments.controller.js"

const router = express.Router()

router.use(requireAuth)

router.get("/", listAssignments)
router.post("/", validate(createAssignmentSchema), createAssignment)
router.get("/:id", validateParams(assignmentIdParamSchema), getAssignment)
router.patch("/:id", validateParams(assignmentIdParamSchema), validate(updateAssignmentSchema), updateAssignment)
router.delete("/:id", validateParams(assignmentIdParamSchema), deleteAssignment)
router.post("/:id/publish", validateParams(assignmentIdParamSchema), publishAssignment)

export default router