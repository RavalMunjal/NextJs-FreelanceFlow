"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Save,
  X,
  CheckSquare,
  Briefcase,
  Calendar,
  AlertCircle,
  FileText,
  Flag,
} from "lucide-react";
import { formatDateForInput } from "@/lib/utils";

export default function TaskForm({
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
    type: initialData?.type || "Task",
    priority: initialData?.priority || "Medium",
    dueDate: initialData?.dueDate ? formatDateForInput(initialData.dueDate) : "",
    status: initialData?.status || "To Do",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        project: initialData?.project?._id || initialData?.project || preselectedProjectId || "",
        title: initialData?.title || "",
        description: initialData?.description || "",
        type: initialData?.type || "Task",
        priority: initialData?.priority || "Medium",
        dueDate: initialData?.dueDate ? formatDateForInput(initialData.dueDate) : "",
        status: initialData?.status || "To Do",
      });
      setErrors({});
    }
  }, [isOpen, initialData, preselectedProjectId]);

  // Load projects for dropdown
  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch("/api/projects");
        const result = await res.json();
        if (result.success) {
          setProjects(result.data || []);
        }
      } catch (err) {
        console.error("Failed to load projects for task form:", err);
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
      newErrors.title = "Task title is required";
    }
    if (!formData.project) {
      newErrors.project = "Please select an associated project";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fill in required fields");
      return;
    }

    setLoading(true);

    try {
      const url = isEdit ? `/api/tasks/${initialData._id}` : "/api/tasks";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to save task");
      }

      toast.success(isEdit ? "Task updated!" : "Task created successfully!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Task submit error:", err);
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
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-textColor-primary">
              {isEdit ? "Edit Task / Milestone" : "Add Task or Milestone"}
            </h3>
            <p className="text-xs text-textColor-secondary">
              Track project deliverables, action items, and key deadlines.
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
              Title <span className="text-terracotta">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Design homepage wireframes"
              className={`w-full px-3 py-2 text-sm rounded-lg border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest ${
                errors.title ? "border-terracotta" : "border-cream-border"
              }`}
            />
            {errors.title && <p className="text-xs text-terracotta mt-1">{errors.title}</p>}
          </div>

          {/* Type & Priority Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-textColor-primary mb-1">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-cream-border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest"
              >
                <option value="Task">Standard Task</option>
                <option value="Milestone">Key Milestone</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-textColor-primary mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-cream-border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Status & Due Date Grid */}
          <div className="grid grid-cols-2 gap-3">
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
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

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
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-textColor-primary mb-1">
              Description (Optional)
            </label>
            <textarea
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              placeholder="Add details, criteria or checklist items..."
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
              <span>{isEdit ? "Update Task" : "Save Task"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
