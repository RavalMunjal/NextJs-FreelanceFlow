"use client";

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
import { formatRsPlain } from "@/lib/calculations";

export function MonthlyRevenueChart({ data = [] }) {
  const hasData = data && data.some((item) => item.revenue > 0);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-xs text-textColor-secondary border border-dashed border-cream-border rounded-xl bg-cream/20">
        No revenue recorded yet this year.
      </div>
    );
  }

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-forest text-white p-2.5 rounded-lg text-xs shadow-lg border border-forest-light">
          <p className="font-semibold text-copper-light mb-1">{label}</p>
          <p className="font-bold">{formatRsPlain(payload[0].value, false)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E4E1D9" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="#737B72"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "#E4E1D9" }}
          />
          <YAxis
            stroke="#737B72"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => (val >= 1000 ? `₹${val / 1000}k` : `₹${val}`)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="revenue"
            fill="#173D32"
            radius={[4, 4, 0, 0]}
            maxBarSize={38}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ProjectStatusChart({ data = [] }) {
  const hasData = data && data.length > 0;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-xs text-textColor-secondary border border-dashed border-cream-border rounded-xl bg-cream/20">
        No active projects to display.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${value} projects`, name]}
            contentStyle={{
              backgroundColor: "#173D32",
              borderRadius: "8px",
              color: "#FFFFFF",
              fontSize: "12px",
              border: "1px solid #477960",
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => (
              <span className="text-xs text-textColor-primary font-medium">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
