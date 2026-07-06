import path from "path";
import Resume from "../models/Resume";
import { parsePDF } from "../utils/pdfParser";
import { parseDOCX } from "../utils/docxParser";
import { structureResume } from "./parser.service";

export async function createResume(userId: string, file: any) {
  const ext = path.extname(file.originalname);

  let rawText = "";

  if (ext === ".pdf") rawText = await parsePDF(file.path);
  else rawText = await parseDOCX(file.path);

  console.log("[TESTING] rawText: ", rawText);

  const parsedData = await structureResume(rawText);

  console.log("[TESTING] parsedData: ", parsedData);

  const resume = await Resume.create({
    userId,

    originalName: file.originalname,

    filename: file.filename,

    filePath: file.path,

    rawText,

    parsedData,
  });

  return resume;
}
