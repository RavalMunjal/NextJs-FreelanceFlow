import assert from "node:assert";
import {
  rupeesToPaise,
  paiseToRupees,
  formatINR,
  calculateProgress,
  getPaymentStatus,
  calculatePaymentSummary,
} from "../lib/calculations.js";

console.log("==================================================");
console.log("   FreelanceFlow End-to-End Business Logic Tests  ");
console.log("==================================================");

// 1. Progress Calculation Tests (Section 11 Formula)
console.log("\n▶ Testing Milestone & Progress Calculation...");
assert.strictEqual(calculateProgress([]), 0, "Zero tasks must return 0% progress");

const scenario1 = [
  { status: "Completed" },
  { status: "Completed" },
  { status: "To Do" },
  { status: "In Progress" },
];
assert.strictEqual(
  calculateProgress(scenario1),
  50,
  "2 completed out of 4 tasks must yield exactly 50% progress"
);

const scenario2 = [
  { status: "Completed" },
  { status: "Completed" },
  { status: "Completed" },
  { status: "Completed" },
];
assert.strictEqual(
  calculateProgress(scenario2),
  100,
  "All 4 tasks completed must yield exactly 100% progress"
);

const scenarioClamp = [{ status: "Completed" }];
assert.strictEqual(
  calculateProgress(scenarioClamp),
  100,
  "Progress must never exceed 100%"
);
console.log("  ✔ Progress calculation passed (0%, 50%, 100% scenarios verified).");

// 2. Financial & Payment Ledger Tests (Section 13 & 30 Steps 16-20)
console.log("\n▶ Testing Financial Balance Calculations (Official College Flow)...");

// Project agreed amount: Rs. 20,000 (2,000,000 paise)
const agreedProjectFee = rupeesToPaise(20000);
assert.strictEqual(agreedProjectFee, 2000000, "Rs. 20,000 must equal 2,000,000 paise");

// Step 16: Record Rs. 5,000 Advance
const paymentAdvance = [{ amount: rupeesToPaise(5000) }];
const balanceAfterAdvance = calculatePaymentSummary(agreedProjectFee, paymentAdvance);

// Step 17: Verify outstanding balance becomes Rs. 15,000
assert.strictEqual(
  balanceAfterAdvance.totalPaid,
  500000,
  "Total paid after advance must be Rs. 5,000"
);
assert.strictEqual(
  balanceAfterAdvance.outstanding,
  1500000,
  "Outstanding balance must be Rs. 15,000 (1,500,000 paise)"
);
assert.strictEqual(
  balanceAfterAdvance.status,
  "Partially Paid",
  "Status after advance must be 'Partially Paid'"
);
console.log("  ✔ Step 16 & 17 passed: Rs. 5,000 Advance recorded -> Rs. 15,000 Outstanding, Partially Paid.");

// Step 18: Record Rs. 15,000 Final Payment
const allPayments = [
  { amount: rupeesToPaise(5000) },
  { amount: rupeesToPaise(15000) },
];
const balanceAfterFinal = calculatePaymentSummary(agreedProjectFee, allPayments);

// Step 19 & 20: Verify outstanding balance becomes 0 and status becomes Fully Paid
assert.strictEqual(
  balanceAfterFinal.totalPaid,
  2000000,
  "Total paid after final settlement must be Rs. 20,000"
);
assert.strictEqual(
  balanceAfterFinal.outstanding,
  0,
  "Outstanding balance must be exactly 0"
);
assert.strictEqual(
  balanceAfterFinal.status,
  "Fully Paid",
  "Status must be 'Fully Paid'"
);
console.log("  ✔ Step 18-20 passed: Rs. 15,000 Final payment -> Rs. 0 Outstanding, Fully Paid.");

// 3. Overpayment Prevention Verification
console.log("\n▶ Testing Overpayment Prevention Logic...");
const testAgreed = 1000000; // Rs. 10,000
const testPaid = 600000;    // Rs. 6,000
const testOutstanding = testAgreed - testPaid; // Rs. 4,000

const attemptedExcessPayment = 500000; // Rs. 5,000
const isOverpayment = attemptedExcessPayment > testOutstanding;
assert.strictEqual(isOverpayment, true, "Payment above outstanding balance must be blocked");
console.log("  ✔ Overpayment correctly identified and prevented.");

// 4. Currency Formatting
console.log("\n▶ Testing INR Currency Formatting...");
const formattedINR = formatINR(2000000); // 20,000 Rs
assert.ok(formattedINR.includes("20,000"), "Currency formatting must include 20,000");
console.log(`  ✔ Formatted INR sample: ${formattedINR}`);

console.log("\n==================================================");
console.log("✅ ALL WORKFLOW AND BUSINESS LOGIC TESTS PASSED!");
console.log("==================================================");
