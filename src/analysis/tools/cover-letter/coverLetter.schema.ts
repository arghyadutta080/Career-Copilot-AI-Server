import { z } from "zod";

export const CoverLetterSchema = z.object({
  subject: z.string(),
  content: z.string(),
});

export type CoverLetterResult = z.infer<typeof CoverLetterSchema>;
