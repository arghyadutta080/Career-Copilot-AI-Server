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
        hr: [
          {
            id: String,
            question: String,
            difficulty: String,
            topics: [String],
            answer: String,
          },
        ],

        resumeBased: [
          {
            id: String,
            question: String,
            topics: [String],
            answer: String,
          },
        ],

        experienceBased: [
          {
            id: String,
            question: String,
            topics: [String],
            answer: String,
          },
        ],

        projectBased: [
          {
            id: String,
            question: String,
            topics: [String],
            answer: String,
          },
        ],

        technical: [
          {
            id: String,
            question: String,
            difficulty: String,
            topics: [String],
            answer: String,
          },
        ],

        coding: [
          {
            id: String,
            question: String,
            difficulty: String,
            topics: [String],
            answer: String,
          },
        ],

        behavioral: [
          {
            id: String,
            question: String,
            topics: [String],
            answer: String,
          },
        ],

        followUps: [
          {
            parentQuestion: String,
            followUps: [
              {
                id: String,
                question: String,
                difficulty: String,
                topics: [String],
                answer: String,
              },
            ],
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
                    title: String,
                    type: { type: String },
                    query: String,
                    reason: String,
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
