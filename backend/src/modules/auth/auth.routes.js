import express from "express"
import { requireAuth } from "./auth.middleware.js"
import { getMe, registerProfile } from "./auth.controller.js"

const router = express.Router()

router.get("/me", requireAuth, getMe)
router.post("/register", registerProfile)

export default router
