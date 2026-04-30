import { z } from "zod"

export const createClassSchema = z.object({
    name: z
        .string()
        .min(1, "Class name is required")
        .max(100, "Class name must be at most 100 characters"),
    academic_year: z
        .string()
        .max(20, "Academic year must be at most 20 characters")
        .optional(),
})

export const updateClassSchema = z.object({
    name: z
        .string()
        .min(1, "Class name is required")
        .max(100, "Class name must be at most 100 characters")
        .optional(),
    academic_year: z
        .string()
        .max(20, "Academic year must be at most 20 characters")
        .nullable()
        .optional(),
})

export const classIdParamSchema = z.object({
    id: z.string().uuid("Invalid class ID format"),
})
