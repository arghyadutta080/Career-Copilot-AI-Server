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
        missingKeywords: [String],
        summary: String,
      },

      skillGap: {
        missingSkills: [String],
        recommendedSkills: [String],
        learningPriority: [
          {
            skill: String,
            reason: String,
          },
        ],
        summary: String,
      },

      interview: {
        questions: [String],
      },

      roadmap: {
        steps: [String],
      },

      optimizer: {
        overallSummary: String,

        atsImpact: {
          currentScore: Number,
          expectedScore: Number,
          reason: String,
        },

        keywordSuggestions: [String],

        experienceSuggestions: [
          {
            company: String,
            role: String,
            suggestions: [String],
          },
        ],

        projectSuggestions: [
          {
            project: String,
            suggestions: [String],
          },
        ],

        sectionSuggestions: [
          {
            section: String,
            suggestion: String,
          },
        ],

        optimizedContent: String,
      },

      coverLetter: {
        subject: String,
        content: String,
      },
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Analysis", AnalysisSchema);
