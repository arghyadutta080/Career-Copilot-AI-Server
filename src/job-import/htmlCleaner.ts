import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import * as cheerio from "cheerio";

export function cleanHtml(html: string, url: string): string {
  // Try Mozilla Readability first
  try {
    const doc = new JSDOM(html, { url });
    const reader = new Readability(doc.window.document);
    const article = reader.parse();
    
    // Check if Readability extracted meaningful content
    if (article && article.textContent && article.textContent.trim().length > 200) {
      console.log(`[htmlCleaner] Readability successfully extracted ${article.textContent.length} characters.`);
      console.log(`[htmlCleaner] Readability preview: ${article.textContent.substring(0, 150)}...`);
      return article.textContent.trim();
    } else {
      console.log("[htmlCleaner] Readability content too short or missing.");
    }
  } catch (error) {
    console.warn("Readability failed, falling back to Cheerio:", error);
  }

  // Fallback to Cheerio
  try {
    const $ = cheerio.load(html);
    
    // Remove unwanted elements
    $("script, style, nav, footer, header, aside, iframe, noscript").remove();
    
    // Extract text from prioritized tags
    const contentSources = [
      $("article").text(),
      $("main").text(),
      $("body").text()
    ];

    for (const text of contentSources) {
      const cleanText = text.replace(/\s+/g, " ").trim();
      if (cleanText.length > 200) {
        console.log(`[htmlCleaner] Cheerio successfully extracted ${cleanText.length} characters.`);
        console.log(`[htmlCleaner] Cheerio preview: ${cleanText.substring(0, 150)}...`);
        return cleanText;
      }
    }
    console.log("[htmlCleaner] Cheerio could not find sufficient content.");
  } catch (error) {
    console.warn("Cheerio fallback failed:", error);
  }

  return "";
}
