import connectToDatabase from "@/lib/mongodb";
import Task from "@/models/Task";
import Project from "@/models/Project";
import { jsonResponse } from "@/lib/utils";
import { logActivity } from "@/lib/activity";
import { calculateProgress } from "@/lib/calculations";
import mongoose from "mongoose";

export const runtime = "nodejs";

/**
 * GET /api/tasks/[id]
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonResponse(false, "Invalid task ID format", null, 400);
    }

    await connectToDatabase();

    const task = await Task.findById(id).populate("project", "title status");
    if (!task) {
      return jsonResponse(false, "Task not found", null, 404);
    }

    return jsonResponse(true, "Task fetched successfully", task);
  } catch (error) {
    console.error("GET /api/tasks/[id] error:", error);
    return jsonResponse(false, error.message || "Failed to fetch task", null, 500);
  }
}

/**
 * PATCH /api/tasks/[id]
 * Update task details or change status, updating project progress automatically
 */
export async function PATCH(request, { params }) {
  try {
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonResponse(false, "Invalid task ID format", null, 400);
    }

    await connectToDatabase();

    const existingTask = await Task.findById(id);
    if (!existingTask) {
      return jsonResponse(false, "Task not found", null, 404);
    }

    const body = await request.json();
    const { title, description, type, priority, dueDate, status } = body;

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (type !== undefined) updateData.type = type;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    // Handle status change and completion date
    const statusChangedToCompleted =
      status === "Completed" && existingTask.status !== "Completed";
    const statusChangedFromCompleted =
      status !== undefined && status !== "Completed" && existingTask.status === "Completed";

    if (status !== undefined) {
      updateData.status = status;
      if (statusChangedToCompleted) {
        updateData.completedAt = new Date();
      } else if (statusChangedFromCompleted) {
        updateData.completedAt = null;
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("project", "title status");

    // Automatically recalculate project progress
    const projectId = updatedTask.project._id || updatedTask.project;
    const allProjectTasks = await Task.find({ project: projectId });
    const newProgress = calculateProgress(allProjectTasks);
    await Project.findByIdAndUpdate(projectId, { progress: newProgress });

    // Log Activity if completed
    if (statusChangedToCompleted) {
      await logActivity({
        project: projectId,
        title: `${updatedTask.type} Completed`,
        description: `Marked ${updatedTask.type.toLowerCase()} "${updatedTask.title}" as completed`,
        type: updatedTask.type === "Milestone" ? "MILESTONE_COMPLETED" : "TASK_COMPLETED",
      });
    }

    return jsonResponse(true, "Task updated successfully", {
      task: updatedTask,
      projectProgress: newProgress,
    });
  } catch (error) {
    console.error("PATCH /api/tasks/[id] error:", error);
    return jsonResponse(false, error.message || "Failed to update task", null, 500);
  }
}

/**
 * DELETE /api/tasks/[id]
 * Remove task and recalculate project progress
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonResponse(false, "Invalid task ID format", null, 400);
    }

    await connectToDatabase();

    const task = await Task.findById(id);
    if (!task) {
      return jsonResponse(false, "Task not found", null, 404);
    }

    const projectId = task.project;
    await Task.findByIdAndDelete(id);

    // Recalculate remaining project progress
    const remainingTasks = await Task.find({ project: projectId });
    const newProgress = calculateProgress(remainingTasks);
    await Project.findByIdAndUpdate(projectId, { progress: newProgress });

    return jsonResponse(true, "Task deleted successfully", {
      id,
      projectProgress: newProgress,
    });
  } catch (error) {
    console.error("DELETE /api/tasks/[id] error:", error);
    return jsonResponse(false, error.message || "Failed to delete task", null, 500);
  }
}
