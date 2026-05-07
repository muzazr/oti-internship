import { env } from "../../config/env.js"
import { supabaseAdmin } from "../../config/supabase.js"
import { asyncHandler } from "../../shared/utils/asyncHandler.js"
import { successResponse } from "../../shared/utils/response.js"
import { AppError } from "../../shared/utils/AppError.js"
import {
    getNonTextMessageReply,
    handleIncomingTextMessage,
    sendWhatsAppTextMessage,
    notifyStudentsNewAssignment,
} from "./whatsapp.service.js"

export function verifyWebhook(req, res) {
    const mode = req.query["hub.mode"]
    const token = req.query["hub.verify_token"]
    const challenge = req.query["hub.challenge"]

    console.log("VERIFY REQUEST:", {
        mode,
        token,
        challenge,
    })

    if (mode === "subscribe" && token === env.WHATSAPP_VERIFY_TOKEN) {
        console.log("Webhook verified successfully")
        return res.status(200).send(challenge)
    }

    console.log("Webhook verification failed")
    return res.sendStatus(403)
}

export async function receiveWebhook(req, res) {
    try {
        const body = req.body

        console.log("WEBHOOK PAYLOAD:")
        console.log(JSON.stringify(body, null, 2))

        const value = body?.entry?.[0]?.changes?.[0]?.value

        const message = value?.messages?.[0]
        const status = value?.statuses?.[0]

        if (status) {
            console.log("MESSAGE STATUS:", {
                id: status.id,
                status: status.status,
                timestamp: status.timestamp,
                recipientId: status.recipient_id,
                errors: status.errors,
            })

            return res.sendStatus(200)
        }

        if (!message) {
            return res.sendStatus(200)
        }

        const from = message.from
        const messageType = message.type
        const text = message.text?.body?.trim().toLowerCase()

        console.log("INCOMING MESSAGE:", {
            from,
            messageType,
            text,
        })

        if (messageType !== "text") {
            await safeReply(from, getNonTextMessageReply())

            return res.sendStatus(200)
        }

        const reply = await handleIncomingTextMessage(from, message.text?.body)
        await safeReply(from, reply)

        return res.sendStatus(200)
    } catch (error) {
        console.error("Webhook receive error:", error.response?.data || error)

        return res.sendStatus(200)
    }
}

async function safeReply(to, message) {
    try {
        const result = await sendWhatsAppTextMessage(to, message)

        console.log("WHATSAPP REPLY SENT:", result)

        return result
    } catch (error) {
        console.error("FAILED TO SEND WHATSAPP REPLY:", error.response?.data || error.message)

        return null
    }
}

/**
 * Send assignment notification to students via WhatsApp.
 * POST /api/whatsapp/notify-assignment/:assignmentId
 */
export const sendAssignmentNotification = asyncHandler(async (req, res) => {
    const { assignmentId } = req.params
    const { class_ids } = req.body

    if (!class_ids || !Array.isArray(class_ids) || class_ids.length === 0) {
        throw new AppError("class_ids is required and must be a non-empty array", 400)
    }

    // Verify the teacher owns this assignment
    const { data: assignment, error } = await supabaseAdmin
        .from("assignments")
        .select("id, teacher_id")
        .eq("id", assignmentId)
        .eq("teacher_id", req.user.id)
        .single()

    if (error || !assignment) {
        throw new AppError("Assignment not found or you do not have permission", 404)
    }

    const result = await notifyStudentsNewAssignment(assignmentId, class_ids, req.user.id)

    return successResponse(res, "WhatsApp notifications sent", result)
})
