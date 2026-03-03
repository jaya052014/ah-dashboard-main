import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// Cost savings data by year
// 2025 value must match Total Cost Savings YTD: $1,532,818
const COST_SAVINGS_BY_YEAR = [
  { year: 2023, savings: 1363500 },
  { year: 2024, savings: 1450000 },
  { year: 2025, savings: 1532818 },
];

// Format currency for display
const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}k`;
  }
  return `$${value.toLocaleString("en-US")}`;
};

// Custom tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "12px",
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.1)",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "#1e293b",
            marginBottom: "4px",
          }}
        >
          Year: {data.year}
        </div>
        <div
          style={{
            fontSize: "13px",
            color: "#2563eb",
            fontWeight: 600,
          }}
        >
          Cost Savings: ${data.savings.toLocaleString("en-US", { maximumFractionDigits: 0 })}
        </div>
      </div>
    );
  }
  return null;
};

export function CostSavings() {
  return (
    <section id="cost-savings" className="orders-table-card dashboard-section">
      <div className="repair-trend-analysis-header">
        <div className="repair-trend-analysis-header-left">
          <h3 className="dashboard-section-title">Cost Savings</h3>
          <p className="dashboard-section-subtitle">
            Track total repair cost savings achieved year over year.
          </p>
        </div>
      </div>

      <div style={{ width: "100%", height: 400, position: "relative", overflow: "visible" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={COST_SAVINGS_BY_YEAR}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="year"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="savings"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ fill: "#2563eb", r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
