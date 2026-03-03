import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  Cell,
} from "recharts";

type CompletedRepairsBreakdownProps = {
  data: {
    repairComplete: number;
    notRepairable: number;
    repairRejected: number;
  };
};

export function CompletedRepairsBreakdownChart({
  data,
}: CompletedRepairsBreakdownProps) {
  const chartData = [
    { outcome: "Successfully Completed", count: data.repairComplete, color: "#22C55E" },
    { outcome: "Warranty Recapture", count: data.notRepairable, color: "#F59E0B" },
    { outcome: "Repair Rejected", count: data.repairRejected, color: "#EF4444" },
  ];

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
        Completed Repairs Breakdown
      </h2>
      <p
        style={{
          margin: 0,
          marginBottom: 20,
          fontSize: 13,
          color: "#64748b",
        }}
      >
        Share of completed repairs by outcome.
      </p>

      <div style={{ width: "100%", height: 200, position: "relative", overflow: "visible" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 100, bottom: 4 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(226, 232, 240, 0.6)"
              horizontal={false}
            />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              tick={{
                fill: "#64748b",
                fontSize: 12,
                fontWeight: 500,
              }}
            />
            <YAxis
              type="category"
              dataKey="outcome"
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
              cursor={{ fill: "rgba(34, 197, 94, 0.08)" }}
            />
            <Bar
              dataKey="count"
              radius={[0, 6, 6, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <LabelList
                dataKey="count"
                position="right"
                style={{
                  fill: "#0f172a",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

