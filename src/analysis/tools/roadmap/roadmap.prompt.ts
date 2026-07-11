import { ATSResult } from "../ats/ats.schema";
import { SkillGapResult } from "../skill-gap/skillGap.schema";
import { ResumeOptimizerResult } from "../resume-optimizer/optimizer.schema";
import { InterviewResult } from "../interview/interview.schema";
import { pruneInterview } from "../../utils/pruneInterview";

export function buildRoadmapPrompt(
  parsedResume: any,
  jobTitle: string,
  company: string,
  jobDescription: string,
  ats: ATSResult,
  skillGap: SkillGapResult,
  optimizer: ResumeOptimizerResult,
  interview: InterviewResult,
) {
  // eliminating answers from question before sending into prompt
  const prunedInterview = pruneInterview(interview);

  return `
You are a Senior Engineering Mentor and Technical Interview Coach.

Your responsibility is to prepare this candidate for the target role by creating a personalized learning roadmap.

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

Resume

${JSON.stringify(parsedResume, null, 2)}

==================================================
ATS ANALYSIS
==================================================

${JSON.stringify(ats, null, 2)}

==================================================
SKILL GAP
==================================================

${JSON.stringify(skillGap, null, 2)}

==================================================
RESUME OPTIMIZATION
==================================================

${JSON.stringify(optimizer, null, 2)}

==================================================
INTERVIEW QUESTIONS
==================================================

${JSON.stringify(prunedInterview, null, 2)}

==================================================
OBJECTIVE
==================================================

Generate a personalized learning roadmap.

Prioritize:

1. Missing critical skills.
2. Weak ATS areas.
3. Frequently asked interview topics.
4. Technologies required by the job.
5. High-impact concepts.

Avoid teaching topics the candidate already demonstrates strong proficiency in unless advanced mastery would significantly improve interview performance.

==================================================
ROADMAP DESIGN
==================================================

Create 4–6 milestones.

Each milestone should contain 3–6 learning steps.

Each learning step should contain:

- Clear title
- Description
- Priority
- Estimated study hours
- Expected learning outcomes
- Recommended learning resources

==================================================
LEARNING RESOURCES
==================================================

Recommend ONLY YouTube videos.
Do NOT recommend blogs.
Do NOT recommend articles.
Do NOT recommend documentation.
Do NOT recommend GitHub repositories.
Do NOT recommend courses.
Do NOT generate YouTube URLs.
The backend will automatically search YouTube.

For every learning resource, return ONLY:

- title
- query
- reason

The search query should be optimized for YouTube search.

Example:

title:
OAuth 2.0 Authentication

query:
OAuth 2.0 OpenID Connect Complete Tutorial English

reason:
Authentication is required for this role.

==================================================
INTERVIEW CHECKLIST
==================================================

Generate a concise checklist that the candidate should revise before interviews.

==================================================
STRICT RULES
==================================================

Do not hallucinate.

Do not recommend random resources.

Recommend only widely trusted learning resources.

Return ONLY structured output.
`;
}
