import { z } from "zod";

export const ATSResultSchema = z.object({
  score: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  summary: z.string(),
});

export type ATSResult = z.infer<typeof ATSResultSchema>;
