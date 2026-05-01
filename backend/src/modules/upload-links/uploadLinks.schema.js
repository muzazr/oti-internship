import { z } from "zod"

export const generateLinksSchema = z.object({
    assignment_id: z.string().uuid("Invalid assignment ID"),
    student_ids: z.array(z.string().uuid()).min(1, "At least one student must be selected"),
    source: z.enum(["teacher_dashboard", "whatsapp_bot", "simulation"]).default("teacher_dashboard"),
})
