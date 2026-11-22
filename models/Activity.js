import mongoose from "mongoose";

// Activity log schema definition
const ActivitySchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Activity title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Activity description is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Activity type is required"],
      trim: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Prevent model overwrite error in Next.js
const Activity = mongoose.models.Activity || mongoose.model("Activity", ActivitySchema);

export default Activity;
