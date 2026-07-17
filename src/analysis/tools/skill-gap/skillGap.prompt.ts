export function buildSkillGapPrompt(parsedResume: any, jobDescription: string) {
  return `
You are an experienced and highly analytical engineering hiring manager.

Your task is to strictly compare the provided candidate resume with the target job description and identify exact gaps.

CRITICAL INSTRUCTIONS (Follow these EXACTLY):

1. Missing skills: Identify specific technologies, frameworks, or domain knowledge required by the job description that are completely absent from the resume.
2. Skills that should be learned: Identify areas where the candidate might have related or partial knowledge, but needs explicit upskilling for this specific role.
3. Prioritize the learning order: Rank the missing/needed skills strictly by their critical importance to the job role (1 being the highest priority).
4. Summary: Provide a concise (2-3 sentences) professional summary of the overall gap between the candidate and the role.

DO NOT hallucinate skills. Base your analysis ONLY on the provided texts.

Candidate Profile (Structured Resume):

${JSON.stringify(parsedResume, null, 2)}

----------------------

Job Description:

${jobDescription}
`;
}
