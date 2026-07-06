import mongoose from "mongoose";

const AnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },

    resumeId: {
      type: mongoose.Types.ObjectId,
      ref: "Resume",
      required: true,
    },

    jobDescriptionId: {
      type: mongoose.Types.ObjectId,
      ref: "JobDescription",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "running", "completed", "failed"],
      default: "pending",
    },

    results: {
      ats: {
        score: Number,
        strengths: [String],
        weaknesses: [String],
        missingKeywords: [String]
      },

      skillGap: {
        missingSkills: [String],
      },

      interview: {
        questions: [String],
      },

      roadmap: {
        steps: [String],
      },

      optimizer: {
        optimizedResume: String,
      },

      coverLetter: {
        content: String,
      },
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Analysis", AnalysisSchema);
