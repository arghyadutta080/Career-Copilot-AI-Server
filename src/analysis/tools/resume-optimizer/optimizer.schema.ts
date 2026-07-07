import { z } from "zod";

export const ResumeOptimizerSchema = z.object({
  overallSummary: z.string(),

  atsImpact: z.object({
    currentScore: z.number().min(0).max(100),
    expectedScore: z.number().min(0).max(100),
    reason: z.string(),
  }),

  keywordSuggestions: z.array(z.string()),

  experienceSuggestions: z.array(
    z.object({
      company: z.string(),
      role: z.string().optional(),
      suggestions: z.array(z.string()),
    }),
  ),

  projectSuggestions: z.array(
    z.object({
      project: z.string(),
      suggestions: z.array(z.string()),
    }),
  ),

  sectionSuggestions: z.array(
    z.object({
      section: z.enum([
        "Summary",
        "Skills",
        "Experience",
        "Projects",
        "Education",
        "Certifications",
      ]),
      suggestion: z.string(),
    }),
  ),

  optimizedContent: z.string(),
});

export type ResumeOptimizerResult = z.infer<typeof ResumeOptimizerSchema>;
