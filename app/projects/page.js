"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Briefcase,
  Search,
  Plus,
  LayoutGrid,
  List,
  Filter,
  Calendar,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Clock,
  ArrowUpDown,
} from "lucide-react";
import EmptyState from "@/components/EmptyState";
import Loading from "@/components/Loading";
import ConfirmDialog from "@/components/ConfirmDialog";
import ProgressBar from "@/components/ProgressBar";
import {
  formatDate,
  isOverdue,
  getStatusBadgeClasses,
  getPriorityBadgeClasses,
} from "@/lib/utils";
import { formatINR } from "@/lib/calculations";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Controls
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Deletion modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch projects from backend
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (selectedClient) params.set("client", selectedClient);
      if (selectedStatus) params.set("status", selectedStatus);
      if (selectedPriority) params.set("priority", selectedPriority);
      if (sortBy) params.set("sort", sortBy);

      const res = await fetch(`/api/projects?${params.toString()}`);
      const result = await res.json();

      if (result.success) {
        setProjects(result.data || []);
      } else {
        toast.error(result.message || "Failed to load projects");
      }
    } catch (err) {
      console.error("Fetch projects error:", err);
      toast.error("Could not connect to database");
    } finally {
      setLoading(false);
    }
  }, [search, selectedClient, selectedStatus, selectedPriority, sortBy]);

  // Load clients for filter dropdown
  useEffect(() => {
    async function loadClients() {
      try {
        const res = await fetch("/api/clients");
        const result = await res.json();
        if (result.success) setClients(result.data || []);
      } catch (err) {
        console.error("Error loading clients for filter:", err);
      }
    }
    loadClients();
  }, []);

  // Fetch projects on filter change
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Delete project handler
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/projects/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to delete project");
      }

      toast.success("Project deleted successfully");
      setProjects((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete project error:", err);
      toast.error(err.message || "Could not delete project");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cream-border">
        <div>
          <h1 className="text-2xl font-bold text-textColor-primary tracking-tight">
            Project Portfolio
          </h1>
          <p className="text-xs text-textColor-secondary mt-1">
            Track active client contracts, milestones, deadlines, and project progress.
          </p>
        </div>

        <Link
          href="/projects/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-forest text-white hover:bg-forest-light transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 text-copper-light" />
          <span>Create Project</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-cream-border card-shadow space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-textColor-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects by title or scope..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-cream-border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest"
            />
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-cream/50 p-1 rounded-lg border border-cream-border self-end lg:self-auto">
            <button
              onClick={() => setViewMode("grid")}
              title="Grid View"
              className={`p-1.5 rounded text-xs font-medium transition-colors ${
                viewMode === "grid"
                  ? "bg-forest text-white shadow-xs"
                  : "text-textColor-secondary hover:text-textColor-primary"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              title="List View"
              className={`p-1.5 rounded text-xs font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-forest text-white shadow-xs"
                  : "text-textColor-secondary hover:text-textColor-primary"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-2 border-t border-cream-border/60">
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

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-cream-border bg-cream/20 text-textColor-primary focus:outline-none focus:ring-1 focus:ring-forest"
          >
            <option value="">All Statuses</option>
            <option value="Planning">Planning</option>
            <option value="In Progress">In Progress</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-cream-border bg-cream/20 text-textColor-primary focus:outline-none focus:ring-1 focus:ring-forest"
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-cream-border bg-cream/20 text-textColor-primary focus:outline-none focus:ring-1 focus:ring-forest"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="deadline">Sort: Deadline</option>
            <option value="budget">Sort: Highest Budget</option>
            <option value="oldest">Sort: Oldest First</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <Loading message="Loading project contracts from database..." />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No projects found"
          description={
            search || selectedClient || selectedStatus || selectedPriority
              ? "No projects match your active search filters. Try clearing filters to see all projects."
              : "Create your first freelance project to organize tasks, deliverables, and track agreed payments."
          }
          actionText={
            search || selectedClient || selectedStatus || selectedPriority
              ? "Reset Filters"
              : "Create Project"
          }
          onAction={
            search || selectedClient || selectedStatus || selectedPriority
              ? () => {
                  setSearch("");
                  setSelectedClient("");
                  setSelectedStatus("");
                  setSelectedPriority("");
                }
              : null
          }
          actionHref={
            search || selectedClient || selectedStatus || selectedPriority
              ? null
              : "/projects/new"
          }
        />
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => {
            const overdue = isOverdue(proj.deadline, proj.status);

            return (
              <div
                key={proj._id}
                className={`bg-white rounded-xl border card-shadow card-hover p-5 flex flex-col justify-between transition-all ${
                  overdue
                    ? "border-terracotta/60 ring-1 ring-terracotta/20"
                    : "border-cream-border"
                }`}
              >
                <div>
                  {/* Card Header: Client & Status */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-textColor-secondary truncate">
                      {proj.client?.fullName || "Unassigned"}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${getStatusBadgeClasses(
                        proj.status
                      )}`}
                    >
                      {proj.status}
                    </span>
                  </div>

                  {/* Title */}
                  <Link
                    href={`/projects/${proj._id}`}
                    className="block text-base font-bold text-textColor-primary hover:text-forest line-clamp-1 mb-1.5"
                  >
                    {proj.title}
                  </Link>

                  {/* Description preview */}
                  <p className="text-xs text-textColor-secondary line-clamp-2 mb-4 leading-relaxed">
                    {proj.description || "No description provided."}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <ProgressBar progress={proj.progress || 0} size="sm" />
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-cream-border/60">
                  <div className="flex items-center justify-between text-xs mb-3">
                    <div>
                      <span className="text-textColor-secondary block text-[10px] uppercase font-semibold">
                        Agreed Fee
                      </span>
                      <span className="font-bold text-textColor-primary">
                        {formatINR(proj.agreedAmount)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-textColor-secondary block text-[10px] uppercase font-semibold">
                        Deadline
                      </span>
                      <span
                        className={`font-medium flex items-center gap-1 ${
                          overdue ? "text-terracotta font-bold" : "text-textColor-primary"
                        }`}
                      >
                        {overdue && <AlertCircle className="w-3 h-3 text-terracotta" />}
                        {formatDate(proj.deadline)}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between pt-2">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${getPriorityBadgeClasses(
                        proj.priority
                      )}`}
                    >
                      {proj.priority} Priority
                    </span>

                    <div className="flex items-center gap-1">
                      <Link
                        href={`/projects/${proj._id}`}
                        title="Open Workspace"
                        className="px-2.5 py-1 text-xs font-medium rounded bg-forest text-white hover:bg-forest-light transition-colors"
                      >
                        Workspace
                      </Link>
                      <Link
                        href={`/projects/${proj._id}/edit`}
                        title="Edit Project"
                        className="p-1 rounded text-textColor-secondary hover:text-textColor-primary hover:bg-cream-dark"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(proj)}
                        title="Delete Project"
                        className="p-1 rounded text-terracotta hover:bg-terracotta-light"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white rounded-xl border border-cream-border card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-cream/60 border-b border-cream-border text-xs uppercase font-semibold text-textColor-secondary">
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Agreed Amount</th>
                  <th className="py-3 px-4 min-w-[120px]">Progress</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-border/60">
                {projects.map((proj) => {
                  const overdue = isOverdue(proj.deadline, proj.status);

                  return (
                    <tr
                      key={proj._id}
                      className={`hover:bg-cream/20 transition-colors ${
                        overdue ? "bg-terracotta-light/10" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 font-semibold text-textColor-primary">
                        <Link href={`/projects/${proj._id}`} className="hover:text-forest">
                          {proj.title}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-textColor-secondary">
                        {proj.client?.fullName || "Unassigned"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusBadgeClasses(
                            proj.status
                          )}`}
                        >
                          {proj.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getPriorityBadgeClasses(
                            proj.priority
                          )}`}
                        >
                          {proj.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-textColor-primary">
                        {formatINR(proj.agreedAmount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <ProgressBar progress={proj.progress || 0} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <span
                          className={`flex items-center gap-1 ${
                            overdue ? "text-terracotta font-bold" : "text-textColor-secondary"
                          }`}
                        >
                          {overdue && <AlertCircle className="w-3 h-3 text-terracotta" />}
                          {formatDate(proj.deadline)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Link
                            href={`/projects/${proj._id}`}
                            className="px-2 py-1 text-xs font-medium rounded bg-forest text-white hover:bg-forest-light"
                          >
                            Workspace
                          </Link>
                          <Link
                            href={`/projects/${proj._id}/edit`}
                            className="p-1 rounded text-textColor-secondary hover:text-textColor-primary hover:bg-cream-dark"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(proj)}
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

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Project Contract?"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? Projects with dependent tasks, deliverables, or payment records cannot be deleted until those dependencies are removed.`}
        confirmText="Delete Project"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
