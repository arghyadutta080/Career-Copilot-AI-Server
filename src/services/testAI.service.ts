import { llm } from "../llm/gemini";

export async function testAI() {
    const response = await llm.invoke(
        "Reply only with: Hello from Gemini"
    );

    console.log(response.content);
}