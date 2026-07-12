import { llm } from "../llm/gemini";

export async function testAI() {
    const response = await llm.gemini31FlashLite.invoke(
        "Reply only with: Hello from Gemini"
    );

    console.log(response.content);
}