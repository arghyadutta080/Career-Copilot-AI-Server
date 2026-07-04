import mongoose from "mongoose";
import { env } from "./env";

export const connectDB = async () => {
    try {
        await mongoose.connect(env.mongoUri);

        console.log("MongoDB Connected");
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};