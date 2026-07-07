import { ATSResult } from "../ats/ats.schema";
import { SkillGapResult } from "../skill-gap/skillGap.schema";
import { ResumeOptimizerResult } from "../resume-optimizer/optimizer.schema";
import { InterviewResult } from "../interview/interview.schema";

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

${JSON.stringify(interview, null, 2)}

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

Resources MUST be realistic.

Recommend only well-known resources.

Resource types may include:

- Official Documentation
- MDN
- Microsoft Learn
- Google Developers
- MongoDB University
- React Docs
- TypeScript Handbook
- Python Docs
- Node.js Docs
- Express Docs
- PostgreSQL Docs
- Docker Docs
- Kubernetes Docs
- LangChain Docs
- OpenAI Docs
- Anthropic Docs
- YouTube
- FreeCodeCamp
- GeeksForGeeks
- NeetCode
- LeetCode
- System Design Primer
- High-quality engineering blogs

Do NOT invent websites.

Do NOT invent URLs.

For every resource provide:

- title
- type
- search query
- reason

The query should help the frontend search the resource later.

Example:

title:
MongoDB Aggregation Pipeline

type:
Official Docs

query:
MongoDB Aggregation Pipeline Documentation

reason:
Required for backend interview preparation.

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
