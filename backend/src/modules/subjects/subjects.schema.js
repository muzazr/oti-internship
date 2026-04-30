import { z } from "zod"

export const createSubjectSchema = z.object({
    name: z
        .string()
        .min(1, "Subject name is required")
        .max(100, "Subject name must be at most 100 characters"),
})

export const updateSubjectSchema = z.object({
    name: z
        .string()
        .min(1, "Subject name is required")
        .max(100, "Subject name must be at most 100 characters"),
})

export const subjectIdParamSchema = z.object({
    id: z.string().uuid("Invalid subject ID format"),
})
