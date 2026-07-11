import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },

    originalName: {
      type: String,
      required: true,
    },

    filename: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    rawText: {
      type: String,
    },

    parsedData: {
      name: String,
      email: String,
      phone: String,

      skills: [String],

      projects: [
        {
          title: String,
          description: String,
        },
      ],

      experience: [
        {
          company: String,
          role: String,
          duration: String,
          responsibilities: [String],
        },
      ],

      education: [
        {
          institution: String,
          degree: String,
        },
      ],

      certifications: [String],

      achievements: [String],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Resume", ResumeSchema);
