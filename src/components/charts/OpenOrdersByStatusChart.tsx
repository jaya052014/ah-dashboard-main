import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { ORDERS_MOCK } from "../../data/orders";
import { filterOrdersByDateRange } from "../../utils/dateRangeFilters";
import type { DateRange } from "../DateRangeSelector";
import type { OrderRow } from "../../data/orders";

type OpenOrdersByStatusChartProps = {
  selectedOrgIds: string[];
  dateRange: DateRange;
};

export function OpenOrdersByStatusChart({ selectedOrgIds, dateRange }: OpenOrdersByStatusChartProps) {
  const data = useMemo(() => {
    // Filter by org and date range
    // If no subsidiaries selected, show empty (Interpretation A)
    let filtered = ORDERS_MOCK.filter((row: OrderRow) => {
      if (selectedOrgIds.length === 0) {
        return false;
      }
      return selectedOrgIds.includes(row.orgId);
    });
    
    filtered = filterOrdersByDateRange(filtered, dateRange);
    
    // Count by status
    const statusCounts: Record<string, number> = {
      Open: 0,
      "In Progress": 0,
      Delayed: 0,
      Completed: 0,
    };
    
    filtered.forEach((order: OrderRow) => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });
    
    return [
      { status: "Open", count: statusCounts.Open },
      { status: "In Progress", count: statusCounts["In Progress"] },
      { status: "Delayed", count: statusCounts.Delayed },
      { status: "Completed", count: statusCounts.Completed },
    ];
  }, [selectedOrgIds, dateRange]);
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 12,
        padding: 24,
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04), 0 0 0 1px rgba(15, 23, 42, 0.02)",
      }}
    >
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          margin: 0,
          marginBottom: 6,
          color: "#0f172a",
        }}
      >
        Open Orders by Status
      </h2>
      <p
        style={{
          margin: 0,
          marginBottom: 20,
          fontSize: 13,
          color: "#64748b",
        }}
      >
        Distribution of open orders across current status buckets.
      </p>

      <div style={{ width: "100%", height: 260, position: "relative", overflow: "visible" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 12, left: 0, bottom: 4 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(226, 232, 240, 0.6)"
              vertical={false}
            />
            <XAxis
              dataKey="status"
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              tick={{
                fill: "#64748b",
                fontSize: 12,
                fontWeight: 500,
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              tick={{
                fill: "#64748b",
                fontSize: 12,
                fontWeight: 500,
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                color: "#1e293b",
                fontSize: 13,
                fontWeight: 500,
                boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(15, 23, 42, 0.04)",
                padding: "8px 12px",
              }}
              wrapperStyle={{ zIndex: 9999, pointerEvents: 'none' }}
              cursor={{ fill: "rgba(139, 92, 246, 0.08)" }}
            />
            <Bar
              dataKey="count"
              radius={[6, 6, 0, 0]}
              fill="#2563eb"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}