import connectToDatabase from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Project from "@/models/Project";
import { jsonResponse } from "@/lib/utils";
import { logActivity } from "@/lib/activity";
import { rupeesToPaise, paiseToRupees, calculatePaymentSummary } from "@/lib/calculations";
import mongoose from "mongoose";

export const runtime = "nodejs";

/**
 * GET /api/payments
 * List payment records with project, client, method, and date range filters
 */
export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("project") || "";
    const clientId = searchParams.get("client") || "";
    const method = searchParams.get("method") || "";
    const type = searchParams.get("type") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    const query = {};

    if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
      query.project = projectId;
    }

    if (method) {
      query.paymentMethod = method;
    }

    if (type) {
      query.paymentType = type;
    }

    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }

    // Populate project and project's client
    let payments = await Payment.find(query)
      .populate({
        path: "project",
        select: "title agreedAmount client status",
        populate: {
          path: "client",
          select: "fullName company email",
        },
      })
      .sort({ paymentDate: -1, createdAt: -1 });

    // If filtered by client, filter in memory if needed
    if (clientId && mongoose.Types.ObjectId.isValid(clientId)) {
      payments = payments.filter((p) => {
        const cId = p.project?.client?._id?.toString() || p.project?.client?.toString();
        return cId === clientId;
      });
    }

    return jsonResponse(true, "Payments fetched successfully", payments);
  } catch (error) {
    console.error("GET /api/payments error:", error);
    return jsonResponse(false, error.message || "Failed to fetch payments", null, 500);
  }
}

/**
 * POST /api/payments
 * Record a payment with strict balance validation (prevent overpayment)
 */
export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const {
      project,
      amount,
      paymentDate,
      paymentMethod,
      paymentType,
      referenceNumber,
      notes,
    } = body;

    // Basic Validation
    if (!project || !mongoose.Types.ObjectId.isValid(project)) {
      return jsonResponse(false, "Valid project reference is required", null, 400);
    }

    const projectRecord = await Project.findById(project).populate("client", "fullName");
    if (!projectRecord) {
      return jsonResponse(false, "Selected project does not exist", null, 404);
    }

    const amountRupees = Number(amount);
    if (isNaN(amountRupees) || amountRupees <= 0) {
      return jsonResponse(false, "Payment amount must be greater than zero", null, 400);
    }

    const paymentAmountPaise = rupeesToPaise(amountRupees);

    // Fetch existing payments to verify outstanding balance
    const existingPayments = await Payment.find({ project });
    const totalPaidSoFar = existingPayments.reduce(
      (sum, p) => sum + (Number(p.amount) || 0),
      0
    );

    const agreedPaise = Number(projectRecord.agreedAmount) || 0;
    const outstandingPaise = Math.max(0, agreedPaise - totalPaidSoFar);

    // Prevent Overpayment (Section 13)
    if (paymentAmountPaise > outstandingPaise) {
      const outstandingRupees = paiseToRupees(outstandingPaise);
      return jsonResponse(
        false,
        `Payment amount (Rs. ${amountRupees.toLocaleString("en-IN")}) exceeds outstanding balance (Rs. ${outstandingRupees.toLocaleString("en-IN")})`,
        null,
        400
      );
    }

    const newPayment = await Payment.create({
      project,
      amount: paymentAmountPaise,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      paymentMethod: paymentMethod || "UPI",
      paymentType: paymentType || "Partial",
      referenceNumber: (referenceNumber || "").trim(),
      notes: (notes || "").trim(),
    });

    await newPayment.populate({
      path: "project",
      select: "title agreedAmount client",
      populate: { path: "client", select: "fullName company email" },
    });

    // Log Activity
    await logActivity({
      project,
      title: "Payment Recorded",
      description: `Recorded ${paymentType || "Partial"} payment of Rs. ${amountRupees.toLocaleString("en-IN")} via ${paymentMethod || "UPI"}`,
      type: "PAYMENT_RECORDED",
    });

    return jsonResponse(true, "Payment recorded successfully", newPayment, 201);
  } catch (error) {
    console.error("POST /api/payments error:", error);
    return jsonResponse(false, error.message || "Failed to record payment", null, 500);
  }
}
