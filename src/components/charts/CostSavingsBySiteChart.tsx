import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
} from "recharts";

type SubsidiarySavingsPoint = {
  subsidiaryId: string;
  subsidiaryName: string;
  savings: number;
};

type CostSavingsBySiteChartProps = {
  selectedYear: number;
};

const COST_SAVINGS_BY_SUBSIDIARY: Record<number, SubsidiarySavingsPoint[]> = {
  2024: [
    { subsidiaryId: "sub1", subsidiaryName: "Coca-Cola Refreshments", savings: 285_744 },
    { subsidiaryId: "sub2", subsidiaryName: "Coca-Cola FEMSA", savings: 268_089 },
    { subsidiaryId: "sub3", subsidiaryName: "Coca-Cola HBC", savings: 252_234 },
    { subsidiaryId: "sub4", subsidiaryName: "Coca-Cola Amatil", savings: 238_180 },
    { subsidiaryId: "sub5", subsidiaryName: "Coca-Cola European Partners", savings: 225_450 },
    { subsidiaryId: "sub6", subsidiaryName: "Coca-Cola Bottling Co. United", savings: 215_320 },
    { subsidiaryId: "sub7", subsidiaryName: "Coca-Cola Consolidated", savings: 208_670 },
    { subsidiaryId: "sub8", subsidiaryName: "Swire Coca-Cola", savings: 198_540 },
  ],
  2023: [
    { subsidiaryId: "sub1", subsidiaryName: "Coca-Cola Refreshments", savings: 265_000 },
    { subsidiaryId: "sub2", subsidiaryName: "Coca-Cola FEMSA", savings: 248_000 },
    { subsidiaryId: "sub3", subsidiaryName: "Coca-Cola HBC", savings: 235_000 },
    { subsidiaryId: "sub4", subsidiaryName: "Coca-Cola Amatil", savings: 222_000 },
    { subsidiaryId: "sub5", subsidiaryName: "Coca-Cola European Partners", savings: 210_000 },
    { subsidiaryId: "sub6", subsidiaryName: "Coca-Cola Bottling Co. United", savings: 200_000 },
    { subsidiaryId: "sub7", subsidiaryName: "Coca-Cola Consolidated", savings: 195_000 },
    { subsidiaryId: "sub8", subsidiaryName: "Swire Coca-Cola", savings: 188_000 },
  ],
  2022: [
    { subsidiaryId: "sub1", subsidiaryName: "Coca-Cola Refreshments", savings: 255_000 },
    { subsidiaryId: "sub2", subsidiaryName: "Coca-Cola FEMSA", savings: 238_000 },
    { subsidiaryId: "sub3", subsidiaryName: "Coca-Cola HBC", savings: 228_000 },
    { subsidiaryId: "sub4", subsidiaryName: "Coca-Cola Amatil", savings: 218_000 },
    { subsidiaryId: "sub5", subsidiaryName: "Coca-Cola European Partners", savings: 208_000 },
    { subsidiaryId: "sub6", subsidiaryName: "Coca-Cola Bottling Co. United", savings: 198_000 },
    { subsidiaryId: "sub7", subsidiaryName: "Coca-Cola Consolidated", savings: 192_000 },
    { subsidiaryId: "sub8", subsidiaryName: "Swire Coca-Cola", savings: 185_000 },
  ],
};

export function CostSavingsBySiteChart({ selectedYear }: CostSavingsBySiteChartProps) {
  const data = COST_SAVINGS_BY_SUBSIDIARY[selectedYear] || COST_SAVINGS_BY_SUBSIDIARY[2024];
  
  // Find max savings to highlight the largest bar
  const maxSavings = Math.max(...data.map((d) => d.savings));

  // Properly typed formatter for LabelList
  // LabelList formatter accepts: (value: any, entry?: any, index?: number) => ReactNode | string
  const formatSavingsLabel = (value: any): string => {
    if (typeof value === 'number') {
      return `$${value.toLocaleString("en-US")}`;
    }
    if (typeof value === 'string') {
      return value;
    }
    return '';
  };

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
      <div style={{ width: "100%", height: 400, position: "relative", overflow: "visible" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 12, left: 0, bottom: 80 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(226, 232, 240, 0.6)"
              vertical={false}
            />
            <XAxis
              dataKey="subsidiaryName"
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
              tickFormatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: number) => `$${value.toLocaleString("en-US")}`}
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
              dataKey="savings"
              radius={[6, 6, 0, 0]}
            >
              {data.map((entry, index) => {
                const isMax = entry.savings === maxSavings;
                const fillColor = isMax ? "#2563eb" : "#3b82f6";
                return (
                  <Cell key={`cell-${index}`} fill={fillColor} />
                );
              })}
              <LabelList
                dataKey="savings"
                position="top"
                formatter={formatSavingsLabel}
                style={{
                  fill: "#1e293b",
                  fontSize: 11,
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

