import multer from "multer"
import { AppError } from "../utils/AppError.js"

export function errorHandler(error, req, res, next) {
    if (process.env.NODE_ENV !== "production") {
        console.error("ERROR:", error)
    } else {
        console.error("ERROR:", error.message)
    }

    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            ok: false,
            message: error.message,
        })
    }

    // Handle multer errors (file size, count, etc.)
    if (error instanceof multer.MulterError) {
        const messages = {
            LIMIT_FILE_SIZE: "File size exceeds the allowed limit",
            LIMIT_FILE_COUNT: "Too many files uploaded",
            LIMIT_UNEXPECTED_FILE: "Unexpected file field",
        }

        return res.status(400).json({
            ok: false,
            message: messages[error.code] || error.message,
        })
    }

    // Handle Supabase/PostgREST errors
    if (error.code && error.message && error.details) {
        return res.status(400).json({
            ok: false,
            message: error.message,
        })
    }

    return res.status(500).json({
        ok: false,
        message: "Internal server error",
    })
}