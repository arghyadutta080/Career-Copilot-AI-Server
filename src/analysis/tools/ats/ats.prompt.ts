export function buildATSPrompt(resume: string, jobDescription: string) {
  return `
You are an experienced ATS reviewer.

Compare the following resume with the job description.

Return:

- ATS score (0-100)
- Strengths
- Weaknesses
- Missing Keywords
- Short Summary

Resume:

${resume}

Job Description:

${jobDescription}
`;
}
