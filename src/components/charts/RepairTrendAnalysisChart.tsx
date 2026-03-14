import React, { useMemo, useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { ALL_REPAIRS_DATA } from "../../data/allRepairsData";
import type { RepairStatus } from "../tables/AllRepairsTable";
//import { REPAIR_STATUS_CONFIG, ALL_STATUSES } from "../../constants/repairStatusConfig";
import { REPAIR_STATUS_CONFIG, API_STATUSES } from "../../constants/repairStatusConfig";

type RepairTrendAnalysisChartProps = {
  selectedSites: string[];
  selectedDepartments: string[];
  selectedYear: number;
  compareWithPrevious?: boolean;
};

// Status color mapping
/*const STATUS_COLORS: Record<RepairStatus, string> = {
  "Repair Logged": "#06b6d4", // cyan
  "Awaiting Quote": "#64748b", // grey
  "PO": "#6366f1", // indigo
  "Awaiting Approval": "#f59e0b", // orange
  "In Progress": "#2563eb", // blue
  "Completed": "#10b981", // green
  "Rejected": "#ef4444", // red
  "Not Repairable": "#f97316", // orange (different shade)
};*/


const STATUS_COLORS: Record<RepairStatus, string> = {
  "LOGGED": "#06b6d4", // cyan
  "UNDER_EVALUATION": "#64748b", // grey
  //"PO": "#6366f1", // indigo
  "AWAITING_APPROVAL": "#f59e0b", // orange
  "IN_PROGRESS": "#2563eb", // blue
  "COMPLETED": "#10b981", // green
  "REJECTED": "#ef4444", // red
  "NOT_REPAIRABLE": "#f97316", // orange (different shade)
};

export function RepairTrendAnalysisChart({
  selectedSites,
  selectedDepartments,
  selectedYear,
  compareWithPrevious = false,
}: RepairTrendAnalysisChartProps) {
  // Legend toggle state - all visible by default
  /*const [visibleStatuses, setVisibleStatuses] = useState<Set<RepairStatus>>(
    new Set(ALL_STATUSES)
  );*/

 const [visibleStatuses, setVisibleStatuses] = useState<Set<RepairStatus>>(
    new Set(API_STATUSES)
  );
  
  const toggleStatus = (status: RepairStatus) => {
    setVisibleStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  };
  
  // Jaya - BOC
  const [repairDyna, setRepair] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
		setRepair(null);
      setLoading(true);
      try {
        const response = await fetch('https://staging.junoedge.com/api/api/v1.0/dview/CustomerDashboard');
        const jsonData = await response.json();
		
		setRepair(jsonData.responseData['RepairTrendAnalysis']); // Store the result in state
						
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  	// Jaya - EOC
  const chartData = useMemo(() => {
	  
	  if (!repairDyna || repairDyna.length === 0) {
	
	  return {chartData: []};
		}
    // Calculate year boundaries for selected year
    const yearStart = new Date(selectedYear, 0, 1);
    const yearEnd = new Date(selectedYear, 11, 31, 23, 59, 59, 999);
    
    // Calculate previous year boundaries if comparison is enabled
    const previousYear = selectedYear - 1;
    const previousYearStart = compareWithPrevious ? new Date(previousYear, 0, 1) : null;
    const previousYearEnd = compareWithPrevious ? new Date(previousYear, 11, 31, 23, 59, 59, 999) : null;
    
    // Helper function to process data for a specific year and return counts by month index (0-11)
    const processYearData = (yearStart: Date, yearEnd: Date): Map<number, Map<RepairStatus, number>> => {
      // Filter repairs data based on site, department, and year
      //const filtered = ALL_REPAIRS_DATA.filter((repair: any) => {
		  
		  let filtered = repairDyna.filter((repair: any) => {
        // Site filter
        const hasSiteFilter = selectedSites.length > 0 && !selectedSites.includes("all");
        if (hasSiteFilter) {
          const rowSite = repair.site || "";
          if (!selectedSites.includes(rowSite)) {
            return false;
          }
        }

        // Department filter
        const hasDepartmentFilter = selectedDepartments.length > 0 && !selectedDepartments.includes("all");
        if (hasDepartmentFilter) {
          const rowDepartment = repair.department || "";
          if (!selectedDepartments.includes(rowDepartment)) {
            return false;
          }
        }

        // Year filter - check if any status transition falls within the year
        if (repair.statusHistory && repair.statusHistory.length > 0) {
          const hasTransitionInYear = repair.statusHistory.some((entry: any) => {
            const entryDate = new Date(entry.date);
            return entryDate >= yearStart && entryDate <= yearEnd;
          });
          if (!hasTransitionInYear) {
            return false;
          }
        } else if (repair.receivedDate) {
          // Fallback to receivedDate if no statusHistory
          const repairDate = new Date(repair.receivedDate);
          if (repairDate < yearStart || repairDate > yearEnd) {
            return false;
          }
        }
        return true;
      });

      // Group by month index (0-11) and status - count when repairs ENTERED each status
      const monthStatusMap = new Map<number, Map<RepairStatus, number>>();
      
      filtered.forEach((repair: any) => {
		
        if (repair.statusHistory && repair.statusHistory.length > 0) {
          // Use statusHistory to find when each status was entered
          repair.statusHistory.forEach((entry: any) => {
            const entryDate = new Date(entry.date);
            // Only count entries within the year
            if (entryDate >= yearStart && entryDate <= yearEnd) {
              const monthIndex = entryDate.getMonth(); // 0-11
              const status = entry.status;
              //const statusMap = monthStatusMap.get(monthIndex)!;
			  //statusMap.set(status, (statusMap.get(status) || 0) + 1);
              if (!monthStatusMap.has(monthIndex)) {
                monthStatusMap.set(monthIndex, new Map());
              }
              
              const statusMap = monthStatusMap.get(monthIndex)!;
              statusMap.set(status, (statusMap.get(status) || 0) + 1);
            }
          });
        } else if (repair.Year) {
			const keys = Object.keys(repair);
			
          // Fallback: use receivedDate and current status if no statusHistory
          const date = new Date(repair.Year,0,1);
		  
          if (date >= yearStart && date <= yearEnd) {
			
            const monthIndex = repair.Month-1; // 0-11
            
            if (!monthStatusMap.has(monthIndex)) {
              monthStatusMap.set(monthIndex, new Map());
            }
            
            const statusMap = monthStatusMap.get(monthIndex)!;
            for(let i=2;i<=keys.length;i++) {
				
				statusMap.set(keys[i], repair[keys[i]]);
			}
			monthStatusMap.set(monthIndex, statusMap);

          }
        }		
      });
	  
	  
      return monthStatusMap;
    };

    // Process current year data
    const currentYearMap = processYearData(yearStart, yearEnd);
   	
    // Process previous year data if comparison is enabled
    const previousYearMap = compareWithPrevious && previousYearStart && previousYearEnd
      ? processYearData(previousYearStart, previousYearEnd)
      : null;

    // Create data for exactly 12 months (Jan-Dec) using month names only
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const data = monthNames.map((monthName, monthIndex) => {
      const entry: Record<string, string | number> = { month: monthName };
      
      // Add current year data
      const currentStatusMap = currentYearMap.get(monthIndex);
	  
	  
     /* ALL_STATUSES.forEach((status) => {
        entry[status] = currentStatusMap?.get(status) || 0;
      });*/
	      API_STATUSES.forEach((status) => {
        entry[status] = currentStatusMap?.get(status) || 0;
      });
      
      // Add previous year data if comparison is enabled
      if (previousYearMap) {
        const previousStatusMap = previousYearMap.get(monthIndex);
        /*ALL_STATUSES.forEach((status) => {
          entry[`${status}_prev`] = previousStatusMap?.get(status) || 0;*/
		  API_STATUSES.forEach((status) => {
          entry[`${status}_prev`] = previousStatusMap?.get(status) || 0;
        });
      }
      
      return entry;
    });
	
    return { data, compareWithPrevious, previousYear };
  }, [repairDyna, selectedYear, selectedSites, selectedDepartments, compareWithPrevious]);

  // Custom tooltip to show only visible statuses
  const CustomTooltip = ({ active, payload, label }: any) => {
	  
    if (active && payload && payload.length) {
      // Filter to only show visible statuses
	  
      const visibleStatusesArray = Array.from(visibleStatuses);
      const isComparing = chartData.compareWithPrevious;
      const prevYear = chartData.previousYear;
      
      return (
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 10,
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(15, 23, 42, 0.04)",
            padding: "12px",
            fontSize: 13,
          }}
        >
          <div style={{ marginBottom: 8, fontWeight: 600, color: "#1e293b" }}>
            {label}
          </div>
          {visibleStatusesArray.map((status) => {
            const currentValue = payload.find((p: any) => p.dataKey === status)?.value || 0;
            const prevValue = isComparing
              ? payload.find((p: any) => p.dataKey === `${status}_prev`)?.value || 0
              : null;
            
            return (
              <div key={status} style={{ marginBottom: 6 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#475569",
                  }}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 2,
                      backgroundColor: STATUS_COLORS[status],
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontWeight: 500 }}>
                    {REPAIR_STATUS_CONFIG[status].label}:
                  </span>
                </div>
                <div style={{ marginLeft: 20, marginTop: 2 }}>
                  {isComparing && prevValue !== null ? (
                    <>
                      <div style={{ color: "#1e293b", fontWeight: 500 }}>
                        {selectedYear}: {currentValue}
                      </div>
                      <div style={{ color: "#64748b", fontSize: 12 }}>
                        {prevYear}: {prevValue}
                      </div>
                    </>
                  ) : (
                    <div style={{ color: "#1e293b", fontWeight: 500 }}>
                      {currentValue}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return ( 
    <div style={{ position: "relative", overflow: "visible" }}>
      <div style={{ width: "100%", height: 300, position: "relative", overflow: "visible" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData.data}
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
              content={<CustomTooltip />} 
              cursor={{ stroke: "rgba(37, 99, 235, 0.4)", strokeWidth: 1 }}
              wrapperStyle={{ zIndex: 9999, pointerEvents: 'none' }}
            />
            {//ALL_STATUSES.map((status) => {
				API_STATUSES.map((status) => {
              if (!visibleStatuses.has(status)) return null;
              const color = STATUS_COLORS[status];
              
              return (
                <React.Fragment key={status}>
                  {/* Current year line - solid */}
                  <Line
                    type="monotone"
                    dataKey={status}
                    stroke={color}
                    strokeWidth={2}
                    dot={{ fill: color, r: 2 }}
                    activeDot={{ r: 4 }}
                    connectNulls
                  />
                  {/* Previous year line - dashed, lower opacity */}
                  {chartData.compareWithPrevious && visibleStatuses.has(status) && (
                    <Line
                      type="monotone"
                      dataKey={`${status}_prev`}
                      stroke={color}
                      strokeWidth={2}
                      strokeDasharray="6 6"
                      strokeOpacity={0.7}
                      dot={false}
                      activeDot={false}
                      connectNulls
                    />
                  )}
                </React.Fragment>
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="repair-trend-legend">
        {//ALL_STATUSES.map((status) => {
			API_STATUSES.map((status) => {
          const isVisible = visibleStatuses.has(status);
          return (
            <button
              key={status}
              type="button"
              className={`repair-trend-legend-item ${!isVisible ? "repair-trend-legend-item--hidden" : ""}`}
              onClick={() => toggleStatus(status)}
            >
              <div
                className="repair-trend-legend-color"
                style={{ backgroundColor: STATUS_COLORS[status] }}
              />
              <span className="repair-trend-legend-label">
                {REPAIR_STATUS_CONFIG[status].label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

