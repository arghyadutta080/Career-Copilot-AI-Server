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
STRICT WRITING GUIDELINES
==================================================

• YOU MUST keep the cover letter strictly between 250 and 350 words. Do not exceed this limit.
• Address the letter professionally to the Hiring Team.
• Mention the exact company name and job title naturally.
• Highlight ONLY the candidate's most relevant experience as found in the resume.
• YOU MUST ONLY mention technologies, skills, or projects that explicitly exist in the candidate's resume.
• Leverage the provided ATS and Skill Gap analysis to address alignment and minor gaps positively (e.g., emphasize fast learning ability).
• Tone: Confident, professional, humble.
• NEVER sound overly generic or use excessive buzzwords.
• DO NOT copy sentences directly from the job description.
• DO NOT just repeat the resume as a list.
• Clearly explain WHY the candidate is interested in this specific role and WHY they would be valuable to this specific company.
• End with a strong professional closing.

==================================================
CRITICAL HALLUCINATION RULES
==================================================

YOU MUST NEVER:
- Invent experience, projects, achievements, certifications, or technologies.
- Include placeholders like [Company Name] or [Insert Skill].
- Change the employment history.
- Exaggerate responsibilities.
- Mention skills NOT present in the structured resume.

ANY hallucination is a severe failure.

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