import mongoose from "mongoose";

const QuestionAnswerSchema = {
  content: { type: String, default: null },
  status: {
    type: String,
    enum: ["not_started", "generating", "completed", "failed"],
    default: "not_started"
  },
  generatedAt: { type: String, default: null }
};

const InterviewQuestionSchema = {
  id: String,
  question: String,
  difficulty: String,
  topics: [String],
  answer: {
    type: QuestionAnswerSchema,
    default: () => ({ content: null, status: "not_started", generatedAt: null })
  }
};

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

    toolStatus: {
      ats: {
        type: String,
        enum: ["not_started", "running", "completed", "failed"],
        default: "not_started",
      },

      skillGap: {
        type: String,
        enum: ["not_started", "running", "completed", "failed"],
        default: "not_started",
      },

      optimizer: {
        type: String,
        enum: ["not_started", "running", "completed", "failed"],
        default: "not_started",
      },

      coverLetter: {
        type: String,
        enum: ["not_started", "running", "completed", "failed"],
        default: "not_started",
      },

      interview: {
        type: String,
        enum: ["not_started", "running", "completed", "failed"],
        default: "not_started",
      },

      roadmap: {
        type: String,
        enum: ["not_started", "running", "completed", "failed"],
        default: "not_started",
      },
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
        hr: [InterviewQuestionSchema],
        resumeBased: [InterviewQuestionSchema],
        experienceBased: [InterviewQuestionSchema],
        projectBased: [InterviewQuestionSchema],
        technical: [InterviewQuestionSchema],
        coding: [InterviewQuestionSchema],
        behavioral: [InterviewQuestionSchema],
        followUps: [
          {
            parentQuestion: String,
            followUps: [InterviewQuestionSchema],
          },
        ],
      },

      roadmap: {
        overview: String,

        milestones: [
          {
            title: String,
            description: String,

            steps: [
              {
                order: Number,
                title: String,
                description: String,
                priority: String,
                estimatedHours: Number,

                resources: [
                  {
                    id: String,
                    title: String,
                    query: String,
                    reason: String,
                    urls: { type: [String], default: [] },
                  },
                ],

                outcomes: [String],
              },
            ],
          },
        ],

        interviewChecklist: [String],
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
