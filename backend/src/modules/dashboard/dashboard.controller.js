import { getDashboardStats } from "./dashboard.service.js"
import { successResponse } from "../../shared/utils/response.js"

export async function getStats(req, res) {
    const stats = await getDashboardStats(req.user.id)
    return successResponse(res, "Dashboard stats retrieved", stats)
}
