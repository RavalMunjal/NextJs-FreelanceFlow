import mongoose from "mongoose";

// Deliverable schema definition
const DeliverableSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project reference is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Deliverable title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    submissionDate: {
      type: Date,
      default: null,
    },
    fileUrl: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Submitted", "Approved", "Revision Required"],
      default: "Pending",
      index: true,
    },
    revisionNotes: {
      type: String,
      default: "",
      trim: true,
    },
    history: [
      {
        status: { type: String, required: true },
        date: { type: Date, default: Date.now },
        notes: { type: String, default: "" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Prevent model overwrite error in Next.js
const Deliverable =
  mongoose.models.Deliverable || mongoose.model("Deliverable", DeliverableSchema);

export default Deliverable;
