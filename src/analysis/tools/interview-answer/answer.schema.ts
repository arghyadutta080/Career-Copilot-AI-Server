import { z } from "zod";

export const AnswerStatusEnum = z.enum(["not_started", "generating", "completed", "failed"]);

export const AnswerSchema = z.object({
  content: z.string().nullable().default(null),
  status: AnswerStatusEnum.default("not_started"),
  generatedAt: z.string().nullable().default(null),
});

export type Answer = z.infer<typeof AnswerSchema>;
