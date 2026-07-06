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
});

export type ResumeStructured = z.infer<typeof ResumeStructuredSchema>;
