import mongoose from "mongoose";

// Project schema definition
const ProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "Client reference is required"],
      index: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    budget: {
      type: Number,
      default: 0,
      min: [0, "Budget cannot be negative"],
    },
    agreedAmount: {
      type: Number,
      required: [true, "Agreed payment amount is required"],
      min: [0, "Agreed amount cannot be negative"],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
      required: [true, "Project deadline is required"],
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Planning", "In Progress", "On Hold", "Completed", "Cancelled"],
      default: "Planning",
      index: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model overwrite error in Next.js
const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);

export default Project;
