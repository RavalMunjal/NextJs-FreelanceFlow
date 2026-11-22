import connectToDatabase from "@/lib/mongodb";
import Activity from "@/models/Activity";
import { jsonResponse } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/activities
 * Fetch recent activity history across projects
 */
export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "25", 10);
    const projectId = searchParams.get("project") || "";

    const query = {};
    if (projectId) {
      query.project = projectId;
    }

    const activities = await Activity.find(query)
      .populate("project", "title status client")
      .sort({ createdAt: -1 })
      .limit(limit);

    return jsonResponse(true, "Activities fetched successfully", activities);
  } catch (error) {
    console.error("GET /api/activities error:", error);
    return jsonResponse(false, error.message || "Failed to fetch activities", null, 500);
  }
}
