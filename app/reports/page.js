"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  BarChart3,
  Download,
  Filter,
  FileSpreadsheet,
  FileText,
  IndianRupee,
  Calendar,
  Building2,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  PieChart as PieIcon,
  RotateCcw,
} from "lucide-react";
import Loading from "@/components/Loading";
import EmptyState from "@/components/EmptyState";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { formatINR, paiseToRupees, formatRsPlain } from "@/lib/calculations";
import { formatDate } from "@/lib/utils";
import { generateFinancialSummaryPDF, generatePaymentsCSV } from "@/lib/exportReports";

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Fetch report data
  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (selectedClient) params.set("client", selectedClient);
      if (selectedStatus) params.set("status", selectedStatus);

      const res = await fetch(`/api/reports?${params.toString()}`);
      const result = await res.json();

      if (result.success) {
        setData(result.data);
      } else {
        toast.error(result.message || "Failed to load report analytics");
      }
    } catch (err) {
      console.error("Fetch report error:", err);
      toast.error("Could not connect to database");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, selectedClient, selectedStatus]);

  // Load clients for filter
  useEffect(() => {
    async function loadClients() {
      try {
        const res = await fetch("/api/clients");
        const result = await res.json();
        if (result.success) setClients(result.data || []);
      } catch (err) {
        console.error("Error loading clients:", err);
      }
    }
    loadClients();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  if (loading && !data) {
    return <Loading message="Generating comprehensive financial analytics..." />;
  }

  const summary = data?.summary || {
    totalAgreedPaise: 0,
    totalPaidPaise: 0,
    outstandingPaise: 0,
    totalProjects: 0,
    totalClients: 0,
  };

  const charts = data?.charts || {
    monthlyRevenue: [],
    projectStatusDistribution: [],
  };

  const clientEarnings = data?.clientEarnings || [];
  const projectEarnings = data?.projectEarnings || [];
  const rawPayments = data?.rawPayments || [];
  const taskStats = data?.taskStats || { total: 0, completed: 0, inProgress: 0, toDo: 0 };

  // Task chart data
  const taskChartData = [
    { name: "Completed", value: taskStats.completed, color: "#477960" },
    { name: "In Progress", value: taskStats.inProgress, color: "#173D32" },
    { name: "To Do", value: taskStats.toDo, color: "#D9C7A7" },
  ].filter((t) => t.value > 0);

  // Client earnings top 6 for chart
  const clientChartData = clientEarnings.slice(0, 6).map((c) => ({
    name: c.name.length > 12 ? c.name.substring(0, 10) + "..." : c.name,
    earnings: c.totalEarnedRupees,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header & Export Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cream-border">
        <div>
          <h1 className="text-2xl font-bold text-textColor-primary tracking-tight">
            Financial Reports & Analytics
          </h1>
          <p className="text-xs text-textColor-secondary mt-1">
            Audit business revenue, analyze client profitability, and export verifiable PDF & CSV reports.
          </p>
        </div>

        {/* Real Download Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => generatePaymentsCSV(rawPayments)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-cream-border bg-white text-textColor-primary hover:bg-cream-dark transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-forest" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => generateFinancialSummaryPDF(data)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-forest text-white hover:bg-forest-light transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4 text-copper-light" />
            <span>Download Summary PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-cream-border card-shadow space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-textColor-primary uppercase tracking-wider mb-1">
          <Filter className="w-3.5 h-3.5 text-forest" />
          <span>Report Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Client Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-textColor-secondary mb-1">
              Filter by Client
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-cream-border bg-cream/20 text-textColor-primary focus:outline-none focus:ring-1 focus:ring-forest"
            >
              <option value="">All Clients</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Project Status */}
          <div>
            <label className="block text-[11px] font-semibold text-textColor-secondary mb-1">
              Project Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-cream-border bg-cream/20 text-textColor-primary focus:outline-none focus:ring-1 focus:ring-forest"
            >
              <option value="">All Statuses</option>
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-semibold text-textColor-secondary mb-1">
              Payments From
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2.5 py-1 text-xs rounded-lg border border-cream-border bg-cream/20 text-textColor-primary focus:outline-none focus:ring-1 focus:ring-forest"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-semibold text-textColor-secondary mb-1">
              Payments To
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2.5 py-1 text-xs rounded-lg border border-cream-border bg-cream/20 text-textColor-primary focus:outline-none focus:ring-1 focus:ring-forest"
            />
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Invoiced */}
        <div className="p-5 bg-white rounded-xl border border-cream-border card-shadow">
          <p className="text-xs font-semibold uppercase tracking-wider text-textColor-secondary mb-1">
            Total Contracted Value
          </p>
          <p className="text-2xl font-bold text-textColor-primary">
            {formatINR(summary.totalAgreedPaise)}
          </p>
          <span className="text-[11px] text-textColor-secondary mt-1 block">
            Across {summary.totalProjects} active projects
          </span>
        </div>

        {/* Total Collected */}
        <div className="p-5 bg-white rounded-xl border border-cream-border card-shadow">
          <p className="text-xs font-semibold uppercase tracking-wider text-textColor-secondary mb-1">
            Cleared Revenue Realized
          </p>
          <p className="text-2xl font-bold text-sage-dark">
            {formatINR(summary.totalPaidPaise)}
          </p>
          <span className="text-[11px] text-sage-dark font-medium mt-1 block">
            {rawPayments.length} transactions processed
          </span>
        </div>

        {/* Total Due */}
        <div className="p-5 bg-white rounded-xl border border-cream-border card-shadow">
          <p className="text-xs font-semibold uppercase tracking-wider text-textColor-secondary mb-1">
            Outstanding Receivable
          </p>
          <p className="text-2xl font-bold text-terracotta">
            {formatINR(summary.outstandingPaise)}
          </p>
          <span className="text-[11px] text-terracotta font-medium mt-1 block">
            Unpaid contract balances
          </span>
        </div>
      </div>

      {/* Analytics Charts Grid: Monthly Revenue & Client Earnings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Monthly Revenue Bar Chart */}
        <div className="p-5 bg-white rounded-xl border border-cream-border card-shadow">
          <h3 className="text-base font-bold text-textColor-primary mb-1">
            Monthly Revenue Trend
          </h3>
          <p className="text-xs text-textColor-secondary mb-4">
            Total cleared client payments (INR)
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.monthlyRevenue} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E1D9" vertical={false} />
                <XAxis dataKey="month" stroke="#737B72" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#737B72"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => (val >= 1000 ? `₹${val / 1000}k` : `₹${val}`)}
                />
                <Tooltip
                  formatter={(val) => [formatRsPlain(val, false), "Revenue"]}
                  contentStyle={{
                    backgroundColor: "#173D32",
                    borderRadius: "8px",
                    color: "#FFFFFF",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="revenue" fill="#173D32" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Client Earnings Bar Chart */}
        <div className="p-5 bg-white rounded-xl border border-cream-border card-shadow">
          <h3 className="text-base font-bold text-textColor-primary mb-1">
            Client-Wise Revenue Contribution
          </h3>
          <p className="text-xs text-textColor-secondary mb-4">
            Top accounts ranked by cleared cash receipts (INR)
          </p>

          <div className="h-64 w-full">
            {clientChartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs text-textColor-secondary">
                No client payment data recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clientChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E1D9" vertical={false} />
                  <XAxis dataKey="name" stroke="#737B72" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#737B72"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => (val >= 1000 ? `₹${val / 1000}k` : `₹${val}`)}
                  />
                  <Tooltip
                    formatter={(val) => [formatRsPlain(val, false), "Earned"]}
                    contentStyle={{
                      backgroundColor: "#173D32",
                      borderRadius: "8px",
                      color: "#FFFFFF",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="earnings" fill="#C58B55" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid: Project Status & Task Completion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Donut Chart */}
        <div className="p-5 bg-white rounded-xl border border-cream-border card-shadow">
          <h3 className="text-base font-bold text-textColor-primary mb-1">
            Project Status Distribution
          </h3>
          <p className="text-xs text-textColor-secondary mb-4">
            Current health of contracted portfolio
          </p>

          <div className="h-64 w-full">
            {charts.projectStatusDistribution.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs text-textColor-secondary">
                No projects found.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.projectStatusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {charts.projectStatusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val} projects`, name]}
                    contentStyle={{
                      backgroundColor: "#173D32",
                      borderRadius: "8px",
                      color: "#FFFFFF",
                      fontSize: "12px",
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Task Completion Donut Chart */}
        <div className="p-5 bg-white rounded-xl border border-cream-border card-shadow">
          <h3 className="text-base font-bold text-textColor-primary mb-1">
            Task & Milestone Execution
          </h3>
          <p className="text-xs text-textColor-secondary mb-4">
            Progress breakdown ({taskStats.completed}/{taskStats.total} completed)
          </p>

          <div className="h-64 w-full">
            {taskChartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs text-textColor-secondary">
                No tasks available to chart.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {taskChartData.map((entry, index) => (
                      <Cell key={`task-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val} tasks`, name]}
                    contentStyle={{
                      backgroundColor: "#173D32",
                      borderRadius: "8px",
                      color: "#FFFFFF",
                      fontSize: "12px",
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Project-Wise Financial Ledger Table */}
      <div className="bg-white rounded-xl border border-cream-border card-shadow overflow-hidden">
        <div className="p-4 border-b border-cream-border flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-textColor-primary">
              Project Ledger Breakdown
            </h3>
            <p className="text-xs text-textColor-secondary">
              Agreed fees, collected cash, and remaining balance per project
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-cream/60 border-b border-cream-border text-xs uppercase font-semibold text-textColor-secondary">
                <th className="py-3 px-4">Project Title</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Agreed Fee</th>
                <th className="py-3 px-4">Collected</th>
                <th className="py-3 px-4">Outstanding Due</th>
                <th className="py-3 px-4 text-right">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-border/60">
              {projectEarnings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-xs text-textColor-secondary">
                    No project financial records found matching the active filters.
                  </td>
                </tr>
              ) : (
                projectEarnings.map((p) => (
                  <tr key={p.projectId} className="hover:bg-cream/20">
                    <td className="py-3.5 px-4 font-semibold text-textColor-primary">
                      {p.title}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-textColor-secondary">
                      {p.client}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium">
                      <span className="px-2 py-0.5 rounded-full bg-cream-dark border border-cream-border">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-textColor-primary">
                      {formatINR(p.agreedPaise)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-sage-dark">
                      {formatINR(p.collectedPaise)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-terracotta">
                      {formatINR(p.duePaise)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs font-semibold text-textColor-primary">
                      {p.progress}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
