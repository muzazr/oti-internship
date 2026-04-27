export function requireAuth(req, res, next) {
    return res.status(501).json({
        ok: false,
        message: "Auth middleware is not implemented yet",
    })
}