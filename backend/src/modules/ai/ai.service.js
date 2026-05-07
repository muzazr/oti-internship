const DEFAULT_AI_CROP_ENDPOINT = "https://gradienr-mitbridge.hf.space/scan"
const AI_REQUEST_TIMEOUT_MS = 60_000

export async function requestCropInference(file) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS)

    try {
        const formData = new FormData()
        const blob = new Blob([file.buffer], { type: file.mimetype })
        formData.append("file", blob, file.originalname || "image.jpg")

        return await fetch(process.env.AI_CROP_ENDPOINT || DEFAULT_AI_CROP_ENDPOINT, {
            method: "POST",
            body: formData,
            signal: controller.signal,
        })
    } finally {
        clearTimeout(timeout)
    }
}
