import axios from "axios"
import { env } from "../../config/env.js"

export async function sendWhatsAppTextMessage(to, body) {
    if (!env.WHATSAPP_ACCESS_TOKEN) {
        throw new Error("WHATSAPP_ACCESS_TOKEN is missing")
    }

    if (!env.WHATSAPP_PHONE_NUMBER_ID) {
        throw new Error("WHATSAPP_PHONE_NUMBER_ID is missing")
    }

    const url = `https://graph.facebook.com/${env.META_GRAPH_API_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`

    const payload = {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: {
            preview_url: false,
            body,
        },
    }

    const response = await axios.post(url, payload, {
        headers: {
            Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
        },
    })

    return response.data
}