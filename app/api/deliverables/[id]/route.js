import connectToDatabase from "@/lib/mongodb";
import Deliverable from "@/models/Deliverable";
import { jsonResponse } from "@/lib/utils";
import { logActivity } from "@/lib/activity";
import mongoose from "mongoose";

export const runtime = "nodejs";

/**
 * GET /api/deliverables/[id]
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonResponse(false, "Invalid deliverable ID format", null, 400);
    }

    await connectToDatabase();

    const deliverable = await Deliverable.findById(id).populate("project", "title client status");
    if (!deliverable) {
      return jsonResponse(false, "Deliverable not found", null, 404);
    }

    return jsonResponse(true, "Deliverable fetched successfully", deliverable);
  } catch (error) {
    console.error("GET /api/deliverables/[id] error:", error);
    return jsonResponse(false, error.message || "Failed to fetch deliverable", null, 500);
  }
}

/**
 * PATCH /api/deliverables/[id]
 * Submit, Approve, Request Revision, or update deliverable
 */
export async function PATCH(request, { params }) {
  try {
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonResponse(false, "Invalid deliverable ID format", null, 400);
    }

    await connectToDatabase();

    const current = await Deliverable.findById(id);
    if (!current) {
      return jsonResponse(false, "Deliverable not found", null, 404);
    }

    const body = await request.json();
    const { title, description, dueDate, fileUrl, status, revisionNotes } = body;

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    if (fileUrl !== undefined) {
      if (fileUrl.trim()) {
        const urlPattern = /^https?:\/\/.+/i;
        if (!urlPattern.test(fileUrl.trim())) {
          return jsonResponse(false, "Attachment URL must start with http:// or https://", null, 400);
        }
      }
      updateData.fileUrl = fileUrl.trim();
    }

    if (revisionNotes !== undefined) {
      updateData.revisionNotes = revisionNotes.trim();
    }

    // Handle status workflow transitions & history
    if (status !== undefined && status !== current.status) {
      updateData.status = status;

      const historyEntry = {
        status,
        date: new Date(),
        notes: revisionNotes || (status === "Submitted" ? "Submitted link for review" : `Status updated to ${status}`),
      };

      updateData.$push = { history: historyEntry };

      if (status === "Submitted") {
        updateData.submissionDate = new Date();
        await logActivity({
          project: current.project,
          title: "Deliverable Submitted",
          description: `Deliverable "${current.title}" submitted for client review`,
          type: "DELIVERABLE_SUBMITTED",
        });
      } else if (status === "Approved") {
        await logActivity({
          project: current.project,
          title: "Deliverable Approved",
          description: `Deliverable "${current.title}" marked as approved`,
          type: "DELIVERABLE_APPROVED",
        });
      } else if (status === "Revision Required") {
        await logActivity({
          project: current.project,
          title: "Revision Requested",
          description: `Revision requested for "${current.title}": ${revisionNotes || "Changes needed"}`,
          type: "REVISION_REQUESTED",
        });
      }
    }

    const updatedDeliverable = await Deliverable.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("project", "title client status");

    return jsonResponse(true, "Deliverable updated successfully", updatedDeliverable);
  } catch (error) {
    console.error("PATCH /api/deliverables/[id] error:", error);
    return jsonResponse(false, error.message || "Failed to update deliverable", null, 500);
  }
}

/**
 * DELETE /api/deliverables/[id]
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonResponse(false, "Invalid deliverable ID format", null, 400);
    }

    await connectToDatabase();

    const deleted = await Deliverable.findByIdAndDelete(id);
    if (!deleted) {
      return jsonResponse(false, "Deliverable not found", null, 404);
    }

    return jsonResponse(true, "Deliverable deleted successfully", { id });
  } catch (error) {
    console.error("DELETE /api/deliverables/[id] error:", error);
    return jsonResponse(false, error.message || "Failed to delete deliverable", null, 500);
  }
}
