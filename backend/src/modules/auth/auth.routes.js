import express from "express"
import { requireAuth } from "./auth.middleware.js"
import { getMe } from "./auth.controller.js"

const router = express.Router()

router.get("/me", requireAuth, getMe)

export default router