import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
    },

    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    avatar: {
      type: String,
    },

    currentRole: {
      type: String,
      default: "",
    },

    experience: {
      type: Number,
      default: 0,
    },

    preferences: {
      targetRole: String,
      location: String,
      remote: Boolean,
      expectedSalary: Number,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("User", UserSchema);
