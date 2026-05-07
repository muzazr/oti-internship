import express from "express"
import { requireAuth } from "../auth/auth.middleware.js"
import { validate } from "../../shared/middlewares/validate.js"
import { generateLinksSchema } from "./uploadLinks.schema.js"
import {
    generateUploadLinks,
    validateToken,
    recordAccess,
    getPendingAssignments,
} from "./uploadLinks.controller.js"

const router = express.Router()

// protected: teacher generates links
router.post("/", requireAuth, validate(generateLinksSchema), generateUploadLinks)

// public: student validates token
router.get("/:token", validateToken)

// public: student records page access
router.post("/:token/access", recordAccess)

// public: get pending assignments for student (identified by token)
router.get("/:token/pending", getPendingAssignments)

export default router