"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  Save,
  ArrowLeft,
  Briefcase,
  Users,
  IndianRupee,
  Calendar,
  AlertCircle,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { formatDateForInput } from "@/lib/utils";
import { paiseToRupees } from "@/lib/calculations";

export default function ProjectForm({ initialData = null, isEdit = false }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams?.get("clientId") || "";

  // Available clients list for dropdown
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    client: initialData?.client?._id || initialData?.client || preselectedClientId,
    description: initialData?.description || "",
    budget: initialData?.budget ? paiseToRupees(initialData.budget) : "",
    agreedAmount: initialData?.agreedAmount ? paiseToRupees(initialData.agreedAmount) : "",
    startDate: initialData?.startDate
      ? formatDateForInput(initialData.startDate)
      : formatDateForInput(new Date()),
    deadline: initialData?.deadline ? formatDateForInput(initialData.deadline) : "",
    priority: initialData?.priority || "Medium",
    status: initialData?.status || "Planning",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch clients for dropdown
  useEffect(() => {
    async function fetchClients() {
      try {
        const res = await fetch("/api/clients");
        const result = await res.json();
        if (result.success) {
          setClients(result.data || []);
        }
      } catch (err) {
        console.error("Failed to load clients:", err);
      } finally {
        setLoadingClients(false);
      }
    }
    fetchClients();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Project title is required";
    }

    if (!formData.client) {
      newErrors.client = "Please select a client";
    }

    if (!formData.agreedAmount || Number(formData.agreedAmount) < 0) {
      newErrors.agreedAmount = "Valid agreed payment amount is required";
    }

    if (!formData.deadline) {
      newErrors.deadline = "Project deadline is required";
    } else if (formData.startDate && new Date(formData.deadline) < new Date(formData.startDate)) {
      newErrors.deadline = "Deadline cannot be earlier than start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required project fields correctly");
      return;
    }

    setLoading(true);

    try {
      const url = isEdit ? `/api/projects/${initialData._id}` : "/api/projects";
      const method = isEdit ? "PATCH" : "POST";

      const payload = {
        ...formData,
        budget: formData.budget ? Number(formData.budget) : Number(formData.agreedAmount),
        agreedAmount: Number(formData.agreedAmount),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to save project");
      }

      toast.success(isEdit ? "Project updated successfully!" : "Project created successfully!");
      router.push(isEdit ? `/projects/${initialData._id}` : "/projects");
      router.refresh();
    } catch (err) {
      console.error("Project submit error:", err);
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl border border-cream-border card-shadow p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-cream-border">
        <div>
          <h2 className="text-xl font-bold text-textColor-primary">
            {isEdit ? "Edit Project Contract" : "Create New Project"}
          </h2>
          <p className="text-xs text-textColor-secondary mt-1">
            {isEdit
              ? "Update project timeline, agreed payment, and contract terms."
              : "Define project scope, assign client, set deadline and budget."}
          </p>
        </div>

        <Link
          href={isEdit ? `/projects/${initialData._id}` : "/projects"}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-textColor-secondary hover:text-textColor-primary hover:bg-cream-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel</span>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Project Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-textColor-primary mb-1.5">
            Project Title <span className="text-terracotta">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textColor-secondary">
              <Briefcase className="w-4 h-4" />
            </div>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. E-Commerce Website Redesign"
              className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest ${
                errors.title ? "border-terracotta" : "border-cream-border"
              }`}
            />
          </div>
          {errors.title && <p className="text-xs text-terracotta mt-1">{errors.title}</p>}
        </div>

        {/* Client Selection */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-textColor-primary">
              Client Assignment <span className="text-terracotta">*</span>
            </label>
            <Link
              href="/clients/new"
              className="text-xs font-semibold text-forest hover:underline"
            >
              + Create Client
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textColor-secondary">
              <Users className="w-4 h-4" />
            </div>
            <select
              name="client"
              value={formData.client}
              onChange={handleChange}
              disabled={loadingClients}
              className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest ${
                errors.client ? "border-terracotta" : "border-cream-border"
              }`}
            >
              <option value="">-- Select Client --</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.fullName} {c.company ? `(${c.company})` : ""}
                </option>
              ))}
            </select>
          </div>
          {errors.client && <p className="text-xs text-terracotta mt-1">{errors.client}</p>}
        </div>

        {/* Financial Fields (Agreed Amount & Budget) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-textColor-primary mb-1.5">
              Agreed Payment (INR ₹) <span className="text-terracotta">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textColor-secondary">
                <IndianRupee className="w-4 h-4" />
              </div>
              <input
                type="number"
                name="agreedAmount"
                value={formData.agreedAmount}
                onChange={handleChange}
                min="0"
                step="1"
                placeholder="e.g. 25000"
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest ${
                  errors.agreedAmount ? "border-terracotta" : "border-cream-border"
                }`}
              />
            </div>
            {errors.agreedAmount && (
              <p className="text-xs text-terracotta mt-1">{errors.agreedAmount}</p>
            )}
            <span className="text-[11px] text-textColor-secondary mt-1 block">
              Contract amount expected from client.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-textColor-primary mb-1.5">
              Estimated Budget (INR ₹)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textColor-secondary">
                <IndianRupee className="w-4 h-4" />
              </div>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                min="0"
                step="1"
                placeholder="e.g. 25000"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-cream-border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest"
              />
            </div>
            <span className="text-[11px] text-textColor-secondary mt-1 block">
              Internal project budget estimation.
            </span>
          </div>
        </div>

        {/* Dates (Start Date & Deadline) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-textColor-primary mb-1.5">
              Start Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textColor-secondary">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-cream-border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-textColor-primary mb-1.5">
              Project Deadline <span className="text-terracotta">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textColor-secondary">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest ${
                  errors.deadline ? "border-terracotta" : "border-cream-border"
                }`}
              />
            </div>
            {errors.deadline && (
              <p className="text-xs text-terracotta mt-1">{errors.deadline}</p>
            )}
          </div>
        </div>

        {/* Priority & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-textColor-primary mb-1.5">
              Priority Level
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-cream-border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High Priority</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-textColor-primary mb-1.5">
              Project Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-cream-border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest"
            >
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-textColor-primary mb-1.5">
            Project Description & Scope
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 pt-2.5 pointer-events-none text-textColor-secondary">
              <FileText className="w-4 h-4" />
            </div>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed project scope, deliverable specifications, key milestones..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-cream-border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-cream-border">
          <Link
            href={isEdit ? `/projects/${initialData._id}` : "/projects"}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-cream-border text-textColor-secondary bg-white hover:bg-cream-dark transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className={`inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg bg-forest text-white hover:bg-forest-light transition-colors shadow-sm ${
              loading ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <Save className="w-4 h-4 text-copper-light" />
            )}
            <span>{isEdit ? "Update Project" : "Create Project"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
