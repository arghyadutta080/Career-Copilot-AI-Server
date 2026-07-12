import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { env } from "../config/env";

export enum GeminiModel {
  GEMINI_3_1_FLASH_LITE = "gemini-3.1-flash-lite",
  GEMINI_3_5_FLASH = "gemini-3.5-flash",
}

export function createChatModel(
  model: GeminiModel | string,
  temperature: number = 0.2,
  maxRetries: number = 3,
) {
  return new ChatGoogleGenerativeAI({
    model,
    apiKey: env.geminiKey,
    temperature,
    maxRetries,
  });
}

export const llm = {
  gemini31FlashLite: createChatModel(GeminiModel.GEMINI_3_1_FLASH_LITE),
  gemini35Flash: createChatModel(GeminiModel.GEMINI_3_5_FLASH),
};
