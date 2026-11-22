import connectToDatabase from "@/lib/mongodb";
import Client from "@/models/Client";
import { jsonResponse } from "@/lib/utils";
import { logActivity } from "@/lib/activity";

// Force Node.js runtime and dynamic handling
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/clients
 * Fetch all clients with optional search filter
 */
export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const query = {};
    if (search.trim()) {
      query.$or = [
        { fullName: { $regex: search.trim(), $options: "i" } },
        { company: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const clients = await Client.find(query).sort({ createdAt: -1 });

    return jsonResponse(true, "Clients fetched successfully", clients);
  } catch (error) {
    console.error("GET /api/clients error:", error);
    return jsonResponse(false, error.message || "Failed to fetch clients", null, 500);
  }
}

/**
 * POST /api/clients
 * Create a new client record
 */
export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { fullName, email, phone, company, address, notes } = body;

    // Basic Validation
    if (!fullName || !fullName.trim()) {
      return jsonResponse(false, "Full name is required", null, 400);
    }

    if (!email || !email.trim()) {
      return jsonResponse(false, "Email is required", null, 400);
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return jsonResponse(false, "Please provide a valid email address", null, 400);
    }

    // Create client
    const newClient = await Client.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: (phone || "").trim(),
      company: (company || "").trim(),
      address: (address || "").trim(),
      notes: (notes || "").trim(),
    });

    // Log Activity
    await logActivity({
      title: "Client Added",
      description: `Added client "${newClient.fullName}" (${newClient.company || "Individual"})`,
      type: "CLIENT_CREATED",
    });

    return jsonResponse(true, "Client created successfully", newClient, 201);
  } catch (error) {
    console.error("POST /api/clients error:", error);
    return jsonResponse(false, error.message || "Failed to create client", null, 500);
  }
}
