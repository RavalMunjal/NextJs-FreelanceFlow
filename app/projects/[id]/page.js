"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Briefcase,
  Users,
  Calendar,
  IndianRupee,
  CheckSquare,
  FileCheck,
  CreditCard,
  Clock,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  RotateCcw,
  CheckCircle,
} from "lucide-react";
import Loading from "@/components/Loading";
import EmptyState from "@/components/EmptyState";
import ConfirmDialog from "@/components/ConfirmDialog";
import ProgressBar from "@/components/ProgressBar";
import {
  formatDate,
  isOverdue,
  getStatusBadgeClasses,
  getPriorityBadgeClasses,
} from "@/lib/utils";
import { formatINR, paiseToRupees } from "@/lib/calculations";

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "tasks" | "deliverables" | "payments" | "activity"

  // Quick action modal or delete modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load project workspace
  const fetchWorkspace = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${id}`);
      const result = await res.json();

      if (result.success) {
        setWorkspace(result.data);
      } else {
        toast.error(result.message || "Failed to load project workspace");
      }
    } catch (err) {
      console.error("Workspace error:", err);
      toast.error("Network error while loading project workspace");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchWorkspace();
    }
  }, [id, fetchWorkspace]);

  // Project Delete handler
  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Cannot delete project");
      }

      toast.success("Project deleted successfully");
      router.push("/projects");
      router.refresh();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete project");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Quick project status update handler
  const handleStatusChange = async (newStatus) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();

      if (result.success) {
        toast.success(`Project status marked as ${newStatus}`);
        fetchWorkspace();
      } else {
        toast.error(result.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Status update error:", err);
      toast.error("Could not update status");
    }
  };

  if (loading) {
    return <Loading message="Loading project workspace, tasks, deliverables & ledger..." />;
  }

  if (!workspace?.project) {
    return (
      <EmptyState
        title="Project Workspace Not Found"
        description="The requested project does not exist or has been removed."
        actionText="Back to Projects"
        actionHref="/projects"
      />
    );
  }

  const { project, tasks = [], deliverables = [], payments = [], activities = [], financialSummary } = workspace;
  const overdue = isOverdue(project.deadline, project.status);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-cream-border">
        <div className="flex items-start gap-3">
          <Link
            href="/projects"
            className="p-2 rounded-lg text-textColor-secondary hover:text-textColor-primary hover:bg-cream-dark transition-colors mt-0.5"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-textColor-primary">
                {project.title}
              </h1>
              <span
                className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getStatusBadgeClasses(
                  project.status
                )}`}
              >
                {project.status}
              </span>
              <span
                className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getPriorityBadgeClasses(
                  project.priority
                )}`}
              >
                {project.priority} Priority
              </span>
            </div>

            <p className="text-xs text-textColor-secondary">
              Client:{" "}
              {project.client ? (
                <Link
                  href={`/clients/${project.client._id}`}
                  className="font-semibold text-forest hover:underline"
                >
                  {project.client.fullName}
                  {project.client.company ? ` (${project.client.company})` : ""}
                </Link>
              ) : (
                "Unassigned"
              )}
            </p>
          </div>
        </div>

        {/* Quick status & edit buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick status selector */}
          <select
            value={project.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-cream-border bg-white text-textColor-primary focus:outline-none focus:ring-1 focus:ring-forest"
          >
            <option value="Planning">Status: Planning</option>
            <option value="In Progress">Status: In Progress</option>
            <option value="On Hold">Status: On Hold</option>
            <option value="Completed">Status: Completed</option>
            <option value="Cancelled">Status: Cancelled</option>
          </select>

          <Link
            href={`/projects/${project._id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-cream-border bg-white text-textColor-primary hover:bg-cream-dark transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Link>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-terracotta hover:bg-terracotta-light transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Financial & Completion Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Agreed Fee */}
        <div className="p-4 bg-white rounded-xl border border-cream-border card-shadow">
          <p className="text-xs font-semibold uppercase tracking-wider text-textColor-secondary mb-1">
            Agreed Contract Fee
          </p>
          <p className="text-2xl font-bold text-textColor-primary">
            {formatINR(project.agreedAmount)}
          </p>
          <span className="text-[11px] text-textColor-secondary mt-1 block">
            Budget estimate: {formatINR(project.budget || project.agreedAmount)}
          </span>
        </div>

        {/* Collected Payments */}
        <div className="p-4 bg-white rounded-xl border border-cream-border card-shadow">
          <p className="text-xs font-semibold uppercase tracking-wider text-textColor-secondary mb-1">
            Total Received
          </p>
          <p className="text-2xl font-bold text-sage-dark">
            {formatINR(financialSummary?.totalPaid || 0)}
          </p>
          <span className="text-[11px] font-medium text-sage-dark mt-1 block">
            Status: {financialSummary?.status || "Unpaid"}
          </span>
        </div>

        {/* Outstanding Balance */}
        <div className="p-4 bg-white rounded-xl border border-cream-border card-shadow">
          <p className="text-xs font-semibold uppercase tracking-wider text-textColor-secondary mb-1">
            Outstanding Due
          </p>
          <p className="text-2xl font-bold text-terracotta">
            {formatINR(financialSummary?.outstanding || 0)}
          </p>
          <span className="text-[11px] text-textColor-secondary mt-1 block">
            Balance remaining
          </span>
        </div>

        {/* Timeline & Deadline */}
        <div className="p-4 bg-white rounded-xl border border-cream-border card-shadow">
          <p className="text-xs font-semibold uppercase tracking-wider text-textColor-secondary mb-1">
            Project Deadline
          </p>
          <p
            className={`text-xl font-bold flex items-center gap-1.5 ${
              overdue ? "text-terracotta" : "text-textColor-primary"
            }`}
          >
            {overdue && <AlertCircle className="w-5 h-5 text-terracotta" />}
            {formatDate(project.deadline)}
          </p>
          <span className="text-[11px] text-textColor-secondary mt-1 block">
            Started: {formatDate(project.startDate)}
          </span>
        </div>
      </div>

      {/* Progress Bar Banner */}
      <div className="p-5 bg-white rounded-xl border border-cream-border card-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-textColor-primary">
            Project Milestone Completion
          </span>
          <span className="text-xs text-textColor-secondary font-medium">
            {tasks.filter((t) => t.status === "Completed").length} of {tasks.length} tasks completed
          </span>
        </div>
        <ProgressBar progress={project.progress || 0} size="lg" />
      </div>

      {/* Workspace Tabs Navigation */}
      <div className="border-b border-cream-border">
        <nav className="flex gap-4 sm:gap-6 overflow-x-auto text-sm font-medium">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "overview"
                ? "border-forest text-forest font-bold"
                : "border-transparent text-textColor-secondary hover:text-textColor-primary"
            }`}
          >
            Overview & Scope
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "tasks"
                ? "border-forest text-forest font-bold"
                : "border-transparent text-textColor-secondary hover:text-textColor-primary"
            }`}
          >
            <span>Tasks & Milestones</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cream-dark">
              {tasks.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("deliverables")}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "deliverables"
                ? "border-forest text-forest font-bold"
                : "border-transparent text-textColor-secondary hover:text-textColor-primary"
            }`}
          >
            <span>Deliverables</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cream-dark">
              {deliverables.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "payments"
                ? "border-forest text-forest font-bold"
                : "border-transparent text-textColor-secondary hover:text-textColor-primary"
            }`}
          >
            <span>Payments & Ledger</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cream-dark">
              {payments.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "activity"
                ? "border-forest text-forest font-bold"
                : "border-transparent text-textColor-secondary hover:text-textColor-primary"
            }`}
          >
            <span>Activity Log</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cream-dark">
              {activities.length}
            </span>
          </button>
        </nav>
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Scope description */}
          <div className="p-6 bg-white rounded-xl border border-cream-border card-shadow">
            <h3 className="text-base font-bold text-textColor-primary mb-3">
              Project Scope & Details
            </h3>
            <p className="text-sm text-textColor-primary leading-relaxed whitespace-pre-wrap">
              {project.description || "No detailed description provided for this project."}
            </p>
          </div>

          {/* Client Details Card */}
          {project.client && (
            <div className="p-6 bg-white rounded-xl border border-cream-border card-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-textColor-primary">
                  Client Information
                </h3>
                <Link
                  href={`/clients/${project.client._id}`}
                  className="text-xs font-semibold text-forest hover:underline"
                >
                  View Client Profile →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-xs font-semibold uppercase text-textColor-secondary block mb-1">
                    Client Name
                  </span>
                  <p className="font-semibold text-textColor-primary">
                    {project.client.fullName}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-textColor-secondary block mb-1">
                    Company
                  </span>
                  <p className="text-textColor-primary">
                    {project.client.company || "Independent"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-textColor-secondary block mb-1">
                    Email
                  </span>
                  <p className="text-textColor-primary">{project.client.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: TASKS */}
      {activeTab === "tasks" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-textColor-primary">
              Associated Tasks & Milestones
            </h3>
            <Link
              href="/tasks"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-forest text-white hover:bg-forest-light"
            >
              <Plus className="w-3.5 h-3.5 text-copper-light" />
              <span>Go to Kanban Board</span>
            </Link>
          </div>

          {tasks.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="No tasks or milestones added"
              description="Add tasks to this project on the Tasks page to track progress automatically."
              actionText="Manage Tasks"
              actionHref="/tasks"
            />
          ) : (
            <div className="bg-white rounded-xl border border-cream-border card-shadow overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-cream/60 border-b border-cream-border text-xs uppercase font-semibold text-textColor-secondary">
                    <th className="py-3 px-4">Task Title</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-border/60">
                  {tasks.map((task) => (
                    <tr key={task._id} className="hover:bg-cream/20">
                      <td className="py-3.5 px-4 font-semibold text-textColor-primary">
                        {task.title}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <span className="px-2 py-0.5 rounded bg-cream-dark">
                          {task.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <span className={`px-2 py-0.5 rounded border ${getPriorityBadgeClasses(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium">
                        <span className={`px-2 py-0.5 rounded border ${getStatusBadgeClasses(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-textColor-secondary">
                        {formatDate(task.dueDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: DELIVERABLES */}
      {activeTab === "deliverables" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-textColor-primary">
              Project Deliverables
            </h3>
            <Link
              href="/deliverables"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-forest text-white hover:bg-forest-light"
            >
              <Plus className="w-3.5 h-3.5 text-copper-light" />
              <span>Deliverable Pipeline</span>
            </Link>
          </div>

          {deliverables.length === 0 ? (
            <EmptyState
              icon={FileCheck}
              title="No deliverables created"
              description="Define deliverable requirements and track client review approvals."
              actionText="Open Deliverables"
              actionHref="/deliverables"
            />
          ) : (
            <div className="bg-white rounded-xl border border-cream-border card-shadow overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-cream/60 border-b border-cream-border text-xs uppercase font-semibold text-textColor-secondary">
                    <th className="py-3 px-4">Deliverable</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Attachment URL</th>
                    <th className="py-3 px-4">Revision Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-border/60">
                  {deliverables.map((del) => (
                    <tr key={del._id} className="hover:bg-cream/20">
                      <td className="py-3.5 px-4 font-semibold text-textColor-primary">
                        {del.title}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium">
                        <span className={`px-2 py-0.5 rounded border ${getStatusBadgeClasses(del.status)}`}>
                          {del.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-textColor-secondary">
                        {formatDate(del.dueDate)}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        {del.fileUrl ? (
                          <a
                            href={del.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-forest hover:underline"
                          >
                            <span>Open Link</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-textColor-secondary">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-textColor-secondary truncate max-w-xs">
                        {del.revisionNotes || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: PAYMENTS */}
      {activeTab === "payments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-textColor-primary">
              Payments & Financial Ledger
            </h3>
            <Link
              href="/payments"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-forest text-white hover:bg-forest-light"
            >
              <Plus className="w-3.5 h-3.5 text-copper-light" />
              <span>Record Payment</span>
            </Link>
          </div>

          {payments.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No payments recorded"
              description="Record advance, partial, or final payments received from the client."
              actionText="Record Payment"
              actionHref="/payments"
            />
          ) : (
            <div className="bg-white rounded-xl border border-cream-border card-shadow overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-cream/60 border-b border-cream-border text-xs uppercase font-semibold text-textColor-secondary">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Reference No.</th>
                    <th className="py-3 px-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-border/60">
                  {payments.map((pmt) => (
                    <tr key={pmt._id} className="hover:bg-cream/20">
                      <td className="py-3.5 px-4 text-xs text-textColor-secondary">
                        {formatDate(pmt.paymentDate)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-sage-dark">
                        {formatINR(pmt.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <span className="px-2 py-0.5 rounded bg-cream-dark">
                          {pmt.paymentType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-textColor-secondary">
                        {pmt.paymentMethod}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-textColor-secondary">
                        {pmt.referenceNumber || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-textColor-secondary truncate max-w-xs">
                        {pmt.notes || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: ACTIVITY LOG */}
      {activeTab === "activity" && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-textColor-primary">
            Project Event History
          </h3>

          {activities.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-cream-border text-xs text-textColor-secondary">
              No activity logged yet for this project.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-cream-border card-shadow divide-y divide-cream-border/60">
              {activities.map((act) => (
                <div key={act._id} className="p-4 flex items-start gap-3">
                  <div className="p-2 rounded-full bg-cream-dark text-forest mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-textColor-primary">{act.title}</h4>
                    <p className="text-xs text-textColor-secondary mt-0.5">{act.description}</p>
                    <span className="text-[11px] text-textColor-secondary/80 mt-1 block">
                      {formatDate(act.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Project Contract?"
        message={`Are you sure you want to delete "${project.title}"? Deletion is strictly blocked if tasks, deliverables, or payment records are linked.`}
        confirmText="Confirm Delete"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
