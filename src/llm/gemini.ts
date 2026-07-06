import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { env } from "../config/env";

export const llm = new ChatGoogleGenerativeAI({
    model: "gemini-3.1-pro-preview",
    apiKey: env.geminiKey,
    temperature: 0.2,
    maxRetries: 3
});