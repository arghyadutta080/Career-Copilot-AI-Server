import { llm } from "../llm/gemini";
import { ResumeStructuredSchema } from "../types/resume.schema";

export async function structureResume(rawText: string) {
  try {
    const structuredLLM = llm.gemini35Flash
      .withStructuredOutput(ResumeStructuredSchema)
      .withConfig({
        runName: "Resume Parser Tool",
      });

    const result = await structuredLLM.invoke(`
You are an expert ATS (Applicant Tracking System) resume parser. Your task is to accurately extract and structure all information from the provided resume raw text into the requested schema structure.

Please follow these guidelines strictly:
1. **Contact Information**:
   - **name**: Extract the candidate's full name (usually found at the very beginning of the resume).
   - **email**: Extract the candidate's email address.
   - **phone**: Extract the candidate's phone number.

2. **skills**:
   - Extract all technical, soft, and professional skills listed in the resume (e.g. JavaScript, Python, React, Agile, Leadership). 
   - Parse them as separate, individual string items. Split consolidated lists or comma-separated blocks.

3. **projects**:
   - Extract details of all academic, professional, or personal projects.
   - For each project, parse:
     - **title**: ONLY the name of the project. Keep it short.
     - **description**: A comprehensive paragraph containing the project tagline, the tech stack, all bullet points detailing the implementation, and any links or dates. You MUST extract all these details from the raw text and put them into this description field.

4. **experience**:
   - Extract the candidate's professional work history.
   - For each role/experience, parse:
     - **company**: The name of the organization or employer.
     - **role**: The candidate's title or designation (e.g., Software Engineer, Tech Lead).
     - **duration**: The dates of employment (e.g., "June 2022 - Present", "2021-2023").
     - **responsibilities**: An array of individual sentences/bullet points detailing the responsibilities, actions, and achievements in this role.

5. **education**:
   - Extract the candidate's academic background.
   - For each school/college/university, parse:
     - **institution**: The name of the school or university.
     - **degree**: The degree, major, or specialization (e.g. B.S. in Computer Science).

6. **certifications**:
   - Extract any professional certifications, licenses, courses, or training programs completed (e.g. AWS Solutions Architect, Scrum Master).

7. **achievements**:
   - Extract any honors, awards, publications, contest wins, or other major milestones.

Ensure that all information from the raw text is captured accurately without any hallucinations. If any section or field is missing or not mentioned in the resume text, leave it empty or null as per the schema, but do not drop sections that are clearly present.

Resume raw text:
"""
${rawText}
"""
`);

    return result;
  } catch (error: any) {
    console.error("[RESUME PARSER ERROR]: ", error);
    
    throw new Error("Error in Resume Parser");
  }
}
