import {
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

// Cost savings data by year (2023-2025)
const COST_SAVINGS_BY_YEAR = [
  { year: 2023, savings: 1363500 },
  { year: 2024, savings: 1450000 },
  { year: 2025, savings: 1532818 },
];

type TotalCostSavingsBlockProps = {
  ytdValue: number;
};

export function TotalCostSavingsBlock({ ytdValue }: TotalCostSavingsBlockProps) {
  return (
    <div className="total-cost-savings-block">
      <div className="total-cost-savings-block-header">
        <h3 className="total-cost-savings-block-title">Total Cost Savings</h3>
        <p className="total-cost-savings-block-description">
          Year-to-date savings generated through repaired parts.
        </p>
      </div>
      
      <div className="total-cost-savings-block-value">
        ${ytdValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
      </div>
      
      <div className="total-cost-savings-block-chart">
        <ResponsiveContainer width="100%" height={60}>
          <LineChart
            data={COST_SAVINGS_BY_YEAR}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <Line
              type="monotone"
              dataKey="savings"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
