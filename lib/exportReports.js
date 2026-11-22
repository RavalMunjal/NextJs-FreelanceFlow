import { jsPDF } from "jspdf";
import { formatRsPlain, paiseToRupees } from "./calculations";
import { formatDate } from "./utils";

/**
 * Generate and download a Financial Summary PDF report
 */
export function generateFinancialSummaryPDF(reportData, filterInfo = {}) {
  if (!reportData) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const primaryForest = [23, 61, 50]; // #173D32
  const copperGold = [197, 139, 85]; // #C58B55
  const creamBg = [247, 245, 239]; // #F7F5EF
  const darkText = [36, 51, 45]; // #24332D
  const mutedText = [115, 123, 114]; // #737B72

  // 1. Header Banner
  doc.setFillColor(...primaryForest);
  doc.rect(0, 0, 210, 36, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("FreelanceFlow", 20, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(223, 171, 123);
  doc.text("FINANCIAL & REVENUE ANALYTICS SUMMARY", 20, 28);

  // Metadata
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`Generated: ${formatDate(new Date())}`, 145, 20);
  doc.text(`Scope: All Filtered Records`, 145, 27);

  // 2. Executive Metric KPI Boxes
  const kpiY = 46;
  const summary = reportData.summary || {};

  // Total Invoiced Value Box
  doc.setFillColor(...creamBg);
  doc.rect(20, kpiY, 52, 26, "F");
  doc.setDrawColor(228, 225, 217);
  doc.rect(20, kpiY, 52, 26, "S");
  doc.setTextColor(...mutedText);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL CONTRACT VALUE", 24, kpiY + 8);
  doc.setFontSize(12);
  doc.setTextColor(...darkText);
  doc.text(formatRsPlain(summary.totalAgreedPaise || 0), 24, kpiY + 18);

  // Total Collected Box
  doc.setFillColor(...creamBg);
  doc.rect(79, kpiY, 52, 26, "F");
  doc.rect(79, kpiY, 52, 26, "S");
  doc.setTextColor(...mutedText);
  doc.setFontSize(8);
  doc.text("TOTAL REVENUE COLLECTED", 83, kpiY + 8);
  doc.setFontSize(12);
  doc.setTextColor(53, 100, 81); // Sage dark
  doc.text(formatRsPlain(summary.totalPaidPaise || 0), 83, kpiY + 18);

  // Outstanding Balance Box
  doc.setFillColor(...creamBg);
  doc.rect(138, kpiY, 52, 26, "F");
  doc.rect(138, kpiY, 52, 26, "S");
  doc.setTextColor(...mutedText);
  doc.setFontSize(8);
  doc.text("OUTSTANDING BALANCE", 142, kpiY + 8);
  doc.setFontSize(12);
  doc.setTextColor(185, 84, 73); // Terracotta
  doc.text(formatRsPlain(summary.outstandingPaise || 0), 142, kpiY + 18);

  // 3. Project-wise Financial Breakdown Table
  let currentY = 82;
  doc.setTextColor(...darkText);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Project Portfolio Breakdown", 20, currentY);
  currentY += 6;

  // Table Header
  doc.setFillColor(...primaryForest);
  doc.rect(20, currentY, 170, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("PROJECT TITLE", 24, currentY + 5.5);
  doc.text("CLIENT", 80, currentY + 5.5);
  doc.text("STATUS", 115, currentY + 5.5);
  doc.text("AGREED", 145, currentY + 5.5, { align: "right" });
  doc.text("COLLECTED", 168, currentY + 5.5, { align: "right" });
  doc.text("DUE", 188, currentY + 5.5, { align: "right" });
  currentY += 8;

  const projectList = (reportData.projectEarnings || []).slice(0, 15);
  projectList.forEach((p, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 247, idx % 2 === 0 ? 255 : 245, idx % 2 === 0 ? 255 : 239);
    doc.rect(20, currentY, 170, 7.5, "F");
    doc.setDrawColor(228, 225, 217);
    doc.rect(20, currentY, 170, 7.5, "S");

    doc.setTextColor(...darkText);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    const titleStr = p.title.length > 28 ? p.title.substring(0, 26) + "..." : p.title;
    const clientStr = p.client.length > 18 ? p.client.substring(0, 16) + "..." : p.client;

    doc.text(titleStr, 24, currentY + 5);
    doc.text(clientStr, 80, currentY + 5);
    doc.text(p.status, 115, currentY + 5);
    doc.text(formatRsPlain(p.agreedPaise), 145, currentY + 5, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(53, 100, 81);
    doc.text(formatRsPlain(p.collectedPaise), 168, currentY + 5, { align: "right" });

    doc.setTextColor(p.duePaise > 0 ? 185 : 53, p.duePaise > 0 ? 84 : 100, p.duePaise > 0 ? 73 : 81);
    doc.text(formatRsPlain(p.duePaise), 188, currentY + 5, { align: "right" });

    currentY += 7.5;
  });

  // 4. Client-wise Earnings Summary
  currentY += 8;
  if (currentY < 230) {
    doc.setTextColor(...darkText);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Top Client Revenue Contribution", 20, currentY);
    currentY += 6;

    doc.setFillColor(...copperGold);
    doc.rect(20, currentY, 170, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text("CLIENT / COMPANY", 24, currentY + 5.5);
    doc.text("TOTAL REVENUE REALIZED", 188, currentY + 5.5, { align: "right" });
    currentY += 8;

    const topClients = (reportData.clientEarnings || []).slice(0, 5);
    topClients.forEach((c, idx) => {
      doc.setFillColor(idx % 2 === 0 ? 255 : 247, idx % 2 === 0 ? 255 : 245, idx % 2 === 0 ? 255 : 239);
      doc.rect(20, currentY, 170, 7, "F");
      doc.setDrawColor(228, 225, 217);
      doc.rect(20, currentY, 170, 7, "S");

      doc.setTextColor(...darkText);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`${c.name} (${c.company})`, 24, currentY + 5);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(53, 100, 81);
      doc.text(formatRsPlain(c.totalEarnedPaise), 188, currentY + 5, { align: "right" });

      currentY += 7;
    });
  }

  // Footer
  const footerY = 280;
  doc.setDrawColor(228, 225, 217);
  doc.line(20, footerY, 190, footerY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...mutedText);
  doc.text(
    "FreelanceFlow — Freelance Project & Client Management System. Full-stack College Project.",
    20,
    footerY + 6
  );

  doc.save(`FreelanceFlow_Financial_Report_${Date.now()}.pdf`);
}

/**
 * Generate and download a Project Summary PDF for an individual project or portfolio
 */
export function generateProjectSummaryPDF(project, tasks = [], deliverables = [], payments = []) {
  if (!project) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const primaryForest = [23, 61, 50];
  const creamBg = [247, 245, 239];
  const darkText = [36, 51, 45];
  const mutedText = [115, 123, 114];

  // Header Banner
  doc.setFillColor(...primaryForest);
  doc.rect(0, 0, 210, 36, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("FreelanceFlow", 20, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(223, 171, 123);
  doc.text("PROJECT CONTRACT SPECIFICATION & SUMMARY", 20, 28);

  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`Date: ${formatDate(new Date())}`, 145, 22);

  // Project Info Card
  doc.setFillColor(...creamBg);
  doc.rect(20, 44, 170, 38, "F");
  doc.setDrawColor(228, 225, 217);
  doc.rect(20, 44, 170, 38, "S");

  doc.setTextColor(...darkText);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(project.title, 26, 54);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...mutedText);
  doc.text(`Client: ${project.client?.fullName || "Unassigned"}`, 26, 62);
  doc.text(`Status: ${project.status} | Priority: ${project.priority}`, 26, 69);
  doc.text(`Deadline: ${formatDate(project.deadline)}`, 26, 76);

  doc.text(`Agreed Contract Fee: ${formatRsPlain(project.agreedAmount)}`, 110, 62);
  doc.text(`Milestone Progress: ${project.progress || 0}%`, 110, 69);

  // Tasks Section
  let currentY = 90;
  doc.setTextColor(...darkText);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`Milestones & Tasks (${tasks.length})`, 20, currentY);
  currentY += 6;

  doc.setFillColor(...primaryForest);
  doc.rect(20, currentY, 170, 7, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text("TASK / MILESTONE", 24, currentY + 5);
  doc.text("TYPE", 110, currentY + 5);
  doc.text("STATUS", 140, currentY + 5);
  doc.text("DUE DATE", 170, currentY + 5);
  currentY += 7;

  tasks.slice(0, 10).forEach((t, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 247, idx % 2 === 0 ? 255 : 245, idx % 2 === 0 ? 255 : 239);
    doc.rect(20, currentY, 170, 7, "F");
    doc.setDrawColor(228, 225, 217);
    doc.rect(20, currentY, 170, 7, "S");

    doc.setTextColor(...darkText);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(t.title.substring(0, 45), 24, currentY + 5);
    doc.text(t.type, 110, currentY + 5);
    doc.text(t.status, 140, currentY + 5);
    doc.text(formatDate(t.dueDate), 170, currentY + 5);
    currentY += 7;
  });

  // Footer
  const footerY = 280;
  doc.setDrawColor(228, 225, 217);
  doc.line(20, footerY, 190, footerY);
  doc.setFontSize(8);
  doc.setTextColor(...mutedText);
  doc.text("Generated by FreelanceFlow Business Management System.", 20, footerY + 6);

  doc.save(`Project_Summary_${project.title.replace(/\s+/g, "_")}.pdf`);
}

/**
 * Generate and download a real CSV file containing all filtered payment records
 */
export function generatePaymentsCSV(payments = []) {
  if (!payments || payments.length === 0) {
    alert("No payments available to export for the selected filter.");
    return;
  }

  const headers = [
    "Payment Date",
    "Reference Number",
    "Project Title",
    "Client Name",
    "Amount (INR)",
    "Payment Type",
    "Payment Method",
    "Notes",
  ];

  const rows = payments.map((p) => [
    formatDate(p.paymentDate),
    `"${p.referenceNumber || ""}"`,
    `"${p.project?.title || ""}"`,
    `"${p.project?.client?.fullName || ""}"`,
    paiseToRupees(p.amount),
    p.paymentType,
    p.paymentMethod,
    `"${(p.notes || "").replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `FreelanceFlow_Payments_Report_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
