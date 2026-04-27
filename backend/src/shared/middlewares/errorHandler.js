export function errorHandler(error, req, res, next) {
    console.error("ERROR:", error.response?.data || error)

    res.status(error.statusCode || 500).json({
        ok: false,
        message: error.message || "Internal server error",
    })
}