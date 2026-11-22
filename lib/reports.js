import { paiseToRupees } from "./calculations";

/**
 * Helper functions to transform raw MongoDB data into dashboard & analytics charts
 */

/**
 * Format payments into 6-month monthly revenue series
 */
export function buildMonthlyRevenueSeries(payments = []) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  const currentYear = now.getFullYear();

  // Initialize all 12 months with 0
  const monthlyMap = {};
  for (let i = 0; i < 12; i++) {
    monthlyMap[months[i]] = 0;
  }

  // Aggregate payments for the current year
  payments.forEach((payment) => {
    if (!payment.paymentDate) return;
    const date = new Date(payment.paymentDate);
    if (date.getFullYear() === currentYear) {
      const monthName = months[date.getMonth()];
      monthlyMap[monthName] += paiseToRupees(payment.amount);
    }
  });

  // Convert to array format for Recharts
  return months.map((m) => ({
    month: m,
    revenue: monthlyMap[m],
  }));
}

/**
 * Calculate distribution of projects by status for donut/pie chart
 */
export function buildProjectStatusDistribution(projects = []) {
  const counts = {
    Planning: 0,
    "In Progress": 0,
    "On Hold": 0,
    Completed: 0,
    Cancelled: 0,
  };

  projects.forEach((p) => {
    if (counts[p.status] !== undefined) {
      counts[p.status]++;
    } else {
      counts[p.status] = 1;
    }
  });

  const colors = {
    Planning: "#D9C7A7",
    "In Progress": "#173D32",
    "On Hold": "#A8B9A1",
    Completed: "#477960",
    Cancelled: "#B95449",
  };

  return Object.keys(counts)
    .filter((status) => counts[status] > 0)
    .map((status) => ({
      name: status,
      value: counts[status],
      color: colors[status] || "#737B72",
    }));
}

/**
 * Calculate earnings aggregated by Client
 */
export function buildClientEarningsList(clients = [], projects = [], payments = []) {
  // Create project to client mapping
  const projectClientMap = {};
  projects.forEach((proj) => {
    const clientId = typeof proj.client === "object" ? proj.client._id?.toString() : proj.client?.toString();
    if (clientId) {
      projectClientMap[proj._id.toString()] = clientId;
    }
  });

  // Accumulate payments per client
  const clientRevenueMap = {};
  payments.forEach((pmt) => {
    const projId = typeof pmt.project === "object" ? pmt.project._id?.toString() : pmt.project?.toString();
    const clientId = projectClientMap[projId];
    if (clientId) {
      clientRevenueMap[clientId] = (clientRevenueMap[clientId] || 0) + (Number(pmt.amount) || 0);
    }
  });

  return clients.map((client) => {
    const cId = client._id.toString();
    const totalPaise = clientRevenueMap[cId] || 0;
    return {
      clientId: cId,
      name: client.fullName,
      company: client.company || "Independent",
      totalEarnedPaise: totalPaise,
      totalEarnedRupees: paiseToRupees(totalPaise),
    };
  }).sort((a, b) => b.totalEarnedPaise - a.totalEarnedPaise);
}
