import Activity from "@/models/Activity";

/**
 * Log a user action or system event into MongoDB Activity collection
 * Simple, reusable function without complex message queues.
 */
export async function logActivity({ project = null, title, description, type }) {
  try {
    const activity = await Activity.create({
      project,
      title,
      description,
      type,
    });
    return activity;
  } catch (error) {
    // Fail gracefully so activity logging failure does not break primary operations
    console.error("Activity logging error:", error);
    return null;
  }
}
