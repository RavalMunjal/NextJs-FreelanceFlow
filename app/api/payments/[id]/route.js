import connectToDatabase from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Project from "@/models/Project";
import { jsonResponse } from "@/lib/utils";
import { rupeesToPaise, paiseToRupees } from "@/lib/calculations";
import mongoose from "mongoose";

export const runtime = "nodejs";

/**
 * GET /api/payments/[id]
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonResponse(false, "Invalid payment ID format", null, 400);
    }

    await connectToDatabase();

    const payment = await Payment.findById(id).populate({
      path: "project",
      select: "title agreedAmount client",
      populate: { path: "client", select: "fullName company email phone" },
    });

    if (!payment) {
      return jsonResponse(false, "Payment not found", null, 404);
    }

    return jsonResponse(true, "Payment fetched successfully", payment);
  } catch (error) {
    console.error("GET /api/payments/[id] error:", error);
    return jsonResponse(false, error.message || "Failed to fetch payment", null, 500);
  }
}

/**
 * PATCH /api/payments/[id]
 * Edit payment details with balance validation
 */
export async function PATCH(request, { params }) {
  try {
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonResponse(false, "Invalid payment ID format", null, 400);
    }

    await connectToDatabase();

    const existingPayment = await Payment.findById(id);
    if (!existingPayment) {
      return jsonResponse(false, "Payment not found", null, 404);
    }

    const body = await request.json();
    const { amount, paymentDate, paymentMethod, paymentType, referenceNumber, notes } = body;

    const updateData = {};

    if (amount !== undefined) {
      const amountRupees = Number(amount);
      if (isNaN(amountRupees) || amountRupees <= 0) {
        return jsonResponse(false, "Payment amount must be greater than zero", null, 400);
      }

      const newPaise = rupeesToPaise(amountRupees);

      // Check project balance excluding this payment's current amount
      const project = await Project.findById(existingPayment.project);
      const otherPayments = await Payment.find({
        project: existingPayment.project,
        _id: { $ne: id },
      });

      const otherTotalPaid = otherPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const availableBalance = Math.max(0, (project.agreedAmount || 0) - otherTotalPaid);

      if (newPaise > availableBalance) {
        return jsonResponse(
          false,
          `Amount exceeds available project balance (Rs. ${paiseToRupees(availableBalance).toLocaleString("en-IN")})`,
          null,
          400
        );
      }

      updateData.amount = newPaise;
    }

    if (paymentDate !== undefined) updateData.paymentDate = new Date(paymentDate);
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (paymentType !== undefined) updateData.paymentType = paymentType;
    if (referenceNumber !== undefined) updateData.referenceNumber = referenceNumber.trim();
    if (notes !== undefined) updateData.notes = notes.trim();

    const updatedPayment = await Payment.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate({
      path: "project",
      select: "title agreedAmount client",
      populate: { path: "client", select: "fullName company" },
    });

    return jsonResponse(true, "Payment updated successfully", updatedPayment);
  } catch (error) {
    console.error("PATCH /api/payments/[id] error:", error);
    return jsonResponse(false, error.message || "Failed to update payment", null, 500);
  }
}

/**
 * DELETE /api/payments/[id]
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonResponse(false, "Invalid payment ID format", null, 400);
    }

    await connectToDatabase();

    const deleted = await Payment.findByIdAndDelete(id);
    if (!deleted) {
      return jsonResponse(false, "Payment not found", null, 404);
    }

    return jsonResponse(true, "Payment record deleted successfully", { id });
  } catch (error) {
    console.error("DELETE /api/payments/[id] error:", error);
    return jsonResponse(false, error.message || "Failed to delete payment", null, 500);
  }
}
