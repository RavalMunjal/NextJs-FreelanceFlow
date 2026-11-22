"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Save,
  X,
  FileCheck,
  Briefcase,
  Calendar,
  Link as LinkIcon,
  FileText,
  AlertCircle,
} from "lucide-react";
import { formatDateForInput } from "@/lib/utils";

export default function DeliverableForm({
  isOpen,
  onClose,
  onSuccess,
  initialData = null,
  preselectedProjectId = "",
}) {
  const isEdit = Boolean(initialData);

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [formData, setFormData] = useState({
    project: initialData?.project?._id || initialData?.project || preselectedProjectId || "",
    title: initialData?.title || "",
    description: initialData?.description || "",
    dueDate: initialData?.dueDate ? formatDateForInput(initialData.dueDate) : "",
    fileUrl: initialData?.fileUrl || "",
    status: initialData?.status || "Pending",
    revisionNotes: initialData?.revisionNotes || "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        project: initialData?.project?._id || initialData?.project || preselectedProjectId || "",
        title: initialData?.title || "",
        description: initialData?.description || "",
        dueDate: initialData?.dueDate ? formatDateForInput(initialData.dueDate) : "",
        fileUrl: initialData?.fileUrl || "",
        status: initialData?.status || "Pending",
        revisionNotes: initialData?.revisionNotes || "",
      });
      setErrors({});
    }
  }, [isOpen, initialData, preselectedProjectId]);

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch("/api/projects");
        const result = await res.json();
        if (result.success) setProjects(result.data || []);
      } catch (err) {
        console.error("Failed to load projects for deliverable form:", err);
      } finally {
        setLoadingProjects(false);
      }
    }
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

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
    if (!formData.title.trim()) {
      newErrors.title = "Deliverable title is required";
    }
    if (!formData.project) {
      newErrors.project = "Please select an associated project";
    }
    if (formData.fileUrl && formData.fileUrl.trim()) {
      const urlPattern = /^https?:\/\/.+/i;
      if (!urlPattern.test(formData.fileUrl.trim())) {
        newErrors.fileUrl = "URL must start with http:// or https://";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fill in the deliverable fields correctly");
      return;
    }

    setLoading(true);

    try {
      const url = isEdit ? `/api/deliverables/${initialData._id}` : "/api/deliverables";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to save deliverable");
      }

      toast.success(isEdit ? "Deliverable updated!" : "Deliverable added successfully!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Deliverable submit error:", err);
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
          <div className="p-2 rounded-lg bg-forest/10 text-forest">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-textColor-primary">
              {isEdit ? "Edit Deliverable" : "Add Deliverable Requirement"}
            </h3>
            <p className="text-xs text-textColor-secondary">
              Track client deliverables, external review links, and approvals.
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
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
            {errors.project && <p className="text-xs text-terracotta mt-1">{errors.project}</p>}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-textColor-primary mb-1">
              Deliverable Title <span className="text-terracotta">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Final Production UI Assets & Source Code"
              className={`w-full px-3 py-2 text-sm rounded-lg border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest ${
                errors.title ? "border-terracotta" : "border-cream-border"
              }`}
            />
            {errors.title && <p className="text-xs text-terracotta mt-1">{errors.title}</p>}
          </div>

          {/* Due Date & Status Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-textColor-primary mb-1">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-cream-border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-textColor-primary mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-cream-border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest"
              >
                <option value="Pending">Pending</option>
                <option value="Submitted">Submitted</option>
                <option value="Approved">Approved</option>
                <option value="Revision Required">Revision Required</option>
              </select>
            </div>
          </div>

          {/* Attachment Link / File URL */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-textColor-primary mb-1">
              Attachment or External Link (Google Drive, Figma, GitHub)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textColor-secondary">
                <LinkIcon className="w-4 h-4" />
              </div>
              <input
                type="url"
                name="fileUrl"
                value={formData.fileUrl}
                onChange={handleChange}
                placeholder="https://drive.google.com/..."
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest ${
                  errors.fileUrl ? "border-terracotta" : "border-cream-border"
                }`}
              />
            </div>
            {errors.fileUrl && <p className="text-xs text-terracotta mt-1">{errors.fileUrl}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-textColor-primary mb-1">
              Deliverable Description
            </label>
            <textarea
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              placeholder="Scope, specifications, or format notes..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-cream-border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest"
            />
          </div>

          {/* Revision Notes if in revision status */}
          {formData.status === "Revision Required" && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-terracotta mb-1">
                Revision Notes / Feedback
              </label>
              <textarea
                name="revisionNotes"
                rows={2}
                value={formData.revisionNotes}
                onChange={handleChange}
                placeholder="Client feedback, requested modifications..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-terracotta/50 bg-terracotta-light/20 focus:outline-none focus:ring-1 focus:ring-terracotta"
              />
            </div>
          )}

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
              <span>{isEdit ? "Update Deliverable" : "Save Deliverable"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
