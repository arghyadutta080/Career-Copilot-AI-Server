import { z } from "zod";

export const ResumeStructuredSchema = z.object({
  name: z.string().optional(),

  email: z.string().optional(),

  phone: z.string().optional(),

  skills: z.array(z.string()).default([]),

  projects: z
    .array(
      z.object({
        title: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .default([]),

  experience: z
    .array(
      z.object({
        company: z.string().optional(),
        role: z.string().optional(),
        duration: z.string().optional(),
        responsibilities: z.array(z.string()).default([]),
      }),
    )
    .default([]),

  education: z
    .array(
      z.object({
        institution: z.string().optional(),
        degree: z.string().optional(),
      }),
    )
    .default([]),

  certifications: z.array(z.string()).default([]),

  achievements: z.array(z.string()).default([]),
});

export type ResumeStructured = z.infer<typeof ResumeStructuredSchema>;
