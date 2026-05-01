import multer from "multer"
import { AppError } from "../shared/utils/AppError.js"

const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
]

const storage = multer.memoryStorage()

function fileFilter(req, file, cb) {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new AppError(`File type ${file.mimetype} is not allowed. Accepted: JPEG, PNG, WebP, PDF`, 400), false)
    }
}

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
        files: 20,
    },
})

export { ALLOWED_MIME_TYPES }
