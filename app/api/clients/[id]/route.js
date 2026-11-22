import connectToDatabase from "@/lib/mongodb";
import Client from "@/models/Client";
import Project from "@/models/Project";
import Payment from "@/models/Payment";
import { jsonResponse } from "@/lib/utils";
import { calculatePaymentSummary } from "@/lib/calculations";
import mongoose from "mongoose";

export const runtime = "nodejs";

/**
 * GET /api/clients/[id]
 * Fetch client details, associated projects, and financial summary
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonResponse(false, "Invalid client ID format", null, 400);
    }

    await connectToDatabase();

    const client = await Client.findById(id);
    if (!client) {
      return jsonResponse(false, "Client not found", null, 404);
    }

    // Find all projects belonging to this client
    const projects = await Project.find({ client: id }).sort({ createdAt: -1 });

    // Fetch payments for all projects belonging to this client
    const projectIds = projects.map((p) => p._id);
    const payments = await Payment.find({ project: { $in: projectIds } })
      .populate("project", "title")
      .sort({ paymentDate: -1 });

    // Calculate total agreed amount and total paid across all projects
    let totalAgreed = 0;
    projects.forEach((p) => {
      totalAgreed += Number(p.agreedAmount) || 0;
    });

    const summary = calculatePaymentSummary(totalAgreed, payments);

    return jsonResponse(true, "Client details fetched successfully", {
      client,
      projects,
      payments,
      financialSummary: {
        totalProjects: projects.length,
        totalAgreedPaise: summary.agreedAmount,
        totalPaidPaise: summary.totalPaid,
        outstandingPaise: summary.outstanding,
        paymentStatus: summary.status,
      },
    });
  } catch (error) {
    console.error("GET /api/clients/[id] error:", error);
    return jsonResponse(false, error.message || "Failed to fetch client details", null, 500);
  }
}

/**
 * PATCH /api/clients/[id]
 * Update an existing client
 */
export async function PATCH(request, { params }) {
  try {
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonResponse(false, "Invalid client ID format", null, 400);
    }

    await connectToDatabase();

    const body = await request.json();
    const { fullName, email, phone, company, address, notes } = body;

    // Validation
    if (fullName !== undefined && !fullName.trim()) {
      return jsonResponse(false, "Full name cannot be empty", null, 400);
    }

    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return jsonResponse(false, "Please provide a valid email address", null, 400);
      }
    }

    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName.trim();
    if (email !== undefined) updateData.email = email.trim().toLowerCase();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (company !== undefined) updateData.company = company.trim();
    if (address !== undefined) updateData.address = address.trim();
    if (notes !== undefined) updateData.notes = notes.trim();

    const updatedClient = await Client.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedClient) {
      return jsonResponse(false, "Client not found", null, 404);
    }

    return jsonResponse(true, "Client updated successfully", updatedClient);
  } catch (error) {
    console.error("PATCH /api/clients/[id] error:", error);
    return jsonResponse(false, error.message || "Failed to update client", null, 500);
  }
}

/**
 * DELETE /api/clients/[id]
 * Safe deletion: check if client has associated projects
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonResponse(false, "Invalid client ID format", null, 400);
    }

    await connectToDatabase();

    // Check for dependent projects
    const projectCount = await Project.countDocuments({ client: id });
    if (projectCount > 0) {
      return jsonResponse(
        false,
        `Cannot delete client. This client is associated with ${projectCount} project(s). Delete or reassign those projects first.`,
        null,
        400
      );
    }

    const deletedClient = await Client.findByIdAndDelete(id);
    if (!deletedClient) {
      return jsonResponse(false, "Client not found", null, 404);
    }

    return jsonResponse(true, "Client deleted successfully", { id });
  } catch (error) {
    console.error("DELETE /api/clients/[id] error:", error);
    return jsonResponse(false, error.message || "Failed to delete client", null, 500);
  }
}
