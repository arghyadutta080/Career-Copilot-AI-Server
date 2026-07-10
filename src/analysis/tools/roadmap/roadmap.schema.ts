import { z } from "zod";

export const LearningResourceSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  query: z.string(),
  reason: z.string(),
  urls: z.array(z.string()).default([]),
});

export const RoadmapStepSchema = z.object({
  order: z.number(),
  title: z.string(),
  description: z.string(),
  priority: z.enum(["High", "Medium", "Low"]),
  estimatedHours: z.number(),
  resources: z.array(LearningResourceSchema),
  outcomes: z.array(z.string()),
});

export const RoadmapMilestoneSchema = z.object({
  title: z.string(),
  description: z.string(),
  steps: z.array(RoadmapStepSchema),
});

export const LearningRoadmapSchema = z.object({
  overview: z.string(),
  milestones: z.array(RoadmapMilestoneSchema),
  interviewChecklist: z.array(z.string()),
});

export type LearningRoadmap = z.infer<typeof LearningRoadmapSchema>;
