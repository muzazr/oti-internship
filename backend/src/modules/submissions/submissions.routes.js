import express from "express"
import { requireAuth } from "../auth/auth.middleware.js"
import { validate, validateParams } from "../../shared/middlewares/validate.js"
import { upload } from "../../config/multer.js"
import { gradeSchema, submissionIdParamSchema } from "./submissions.schema.js"
import {
    submitAssignment,
    getSubmission,
    gradeSubmission,
} from "./submissions.controller.js"

const router = express.Router()

// public: student submits via token (multipart/form-data)
router.post("/:token", upload.array("files", 20), submitAssignment)

// protected: teacher views a submission
router.get("/:id", requireAuth, validateParams(submissionIdParamSchema), getSubmission)

// protected: teacher grades a submission
router.patch("/:id/grade", requireAuth, validateParams(submissionIdParamSchema), validate(gradeSchema), gradeSubmission)

export default router