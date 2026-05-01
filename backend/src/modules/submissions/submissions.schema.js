import { z } from "zod"

export const gradeSchema = z.object({
    score: z.number().min(0, "Score must be at least 0").max(100, "Score must be at most 100"),
    feedback: z.string().max(2000).nullable().optional(),
})

export const submissionIdParamSchema = z.object({
    id: z.string().uuid("Invalid submission ID format"),
})
