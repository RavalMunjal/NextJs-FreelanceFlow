"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Save,
  X,
  CreditCard,
  Briefcase,
  Calendar,
  IndianRupee,
  Hash,
  FileText,
  AlertCircle,
} from "lucide-react";
import { formatDateForInput } from "@/lib/utils";
import { paiseToRupees, formatINR } from "@/lib/calculations";

export default function PaymentForm({
  isOpen,
  onClose,
  onSuccess,
  initialData = null,
  preselectedProjectId = "",
}) {
  const isEdit = Boolean(initialData);

  const [projects, setProjects] = useState([]);
  const [selectedProjectInfo, setSelectedProjectInfo] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [formData, setFormData] = useState({
    project: initialData?.project?._id || initialData?.project || preselectedProjectId || "",
    amount: initialData?.amount ? paiseToRupees(initialData.amount) : "",
    paymentDate: initialData?.paymentDate
      ? formatDateForInput(initialData.paymentDate)
      : formatDateForInput(new Date()),
    paymentType: initialData?.paymentType || "Partial",
    paymentMethod: initialData?.paymentMethod || "UPI",
    referenceNumber: initialData?.referenceNumber || "",
    notes: initialData?.notes || "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        project: initialData?.project?._id || initialData?.project || preselectedProjectId || "",
        amount: initialData?.amount ? paiseToRupees(initialData.amount) : "",
        paymentDate: initialData?.paymentDate
          ? formatDateForInput(initialData.paymentDate)
          : formatDateForInput(new Date()),
        paymentType: initialData?.paymentType || "Partial",
        paymentMethod: initialData?.paymentMethod || "UPI",
        referenceNumber: initialData?.referenceNumber || "",
        notes: initialData?.notes || "",
      });
      setErrors({});
    }
  }, [isOpen, initialData, preselectedProjectId]);

  // Load projects with client details
  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch("/api/projects");
        const result = await res.json();
        if (result.success) setProjects(result.data || []);
      } catch (err) {
        console.error("Failed to load projects for payment:", err);
      } finally {
        setLoadingProjects(false);
      }
    }
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  // When selected project changes, fetch its current balance summary
  useEffect(() => {
    async function fetchProjectBalance(projId) {
      if (!projId) {
        setSelectedProjectInfo(null);
        return;
      }
      try {
        const res = await fetch(`/api/projects/${projId}`);
        const result = await res.json();
        if (result.success) {
          setSelectedProjectInfo(result.data);
        }
      } catch (err) {
        console.error("Error fetching project balance:", err);
      }
    }

    if (formData.project) {
      fetchProjectBalance(formData.project);
    }
  }, [formData.project]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.project) {
      newErrors.project = "Please select a project";
    }

    const amt = Number(formData.amount);
    if (!formData.amount || isNaN(amt) || amt <= 0) {
      newErrors.amount = "Enter a valid positive payment amount";
    } else if (selectedProjectInfo && !isEdit) {
      const outstandingRupees = paiseToRupees(
        selectedProjectInfo.financialSummary?.outstanding || 0
      );
      if (amt > outstandingRupees) {
        newErrors.amount = `Amount cannot exceed outstanding balance (${formatINR(
          selectedProjectInfo.financialSummary?.outstanding || 0
        )})`;
      }
    }

    if (!formData.paymentDate) {
      newErrors.paymentDate = "Payment date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please correct the payment errors");
      return;
    }

    setLoading(true);

    try {
      const url = isEdit ? `/api/payments/${initialData._id}` : "/api/payments";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount),
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to record payment");
      }

      toast.success(isEdit ? "Payment updated!" : "Payment recorded successfully!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Payment submit error:", err);
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-cream-border p-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-textColor-secondary hover:text-textColor-primary hover:bg-cream-dark transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-cream-border">
          <div className="p-2 rounded-lg bg-sage-light text-sage-dark">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-textColor-primary">
              {isEdit ? "Edit Payment Record" : "Record Client Payment"}
            </h3>
            <p className="text-xs text-textColor-secondary">
              Record manual clearance for advance, milestone, or final settlement.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Associated Project */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-textColor-primary mb-1">
              Project <span className="text-terracotta">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textColor-secondary">
                <Briefcase className="w-4 h-4" />
              </div>
              <select
                name="project"
                value={formData.project}
                onChange={handleChange}
                disabled={loadingProjects || Boolean(preselectedProjectId && !isEdit)}
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest ${
                  errors.project ? "border-terracotta" : "border-cream-border"
                }`}
              >
                <option value="">-- Select Project --</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title} {p.client ? `(${p.client.fullName})` : ""}
                  </option>
                ))}
              </select>
            </div>
            {errors.project && <p className="text-xs text-terracotta mt-1">{errors.project}</p>}

            {/* Selected Project Financial Summary Banner */}
            {selectedProjectInfo && (
              <div className="mt-2 p-2.5 bg-cream/50 rounded-lg border border-cream-border text-xs flex items-center justify-between">
                <span>
                  Agreed: <strong>{formatINR(selectedProjectInfo.project?.agreedAmount || 0)}</strong>
                </span>
                <span>
                  Paid: <strong className="text-sage-dark">{formatINR(selectedProjectInfo.financialSummary?.totalPaid || 0)}</strong>
                </span>
                <span>
                  Due: <strong className="text-terracotta">{formatINR(selectedProjectInfo.financialSummary?.outstanding || 0)}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Amount & Date Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-textColor-primary mb-1">
                Amount (INR ₹) <span className="text-terracotta">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textColor-secondary">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  placeholder="e.g. 5000"
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest ${
                    errors.amount ? "border-terracotta" : "border-cream-border"
                  }`}
                />
              </div>
              {errors.amount && <p className="text-xs text-terracotta mt-1">{errors.amount}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-textColor-primary mb-1">
                Payment Date <span className="text-terracotta">*</span>
              </label>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-cream-border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest"
              />
            </div>
          </div>

          {/* Type & Method Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-textColor-primary mb-1">
                Payment Type
              </label>
              <select
                name="paymentType"
                value={formData.paymentType}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-cream-border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest"
              >
                <option value="Advance">Advance Payment</option>
                <option value="Partial">Partial / Milestone</option>
                <option value="Final">Final Settlement</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-textColor-primary mb-1">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-cream-border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest"
              >
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Reference Number */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-textColor-primary mb-1">
              Transaction / Reference Number (UTR / Ref ID)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textColor-secondary">
                <Hash className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="referenceNumber"
                value={formData.referenceNumber}
                onChange={handleChange}
                placeholder="e.g. UPI/123456789 or TXN-9876"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-cream-border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-textColor-primary mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g. Cleared via GPay after Milestone 1 approval..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-cream-border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-cream-border">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-cream-border text-textColor-secondary hover:bg-cream-dark transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-forest text-white hover:bg-forest-light transition-colors shadow-sm"
            >
              {loading && (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              )}
              <Save className="w-4 h-4 text-copper-light" />
              <span>{isEdit ? "Update Payment" : "Record Payment"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
