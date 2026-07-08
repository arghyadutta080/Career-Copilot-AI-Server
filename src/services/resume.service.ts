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

  console.log("[Resume Service] Extracted rawText\n: ", rawText);

  const parsedData = await structureResume(rawText);

  console.log("[Resume Service] Structured parsedData\n: ", parsedData);

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

export async function getResumeById(userId: string, resumeId: string) {
  return await Resume.findOne({ _id: resumeId, userId });
}

export async function getAllResumes(userId: string) {
  return await Resume.find({ userId }).sort({ createdAt: -1 });
}
