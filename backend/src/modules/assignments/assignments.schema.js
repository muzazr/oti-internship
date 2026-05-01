import { z } from "zod"

export const createAssignmentSchema = z.object({
    subject_id: z.string().uuid("Invalid subject ID").nullable().optional(),
    title: z.string().min(1, "Title is required").max(200),
    description: z.string().max(5000).optional(),
    instruction: z.string().max(5000).optional(),
    deadline: z.string().datetime({ offset: true }).nullable().optional(),
    allow_late_submission: z.boolean().default(true),
    max_files: z.number().int().min(1).max(20).default(5),
    max_file_size_mb: z.number().int().min(1).max(50).default(10),
    accepts_file: z.boolean().default(true),
    accepts_link: z.boolean().default(false),
    class_ids: z.array(z.string().uuid()).min(1, "At least one class must be selected"),
})

export const updateAssignmentSchema = z.object({
    subject_id: z.string().uuid("Invalid subject ID").nullable().optional(),
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(5000).nullable().optional(),
    instruction: z.string().max(5000).nullable().optional(),
    deadline: z.string().datetime({ offset: true }).nullable().optional(),
    allow_late_submission: z.boolean().optional(),
    max_files: z.number().int().min(1).max(20).optional(),
    max_file_size_mb: z.number().int().min(1).max(50).optional(),
    accepts_file: z.boolean().optional(),
    accepts_link: z.boolean().optional(),
    class_ids: z.array(z.string().uuid()).min(1).optional(),
})

export const assignmentIdParamSchema = z.object({
    id: z.string().uuid("Invalid assignment ID format"),
})
