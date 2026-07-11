export function buildAnswerPrompt(
  parsedResume: any,
  jobDescription: string,
  question: string,
  category: string,
  difficulty: string,
) {
  return `
You are an expert technical interviewer and senior software engineer.

Generate a comprehensive, high-quality, professional markdown answer for the following interview question.

==================================================
TARGET JOB DESCRIPTION
==================================================
${jobDescription}

==================================================
CANDIDATE PROFILE (STRUCTURED RESUME)
==================================================
${JSON.stringify(parsedResume, null, 2)}

==================================================
INTERVIEW QUESTION
==================================================
Question: ${question}
Category: ${category}
Difficulty: ${difficulty}

==================================================
INSTRUCTIONS
==================================================
Provide a comprehensive answer in clean Markdown format. The answer MUST include the following sections:
1. **Concept Explanation**: Clear, high-level explanation of the core concept.
2. **Ideal Interview Answer**: A concise, structured response suitable for delivery during an interview.
3. **Practical Examples**: Real-world application scenarios showing how this concept is used in production.
4. **Code Examples**: Well-structured, practical code examples (when applicable).

Return ONLY clean markdown. Do not wrap it in JSON. Do not include markdown code block tags (\`\`\`markdown ... \`\`\`) around the entire response. Start directly with the markdown content.
`;
}
