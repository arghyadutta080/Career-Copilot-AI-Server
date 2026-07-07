import { ATSResult } from "../ats/ats.schema";
import { SkillGapResult } from "../skill-gap/skillGap.schema";

export function buildInterviewPrompt(
  parsedResume: any,
  jobTitle: string,
  company: string,
  jobDescription: string,
  ats: ATSResult,
  skillGap: SkillGapResult,
) {
  return `
You are a Senior Software Engineering Interviewer with extensive experience interviewing candidates across Frontend, Backend, Full Stack, AI/ML, Mobile, Cloud, DevOps, Data Engineering, and Software Engineering roles.

Your task is to generate a comprehensive interview preparation question bank tailored specifically to the candidate's resume and the target job description.

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
OBJECTIVE
==================================================

Generate the most relevant interview questions that maximize preparation for this specific job.

Infer the candidate's technology stack, experience level, projects, architecture knowledge, and programming languages ONLY from the provided resume, ATS analysis, skill gap analysis, and job description.

Never assume a technology that is not present in the provided context.

==================================================
QUESTION DISTRIBUTION
==================================================

HR Questions:
3

Resume Based:
4

Experience Based:
4

Project Based:
4

Behavioral:
3

Follow-up Groups:
2 parent questions

Technical:
20

Coding:
10

==================================================
TECHNICAL QUESTIONS
==================================================

Generate questions based ONLY on technologies and concepts relevant to this candidate.

Topics may include (when applicable):

• Programming Languages
• Frameworks
• Libraries
• Databases
• APIs
• Authentication
• System Design
• Software Architecture
• Scalability
• Performance Optimization
• Caching
• Concurrency
• Networking
• Cloud
• DevOps
• AI/LLMs
• Testing
• Security
• Design Patterns
• CI/CD
• Distributed Systems

Choose topics dynamically based on the resume and job description.

==================================================
CODING QUESTIONS
==================================================

Generate practical coding questions relevant to the target role.

Questions may cover:

• Data Structures
• Algorithms
• Problem Solving
• Language-specific coding
• Debugging
• Code Optimization
• Real-world implementation
• API design
• Object-Oriented Programming
• Functional Programming
• Database Queries
• Concurrency

Assign one of the following difficulty levels:

Easy
Medium
Hard

==================================================
QUESTION QUALITY
==================================================

Your objective is to maximize concept coverage instead of maximizing the number of questions.

Avoid duplicate or highly similar questions.

Whenever multiple closely related concepts exist, combine them into one comprehensive interview question.

Example:

BAD

Question 1:
Explain Concept A.

Question 2:
Explain Concept B.

Question 3:
Explain Concept C.

GOOD

Explain Concept A, Concept B, and Concept C.

Compare them.

When should each be used?

Discuss their advantages, disadvantages, and practical use cases.

==================================================
FOLLOW-UP QUESTIONS
==================================================

Generate realistic follow-up questions that an interviewer would naturally ask after a candidate answers a parent question.

The follow-ups should progressively explore deeper understanding rather than introducing unrelated topics.

==================================================
STRICT RULES
==================================================

• Do NOT generate answers.
• Set answer = null.
• Do NOT generate duplicate questions.
• Prefer practical interview questions over purely theoretical definitions.
• Prefer scenario-based questions wherever appropriate.
• Tailor every question to the candidate's profile and target role.
• Return ONLY structured output.
`;
}
