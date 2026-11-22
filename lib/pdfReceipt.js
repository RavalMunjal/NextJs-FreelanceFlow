import { jsPDF } from "jspdf";
import { formatRsPlain, paiseToRupees } from "./calculations";
import { formatDate } from "./utils";

/**
 * Generate and download an authentic, beautifully styled Payment Receipt PDF
 */
export function generatePaymentReceiptPDF(payment) {
  if (!payment) return;

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

  // Logo Icon & Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("FreelanceFlow", 20, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(223, 171, 123); // copper gold light
  doc.text("OFFICIAL PAYMENT CLEARANCE RECEIPT", 20, 28);

  // Receipt Number & Date on right
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`Receipt Ref: ${payment.referenceNumber || payment._id.slice(-8).toUpperCase()}`, 140, 18);
  doc.text(`Issued Date: ${formatDate(new Date())}`, 140, 26);

  // 2. Client & Project Details Container
  doc.setFillColor(...creamBg);
  doc.rect(20, 46, 170, 42, "F");
  doc.setDrawColor(228, 225, 217);
  doc.rect(20, 46, 170, 42, "S");

  doc.setTextColor(...darkText);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("BILLED TO (CLIENT):", 26, 56);
  doc.text("PROJECT CONTEXT:", 110, 56);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...mutedText);

  // Client info
  const clientName = payment.project?.client?.fullName || "Client Name";
  const clientCompany = payment.project?.client?.company || "Independent Client";
  const clientEmail = payment.project?.client?.email || "";
  doc.setTextColor(...darkText);
  doc.text(clientName, 26, 64);
  doc.setTextColor(...mutedText);
  doc.text(clientCompany, 26, 71);
  if (clientEmail) doc.text(clientEmail, 26, 78);

  // Project info
  const projectTitle = payment.project?.title || "Freelance Project";
  doc.setTextColor(...darkText);
  doc.text(projectTitle, 110, 64);
  doc.setTextColor(...mutedText);
  doc.text(`Status: ${payment.project?.status || "Active"}`, 110, 71);
  doc.text(`Contract Fee: ${formatRsPlain(payment.project?.agreedAmount || 0)}`, 110, 78);

  // 3. Payment Line Item Table
  const startY = 100;
  doc.setFillColor(...primaryForest);
  doc.rect(20, startY, 170, 10, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("PAYMENT DATE", 25, startY + 6.5);
  doc.text("PAYMENT TYPE", 65, startY + 6.5);
  doc.text("METHOD", 105, startY + 6.5);
  doc.text("TRANSACTION REF", 135, startY + 6.5);
  doc.text("AMOUNT", 175, startY + 6.5, { align: "right" });

  // Table row
  doc.setFillColor(255, 255, 255);
  doc.rect(20, startY + 10, 170, 14, "F");
  doc.setDrawColor(228, 225, 217);
  doc.rect(20, startY + 10, 170, 14, "S");

  doc.setTextColor(...darkText);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(formatDate(payment.paymentDate), 25, startY + 18);
  doc.text(`${payment.paymentType} Payment`, 65, startY + 18);
  doc.text(payment.paymentMethod, 105, startY + 18);
  doc.text(payment.referenceNumber || "N/A", 135, startY + 18);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(53, 100, 81); // sage dark
  doc.text(formatRsPlain(payment.amount), 175, startY + 18, { align: "right" });

  // 4. Notes Section
  if (payment.notes) {
    doc.setTextColor(...mutedText);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text(`Payment Notes: "${payment.notes}"`, 25, startY + 32);
  }

  // 5. Total Receipt Box
  const totalBoxY = 145;
  doc.setFillColor(...creamBg);
  doc.rect(110, totalBoxY, 80, 30, "F");
  doc.setDrawColor(197, 139, 85);
  doc.rect(110, totalBoxY, 80, 30, "S");

  doc.setTextColor(...darkText);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Total Paid This Transaction:", 115, totalBoxY + 10);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...primaryForest);
  doc.text(formatRsPlain(payment.amount), 185, totalBoxY + 22, { align: "right" });

  // 6. Security & Verification Footer
  const footerY = 250;
  doc.setDrawColor(228, 225, 217);
  doc.line(20, footerY, 190, footerY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...mutedText);
  doc.text(
    "Thank you for your business. This is a computer-generated receipt from FreelanceFlow Business Management.",
    20,
    footerY + 8
  );
  doc.text(
    "Educational Demonstration Project — Mongoose, Next.js App Router & Tailwind CSS.",
    20,
    footerY + 14
  );

  // Save PDF
  const filename = `Receipt_${payment.referenceNumber || payment._id.slice(-6)}_${formatDate(
    payment.paymentDate
  ).replace(/\s+/g, "_")}.pdf`;
  doc.save(filename);
}
