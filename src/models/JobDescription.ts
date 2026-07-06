import mongoose from "mongoose";

const JobDescriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    company: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      required: true,
    },

    extractedSkills: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("JobDescription", JobDescriptionSchema);
