import { z } from "zod"

export const updateTeacherSchema = z.object({
    full_name: z
        .string()
        .min(1, "Full name is required")
        .max(100, "Full name must be at most 100 characters")
        .optional(),
    phone_number: z
        .string()
        .max(20, "Phone number must be at most 20 characters")
        .nullable()
        .optional(),
})

export const teacherIdParamSchema = z.object({
    id: z.string().uuid("Invalid teacher ID format"),
})
