export function buildATSPrompt(resume: string, jobDescription: string) {
  return `
You are an experienced Applicant Tracking System (ATS).

Compare the given resume against the job description.

Evaluate the resume professionally.

Consider:

- Skill match
- Technologies
- Experience relevance
- Missing keywords
- Overall suitability

Return:

1. score (0-100)

2. strengths
(List of strings)

3. weaknesses
(List of strings)

4. missingKeywords
(List of strings)

5. summary
(2-3 concise sentences)

Resume:

${resume}

-------------------------

Job Description:

${jobDescription}
`;
}
