import connectToDatabase from "@/lib/mongodb";
import Task from "@/models/Task";
import Project from "@/models/Project";
import { jsonResponse } from "@/lib/utils";
import { logActivity } from "@/lib/activity";
import { calculateProgress } from "@/lib/calculations";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/tasks
 * Fetch tasks with optional filters (project, status, priority, search)
 */
export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const projectId = searchParams.get("project") || "";
    const status = searchParams.get("status") || "";
    const priority = searchParams.get("priority") || "";
    const type = searchParams.get("type") || "";

    const query = {};

    if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
      query.project = projectId;
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (type) {
      query.type = type;
    }

    if (search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const tasks = await Task.find(query)
      .populate("project", "title status client")
      .sort({ dueDate: 1, createdAt: -1 });

    return jsonResponse(true, "Tasks fetched successfully", tasks);
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return jsonResponse(false, error.message || "Failed to fetch tasks", null, 500);
  }
}

/**
 * POST /api/tasks
 * Create a new task or milestone and recalculate project progress
 */
export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { project, title, description, type, priority, dueDate, status } = body;

    // Validation
    if (!title || !title.trim()) {
      return jsonResponse(false, "Task title is required", null, 400);
    }

    if (!project || !mongoose.Types.ObjectId.isValid(project)) {
      return jsonResponse(false, "Valid project reference is required", null, 400);
    }

    const projectRecord = await Project.findById(project);
    if (!projectRecord) {
      return jsonResponse(false, "Selected project does not exist", null, 404);
    }

    const isCompleted = status === "Completed";

    const newTask = await Task.create({
      project,
      title: title.trim(),
      description: (description || "").trim(),
      type: type || "Task",
      priority: priority || "Medium",
      dueDate: dueDate ? new Date(dueDate) : null,
      status: status || "To Do",
      completedAt: isCompleted ? new Date() : null,
    });

    // Recalculate project progress
    const allProjectTasks = await Task.find({ project });
    const updatedProgress = calculateProgress(allProjectTasks);
    await Project.findByIdAndUpdate(project, { progress: updatedProgress });

    await newTask.populate("project", "title status");

    // Log Activity
    await logActivity({
      project,
      title: `${type || "Task"} Created`,
      description: `Added ${type || "Task"} "${newTask.title}" to project "${projectRecord.title}"`,
      type: "TASK_CREATED",
    });

    return jsonResponse(true, "Task created successfully", newTask, 201);
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return jsonResponse(false, error.message || "Failed to create task", null, 500);
  }
}
