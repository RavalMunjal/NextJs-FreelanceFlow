"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle,
  Flag,
  Trash2,
  Edit,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Loading from "@/components/Loading";
import EmptyState from "@/components/EmptyState";
import ConfirmDialog from "@/components/ConfirmDialog";
import TaskForm from "@/components/TaskForm";
import { formatDate, isOverdue, getPriorityBadgeClasses } from "@/lib/utils";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedType, setSelectedType] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (selectedProject) params.set("project", selectedProject);
      if (selectedPriority) params.set("priority", selectedPriority);
      if (selectedType) params.set("type", selectedType);

      const res = await fetch(`/api/tasks?${params.toString()}`);
      const result = await res.json();

      if (result.success) {
        setTasks(result.data || []);
      } else {
        toast.error(result.message || "Failed to load tasks");
      }
    } catch (err) {
      console.error("Fetch tasks error:", err);
      toast.error("Could not connect to database");
    } finally {
      setLoading(false);
    }
  }, [search, selectedProject, selectedPriority, selectedType]);

  // Fetch projects for filter dropdown
  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch("/api/projects");
        const result = await res.json();
        if (result.success) setProjects(result.data || []);
      } catch (err) {
        console.error("Error loading projects for filter:", err);
      }
    }
    loadProjects();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Quick status update from Kanban board
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();

      if (result.success) {
        toast.success(`Task moved to ${newStatus}`);
        fetchTasks();
      } else {
        toast.error(result.message || "Could not update status");
      }
    } catch (err) {
      console.error("Task status update error:", err);
      toast.error("Network error");
    }
  };

  // Delete task
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/tasks/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to delete task");
      }

      toast.success("Task removed");
      setTasks((prev) => prev.filter((t) => t._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete task error:", err);
      toast.error(err.message || "Could not delete task");
    } finally {
      setIsDeleting(false);
    }
  };

  // Group tasks into three Kanban columns
  const todoTasks = tasks.filter((t) => t.status === "To Do");
  const inProgressTasks = tasks.filter((t) => t.status === "In Progress");
  const completedTasks = tasks.filter((t) => t.status === "Completed");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cream-border">
        <div>
          <h1 className="text-2xl font-bold text-textColor-primary tracking-tight">
            Tasks & Milestones
          </h1>
          <p className="text-xs text-textColor-secondary mt-1">
            Simple 3-column Kanban board to plan, prioritize, and track project completion.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTask(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-forest text-white hover:bg-forest-light transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 text-copper-light" />
          <span>Add Task / Milestone</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-cream-border card-shadow flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-textColor-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-cream-border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Project filter */}
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

          {/* Priority filter */}
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

          {/* Type filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-cream-border bg-cream/20 text-textColor-primary focus:outline-none focus:ring-1 focus:ring-forest"
          >
            <option value="">All Types</option>
            <option value="Task">Tasks Only</option>
            <option value="Milestone">Milestones Only</option>
          </select>
        </div>
      </div>

      {/* Main Kanban Board */}
      {loading ? (
        <Loading message="Loading Kanban board from database..." />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks or milestones found"
          description="Create your first task or milestone to break down your freelance project requirements."
          actionText="Create Task"
          onAction={() => {
            setEditingTask(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* COLUMN 1: TO DO */}
          <div className="bg-cream/40 rounded-xl border border-cream-border p-4 flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-cream-border">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-textColor-secondary" />
                <h3 className="text-sm font-bold text-textColor-primary uppercase tracking-wider">
                  To Do
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white border border-cream-border text-textColor-secondary">
                {todoTasks.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[700px] pr-1">
              {todoTasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-textColor-secondary border border-dashed border-cream-border rounded-lg bg-white/50">
                  No pending tasks
                </div>
              ) : (
                todoTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onEdit={(t) => {
                      setEditingTask(t);
                      setIsModalOpen(true);
                    }}
                    onDelete={(t) => setDeleteTarget(t)}
                  />
                ))
              )}
            </div>
          </div>

          {/* COLUMN 2: IN PROGRESS */}
          <div className="bg-cream/40 rounded-xl border border-cream-border p-4 flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-cream-border">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-forest" />
                <h3 className="text-sm font-bold text-textColor-primary uppercase tracking-wider">
                  In Progress
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white border border-cream-border text-forest">
                {inProgressTasks.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[700px] pr-1">
              {inProgressTasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-textColor-secondary border border-dashed border-cream-border rounded-lg bg-white/50">
                  No tasks currently active
                </div>
              ) : (
                inProgressTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onEdit={(t) => {
                      setEditingTask(t);
                      setIsModalOpen(true);
                    }}
                    onDelete={(t) => setDeleteTarget(t)}
                  />
                ))
              )}
            </div>
          </div>

          {/* COLUMN 3: COMPLETED */}
          <div className="bg-cream/40 rounded-xl border border-cream-border p-4 flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-cream-border">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sage-dark" />
                <h3 className="text-sm font-bold text-textColor-primary uppercase tracking-wider">
                  Completed
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white border border-cream-border text-sage-dark">
                {completedTasks.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[700px] pr-1">
              {completedTasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-textColor-secondary border border-dashed border-cream-border rounded-lg bg-white/50">
                  No completed tasks yet
                </div>
              ) : (
                completedTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onEdit={(t) => {
                      setEditingTask(t);
                      setIsModalOpen(true);
                    }}
                    onDelete={(t) => setDeleteTarget(t)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Task Modal for Add / Edit */}
      <TaskForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSuccess={fetchTasks}
        initialData={editingTask}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Task / Milestone?"
        message={`Are you sure you want to remove "${deleteTarget?.title}"? Project progress will be recalculated immediately.`}
        confirmText="Delete Task"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

// Kanban Task Card Item
function TaskCard({ task, onStatusChange, onEdit, onDelete }) {
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div
      className={`bg-white rounded-xl border p-4 card-shadow transition-all ${
        overdue
          ? "border-terracotta/70 bg-terracotta-light/10"
          : "border-cream-border hover:border-forest/40"
      }`}
    >
      {/* Project name & Type */}
      <div className="flex items-center justify-between gap-2 mb-1.5 text-xs">
        <span className="font-semibold text-textColor-secondary truncate">
          {task.project?.title || "Project"}
        </span>
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
            task.type === "Milestone"
              ? "bg-copper-light/30 text-copper-dark"
              : "bg-cream-dark text-textColor-secondary"
          }`}
        >
          {task.type}
        </span>
      </div>

      {/* Task Title */}
      <h4
        className={`text-sm font-bold mb-1.5 ${
          task.status === "Completed"
            ? "line-through text-textColor-secondary"
            : "text-textColor-primary"
        }`}
      >
        {task.title}
      </h4>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-textColor-secondary line-clamp-2 mb-3 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Priority & Due Date */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-cream-border/60 mb-3">
        <span
          className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${getPriorityBadgeClasses(
            task.priority
          )}`}
        >
          {task.priority}
        </span>

        {task.dueDate && (
          <span
            className={`flex items-center gap-1 text-[11px] font-medium ${
              overdue ? "text-terracotta font-bold" : "text-textColor-secondary"
            }`}
          >
            {overdue && <AlertCircle className="w-3.5 h-3.5 text-terracotta" />}
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>

      {/* Quick Move Status Buttons & Actions */}
      <div className="flex items-center justify-between pt-1">
        {/* Status Dropdown */}
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task._id, e.target.value)}
          className="text-xs py-1 px-2 rounded border border-cream-border bg-cream/30 text-textColor-primary focus:outline-none focus:ring-1 focus:ring-forest"
        >
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        {/* Edit and Delete */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(task)}
            title="Edit Task"
            className="p-1 rounded text-textColor-secondary hover:text-textColor-primary hover:bg-cream-dark"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(task)}
            title="Delete Task"
            className="p-1 rounded text-terracotta hover:bg-terracotta-light"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
