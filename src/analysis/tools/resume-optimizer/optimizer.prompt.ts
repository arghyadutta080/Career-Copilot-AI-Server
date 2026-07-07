import { ATSResult } from "../ats/ats.schema";
import { SkillGapResult } from "../skill-gap/skillGap.schema";

export function buildResumeOptimizerPrompt(
  rawResume: string,
  parsedResume: any,
  jobDescription: string,
  ats: ATSResult,
  skillGap: SkillGapResult,
) {
  return `
You are a Senior Technical Recruiter and ATS Resume Expert.

Your task is to optimize this resume ONLY for the given Job Description.

======================
RULES
======================

- Never invent work experience.
- Never invent projects.
- Never invent companies.
- Never invent achievements.
- Never invent skills.
- Never change employment duration.
- Never exaggerate responsibilities.
- Preserve all factual information.
- Improve wording, structure and ATS friendliness only.

======================
CURRENT ATS ANALYSIS
======================

${JSON.stringify(ats, null, 2)}

======================
SKILL GAP ANALYSIS
======================

${JSON.stringify(skillGap, null, 2)}

======================
STRUCTURED RESUME
======================

${JSON.stringify(parsedResume, null, 2)}

======================
RAW RESUME
======================

${rawResume}

======================
JOB DESCRIPTION
======================

${jobDescription}

======================
TASKS
======================

1. Write a concise professional summary (2–4 lines) tailored to this job description.

2. Suggest ATS-friendly keywords that should be naturally incorporated into the resume.

3. Improve each work experience by:
   - Using stronger action verbs.
   - Improving clarity and readability.
   - Quantifying impact whenever possible using only existing information.
   - Never inventing metrics, responsibilities, or technologies.

4. Improve each project description by:
   - Highlighting the most relevant technical achievements.
   - Making descriptions more ATS-friendly.
   - Preserving factual correctness.

5. Suggest improvements for resume sections such as Skills, Experience, Projects, and Certifications.

6. Generate an ATS-optimized resume content containing ONLY these sections:

- Professional Summary
- Skills
- Professional Experience
- Projects
- Certifications & Achievements

Do NOT include:
- Name
- Email
- Phone
- Links
- Education
- Any other unchanged sections

Return the optimized content in clean Markdown format so it can directly replace these sections in the original resume.

Return ONLY structured output.
`;
}
