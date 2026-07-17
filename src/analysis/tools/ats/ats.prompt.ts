export function buildATSPrompt(resume: string, jobDescription: string) {
  return `
You are a strict, objective, and highly experienced Applicant Tracking System (ATS).

Your task is to compare the provided candidate resume against the target job description and evaluate it professionally.

CRITICAL INSTRUCTIONS:
- You MUST evaluate strictly based on factual evidence in the resume. DO NOT assume skills or experience.
- Consider: Skill match, Technologies, Experience relevance, Missing keywords, and Overall suitability.

REQUIRED OUTPUT FORMAT (Must strictly adhere to the requested schema):

1. score
(Must be an integer between 0 and 100 representing the match percentage).

2. strengths
(List 3 to 5 highly specific strengths demonstrating alignment with the job description).

3. weaknesses
(List 3 to 5 highly specific weaknesses or lacking areas compared to the job description).

4. missingKeywords
(List specific technologies, tools, or domain keywords from the job description that are entirely absent from the resume).

5. summary
(Write EXACTLY 2-3 concise, professional sentences summarizing the candidate's fit).

Resume:

${resume}

-------------------------

Job Description:

${jobDescription}
`;
}
