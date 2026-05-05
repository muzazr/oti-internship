import { AppError } from "../../shared/utils/AppError.js"
import { requestCropInference } from "./ai.service.js"

const METADATA_HEADERS = [
    "x-detected",
    "x-readable",
    "x-detection-confidence",
    "x-readability-score",
    "x-inference-ms",
]

export async function cropImage(req, res, next) {
    try {
        if (!req.file) {
            throw new AppError("File image wajib dikirim dengan field name 'image'", 400)
        }

        const aiResponse = await requestCropInference(req.file)
        const contentType = aiResponse.headers.get("content-type") || ""

        if (contentType.includes("image/jpeg")) {
            setMetadataHeaders(res, aiResponse.headers)
            const imageBuffer = Buffer.from(await aiResponse.arrayBuffer())

            return res
                .status(aiResponse.status)
                .type("image/jpeg")
                .send(imageBuffer)
        }

        const body = await readJsonBody(aiResponse)

        return res
            .status(aiResponse.status)
            .type("application/json")
            .json(body)
    } catch (error) {
        if (error instanceof AppError) {
            return next(error)
        }

        if (error.name === "AbortError") {
            return next(new AppError("AI inference service timeout", 504))
        }

        console.error("AI crop inference error:", error)
        return next(new AppError("AI inference service unavailable", 502))
    }
}

function setMetadataHeaders(res, headers) {
    for (const header of METADATA_HEADERS) {
        const value = headers.get(header)
        if (value !== null) {
            res.set(formatResponseHeaderName(header), value)
        }
    }
}

async function readJsonBody(response) {
    try {
        return await response.json()
    } catch {
        return {
            detected: false,
            readable: false,
            stage_failed: "unknown",
        }
    }
}

function formatResponseHeaderName(header) {
    return header
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("-")
}
