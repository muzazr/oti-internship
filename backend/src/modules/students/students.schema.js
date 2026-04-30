import { z } from "zod"

export const createStudentSchema = z.object({
    class_id: z
        .string()
        .uuid("Invalid class ID format"),
    full_name: z
        .string()
        .min(1, "Student name is required")
        .max(200, "Student name must be at most 200 characters"),
    student_code: z
        .string()
        .max(50, "Student code must be at most 50 characters")
        .optional(),
    whatsapp_number: z
        .string()
        .max(20, "WhatsApp number must be at most 20 characters")
        .optional(),
})

export const updateStudentSchema = z.object({
    full_name: z
        .string()
        .min(1, "Student name is required")
        .max(200, "Student name must be at most 200 characters")
        .optional(),
    student_code: z
        .string()
        .max(50, "Student code must be at most 50 characters")
        .nullable()
        .optional(),
    whatsapp_number: z
        .string()
        .max(20, "WhatsApp number must be at most 20 characters")
        .nullable()
        .optional(),
})

export const studentIdParamSchema = z.object({
    id: z.string().uuid("Invalid student ID format"),
})

export const listStudentsQuerySchema = z.object({
    class_id: z.string().uuid("Invalid class ID format"),
})
