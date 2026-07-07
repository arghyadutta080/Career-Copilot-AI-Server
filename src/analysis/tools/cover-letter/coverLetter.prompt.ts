import { ATSResult } from "../ats/ats.schema";
import { SkillGapResult } from "../skill-gap/skillGap.schema";
import { ResumeOptimizerResult } from "../resume-optimizer/optimizer.schema";

export function buildCoverLetterPrompt(
  parsedResume: any,
  jobTitle: string,
  company: string,
  jobDescription: string,
  ats: ATSResult,
  skillGap: SkillGapResult,
  optimizer: ResumeOptimizerResult,
) {
  return `
You are a Senior Technical Recruiter and Hiring Manager with over 15 years of experience recruiting Software Engineers at top technology companies.

Your task is to write a highly personalized, ATS-friendly, professional cover letter tailored specifically for this role.

==================================================
JOB INFORMATION
==================================================

Job Title:
${jobTitle}

Company:
${company}

Job Description:

${jobDescription}

==================================================
CANDIDATE PROFILE
==================================================

Structured Resume:

${JSON.stringify(parsedResume, null, 2)}

==================================================
ATS ANALYSIS
==================================================

${JSON.stringify(ats, null, 2)}

==================================================
SKILL GAP ANALYSIS
==================================================

${JSON.stringify(skillGap, null, 2)}

==================================================
RESUME OPTIMIZATION
==================================================

${JSON.stringify(optimizer, null, 2)}

==================================================
OBJECTIVE
==================================================

Generate a compelling cover letter that maximizes the candidate's chances of getting shortlisted.

The letter should naturally demonstrate how the candidate's experience aligns with the job requirements.

==================================================
WRITING GUIDELINES
==================================================

• Keep the cover letter between 250 and 350 words.

• Address the letter to the Hiring Team.

• Mention the company name naturally.

• Mention the job title naturally.

• Highlight the candidate's most relevant experience.

• Mention only technologies that already exist in the resume.

• Leverage ATS analysis and resume optimization suggestions wherever appropriate.

• Acknowledge any minor skill gaps positively by emphasizing the candidate's ability to learn quickly.

• Sound confident but humble.

• Never sound overly generic.

• Avoid buzzword stuffing.

• Do not copy sentences from the job description.

• Do not repeat the resume.

• Explain WHY the candidate is interested in this role.

• Explain WHY the candidate would be valuable to this company.

• End with a strong professional closing expressing interest in discussing the opportunity further.

==================================================
STRICT RULES
==================================================

NEVER:

- Invent experience.
- Invent projects.
- Invent achievements.
- Invent certifications.
- Invent technologies.
- Change employment history.
- Exaggerate responsibilities.
- Mention skills not present in the resume.

==================================================
OUTPUT FORMAT
==================================================

Return ONLY structured output.

The "subject" should be concise and professional.

Examples:

Application for Full Stack Engineer

Application for Software Engineer

Application for React Developer

The "content" should contain valid GitHub-Flavored Markdown.

Use actual newline characters.

Do NOT escape newline characters as "\\n".

Do NOT wrap the content inside triple backticks.
`;
}