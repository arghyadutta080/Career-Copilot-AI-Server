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
0 (Always generate exactly 0 questions; return an empty list)

Behavioral:
0 (Always generate exactly 0 questions; return an empty list)

Resume Based:
Dynamically varies from 2 to 7 questions based on the candidate's resume weightage and richness (assessing tech-stack, projects, and experience):
• If the resume has a rich tech-stack, diverse projects, and significant experience, generate more questions (up to 7).
• If the resume is for a college student, fresher, or lacks a strong tech stack/good projects/experience, generate fewer questions (down to 2).

Experience Based:
Dynamically varies from 2 to 7 questions. Follow the same resume weightage and richness rules as Resume Based questions.

Project Based:
Dynamically varies from 2 to 7 questions. Follow the same resume weightage and richness rules as Resume Based questions.

Follow-up Groups:
Dynamically varies from 2 to 7 parent questions (with follow-ups). Follow the same resume weightage and richness rules as Resume Based questions.

Technical:
Generate between 25 and 50 questions, determined strictly by the job description requirements and required skills.

Coding:
Generate between 20 and 30 questions, ranging from Easy to Hard difficulty depending on the job description requirements.

==================================================
TECHNICAL QUESTIONS
==================================================

Generate between 20 and 50 technical questions.

Guidelines:
1. Base questions strictly on the Job Description and the skills/technologies required for the job.
2. Ask relevant questions ONLY to the job requirements.
3. If the candidate has extra skills or technologies in their resume/profile that are NOT required by this job description, AVOID asking about them in this Technical section (such candidate-specific extra skills should only be addressed in the Resume/Experience/Project sections, not here).
4. Ensure questions target the concepts/technologies required for the target role as defined by the Job Description.

Topics may include (when applicable and required for the job):

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

Choose topics dynamically based on the job description requirements and candidate's relevant skills.

==================================================
CODING QUESTIONS
==================================================

Generate between 15 and 30 practical coding questions relevant to the target role.

Guidelines:
1. Base coding questions on the Job Description requirements and target role, not just the candidate's existing tech-stack.
2. Ask relevant coding questions ONLY to the job requirements.
3. If the candidate has extra skills, languages, or technologies that are NOT required by this job description, AVOID asking coding questions on them (these can be discussed in Resume/Experience/Project sections if relevant, but not here).

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

Assign one of the following difficulty levels based on the job description requirements (ranging from Easy to Hard):

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
