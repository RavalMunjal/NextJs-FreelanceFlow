"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  FileCheck,
  Plus,
  Search,
  ExternalLink,
  CheckCircle2,
  RotateCcw,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  Calendar,
  Send,
  MessageSquare,
} from "lucide-react";
import Loading from "@/components/Loading";
import EmptyState from "@/components/EmptyState";
import ConfirmDialog from "@/components/ConfirmDialog";
import DeliverableForm from "@/components/DeliverableForm";
import { formatDate, isOverdue, getStatusBadgeClasses } from "@/lib/utils";

export default function DeliverablesPage() {
  const [deliverables, setDeliverables] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeliverable, setEditingDeliverable] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Revision Modal State
  const [revisionTarget, setRevisionTarget] = useState(null);
  const [revisionText, setRevisionText] = useState("");
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);

  // Quick Submit Link Modal State
  const [submitTarget, setSubmitTarget] = useState(null);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [isSubmittingLink, setIsSubmittingLink] = useState(false);

  // Fetch deliverables
  const fetchDeliverables = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (selectedProject) params.set("project", selectedProject);
      if (selectedStatus) params.set("status", selectedStatus);

      const res = await fetch(`/api/deliverables?${params.toString()}`);
      const result = await res.json();

      if (result.success) {
        setDeliverables(result.data || []);
      } else {
        toast.error(result.message || "Failed to load deliverables");
      }
    } catch (err) {
      console.error("Fetch deliverables error:", err);
      toast.error("Could not connect to database");
    } finally {
      setLoading(false);
    }
  }, [search, selectedProject, selectedStatus]);

  // Load projects for filter
  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch("/api/projects");
        const result = await res.json();
        if (result.success) setProjects(result.data || []);
      } catch (err) {
        console.error("Error loading projects:", err);
      }
    }
    loadProjects();
  }, []);

  useEffect(() => {
    fetchDeliverables();
  }, [fetchDeliverables]);

  // Quick Approve Handler
  const handleApprove = async (deliverableId) => {
    try {
      const res = await fetch(`/api/deliverables/${deliverableId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Approved" }),
      });
      const result = await res.json();

      if (result.success) {
        toast.success("Deliverable marked as Approved!");
        fetchDeliverables();
      } else {
        toast.error(result.message || "Could not approve deliverable");
      }
    } catch (err) {
      console.error("Approve error:", err);
      toast.error("Network error");
    }
  };

  // Quick Submit Link Handler
  const handleSubmitLink = async (e) => {
    e.preventDefault();
    if (!submitTarget) return;

    if (!submissionUrl.trim()) {
      toast.error("Please enter a valid URL link");
      return;
    }

    try {
      setIsSubmittingLink(true);
      const res = await fetch(`/api/deliverables/${submitTarget._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Submitted",
          fileUrl: submissionUrl.trim(),
        }),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to submit link");
      }

      toast.success("Deliverable submitted for review!");
      setSubmitTarget(null);
      setSubmissionUrl("");
      fetchDeliverables();
    } catch (err) {
      console.error("Submit link error:", err);
      toast.error(err.message || "Failed to submit");
    } finally {
      setIsSubmittingLink(false);
    }
  };

  // Request Revision Handler
  const handleRequestRevision = async (e) => {
    e.preventDefault();
    if (!revisionTarget) return;

    if (!revisionText.trim()) {
      toast.error("Please enter revision instructions for the freelancer or client");
      return;
    }

    try {
      setIsSubmittingRevision(true);
      const res = await fetch(`/api/deliverables/${revisionTarget._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Revision Required",
          revisionNotes: revisionText.trim(),
        }),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to request revision");
      }

      toast.success("Revision requested with notes recorded");
      setRevisionTarget(null);
      setRevisionText("");
      fetchDeliverables();
    } catch (err) {
      console.error("Revision error:", err);
      toast.error(err.message || "Failed to submit revision");
    } finally {
      setIsSubmittingRevision(false);
    }
  };

  // Delete deliverable
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/deliverables/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to delete deliverable");
      }

      toast.success("Deliverable removed");
      setDeliverables((prev) => prev.filter((d) => d._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.message || "Could not delete deliverable");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cream-border">
        <div>
          <h1 className="text-2xl font-bold text-textColor-primary tracking-tight">
            Deliverable Pipeline
          </h1>
          <p className="text-xs text-textColor-secondary mt-1">
            Track submissions, inspect external review links, manage revision requests, and log approvals.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingDeliverable(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-forest text-white hover:bg-forest-light transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 text-copper-light" />
          <span>Add Deliverable</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-cream-border card-shadow flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-textColor-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search deliverables..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-cream-border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
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

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-cream-border bg-cream/20 text-textColor-primary focus:outline-none focus:ring-1 focus:ring-forest"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Submitted">Submitted</option>
            <option value="Approved">Approved</option>
            <option value="Revision Required">Revision Required</option>
          </select>
        </div>
      </div>

      {/* Main Deliverables Table */}
      {loading ? (
        <Loading message="Loading deliverables from database..." />
      ) : deliverables.length === 0 ? (
        <EmptyState
          icon={FileCheck}
          title="No deliverables found"
          description="Create your first deliverable to manage external document links and client feedback."
          actionText="Create Deliverable"
          onAction={() => {
            setEditingDeliverable(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-cream-border card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-cream/60 border-b border-cream-border text-xs uppercase font-semibold text-textColor-secondary">
                  <th className="py-3 px-4">Deliverable</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Attachment</th>
                  <th className="py-3 px-4">Revision Notes</th>
                  <th className="py-3 px-4 text-right">Workflow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-border/60">
                {deliverables.map((del) => {
                  const overdue = isOverdue(del.dueDate, del.status);

                  return (
                    <tr
                      key={del._id}
                      className={`hover:bg-cream/20 transition-colors ${
                        overdue ? "bg-terracotta-light/10" : ""
                      }`}
                    >
                      {/* Title & Description */}
                      <td className="py-3.5 px-4 font-semibold text-textColor-primary">
                        <div>
                          <p>{del.title}</p>
                          {del.description && (
                            <p className="text-xs text-textColor-secondary font-normal line-clamp-1">
                              {del.description}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Project */}
                      <td className="py-3.5 px-4 text-textColor-secondary">
                        <span className="font-medium text-textColor-primary block">
                          {del.project?.title || "Project"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusBadgeClasses(
                            del.status
                          )}`}
                        >
                          {del.status}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4 text-xs">
                        <span
                          className={`flex items-center gap-1 ${
                            overdue ? "text-terracotta font-bold" : "text-textColor-secondary"
                          }`}
                        >
                          {overdue && <AlertCircle className="w-3.5 h-3.5 text-terracotta" />}
                          {formatDate(del.dueDate)}
                        </span>
                      </td>

                      {/* Attachment URL */}
                      <td className="py-3.5 px-4 text-xs">
                        {del.fileUrl ? (
                          <a
                            href={del.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-forest hover:underline"
                          >
                            <span>Open Asset</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <button
                            onClick={() => {
                              setSubmitTarget(del);
                              setSubmissionUrl("");
                            }}
                            className="text-xs text-copper-dark hover:underline font-semibold"
                          >
                            + Attach Link
                          </button>
                        )}
                      </td>

                      {/* Revision Notes */}
                      <td className="py-3.5 px-4 text-xs text-textColor-secondary max-w-xs truncate">
                        {del.revisionNotes ? (
                          <span
                            className="text-terracotta font-medium"
                            title={del.revisionNotes}
                          >
                            {del.revisionNotes}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {/* Submit / Resubmit */}
                          <button
                            onClick={() => {
                              setSubmitTarget(del);
                              setSubmissionUrl(del.fileUrl || "");
                            }}
                            title="Submit / Update Link"
                            className="p-1 rounded text-textColor-secondary hover:text-forest hover:bg-cream-dark"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>

                          {/* Approve */}
                          {del.status !== "Approved" && (
                            <button
                              onClick={() => handleApprove(del._id)}
                              title="Approve Deliverable"
                              className="p-1 rounded text-sage-dark hover:bg-sage-light"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Request Revision */}
                          {del.status !== "Revision Required" && (
                            <button
                              onClick={() => {
                                setRevisionTarget(del);
                                setRevisionText(del.revisionNotes || "");
                              }}
                              title="Request Revision"
                              className="p-1 rounded text-warning hover:bg-warning-light"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Edit */}
                          <button
                            onClick={() => {
                              setEditingDeliverable(del);
                              setIsModalOpen(true);
                            }}
                            title="Edit"
                            className="p-1 rounded text-textColor-secondary hover:text-textColor-primary hover:bg-cream-dark"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteTarget(del)}
                            title="Delete"
                            className="p-1 rounded text-terracotta hover:bg-terracotta-light"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main Deliverable Form Modal */}
      <DeliverableForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDeliverable(null);
        }}
        onSuccess={fetchDeliverables}
        initialData={editingDeliverable}
      />

      {/* Submit Attachment URL Modal */}
      {submitTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-cream-border p-6">
            <h3 className="text-lg font-bold text-textColor-primary mb-1">
              Submit Deliverable Link
            </h3>
            <p className="text-xs text-textColor-secondary mb-4">
              Attach external document or design asset URL for &quot;{submitTarget.title}&quot;.
            </p>

            <form onSubmit={handleSubmitLink} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-textColor-primary mb-1">
                  Asset or Document URL <span className="text-terracotta">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/..."
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-cream-border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmitTarget(null)}
                  className="px-3.5 py-1.5 text-xs font-medium rounded-lg border border-cream-border hover:bg-cream-dark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLink}
                  className="px-4 py-1.5 text-xs font-medium rounded-lg bg-forest text-white hover:bg-forest-light flex items-center gap-1.5"
                >
                  {isSubmittingLink && (
                    <div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  )}
                  <span>Submit for Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Revision Modal */}
      {revisionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-cream-border p-6">
            <h3 className="text-lg font-bold text-textColor-primary mb-1">
              Request Revision
            </h3>
            <p className="text-xs text-textColor-secondary mb-4">
              Specify what changes are required for &quot;{revisionTarget.title}&quot;.
            </p>

            <form onSubmit={handleRequestRevision} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-textColor-primary mb-1">
                  Revision Notes & Feedback <span className="text-terracotta">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe required revisions, client comments, or corrections..."
                  value={revisionText}
                  onChange={(e) => setRevisionText(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-cream-border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRevisionTarget(null)}
                  className="px-3.5 py-1.5 text-xs font-medium rounded-lg border border-cream-border hover:bg-cream-dark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRevision}
                  className="px-4 py-1.5 text-xs font-medium rounded-lg bg-terracotta text-white hover:bg-terracotta-dark flex items-center gap-1.5"
                >
                  {isSubmittingRevision && (
                    <div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  )}
                  <span>Request Revision</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Deliverable?"
        message={`Are you sure you want to remove deliverable "${deleteTarget?.title}"?`}
        confirmText="Delete"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
