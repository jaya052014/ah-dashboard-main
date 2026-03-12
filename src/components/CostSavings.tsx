import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import React, { useState, useEffect } from "react";

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
	//console.log('payload: ', payload);
	
  if (active && payload && payload.length) {
    const data = payload[0].payload;
	//console.log('data: ', data);
	const rawValue = data.CostSaving || data.costSaving || data.savings;
//console.log('rawValue: ', rawValue);
    // 2. Convert to number and provide a fallback of 0 if it's missing
    const numericValue = Number(rawValue || 0);
	//console.log('numericValue: ', numericValue);
	
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
          Year: {data.Year}
        </div>
        <div
          style={{
            fontSize: "13px",
            color: "#2563eb",
            fontWeight: 600,
          }}
        >
         
		 Cost Savings: ${numericValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
        </div>
      </div>
    );
  }
  return null;
};

export function CostSavings() {
	
	const [COST_SAVINGS_BY_YEAR, setChartData] = useState([true]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://staging.junoedge.com/api/api/v1.0/dview/CustomerDashboard');
        const jsonData = await response.json();
        // Ensure we are mapping to the correct keys returned by your API
        setChartData(jsonData?.responseData?.CostSavingsYearWise || []);
		//console.log('COST_SAVINGS_BY_YEAR: ' , COST_SAVINGS_BY_YEAR);
      } catch (error) {
        console.error("Error fetching cost savings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  
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
              dataKey="Year"
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
			  dataKey="CostSaving"			
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


