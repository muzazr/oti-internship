import { successResponse } from "../../shared/utils/response.js"

/**
 * GET /api/auth/me
 * Returns the authenticated teacher's profile.
 * Requires requireAuth middleware to have run first.
 */
export function getMe(req, res) {
    return successResponse(res, "Authenticated user profile", req.user)
}