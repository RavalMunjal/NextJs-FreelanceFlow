/**
 * Calculation Utilities for FreelanceFlow
 * Simple, beginner-friendly functions with clear business logic.
 */

/**
 * Convert Rupees to Integer Paise (1 INR = 100 Paise)
 * Prevents floating point inaccuracies in financial calculations.
 */
export function rupeesToPaise(rupees) {
  const num = Number(rupees) || 0;
  return Math.round(num * 100);
}

/**
 * Convert Integer Paise to Rupees
 */
export function paiseToRupees(paise) {
  const num = Number(paise) || 0;
  return num / 100;
}

/**
 * Format currency to Indian Rupee (INR) format
 * e.g., 500000 paise -> ₹5,000 or Rs. 5,000
 */
export function formatINR(amount, isPaise = true) {
  const inRupees = isPaise ? paiseToRupees(amount) : Number(amount) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(inRupees);
}

/**
 * Format currency using plain "Rs." prefix (safe for PDF fonts)
 */
export function formatRsPlain(amount, isPaise = true) {
  const inRupees = isPaise ? paiseToRupees(amount) : Number(amount) || 0;
  return `Rs. ${inRupees.toLocaleString("en-IN")}`;
}

/**
 * Calculate Project Progress percentage based on completed tasks & milestones
 * Formula: (Completed Tasks / Total Tasks) * 100
 * Clamped between 0 and 100. If no tasks exist, returns 0.
 */
export function calculateProgress(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return 0;
  }

  const completedCount = tasks.filter((t) => t.status === "Completed").length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  // Return value clamped between 0 and 100
  return Math.min(100, Math.max(0, progressPercent));
}

/**
 * Calculate payment status: "Unpaid", "Partially Paid", or "Fully Paid"
 */
export function getPaymentStatus(agreedAmountPaise, totalPaidPaise) {
  const agreed = Number(agreedAmountPaise) || 0;
  const paid = Number(totalPaidPaise) || 0;

  if (paid <= 0) {
    return "Unpaid";
  }
  if (paid >= agreed) {
    return "Fully Paid";
  }
  return "Partially Paid";
}

/**
 * Calculate complete payment summary for a project
 */
export function calculatePaymentSummary(agreedAmountPaise, payments = []) {
  const agreed = Number(agreedAmountPaise) || 0;

  // Sum all recorded payment amounts
  const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // Outstanding balance cannot be negative
  const outstanding = Math.max(0, agreed - totalPaid);

  const status = getPaymentStatus(agreed, totalPaid);

  return {
    agreedAmount: agreed,
    totalPaid,
    outstanding,
    status,
  };
}
