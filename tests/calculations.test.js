import assert from "node:assert";
import {
  rupeesToPaise,
  paiseToRupees,
  calculateProgress,
  getPaymentStatus,
  calculatePaymentSummary,
} from "../lib/calculations.js";

console.log("--- Starting FreelanceFlow Business Logic Tests ---");

// Test 1: Currency Conversion
console.log("Test 1: Currency Conversion");
assert.strictEqual(rupeesToPaise(5000), 500000, "5000 Rs should be 500000 paise");
assert.strictEqual(paiseToRupees(500000), 5000, "500000 paise should be 5000 Rs");
assert.strictEqual(rupeesToPaise(0), 0, "0 Rs should be 0 paise");

// Test 2: Progress Calculation Formula: (completed / total) * 100
console.log("Test 2: Project Progress Calculation");
assert.strictEqual(calculateProgress([]), 0, "Empty tasks should return 0% progress");

const tasksFour = [
  { status: "Completed" },
  { status: "Completed" },
  { status: "To Do" },
  { status: "In Progress" },
];
assert.strictEqual(calculateProgress(tasksFour), 50, "2 of 4 tasks completed should be exactly 50%");

const tasksAllDone = [
  { status: "Completed" },
  { status: "Completed" },
];
assert.strictEqual(calculateProgress(tasksAllDone), 100, "All completed tasks should be 100%");

const tasksNoneDone = [
  { status: "To Do" },
  { status: "In Progress" },
];
assert.strictEqual(calculateProgress(tasksNoneDone), 0, "Zero completed tasks should be 0%");

// Test 3: Payment Status Logic
console.log("Test 3: Payment Status Transitions");
assert.strictEqual(getPaymentStatus(2000000, 0), "Unpaid", "0 paid should be Unpaid");
assert.strictEqual(getPaymentStatus(2000000, 500000), "Partially Paid", "5000 of 20000 should be Partially Paid");
assert.strictEqual(getPaymentStatus(2000000, 2000000), "Fully Paid", "Full amount paid should be Fully Paid");
assert.strictEqual(getPaymentStatus(2000000, 2500000), "Fully Paid", "Overpaid should still be Fully Paid");

// Test 4: Complete Payment Summary
console.log("Test 4: Complete Payment Summary Calculation");
const agreedAmount = 2000000; // Rs 20,000 in paise
const payments = [
  { amount: 500000 },  // Rs 5,000 advance
  { amount: 1500000 }, // Rs 15,000 final
];

const summary = calculatePaymentSummary(agreedAmount, payments);
assert.strictEqual(summary.agreedAmount, 2000000, "Agreed amount must match");
assert.strictEqual(summary.totalPaid, 2000000, "Total paid must be 2000000 paise (Rs 20,000)");
assert.strictEqual(summary.outstanding, 0, "Outstanding balance must be 0");
assert.strictEqual(summary.status, "Fully Paid", "Status must be Fully Paid");

console.log("✅ All business calculation tests passed successfully!");
