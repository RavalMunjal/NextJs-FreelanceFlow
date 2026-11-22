import connectToDatabase from "@/lib/mongodb";
import Client from "@/models/Client";
import Project from "@/models/Project";
import Task from "@/models/Task";
import Payment from "@/models/Payment";
import Activity from "@/models/Activity";
import { jsonResponse } from "@/lib/utils";
import { buildMonthlyRevenueSeries, buildProjectStatusDistribution } from "@/lib/reports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/dashboard
 * Aggregated dashboard statistics, charts data, and activity feeds
 */
export async function GET() {
  try {
    await connectToDatabase();

    const now = new Date();

    // Fetch collections and metrics in parallel
    const [
      totalClients,
      projects,
      tasks,
      payments,
      recentActivities,
    ] = await Promise.all([
      Client.countDocuments(),
      Project.find().populate("client", "fullName company email").sort({ createdAt: -1 }),
      Task.find().populate("project", "title").sort({ dueDate: 1 }),
      Payment.find()
        .populate({
          path: "project",
          select: "title agreedAmount client",
          populate: { path: "client", select: "fullName" },
        })
        .sort({ paymentDate: -1 }),
      Activity.find().populate("project", "title").sort({ createdAt: -1 }).limit(8),
    ]);

    // Financial calculations
    const totalEarningsPaise = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const totalAgreedPaise = projects.reduce((sum, p) => sum + (Number(p.agreedAmount) || 0), 0);
    const outstandingPaise = Math.max(0, totalAgreedPaise - totalEarningsPaise);

    // Project status counts
    const activeProjects = projects.filter(
      (p) => p.status === "In Progress" || p.status === "Planning"
    ).length;
    const completedProjects = projects.filter((p) => p.status === "Completed").length;

    // Task counts
    const pendingTasks = tasks.filter((t) => t.status !== "Completed").length;
    const overdueTasks = tasks.filter((t) => {
      if (t.status === "Completed" || !t.dueDate) return false;
      const due = new Date(t.dueDate);
      due.setHours(23, 59, 59, 999);
      return due < now;
    }).length;

    // Upcoming project deadlines within next 14 days
    const upcomingDeadlines = projects
      .filter((p) => {
        if (p.status === "Completed" || p.status === "Cancelled" || !p.deadline) return false;
        const d = new Date(p.deadline);
        const diffDays = (d - now) / (1000 * 60 * 60 * 24);
        return diffDays >= -1 && diffDays <= 14;
      })
      .slice(0, 5);

    // Chart Series
    const monthlyRevenue = buildMonthlyRevenueSeries(payments);
    const projectStatusDistribution = buildProjectStatusDistribution(projects);

    return jsonResponse(true, "Dashboard metrics loaded successfully", {
      metrics: {
        totalClients,
        totalProjects: projects.length,
        activeProjects,
        completedProjects,
        totalEarningsPaise,
        outstandingPaise,
        pendingTasks,
        overdueTasks,
      },
      charts: {
        monthlyRevenue,
        projectStatusDistribution,
      },
      recentProjects: projects.slice(0, 5),
      recentPayments: payments.slice(0, 5),
      recentActivities,
      upcomingDeadlines,
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return jsonResponse(false, error.message || "Failed to load dashboard statistics", null, 500);
  }
}
