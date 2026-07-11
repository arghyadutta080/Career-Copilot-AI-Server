export function buildSkillGapPrompt(parsedResume: any, jobDescription: string) {
  return `
You are an experienced engineering hiring manager.

Compare this resume with the job description.

Identify:

1. Missing skills.

2. Skills that should be learned.

3. Prioritize the learning order.

4. Give a concise summary.

Candidate Profile (Structured Resume):

${JSON.stringify(parsedResume, null, 2)}

----------------------

Job Description:

${jobDescription}
`;
}
