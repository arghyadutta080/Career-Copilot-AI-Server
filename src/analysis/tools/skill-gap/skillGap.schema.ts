import { z } from "zod";

export const SkillGapSchema = z.object({
  missingSkills: z.array(z.string()),
  recommendedSkills: z.array(z.string()),
  learningPriority: z.array(
    z.object({
      skill: z.string(),
      reason: z.string(),
    }),
  ),
  summary: z.string(),
});

export type SkillGapResult = z.infer<typeof SkillGapSchema>;
