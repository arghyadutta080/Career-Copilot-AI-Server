import path from "path";
import Resume from "../models/Resume";
import { parsePDF } from "../utils/pdfParser";
import { parseDOCX } from "../utils/docxParser";
import { structureResume } from "./parser.service";
import { uploadToCloudinary } from "../utils/cloudinary";

export async function createResume(userId: string, file: any) {
  const ext = path.extname(file.originalname);

  let rawText = "";

  if (ext === ".pdf") rawText = await parsePDF(file.buffer);
  else rawText = await parseDOCX(file.buffer);

  console.log("[TESTING] rawText: ", rawText);

  const parsedData = await structureResume(rawText);

  console.log("[TESTING] parsedData: ", parsedData);

  // Upload to Cloudinary
  const uploadResult = await uploadToCloudinary(file.buffer, file.originalname);

  const resume = await Resume.create({
    userId,
    originalName: file.originalname,
    filename: uploadResult.public_id,
    filePath: uploadResult.secure_url,
    rawText,
    parsedData,
  });

  return resume;
}
