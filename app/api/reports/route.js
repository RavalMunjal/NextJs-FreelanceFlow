import connectToDatabase from "@/lib/mongodb";
import Client from "@/models/Client";
import Project from "@/models/Project";
import Task from "@/models/Task";
import Payment from "@/models/Payment";
import { jsonResponse } from "@/lib/utils";
import {
  buildMonthlyRevenueSeries,
  buildProjectStatusDistribution,
  buildClientEarningsList,
} from "@/lib/reports";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/reports
 * Analytics and reporting endpoint with date range, client, and project status filters
 */
export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const clientId = searchParams.get("client") || "";
    const status = searchParams.get("status") || "";

    // Build project query
    const projectQuery = {};
    if (clientId && mongoose.Types.ObjectId.isValid(clientId)) {
      projectQuery.client = clientId;
    }
    if (status) {
      projectQuery.status = status;
    }

    // Build payment query
    const paymentQuery = {};
    if (startDate || endDate) {
      paymentQuery.paymentDate = {};
      if (startDate) paymentQuery.paymentDate.$gte = new Date(startDate);
      if (endDate) paymentQuery.paymentDate.$lte = new Date(endDate);
    }

    const [clients, projects, tasks, payments] = await Promise.all([
      Client.find().sort({ fullName: 1 }),
      Project.find(projectQuery).populate("client", "fullName company email").sort({ createdAt: -1 }),
      Task.find().populate("project", "title"),
      Payment.find(paymentQuery)
        .populate({
          path: "project",
          select: "title agreedAmount client",
          populate: { path: "client", select: "fullName company email" },
        })
        .sort({ paymentDate: -1 }),
    ]);

    // Financial totals
    const totalAgreedPaise = projects.reduce((sum, p) => sum + (Number(p.agreedAmount) || 0), 0);
    const totalPaidPaise = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const outstandingPaise = Math.max(0, totalAgreedPaise - totalPaidPaise);

    // Task Completion Statistics
    const taskStats = {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === "Completed").length,
      inProgress: tasks.filter((t) => t.status === "In Progress").length,
      toDo: tasks.filter((t) => t.status === "To Do").length,
    };

    // Client-wise earnings list
    const clientEarnings = buildClientEarningsList(clients, projects, payments);

    // Project-wise earnings list
    const projectEarnings = projects.map((proj) => {
      const projId = proj._id.toString();
      const projPayments = payments.filter(
        (p) => (p.project?._id?.toString() || p.project?.toString()) === projId
      );
      const collectedPaise = projPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const agreedPaise = Number(proj.agreedAmount) || 0;
      const duePaise = Math.max(0, agreedPaise - collectedPaise);

      return {
        projectId: projId,
        title: proj.title,
        client: proj.client?.fullName || "Unassigned",
        status: proj.status,
        agreedPaise,
        collectedPaise,
        duePaise,
        progress: proj.progress || 0,
      };
    });

    // Chart Series
    const monthlyRevenue = buildMonthlyRevenueSeries(payments);
    const projectStatusDistribution = buildProjectStatusDistribution(projects);

    return jsonResponse(true, "Report metrics generated successfully", {
      summary: {
        totalAgreedPaise,
        totalPaidPaise,
        outstandingPaise,
        totalProjects: projects.length,
        totalClients: clients.length,
      },
      taskStats,
      clientEarnings,
      projectEarnings,
      charts: {
        monthlyRevenue,
        projectStatusDistribution,
      },
      rawPayments: payments,
    });
  } catch (error) {
    console.error("GET /api/reports error:", error);
    return jsonResponse(false, error.message || "Failed to generate report", null, 500);
  }
}
