export function successResponse(res, message, data = null, statusCode = 200) {
    return res.status(statusCode).json({
        ok: true,
        message,
        data,
    })
}

export function errorResponse(res, message, statusCode = 400) {
    return res.status(statusCode).json({
        ok: false,
        message,
    })
}