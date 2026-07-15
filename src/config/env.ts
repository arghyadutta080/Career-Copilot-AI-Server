import dotenv from "dotenv";

dotenv.config();

export const env = {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGO_URI || '',
    jwtSecret: process.env.JWT_SECRET || 'secret',
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    youtubeApiKey: process.env.YOUTUBE_API_KEY || '',
    geminiKey: process.env.GEMINI_API_KEY || '',
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
    langsmithTracing: process.env.LANGSMITH_TRACING || '',
    langsmithEndpoint: process.env.LANGSMITH_ENDPOINT || '',
    langsmithApiKey: process.env.LANGSMITH_API_KEY || '',
    langsmithProject: process.env.LANGSMITH_PROJECT || '',
    allowedOrigins: process.env.ALLOWED_ORIGINS || "http://localhost:3000,http://localhost:3001",
};

export const PLAN_LIMITS = {
  FREE: Number(process.env.FREE_ANALYSIS_LIMIT) || 3,
  PRO: Number(process.env.PRO_ANALYSIS_LIMIT) || 100,
  ENTERPRISE: Number(process.env.ENTERPRISE_ANALYSIS_LIMIT) || 999999,
} as const;

export type Plan = keyof typeof PLAN_LIMITS;