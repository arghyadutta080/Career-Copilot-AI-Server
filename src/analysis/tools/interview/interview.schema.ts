import { z } from "zod";

export const InterviewAnswerSchema = z.object({
  content: z.string().nullable().default(null),
  status: z.enum(["not_started", "generating", "completed", "failed"]).default("not_started"),
  generatedAt: z.string().nullable().default(null),
});

export const InterviewQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  topics: z.array(z.string()),
  answer: InterviewAnswerSchema.default({
    content: null,
    status: "not_started",
    generatedAt: null,
  }),
});

export const InterviewFollowUpSchema = z.object({
  parentQuestion: z.string(),
  followUps: z.array(InterviewQuestionSchema),
});

export const InterviewResultSchema = z.object({
  hr: z.array(InterviewQuestionSchema),
  resumeBased: z.array(InterviewQuestionSchema),
  experienceBased: z.array(InterviewQuestionSchema),
  projectBased: z.array(InterviewQuestionSchema),
  technical: z.array(InterviewQuestionSchema),
  coding: z.array(InterviewQuestionSchema),
  behavioral: z.array(InterviewQuestionSchema),
  followUps: z.array(InterviewFollowUpSchema),
});

export type InterviewResult = z.infer<typeof InterviewResultSchema>;
