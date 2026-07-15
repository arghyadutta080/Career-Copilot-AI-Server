import mongoose from "mongoose";
import { Plan } from "../config/env";

const UserUsageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    plan: {
      type: String,
      enum: ["FREE", "PRO", "ENTERPRISE"] satisfies Plan[],
      default: "FREE",
    },

    analysisCreated: {
      type: Number,
      default: 0,
    },

    createdAnalysisIds: {
      type: [mongoose.Types.ObjectId],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("UserUsage", UserUsageSchema);
