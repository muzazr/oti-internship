import express from "express"
import { requireAuth } from "../auth/auth.middleware.js"
import { asyncHandler } from "../../shared/utils/asyncHandler.js"
import { getStats } from "./dashboard.controller.js"

const router = express.Router()

router.get("/stats", requireAuth, asyncHandler(getStats))

export default router
