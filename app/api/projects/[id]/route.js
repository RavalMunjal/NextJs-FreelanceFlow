import connectToDatabase from "@/lib/mongodb";
import Project from "@/models/Project";
import Task from "@/models/Task";
import Deliverable from "@/models/Deliverable";
import Payment from "@/models/Payment";
import Activity from "@/models/Activity";
import { jsonResponse } from "@/lib/utils";
import { logActivity } from "@/lib/activity";
import { calculatePaymentSummary, rupeesToPaise } from "@/lib/calculations";
import mongoose from "mongoose";

export const runtime = "nodejs";

/**
 * GET /api/projects/[id]
 * Fetch full project workspace: details, client, tasks, deliverables, payments, activities
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonResponse(false, "Invalid project ID format", null, 400);
    }

    await connectToDatabase();

    const project = await Project.findById(id).populate("client", "fullName company email phone");
    if (!project) {
      return jsonResponse(false, "Project not found", null, 404);
    }

    // Fetch related items in parallel
    const [tasks, deliverables, payments, activities] = await Promise.all([
      Task.find({ project: id }).sort({ createdAt: -1 }),
      Deliverable.find({ project: id }).sort({ createdAt: -1 }),
      Payment.find({ project: id }).sort({ paymentDate: -1 }),
      Activity.find({ project: id }).sort({ createdAt: -1 }).limit(20),
    ]);

    // Financial balance calculation
    const financialSummary = calculatePaymentSummary(project.agreedAmount, payments);

    return jsonResponse(true, "Project workspace loaded successfully", {
      project,
      tasks,
      deliverables,
      payments,
      activities,
      financialSummary,
    });
  } catch (error) {
    console.error("GET /api/projects/[id] error:", error);
    return jsonResponse(false, error.message || "Failed to fetch project workspace", null, 500);
  }
}

/**
 * PATCH /api/projects/[id]
 * Update project details, status, or financial terms
 */
export async function PATCH(request, { params }) {
  try {
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonResponse(false, "Invalid project ID format", null, 400);
    }

    await connectToDatabase();

    const currentProject = await Project.findById(id);
    if (!currentProject) {
      return jsonResponse(false, "Project not found", null, 404);
    }

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
      progress,
    } = body;

    const updateData = {};

    if (title !== undefined) updateData.title = title.trim();
    if (client !== undefined && mongoose.Types.ObjectId.isValid(client)) updateData.client = client;
    if (description !== undefined) updateData.description = description.trim();
    if (priority !== undefined) updateData.priority = priority;

    // Check if agreed amount is being changed
    if (agreedAmount !== undefined) {
      const newAgreedPaise = rupeesToPaise(agreedAmount);
      // Fetch total payments already made
      const payments = await Payment.find({ project: id });
      const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

      // Section 13: "Do not allow reducing project amount below received payments"
      if (newAgreedPaise < totalPaid) {
        return jsonResponse(
          false,
          `Cannot reduce agreed amount below already collected payments (Rs. ${(totalPaid / 100).toLocaleString("en-IN")})`,
          null,
          400
        );
      }
      updateData.agreedAmount = newAgreedPaise;
    }

    if (budget !== undefined) {
      updateData.budget = rupeesToPaise(budget);
    }

    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (deadline !== undefined) updateData.deadline = new Date(deadline);
    if (progress !== undefined) updateData.progress = Math.min(100, Math.max(0, Number(progress)));

    // Status change logging
    const statusChanged = status !== undefined && status !== currentProject.status;
    if (status !== undefined) {
      updateData.status = status;
    }

    const updatedProject = await Project.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("client", "fullName company email");

    // Log Activity if status changed
    if (statusChanged) {
      await logActivity({
        project: id,
        title: "Project Status Changed",
        description: `Project "${updatedProject.title}" status changed to ${status}`,
        type: "PROJECT_STATUS_CHANGED",
      });
    }

    return jsonResponse(true, "Project updated successfully", updatedProject);
  } catch (error) {
    console.error("PATCH /api/projects/[id] error:", error);
    return jsonResponse(false, error.message || "Failed to update project", null, 500);
  }
}

/**
 * DELETE /api/projects/[id]
 * Safe delete: Prevent deletion if tasks, deliverables, or payments exist
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonResponse(false, "Invalid project ID format", null, 400);
    }

    await connectToDatabase();

    // Check for dependent records
    const [taskCount, deliverableCount, paymentCount] = await Promise.all([
      Task.countDocuments({ project: id }),
      Deliverable.countDocuments({ project: id }),
      Payment.countDocuments({ project: id }),
    ]);

    if (taskCount > 0 || deliverableCount > 0 || paymentCount > 0) {
      return jsonResponse(
        false,
        `Cannot delete project with dependent records. This project has ${taskCount} task(s), ${deliverableCount} deliverable(s), and ${paymentCount} payment record(s). Delete or resolve them first.`,
        null,
        400
      );
    }

    const deletedProject = await Project.findByIdAndDelete(id);
    if (!deletedProject) {
      return jsonResponse(false, "Project not found", null, 404);
    }

    return jsonResponse(true, "Project deleted successfully", { id });
  } catch (error) {
    console.error("DELETE /api/projects/[id] error:", error);
    return jsonResponse(false, error.message || "Failed to delete project", null, 500);
  }
}
