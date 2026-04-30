import { successResponse } from "../../shared/utils/response.js"

export function getMe(req, res) {
    return successResponse(res, "Authenticated user profile", req.user)
}