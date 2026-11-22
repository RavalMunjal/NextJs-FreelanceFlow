/**
 * Utility helper functions for FreelanceFlow
 */

/**
 * Format Date into readable string: e.g. "15 Oct 2026"
 */
export function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format Date for HTML <input type="date"> (YYYY-MM-DD)
 */
export function formatDateForInput(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
}

/**
 * Check if a due date is in the past and still incomplete
 */
export function isOverdue(dueDate, status) {
  if (!dueDate) return false;
  if (status === "Completed" || status === "Approved") return false;

  const due = new Date(dueDate);
  const now = new Date();
  // Set both to start of day for fair comparison
  due.setHours(23, 59, 59, 999);
  return due < now;
}

/**
 * Standard API JSON response structure
 */
export function jsonResponse(success, message, data = null, status = 200) {
  return Response.json(
    {
      success,
      message,
      data,
    },
    { status }
  );
}

/**
 * Badge color classes according to FreelanceFlow theme
 */
export function getStatusBadgeClasses(status) {
  switch (status) {
    case "Completed":
    case "Approved":
    case "Fully Paid":
      return "bg-sage-light text-sage-dark border-sage-border";
    case "In Progress":
      return "bg-forest/10 text-forest border-forest/20";
    case "Planning":
      return "bg-cream-dark text-textColor-primary border-cream-border";
    case "Pending":
    case "Partially Paid":
      return "bg-warning-light text-warning border-warning/30";
    case "Revision Required":
    case "Cancelled":
    case "Overdue":
    case "Unpaid":
      return "bg-terracotta-light text-terracotta border-terracotta/30";
    case "On Hold":
      return "bg-gray-100 text-gray-700 border-gray-300";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
}

/**
 * Priority badge classes
 */
export function getPriorityBadgeClasses(priority) {
  switch (priority) {
    case "High":
      return "bg-terracotta-light text-terracotta border-terracotta/30";
    case "Medium":
      return "bg-warning-light text-warning border-warning/30";
    case "Low":
      return "bg-sage-light text-sage-dark border-sage-border";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
}
