import { AppError } from "../utils/AppError.js"

export function errorHandler(error, req, res, next) {
    // Log full error in development
    if (process.env.NODE_ENV !== "production") {
        console.error("ERROR:", error)
    } else {
        console.error("ERROR:", error.message)
    }

    // Handle our custom AppError
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            ok: false,
            message: error.message,
        })
    }

    // Handle Supabase/PostgREST errors
    if (error.code && error.message && error.details) {
        return res.status(400).json({
            ok: false,
            message: error.message,
        })
    }

    // Default 500
    return res.status(500).json({
        ok: false,
        message: "Internal server error",
    })
}