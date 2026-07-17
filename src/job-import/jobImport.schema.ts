import { z } from "zod";

export const jobImportSchema = z.object({
  title: z.string().describe("The job title."),
  company: z.string().describe("The name of the company hiring."),
  description: z.string().describe("The full description of the job, including responsibilities, requirements, and benefits."),
  sourceUrl: z.string().describe("The original URL the job was imported from."),
});

export type JobImportOutput = z.infer<typeof jobImportSchema>;
