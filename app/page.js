"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  IndianRupee,
  AlertCircle,
  Plus,
  ArrowUpRight,
  TrendingUp,
  FileCheck,
  CreditCard,
  UserPlus,
  FolderPlus,
  Calendar,
  CheckSquare,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import Loading from "@/components/Loading";
import EmptyState from "@/components/EmptyState";
import ProgressBar from "@/components/ProgressBar";
import { MonthlyRevenueChart, ProjectStatusChart } from "@/components/DashboardCharts";
import TaskForm from "@/components/TaskForm";
import PaymentForm from "@/components/PaymentForm";
import { formatDate, isOverdue, getStatusBadgeClasses, getPriorityBadgeClasses } from "@/lib/utils";
import { formatINR } from "@/lib/calculations";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quick Action Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard");
      const result = await res.json();

      if (result.success) {
        setData(result.data);
      } else {
        toast.error(result.message || "Failed to load dashboard data");
      }
    } catch (err) {
      console.error("Dashboard error:", err);
      toast.error("Could not connect to database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loading message="Loading FreelanceFlow executive metrics..." />;
  }

  const metrics = data?.metrics || {
    totalClients: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalEarningsPaise: 0,
    outstandingPaise: 0,
    pendingTasks: 0,
    overdueTasks: 0,
  };

  const charts = data?.charts || {
    monthlyRevenue: [],
    projectStatusDistribution: [],
  };

  const recentProjects = data?.recentProjects || [];
  const recentPayments = data?.recentPayments || [];
  const recentActivities = data?.recentActivities || [];
  const upcomingDeadlines = data?.upcomingDeadlines || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-cream-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-textColor-primary tracking-tight">
            Executive Business Dashboard
          </h1>
          <p className="text-xs md:text-sm text-textColor-secondary mt-1">
            Real-time freelance operational summary, active contracts, and cash flow balance.
          </p>
        </div>

        {/* Quick Action Buttons Grid */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/clients/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-cream-border bg-white text-textColor-primary hover:bg-cream-dark transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5 text-forest" />
            <span>Add Client</span>
          </Link>

          <Link
            href="/projects/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-forest text-white hover:bg-forest-light transition-colors shadow-sm"
          >
            <FolderPlus className="w-3.5 h-3.5 text-copper-light" />
            <span>Create Project</span>
          </Link>

          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-cream-border bg-white text-textColor-primary hover:bg-cream-dark transition-colors"
          >
            <CheckSquare className="w-3.5 h-3.5 text-sage-dark" />
            <span>Add Task</span>
          </button>

          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-copper text-white hover:bg-copper-dark transition-colors shadow-sm"
          >
            <CreditCard className="w-3.5 h-3.5 text-white" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* 8 Overview Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Earnings */}
        <StatCard
          title="Total Collected Revenue"
          value={formatINR(metrics.totalEarningsPaise)}
          subtitle="Total cleared cash flow"
          icon={IndianRupee}
          colorScheme="sage"
          href="/payments"
        />

        {/* Outstanding Due */}
        <StatCard
          title="Outstanding Payments"
          value={formatINR(metrics.outstandingPaise)}
          subtitle="Remaining contract balance"
          icon={AlertCircle}
          colorScheme={metrics.outstandingPaise > 0 ? "terracotta" : "forest"}
          href="/payments"
        />

        {/* Active Projects */}
        <StatCard
          title="Active Projects"
          value={metrics.activeProjects}
          subtitle={`${metrics.totalProjects} total contracts`}
          icon={Briefcase}
          colorScheme="forest"
          href="/projects"
        />

        {/* Completed Projects */}
        <StatCard
          title="Completed Projects"
          value={metrics.completedProjects}
          subtitle="Successfully delivered"
          icon={CheckCircle2}
          colorScheme="copper"
          href="/projects"
        />

        {/* Total Clients */}
        <StatCard
          title="Total Clients"
          value={metrics.totalClients}
          subtitle="Registered accounts"
          icon={Users}
          colorScheme="forest"
          href="/clients"
        />

        {/* Total Projects */}
        <StatCard
          title="Total Project Scope"
          value={metrics.totalProjects}
          subtitle="All contract entries"
          icon={Briefcase}
          colorScheme="forest"
          href="/projects"
        />

        {/* Pending Tasks */}
        <StatCard
          title="Pending Tasks"
          value={metrics.pendingTasks}
          subtitle="Action items remaining"
          icon={Clock}
          colorScheme="warning"
          href="/tasks"
        />

        {/* Overdue Tasks */}
        <StatCard
          title="Overdue Tasks"
          value={metrics.overdueTasks}
          subtitle="Past targeted due date"
          icon={AlertCircle}
          colorScheme={metrics.overdueTasks > 0 ? "terracotta" : "sage"}
          href="/tasks"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Bar Chart (2 Cols) */}
        <div className="lg:col-span-2 p-5 bg-white rounded-xl border border-cream-border card-shadow">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-cream-border">
            <div>
              <h3 className="text-base font-bold text-textColor-primary">
                Monthly Revenue Growth
              </h3>
              <p className="text-xs text-textColor-secondary">
                Cumulative revenue cleared by calendar month (INR)
              </p>
            </div>
            <Link
              href="/reports"
              className="text-xs font-semibold text-forest hover:underline flex items-center gap-0.5"
            >
              Full Analytics <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <MonthlyRevenueChart data={charts.monthlyRevenue} />
        </div>

        {/* Status Donut Chart (1 Col) */}
        <div className="p-5 bg-white rounded-xl border border-cream-border card-shadow">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-cream-border">
            <div>
              <h3 className="text-base font-bold text-textColor-primary">
                Project Distribution
              </h3>
              <p className="text-xs text-textColor-secondary">By current project status</p>
            </div>
          </div>
          <ProjectStatusChart data={charts.projectStatusDistribution} />
        </div>
      </div>

      {/* Recent Projects & Upcoming Deadlines Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-cream-border card-shadow overflow-hidden">
          <div className="p-4 border-b border-cream-border flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-textColor-primary">
                Recent Projects
              </h3>
              <p className="text-xs text-textColor-secondary">
                Latest contracted freelance assignments
              </p>
            </div>
            <Link
              href="/projects"
              className="text-xs font-semibold text-forest hover:underline"
            >
              View All Projects →
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <div className="p-8 text-center text-xs text-textColor-secondary">
              No projects added yet. Click &quot;Create Project&quot; to begin.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-cream/50 border-b border-cream-border text-xs uppercase font-semibold text-textColor-secondary">
                    <th className="py-2.5 px-4">Project</th>
                    <th className="py-2.5 px-4">Client</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 min-w-[120px]">Progress</th>
                    <th className="py-2.5 px-4 text-right">Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-border/60">
                  {recentProjects.map((p) => (
                    <tr key={p._id} className="hover:bg-cream/20">
                      <td className="py-3 px-4 font-semibold text-textColor-primary">
                        <Link href={`/projects/${p._id}`} className="hover:text-forest">
                          {p.title}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-xs text-textColor-secondary">
                        {p.client?.fullName || "Unassigned"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusBadgeClasses(
                            p.status
                          )}`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <ProgressBar progress={p.progress || 0} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-xs font-bold text-textColor-primary text-right">
                        {formatINR(p.agreedAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upcoming Deadlines Widget (1 Col) */}
        <div className="bg-white rounded-xl border border-cream-border card-shadow p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-cream-border">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-forest" />
                <h3 className="text-base font-bold text-textColor-primary">
                  Upcoming Deadlines
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-textColor-secondary">
                Next 14 Days
              </span>
            </div>

            {upcomingDeadlines.length === 0 ? (
              <div className="p-8 text-center text-xs text-textColor-secondary">
                No project deadlines due within the next 14 days.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map((p) => {
                  const overdue = isOverdue(p.deadline, p.status);
                  return (
                    <div
                      key={p._id}
                      className="p-3 rounded-lg border border-cream-border bg-cream/30 flex items-start justify-between"
                    >
                      <div>
                        <Link
                          href={`/projects/${p._id}`}
                          className="font-bold text-xs text-textColor-primary hover:text-forest line-clamp-1"
                        >
                          {p.title}
                        </Link>
                        <span className="text-[11px] text-textColor-secondary block mt-0.5">
                          {p.client?.fullName || "Client"}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-bold whitespace-nowrap ml-2 ${
                          overdue ? "text-terracotta" : "text-textColor-primary"
                        }`}
                      >
                        {formatDate(p.deadline)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-cream-border text-center">
            <Link
              href="/projects"
              className="text-xs font-semibold text-forest hover:underline"
            >
              Manage Project Schedules →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Payments & Activity Timeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments Ledger */}
        <div className="bg-white rounded-xl border border-cream-border card-shadow overflow-hidden">
          <div className="p-4 border-b border-cream-border flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-textColor-primary">
                Recent Cleared Payments
              </h3>
              <p className="text-xs text-textColor-secondary">
                Latest client remittance deposits
              </p>
            </div>
            <Link
              href="/payments"
              className="text-xs font-semibold text-forest hover:underline"
            >
              View Ledger →
            </Link>
          </div>

          {recentPayments.length === 0 ? (
            <div className="p-8 text-center text-xs text-textColor-secondary">
              No payments recorded yet. Click &quot;Record Payment&quot; to log incoming funds.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-cream/50 border-b border-cream-border text-xs uppercase font-semibold text-textColor-secondary">
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Project</th>
                    <th className="py-2.5 px-4">Method</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-border/60">
                  {recentPayments.map((pmt) => (
                    <tr key={pmt._id} className="hover:bg-cream/20">
                      <td className="py-2.5 px-4 text-xs text-textColor-secondary">
                        {formatDate(pmt.paymentDate)}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-xs text-textColor-primary truncate max-w-[140px]">
                        {pmt.project?.title || "N/A"}
                      </td>
                      <td className="py-2.5 px-4 text-xs text-textColor-secondary">
                        {pmt.paymentMethod}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-xs text-sage-dark text-right">
                        {formatINR(pmt.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Activity Timeline Feed */}
        <div className="bg-white rounded-xl border border-cream-border card-shadow p-4 flex flex-col justify-between">
          <div>
            <div className="pb-3 mb-3 border-b border-cream-border">
              <h3 className="text-base font-bold text-textColor-primary">
                System Activity Feed
              </h3>
              <p className="text-xs text-textColor-secondary">
                Audited timeline of operational and contract milestones
              </p>
            </div>

            {recentActivities.length === 0 ? (
              <div className="p-8 text-center text-xs text-textColor-secondary">
                No recent activity logged yet.
              </div>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {recentActivities.map((act) => (
                  <div key={act._id} className="flex items-start gap-2.5 text-xs">
                    <div className="p-1.5 rounded-full bg-cream-dark text-forest mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-textColor-primary">{act.title}</p>
                      <p className="text-textColor-secondary leading-snug">
                        {act.description}
                      </p>
                      <span className="text-[10px] text-textColor-secondary/70">
                        {formatDate(act.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Task Modal */}
      <TaskForm
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSuccess={fetchDashboardData}
      />

      {/* Quick Action Payment Modal */}
      <PaymentForm
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
}
