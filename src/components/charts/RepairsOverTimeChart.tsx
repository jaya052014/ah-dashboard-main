import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { ORDERS_MOCK } from "../../data/orders";
import { filterOrdersByDateRange } from "../../utils/dateRangeFilters";
import type { DateRange } from "../DateRangeSelector";
import type { OrderRow } from "../../data/orders";

type RepairsOverTimeChartProps = {
  selectedOrgIds: string[];
  dateRange: DateRange;
};

export function RepairsOverTimeChart({ selectedOrgIds, dateRange }: RepairsOverTimeChartProps) {
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
    
    // Filter to completed orders only
    const completed = filtered.filter((o: OrderRow) => o.status === "Completed" && o.completedDate);
    
    // Group by week within the date range
    // For Last 30 days, show 4 weeks; for longer ranges, show more weeks
    const daysDiff = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
    let numWeeks: number;
    if (daysDiff <= 30) {
      numWeeks = 4; // Last 30 days = 4 weeks
    } else if (daysDiff <= 90) {
      numWeeks = Math.ceil(daysDiff / 7); // ~12-13 weeks for 90 days
    } else {
      numWeeks = Math.ceil(daysDiff / 7); // YTD or custom (up to ~26 weeks for 6 months)
    }
    
    // Ensure minimum of 4 weeks and maximum of 26 weeks for readability
    numWeeks = Math.max(4, Math.min(26, numWeeks));
    
    // Initialize all week buckets with 0 (ensures weeks with no repairs show as 0)
    const weekBuckets: number[] = new Array(numWeeks).fill(0);
    
    // Calculate week size in days
    const weekSize = daysDiff / numWeeks;
    
    // Group completed orders into week buckets
    completed.forEach((order: OrderRow) => {
      if (!order.completedDate) return;
      const orderDate = new Date(order.completedDate);
      orderDate.setHours(0, 0, 0, 0); // Normalize to start of day
      
      // Calculate days from start of range
      const daysFromStart = Math.floor((orderDate.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
      
      // Determine which week bucket this order belongs to
      const weekIndex = Math.min(Math.max(0, Math.floor(daysFromStart / weekSize)), numWeeks - 1);
      
      if (weekIndex >= 0 && weekIndex < numWeeks) {
        weekBuckets[weekIndex]++;
      }
    });
    
    // Return data array with week labels and repair counts (including weeks with 0 repairs)
    return weekBuckets.map((count, index) => ({
      week: `W${index + 1}`,
      repairs: count,
    }));
  }, [selectedOrgIds, dateRange]);
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 12,
        padding: 24,
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04), 0 0 0 1px rgba(15, 23, 42, 0.02)",
        position: "relative",
        overflow: "visible",
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
        Repair Participation by Customer Plant
      </h2>
      <p
        style={{
          margin: 0,
          marginBottom: 20,
          fontSize: 13,
          color: "#64748b",
        }}
      >
        Weekly volume of completed repairs (mock data).
      </p>

      <div style={{ width: "100%", height: 260, position: "relative", overflow: "visible" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 12, left: 0, bottom: 4 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(226, 232, 240, 0.6)"
              vertical={false}
            />
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
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
              cursor={{ stroke: "rgba(139, 92, 246, 0.4)", strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey="repairs"
              stroke="#2563eb"
              strokeWidth={2.5}
              dot={{
                r: 4,
                fill: "#ffffff",
                stroke: "#2563eb",
                strokeWidth: 2,
              }}
              activeDot={{ r: 6, strokeWidth: 0, fill: "#2563eb" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}