import express from "express"

import whatsappRoutes from "./modules/whatsapp/whatsapp.routes.js"
import authRoutes from "./modules/auth/auth.routes.js"
import classesRoutes from "./modules/classes/classes.routes.js"
import studentsRoutes from "./modules/students/students.routes.js"
import subjectsRoutes from "./modules/subjects/subjects.routes.js"
import assignmentsRoutes from "./modules/assignments/assignments.routes.js"
import uploadLinksRoutes from "./modules/upload-links/uploadLinks.routes.js"
import submissionsRoutes from "./modules/submissions/submissions.routes.js"
import reportsRoutes from "./modules/reports/reports.routes.js"

const router = express.Router()

router.use("/whatsapp", whatsappRoutes)
router.use("/auth", authRoutes)
router.use("/classes", classesRoutes)
router.use("/students", studentsRoutes)
router.use("/subjects", subjectsRoutes)
router.use("/assignments", assignmentsRoutes)
router.use("/upload-links", uploadLinksRoutes)
router.use("/submissions", submissionsRoutes)
router.use("/reports", reportsRoutes)

export default router