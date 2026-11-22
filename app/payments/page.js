"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Calendar,
  Building2,
  Briefcase,
  IndianRupee,
  FileText,
  CheckCircle,
} from "lucide-react";
import Loading from "@/components/Loading";
import EmptyState from "@/components/EmptyState";
import ConfirmDialog from "@/components/ConfirmDialog";
import PaymentForm from "@/components/PaymentForm";
import { formatDate } from "@/lib/utils";
import { formatINR, paiseToRupees } from "@/lib/calculations";
import { generatePaymentReceiptPDF } from "@/lib/pdfReceipt";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch payments
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedProject) params.set("project", selectedProject);
      if (selectedClient) params.set("client", selectedClient);
      if (selectedMethod) params.set("method", selectedMethod);
      if (selectedType) params.set("type", selectedType);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await fetch(`/api/payments?${params.toString()}`);
      const result = await res.json();

      if (result.success) {
        setPayments(result.data || []);
      } else {
        toast.error(result.message || "Failed to load payments");
      }
    } catch (err) {
      console.error("Fetch payments error:", err);
      toast.error("Could not connect to database");
    } finally {
      setLoading(false);
    }
  }, [selectedProject, selectedClient, selectedMethod, selectedType, startDate, endDate]);

  // Load projects and clients for filters
  useEffect(() => {
    async function loadFilterData() {
      try {
        const [projRes, clientRes] = await Promise.all([
          fetch("/api/projects"),
          fetch("/api/clients"),
        ]);
        const projData = await projRes.json();
        const clientData = await clientRes.json();

        if (projData.success) setProjects(projData.data || []);
        if (clientData.success) setClients(clientData.data || []);
      } catch (err) {
        console.error("Filter loading error:", err);
      }
    }
    loadFilterData();
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Delete payment handler
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/payments/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to delete payment");
      }

      toast.success("Payment deleted and balance restored");
      setPayments((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete payment error:", err);
      toast.error(err.message || "Could not delete payment");
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate total earnings in active filter
  const totalCollectedPaise = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cream-border">
        <div>
          <h1 className="text-2xl font-bold text-textColor-primary tracking-tight">
            Payments & Financial Ledger
          </h1>
          <p className="text-xs text-textColor-secondary mt-1">
            Track income, record advance and final settlements, verify balances, and download receipts.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingPayment(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-forest text-white hover:bg-forest-light transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 text-copper-light" />
          <span>Record Payment</span>
        </button>
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-cream-border card-shadow">
          <p className="text-xs font-semibold uppercase tracking-wider text-textColor-secondary mb-1">
            Total Collected Revenue
          </p>
          <p className="text-2xl font-bold text-sage-dark">
            {formatINR(totalCollectedPaise)}
          </p>
          <span className="text-[11px] text-textColor-secondary mt-1 block">
            Across {payments.length} cleared transactions
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-cream-border card-shadow">
          <p className="text-xs font-semibold uppercase tracking-wider text-textColor-secondary mb-1">
            Total Projects With Payments
          </p>
          <p className="text-2xl font-bold text-textColor-primary">
            {new Set(payments.map((p) => p.project?._id || p.project)).size}
          </p>
          <span className="text-[11px] text-textColor-secondary mt-1 block">
            Active revenue streams
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-cream-border card-shadow">
          <p className="text-xs font-semibold uppercase tracking-wider text-textColor-secondary mb-1">
            Payment Methods Used
          </p>
          <p className="text-2xl font-bold text-textColor-primary">
            {new Set(payments.map((p) => p.paymentMethod)).size}
          </p>
          <span className="text-[11px] text-textColor-secondary mt-1 block">
            UPI, Bank Transfer, Cash, Card
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-cream-border card-shadow space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Project Filter */}
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-cream-border bg-cream/20 text-textColor-primary focus:outline-none focus:ring-1 focus:ring-forest"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title}
              </option>
            ))}
          </select>

          {/* Client Filter */}
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-cream-border bg-cream/20 text-textColor-primary focus:outline-none focus:ring-1 focus:ring-forest"
          >
            <option value="">All Clients</option>
            {clients.map((c) => (
              <option key={c._id} value={c._id}>
                {c.fullName}
              </option>
            ))}
          </select>

          {/* Payment Method */}
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-cream-border bg-cream/20 text-textColor-primary focus:outline-none focus:ring-1 focus:ring-forest"
          >
            <option value="">All Methods</option>
            <option value="UPI">UPI</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="Other">Other</option>
          </select>

          {/* Payment Type */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-cream-border bg-cream/20 text-textColor-primary focus:outline-none focus:ring-1 focus:ring-forest"
          >
            <option value="">All Types</option>
            <option value="Advance">Advance</option>
            <option value="Partial">Partial</option>
            <option value="Final">Final</option>
          </select>

          {/* Start Date */}
          <input
            type="date"
            placeholder="From Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg border border-cream-border bg-cream/20 text-textColor-primary focus:outline-none focus:ring-1 focus:ring-forest"
          />

          {/* End Date */}
          <input
            type="date"
            placeholder="To Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg border border-cream-border bg-cream/20 text-textColor-primary focus:outline-none focus:ring-1 focus:ring-forest"
          />
        </div>
      </div>

      {/* Payments Table */}
      {loading ? (
        <Loading message="Loading payment ledger from database..." />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payments recorded"
          description="Record your first advance or milestone payment to track earnings and generate PDF receipts."
          actionText="Record Payment"
          onAction={() => {
            setEditingPayment(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-cream-border card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-cream/60 border-b border-cream-border text-xs uppercase font-semibold text-textColor-secondary">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Project & Client</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Ref Number</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-border/60">
                {payments.map((pmt) => (
                  <tr key={pmt._id} className="hover:bg-cream/20 transition-colors">
                    {/* Date */}
                    <td className="py-3.5 px-4 text-xs text-textColor-secondary whitespace-nowrap">
                      {formatDate(pmt.paymentDate)}
                    </td>

                    {/* Project & Client */}
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-textColor-primary">
                          {pmt.project?.title || "Project"}
                        </p>
                        <p className="text-xs text-textColor-secondary">
                          {pmt.project?.client?.fullName || "Client"}
                        </p>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-bold text-sage-dark whitespace-nowrap">
                      {formatINR(pmt.amount)}
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-4 text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-cream-dark font-medium border border-cream-border">
                        {pmt.paymentType}
                      </span>
                    </td>

                    {/* Method */}
                    <td className="py-3.5 px-4 text-xs text-textColor-primary font-medium">
                      {pmt.paymentMethod}
                    </td>

                    {/* Reference */}
                    <td className="py-3.5 px-4 text-xs font-mono text-textColor-secondary">
                      {pmt.referenceNumber || "-"}
                    </td>

                    {/* Notes */}
                    <td className="py-3.5 px-4 text-xs text-textColor-secondary max-w-xs truncate">
                      {pmt.notes || "-"}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {/* Download PDF Receipt */}
                        <button
                          onClick={() => generatePaymentReceiptPDF(pmt)}
                          title="Download PDF Receipt"
                          className="p-1.5 rounded text-forest hover:bg-forest/10 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5 text-forest" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => {
                            setEditingPayment(pmt);
                            setIsModalOpen(true);
                          }}
                          title="Edit Payment"
                          className="p-1 rounded text-textColor-secondary hover:text-textColor-primary hover:bg-cream-dark"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteTarget(pmt)}
                          title="Delete Payment"
                          className="p-1 rounded text-terracotta hover:bg-terracotta-light"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Form Modal */}
      <PaymentForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPayment(null);
        }}
        onSuccess={fetchPayments}
        initialData={editingPayment}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Payment Record?"
        message={`Are you sure you want to delete this payment of ${formatINR(
          deleteTarget?.amount || 0
        )}? The project's outstanding balance will be restored accordingly.`}
        confirmText="Confirm Delete"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
