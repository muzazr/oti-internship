import express from "express"
import multer from "multer"
import { AppError } from "../../shared/utils/AppError.js"
import { cropImage } from "./ai.controller.js"

const router = express.Router()

const ALLOWED_IMAGE_MIME_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
]

const uploadImage = multer({
    storage: multer.memoryStorage(),
    fileFilter(req, file, cb) {
        if (ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
            cb(null, true)
            return
        }

        cb(new AppError("Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.", 400), false)
    },
    limits: {
        fileSize: 8 * 1024 * 1024,
        files: 1,
    },
})

router.post("/crop", uploadImage.single("image"), cropImage)

export default router
