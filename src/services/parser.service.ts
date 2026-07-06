import { llm } from "../llm/gemini";
import { ResumeStructuredSchema } from "../types/resume.schema";

export async function structureResume(rawText: string) {
  const structuredLLM = llm.withStructuredOutput(ResumeStructuredSchema);

  const result = await structuredLLM.invoke(`
Extract all information from the resume.

Resume:

${rawText}
`);

  return result;
}
