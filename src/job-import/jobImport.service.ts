import { llm } from "../llm/gemini";
import { cleanHtml } from "./htmlCleaner";
import { buildJobImportPrompt } from "./jobImport.prompt";
import { jobImportSchema, JobImportOutput } from "./jobImport.schema";

export async function importJobFromUrl(url: string): Promise<JobImportOutput> {
  // 1. Fetch the webpage
  let html = "";
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch webpage, status: ${response.status}`);
    }
    
    html = await response.text();
  } catch (error: any) {
    throw new Error(`BAD_FETCH: ${error.message}`);
  }

  // 2. Clean HTML and extract readable content
  const cleanedText = cleanHtml(html, url);

  if (!cleanedText || cleanedText.length < 50) {
    throw new Error("NO_CONTENT: Unable to extract meaningful job information from the provided webpage.");
  }

  // 3. Use LangChain + Gemini to extract structured output
  try {
    const model = llm.gemini31FlashLite.withStructuredOutput(jobImportSchema, {
      name: "extract_job_details",
    });

    const promptText = buildJobImportPrompt(cleanedText, url);

    console.log(`[jobImportService] Invoking LLM with prompt length: ${promptText.length}`);

    const result = await model.invoke(promptText);
    
    console.log(`[jobImportService] LLM Result:`, JSON.stringify(result, null, 2));

    if (result.title === "Unknown Title" || result.company === "Unknown Company") {
      throw new Error("NO_CONTENT: Unable to extract meaningful job information from the provided webpage.");
    }

    return result as JobImportOutput;
  } catch (error: any) {
    console.error("LLM Extraction error:", error);
    throw new Error(`EXTRACTION_ERROR: Unexpected extraction error.`);
  }
}
