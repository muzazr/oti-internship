import express from "express"
import {
    verifyWebhook,
    receiveWebhook,
    sendAssignmentNotification,
} from "./whatsapp.controller.js"
import { requireAuth } from "../auth/auth.middleware.js"

const router = express.Router()

// Webhook routes (no auth - called by Meta)
router.get("/webhook", verifyWebhook)
router.post("/webhook", receiveWebhook)

// Assignment notification route (requires auth)
router.post("/notify-assignment/:assignmentId", requireAuth, sendAssignmentNotification)

export default router