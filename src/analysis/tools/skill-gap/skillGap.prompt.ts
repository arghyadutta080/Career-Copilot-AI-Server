export function buildSkillGapPrompt(resume: string, jobDescription: string) {
  return `
You are an experienced engineering hiring manager.

Compare this resume with the job description.

Identify:

1. Missing skills.

2. Skills that should be learned.

3. Prioritize the learning order.

4. Give a concise summary.

Resume:

${resume}

----------------------

Job Description:

${jobDescription}
`;
}
