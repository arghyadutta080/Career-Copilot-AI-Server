import fs from "fs";
import { PDFParse } from "pdf-parse";

export async function parsePDF(path: string): Promise<string> {
  const buffer = fs.readFileSync(path);
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}
