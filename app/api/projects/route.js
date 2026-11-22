import connectToDatabase from "@/lib/mongodb";
import Project from "@/models/Project";
import Client from "@/models/Client";
import { jsonResponse } from "@/lib/utils";
import { logActivity } from "@/lib/activity";
import { rupeesToPaise } from "@/lib/calculations";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/projects
 * List projects with filters, search, and sorting
 */
export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const clientId = searchParams.get("client") || "";
    const status = searchParams.get("status") || "";
    const priority = searchParams.get("priority") || "";
    const sort = searchParams.get("sort") || "newest";

    const query = {};

    if (clientId && mongoose.Types.ObjectId.isValid(clientId)) {
      query.client = clientId;
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === "deadline") {
      sortOption = { deadline: 1 };
    } else if (sort === "budget") {
      sortOption = { agreedAmount: -1 };
    } else if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    }

    const projects = await Project.find(query)
      .populate("client", "fullName company email")
      .sort(sortOption);

    return jsonResponse(true, "Projects fetched successfully", projects);
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return jsonResponse(false, error.message || "Failed to fetch projects", null, 500);
  }
}

/**
 * POST /api/projects
 * Create a new project
 */
export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const {
      title,
      client,
      description,
      budget,
      agreedAmount,
      startDate,
      deadline,
      priority,
      status,
    } = body;

    if (!title || !title.trim()) {
      return jsonResponse(false, "Project title is required", null, 400);
    }

    if (!client || !mongoose.Types.ObjectId.isValid(client)) {
      return jsonResponse(false, "A valid client must be selected", null, 400);
    }

    const clientRecord = await Client.findById(client);
    if (!clientRecord) {
      return jsonResponse(false, "Selected client does not exist", null, 404);
    }

    if (agreedAmount === undefined || Number(agreedAmount) < 0) {
      return jsonResponse(false, "Valid agreed payment amount is required", null, 400);
    }

    if (!deadline) {
      return jsonResponse(false, "Project deadline date is required", null, 400);
    }

    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(deadline);

    if (end < start) {
      return jsonResponse(false, "Project deadline cannot be earlier than start date", null, 400);
    }

    const agreedPaise = rupeesToPaise(agreedAmount);
    const budgetPaise = budget !== undefined ? rupeesToPaise(budget) : agreedPaise;

    const newProject = await Project.create({
      title: title.trim(),
      client,
      description: (description || "").trim(),
      budget: budgetPaise,
      agreedAmount: agreedPaise,
      startDate: start,
      deadline: end,
      priority: priority || "Medium",
      status: status || "Planning",
      progress: 0,
    });

    await newProject.populate("client", "fullName company email");

    await logActivity({
      project: newProject._id,
      title: "Project Created",
      description: `Created project "${newProject.title}" for ${clientRecord.fullName}`,
      type: "PROJECT_CREATED",
    });

    return jsonResponse(true, "Project created successfully", newProject, 201);
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return jsonResponse(false, error.message || "Failed to create project", null, 500);
  }
}
