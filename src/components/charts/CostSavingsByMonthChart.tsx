import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
  } from "recharts";
  
  type MonthPoint = {
    month: string;
    savings: number;
    isActive?: boolean;
  };

  type MonthKey = "total" | "Jan" | "Feb" | "Mar" | "Apr" | "May" | "Jun" | "Jul" | "Aug" | "Sep" | "Oct" | "Nov" | "Dec";

  type CostSavingsByMonthChartProps = {
    selectedYear: number;
    selectedMonth: MonthKey;
    selectedOrgIds: string[];
  };
  
  const monthlySavingsByYearAndOrg: Record<string, Record<number, MonthPoint[]>> = {
    root: {
      2024: [
        { month: "Jan", savings: 30476 },
        { month: "Feb", savings: 96782 },
        { month: "Mar", savings: 112029 },
        { month: "Apr", savings: 130287 },
        { month: "May", savings: 277799 },
        { month: "Jun", savings: 194216 },
        { month: "Jul", savings: 187546 },
        { month: "Aug", savings: 159155 },
        { month: "Sep", savings: 186292 },
        { month: "Oct", savings: 221629 },
        { month: "Nov", savings: 198432 },
        { month: "Dec", savings: 175643 },
      ],
      2023: [
        { month: "Jan", savings: 28500 },
        { month: "Feb", savings: 92000 },
        { month: "Mar", savings: 108000 },
        { month: "Apr", savings: 125000 },
        { month: "May", savings: 265000 },
        { month: "Jun", savings: 185000 },
        { month: "Jul", savings: 178000 },
        { month: "Aug", savings: 152000 },
        { month: "Sep", savings: 175000 },
        { month: "Oct", savings: 210000 },
        { month: "Nov", savings: 190000 },
        { month: "Dec", savings: 168000 },
      ],
      2022: [
        { month: "Jan", savings: 27000 },
        { month: "Feb", savings: 88000 },
        { month: "Mar", savings: 105000 },
        { month: "Apr", savings: 120000 },
        { month: "May", savings: 255000 },
        { month: "Jun", savings: 180000 },
        { month: "Jul", savings: 172000 },
        { month: "Aug", savings: 148000 },
        { month: "Sep", savings: 170000 },
        { month: "Oct", savings: 205000 },
        { month: "Nov", savings: 185000 },
        { month: "Dec", savings: 165000 },
      ],
    },
    sub1: {
      2024: [
        { month: "Jan", savings: 12000 },
        { month: "Feb", savings: 38000 },
        { month: "Mar", savings: 44000 },
        { month: "Apr", savings: 51000 },
        { month: "May", savings: 109000 },
        { month: "Jun", savings: 76000 },
        { month: "Jul", savings: 74000 },
        { month: "Aug", savings: 63000 },
        { month: "Sep", savings: 73000 },
        { month: "Oct", savings: 87000 },
        { month: "Nov", savings: 78000 },
        { month: "Dec", savings: 69000 },
      ],
      2023: [
        { month: "Jan", savings: 11200 },
        { month: "Feb", savings: 36000 },
        { month: "Mar", savings: 42000 },
        { month: "Apr", savings: 49000 },
        { month: "May", savings: 104000 },
        { month: "Jun", savings: 73000 },
        { month: "Jul", savings: 70000 },
        { month: "Aug", savings: 60000 },
        { month: "Sep", savings: 69000 },
        { month: "Oct", savings: 82000 },
        { month: "Nov", savings: 75000 },
        { month: "Dec", savings: 66000 },
      ],
      2022: [
        { month: "Jan", savings: 10600 },
        { month: "Feb", savings: 35000 },
        { month: "Mar", savings: 41000 },
        { month: "Apr", savings: 47000 },
        { month: "May", savings: 100000 },
        { month: "Jun", savings: 71000 },
        { month: "Jul", savings: 68000 },
        { month: "Aug", savings: 58000 },
        { month: "Sep", savings: 67000 },
        { month: "Oct", savings: 80000 },
        { month: "Nov", savings: 73000 },
        { month: "Dec", savings: 65000 },
      ],
    },
    sub2: {
      2024: [
        { month: "Jan", savings: 9200 },
        { month: "Feb", savings: 29000 },
        { month: "Mar", savings: 34000 },
        { month: "Apr", savings: 39000 },
        { month: "May", savings: 84000 },
        { month: "Jun", savings: 59000 },
        { month: "Jul", savings: 57000 },
        { month: "Aug", savings: 48000 },
        { month: "Sep", savings: 56000 },
        { month: "Oct", savings: 67000 },
        { month: "Nov", savings: 60000 },
        { month: "Dec", savings: 53000 },
      ],
      2023: [
        { month: "Jan", savings: 8600 },
        { month: "Feb", savings: 28000 },
        { month: "Mar", savings: 33000 },
        { month: "Apr", savings: 38000 },
        { month: "May", savings: 80000 },
        { month: "Jun", savings: 56000 },
        { month: "Jul", savings: 54000 },
        { month: "Aug", savings: 46000 },
        { month: "Sep", savings: 53000 },
        { month: "Oct", savings: 64000 },
        { month: "Nov", savings: 57000 },
        { month: "Dec", savings: 50000 },
      ],
      2022: [
        { month: "Jan", savings: 8200 },
        { month: "Feb", savings: 27000 },
        { month: "Mar", savings: 32000 },
        { month: "Apr", savings: 36000 },
        { month: "May", savings: 77000 },
        { month: "Jun", savings: 54000 },
        { month: "Jul", savings: 52000 },
        { month: "Aug", savings: 44000 },
        { month: "Sep", savings: 51000 },
        { month: "Oct", savings: 61000 },
        { month: "Nov", savings: 55000 },
        { month: "Dec", savings: 49000 },
      ],
    },
    sub3: {
      2024: [
        { month: "Jan", savings: 9276 },
        { month: "Feb", savings: 29782 },
        { month: "Mar", savings: 34029 },
        { month: "Apr", savings: 40287 },
        { month: "May", savings: 84799 },
        { month: "Jun", savings: 59216 },
        { month: "Jul", savings: 56546 },
        { month: "Aug", savings: 48155 },
        { month: "Sep", savings: 57292 },
        { month: "Oct", savings: 68629 },
        { month: "Nov", savings: 60432 },
        { month: "Dec", savings: 53643 },
      ],
      2023: [
        { month: "Jan", savings: 8700 },
        { month: "Feb", savings: 28000 },
        { month: "Mar", savings: 33000 },
        { month: "Apr", savings: 38000 },
        { month: "May", savings: 81000 },
        { month: "Jun", savings: 56000 },
        { month: "Jul", savings: 54000 },
        { month: "Aug", savings: 46000 },
        { month: "Sep", savings: 53000 },
        { month: "Oct", savings: 64000 },
        { month: "Nov", savings: 58000 },
        { month: "Dec", savings: 52000 },
      ],
      2022: [
        { month: "Jan", savings: 8200 },
        { month: "Feb", savings: 26000 },
        { month: "Mar", savings: 32000 },
        { month: "Apr", savings: 37000 },
        { month: "May", savings: 78000 },
        { month: "Jun", savings: 55000 },
        { month: "Jul", savings: 52000 },
        { month: "Aug", savings: 46000 },
        { month: "Sep", savings: 52000 },
        { month: "Oct", savings: 64000 },
        { month: "Nov", savings: 57000 },
        { month: "Dec", savings: 51000 },
      ],
    },
  };
  
  export function CostSavingsByMonthChart({ selectedYear, selectedMonth, selectedOrgIds }: CostSavingsByMonthChartProps) {
    // Aggregate data from all selected orgs
    // If no subsidiaries selected, use empty data (Interpretation A)
    const yearData = (() => {
      if (selectedOrgIds.length === 0) {
        return [];
      }
      
      // Get data for each selected org and aggregate by month
      const monthMap: Record<string, number> = {};
      const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      selectedOrgIds.forEach((orgId) => {
        const orgData = monthlySavingsByYearAndOrg[orgId] || monthlySavingsByYearAndOrg.root;
        const orgYearData = orgData[selectedYear] || orgData[2024];
        
        orgYearData.forEach((point) => {
          monthMap[point.month] = (monthMap[point.month] || 0) + point.savings;
        });
      });
      
      // Convert to array in month order
      return monthOrder.map((month) => ({
        month,
        savings: monthMap[month] || 0,
      }));
    })();
    
    // Mark the active month if a specific month is selected
    const data = yearData.map((point) => ({
      ...point,
      isActive: selectedMonth !== "total" && point.month === selectedMonth,
    }));
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
          Cost Savings by Month
        </h2>
        <p
          style={{
            margin: 0,
            marginBottom: 20,
            fontSize: 13,
            color: "#64748b",
          }}
        >
          Aggregated cost savings from approved repairs (year to date).
        </p>
  
        <div style={{ width: "100%", height: 280, position: "relative", overflow: "visible" }}>
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
                dataKey="month"
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
                formatter={(value: number) =>
                  `$${value.toLocaleString("en-US")}`
                }
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
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isActive ? "#2563eb" : "#3b82f6"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }