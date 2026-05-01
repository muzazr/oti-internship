import * as reportsService from "./reports.service.js"
import { asyncHandler } from "../../shared/utils/asyncHandler.js"
import { successResponse } from "../../shared/utils/response.js"
import { AppError } from "../../shared/utils/AppError.js"

// GET /api/reports/assignments/:assignmentId/recap
export const getRecap = asyncHandler(async (req, res) => {
    const { assignmentId } = req.params

    const data = await reportsService.getAssignmentRecap(assignmentId, req.user.id)

    if (!data) {
        throw new AppError("Assignment not found or you do not have permission", 404)
    }

    return successResponse(res, "Recap retrieved successfully", data)
})

// GET /api/reports/assignments/:assignmentId/export.csv
export const exportCSV = asyncHandler(async (req, res) => {
    const { assignmentId } = req.params

    const data = await reportsService.getAssignmentRecap(assignmentId, req.user.id)

    if (!data) {
        throw new AppError("Assignment not found or you do not have permission", 404)
    }

    const csv = reportsService.formatRecapAsCSV(data)

    const filename = `recap_${data.assignment.title.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}.csv`

    res.setHeader("Content-Type", "text/csv; charset=utf-8")
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
    return res.send(csv)
})