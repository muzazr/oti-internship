import express from "express"
import { requireAuth } from "../auth/auth.middleware.js"
import { getRecap, exportCSV } from "./reports.controller.js"

const router = express.Router()

router.use(requireAuth)

router.get("/assignments/:assignmentId/recap", getRecap)
router.get("/assignments/:assignmentId/export.csv", exportCSV)

export default router