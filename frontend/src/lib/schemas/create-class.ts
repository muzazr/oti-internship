import { z } from "zod";

export const createClassSchema = z.object({
  name: z
    .string()
    .min(1, "Nama kelas wajib diisi")
    .max(100, "Nama kelas maksimal 100 karakter"),
  subject_name: z
    .string()
    .min(1, "Nama mata pelajaran wajib diisi")
    .max(100, "Nama mata pelajaran maksimal 100 karakter"),
});

export type CreateClassFormData = z.infer<typeof createClassSchema>;
