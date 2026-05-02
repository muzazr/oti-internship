import express from "express"
import { requireAuth } from "./auth.middleware.js"
import { getMe, login, register } from "./auth.controller.js"
import { validate } from "../../shared/middlewares/validate.js"
import { loginSchema, registerSchema } from "./auth.schema.js"

const router = express.Router()

router.post("/login", validate(loginSchema), login)
router.post("/register", validate(registerSchema), register)
router.get("/me", requireAuth, getMe)

export default router