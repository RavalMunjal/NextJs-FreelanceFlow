import connectToDatabase from "@/lib/mongodb";
import Deliverable from "@/models/Deliverable";
import Project from "@/models/Project";
import { jsonResponse } from "@/lib/utils";
import { logActivity } from "@/lib/activity";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/deliverables
 * List deliverables with project and status filters
 */
export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const projectId = searchParams.get("project") || "";
    const status = searchParams.get("status") || "";

    const query = {};

    if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
      query.project = projectId;
    }

    if (status) {
      query.status = status;
    }

    if (search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const deliverables = await Deliverable.find(query)
      .populate("project", "title client status")
      .sort({ dueDate: 1, createdAt: -1 });

    return jsonResponse(true, "Deliverables fetched successfully", deliverables);
  } catch (error) {
    console.error("GET /api/deliverables error:", error);
    return jsonResponse(false, error.message || "Failed to fetch deliverables", null, 500);
  }
}

/**
 * POST /api/deliverables
 * Create a new deliverable requirement
 */
export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { project, title, description, dueDate, fileUrl, status, revisionNotes } = body;

    // Validation
    if (!title || !title.trim()) {
      return jsonResponse(false, "Deliverable title is required", null, 400);
    }

    if (!project || !mongoose.Types.ObjectId.isValid(project)) {
      return jsonResponse(false, "Valid project reference is required", null, 400);
    }

    const projectRecord = await Project.findById(project);
    if (!projectRecord) {
      return jsonResponse(false, "Selected project does not exist", null, 404);
    }

    if (fileUrl && fileUrl.trim()) {
      const urlPattern = /^https?:\/\/.+/i;
      if (!urlPattern.test(fileUrl.trim())) {
        return jsonResponse(false, "Attachment URL must start with http:// or https://", null, 400);
      }
    }

    const initialStatus = status || "Pending";
    const historyItem = {
      status: initialStatus,
      date: new Date(),
      notes: "Deliverable item created",
    };

    const newDeliverable = await Deliverable.create({
      project,
      title: title.trim(),
      description: (description || "").trim(),
      dueDate: dueDate ? new Date(dueDate) : null,
      fileUrl: (fileUrl || "").trim(),
      status: initialStatus,
      revisionNotes: (revisionNotes || "").trim(),
      history: [historyItem],
    });

    await newDeliverable.populate("project", "title client");

    // Log Activity
    await logActivity({
      project,
      title: "Deliverable Created",
      description: `Created deliverable "${newDeliverable.title}" for project "${projectRecord.title}"`,
      type: "DELIVERABLE_CREATED",
    });

    return jsonResponse(true, "Deliverable created successfully", newDeliverable, 201);
  } catch (error) {
    console.error("POST /api/deliverables error:", error);
    return jsonResponse(false, error.message || "Failed to create deliverable", null, 500);
  }
}
