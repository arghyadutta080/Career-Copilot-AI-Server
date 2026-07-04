import dotenv from "dotenv";

dotenv.config();

export const env = {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGO_URI || '',
    jwtSecret: process.env.JWT_SECRET || 'secret',
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    geminiKey: process.env.GEMINI_API_KEY || '',
};