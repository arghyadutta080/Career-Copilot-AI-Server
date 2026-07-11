export function buildAnswerPrompt(
  parsedResume: any,
  jobDescription: string,
  question: string,
  category: string,
  difficulty: string,
) {
  const lowercaseCategory = (category || "").toLowerCase();

  let instructionsText = "";
  if (lowercaseCategory === "coding") {
    instructionsText = `Provide a comprehensive answer in clean Markdown format. Since this is a coding question, the answer MUST only include the following sections in order:

1. **Code Implementation**:
   - Provide a high-standard, clean, and production-ready code implementation (following best practices, correct types, proper syntax, and standard conventions) because the interviewer will review it.

2. **Code Explanation**:
   - Provide a clear, step-by-step technical explanation of the implemented code, its logic, and its time/space complexity (Big O).

Do NOT include sections like "Ideal Interview Answer" or "Practical Examples" for coding questions. Only write the code and explanation for that code.`;
  } else {
    // Custom instructions for Code Examples based on the question category
    let codeInstructions = "";
    if (lowercaseCategory === "technical") {
      codeInstructions = `
4. **Code Examples**: Provide a simplified/instructive coding example purely to help the candidate understand the concept (keep it clear and educational).`;
    } else {
      codeInstructions = `
Do NOT include any **Code Examples** or code snippet blocks for this category ("${category}"). Focus purely on the verbal/conceptual explanation.`;
    }

    instructionsText = `Provide a comprehensive answer in clean Markdown format. The answer MUST include the following sections in order:

1. **Concept Explanation (Layman's Terms)**: 
   - Explain the concept first in very simple, layman language so the candidate can easily grasp it.
   - Prepend this explanation with a clear, small callout: *"(Note: This part is for your quick understanding. Do not say this directly in the interview)"*.

2. **Ideal Interview Answer**:
   - Provide a concise, structured response tailored for delivery to the interviewer.
   - Focus on explaining the topic in a short but appropriate way, making sure to highlight proper industry keywords.
   - Include a concrete, concise verbal example showing how to explain it in action (where applicable).

3. **Practical Examples**:
   - Provide real-world application scenarios showing how this concept is used in production.
${codeInstructions}`;
  }

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
${instructionsText}

Return ONLY clean markdown. Do not wrap it in JSON. Do not include markdown code block tags (\`\`\`markdown ... \`\`\`) around the entire response. Start directly with the markdown content.
`;
}
