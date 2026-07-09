import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env";
import path from "path";

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
});

/**
 * Uploads a file buffer to Cloudinary using upload_stream
 * @param fileBuffer The raw file buffer
 * @param originalName The original file name (used to construct the public_id)
 * @param folder The target folder in Cloudinary (defaults to 'resumes')
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  originalName: string,
  folder: string = "resumes"
): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);
    const sanitizedBase = baseName.replace(/[^a-zA-Z0-9-_]/g, "_");
    const publicId = `${sanitizedBase}-${Date.now()}${ext}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "raw", // PDFs/Docs are uploaded as raw files
        public_id: publicId,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Cloudinary upload returned empty result"));
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
}

/**
 * Deletes a raw file from Cloudinary using its public_id
 * @param publicId The public ID of the file to delete
 */
export async function deleteFromCloudinary(publicId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(
      publicId,
      { resource_type: "raw" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
  });
}

