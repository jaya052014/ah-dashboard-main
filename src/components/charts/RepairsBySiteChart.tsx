import { useMemo, useState, useEffect } from "react";
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
import type { StatusHistoryEntry } from "../tables/AllRepairsTable";

type RepairsBySiteChartProps = {
  selectedSites: string[];
  selectedDepartments: string[];
  selectedYear: number;
  viewMode: "sites" | "departments";
};

// Color palette for lines (reuse similar to status colors)
const LINE_COLORS = [
  "#2563eb", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
  "#84cc16", // lime
  "#6366f1", // indigo
  "#14b8a6", // teal
  "#f43f5e", // rose
  "#a855f7", // violet
  "#3b82f6", // blue-500
  "#64748b", // slate
];

export function RepairsBySiteChart({
  selectedSites,
  selectedDepartments,
  selectedYear,
  viewMode,
}: RepairsBySiteChartProps) {
	

  // Get available sites/departments from filtered data
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
		//console.log('json chart data : ', jsonData.responseData);
		if (viewMode == 'sites')
		{
			console.error("viewMode site:", viewMode);		
			setRepair(jsonData.responseData['RRByPlant']); // Store the result in state
			console.error("repairDyna site:", repairDyna);
		}
		else if (viewMode == 'departments')
		{	
			console.error("viewMode dept:", viewMode);	
			setRepair(jsonData.responseData['RRByDept']);
			console.error("repairDyna dept:", repairDyna);
		}
		
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [viewMode]);
  	// Jaya - EOC

  
  const { chartData, seriesKeys  } = useMemo(() => {
	  //console.log('repairDyna 1', repairDyna);
	  if (!repairDyna || repairDyna.length === 0) {
	
//console.log('repairDyna 2', repairDyna);	
		  return { chartData: [], seriesKeys: [] };
		}
		//console.log('hiii repair', JSON.stringify(repair, null, 2));
    // Calculate year boundaries
    const yearStart = new Date(selectedYear, 0, 1);
    const yearEnd = new Date(selectedYear, 11, 31, 23, 59, 59, 999);
	//console.log("yearStart",yearStart.getFullYear());
	//console.log("yearEnd",yearEnd.getFullYear());
	
    // Filter repairs based on global filters and year
	// Jaya - BOC
    //let filtered = ALL_REPAIRS_DATA.filter((repair) => {
		
	let filtered = repairDyna.filter((repair) => {
	// Jaya - EOC
	
//console.log('filtered', JSON.stringify(repairDyna, null, 2));
	
      // Site filter
      const hasSiteFilter = selectedSites.length > 0 && !selectedSites.includes("all");
	  //console.log('hasSiteFilter: ', hasSiteFilter);
      if (hasSiteFilter) {
        const rowSite = repair.site || "";
        if (!selectedSites.includes(rowSite)) {
          return false;
        }
      }

      // Department filter
      const hasDepartmentFilter = selectedDepartments.length > 0 && !selectedDepartments.includes("all");
	  //console.log('hasDepartmentFilter: ', hasDepartmentFilter);
      if (hasDepartmentFilter) {
        const rowDepartment = repair.department || "";
        if (!selectedDepartments.includes(rowDepartment)) {
          return false;
        }
      }

      // Year filter - check if any status transition falls within the selected year
      if (repair.statusHistory && repair.statusHistory.length > 0) {
		  //console.log('repair.statusHistory: ', repair.statusHistory);
        const hasTransitionInYear = repair.statusHistory.some((entry) => {
          const entryDate = new Date(entry.date);
          return entryDate >= yearStart && entryDate <= yearEnd;
        });
        if (!hasTransitionInYear) {
          return false;
        }
      } else if (repair.receivedDate) {
		  //console.log('repair.statusHistory: ', repair.receivedDate);
        // Fallback to receivedDate if no statusHistory
        const repairDate = new Date(repair.receivedDate);
        if (repairDate < yearStart || repairDate > yearEnd) {
          return false;
        }
      }

      return true;
    });
	
	
	//////////

    // Get unique sites/departments from filtered data
    const uniqueValues = new Set<string>();
    filtered.forEach((repair) => {
		//console.log('unique sites/departments');
      if (viewMode === "sites") {
		  //console.log('unique sites');
       // if (repair.site) {
		if (repair.site || repair.CustomerName) {
			//console.log('repair.CustomerName');
          //uniqueValues.add(repair.site);
		  uniqueValues.add(repair.CustomerName)
        }
      } else {
		  //console.log('unique department');
        if (repair.department || repair.DepartmentName) {
			//console.log('repair.department');
          //uniqueValues.add(repair.department);
		  uniqueValues.add(repair.DepartmentName);
        }
      }
    });

    const seriesKeys = Array.from(uniqueValues).sort();
	//console.log('seriesKeys: ' , seriesKeys);

    // Group by month index (0-11) and site/department - count when repairs ENTERED any status
    const monthValueMap = new Map<number, Map<string, number>>();
	//const monthValueMap = new Map<number, number>();

    filtered.forEach((repair) => {
      if (repair.statusHistory && repair.statusHistory.length > 0) {
        // Use statusHistory to find when each status was entered
        repair.statusHistory.forEach((entry: StatusHistoryEntry) => {
          const entryDate = new Date(entry.date);
          // Only count entries within the selected year
          if (entryDate >= yearStart && entryDate <= yearEnd) {
            const monthIndex = entryDate.getMonth(); // 0-11
            const valueKey = viewMode === "sites" ? (repair.site || "") : (repair.department || "");

            if (!monthValueMap.has(monthIndex)) {
              monthValueMap.set(monthIndex, new Map());
            }

            const valueMap = monthValueMap.get(monthIndex)!;
            valueMap.set(valueKey, (valueMap.get(valueKey) || 0) + 1);
          }
        });
      } else if (repair.receivedDate) { 
		//console.log('repair.receivedDate');
        // Fallback: use receivedDate if no statusHistory
        const date = new Date(repair.receivedDate);
        if (date >= yearStart && date <= yearEnd) {
          const monthIndex = date.getMonth(); // 0-11
          const valueKey = viewMode === "sites" ? (repair.site || "") : (repair.department || "");

          if (!monthValueMap.has(monthIndex)) {
            monthValueMap.set(monthIndex, new Map());
          }

          const valueMap = monthValueMap.get(monthIndex)!;
          valueMap.set(valueKey, (valueMap.get(valueKey) || 0) + 1);
        }
      } else if (repair.year) { //Jaya BOC
		//console.log('repair.year');
        // Fallback: use year if no statusHistory and receivedDate
        const year = repair.year;
        if (year >= yearStart.getFullYear() && year <= yearEnd.getFullYear()) {
          const monthIndex = repair.month_number - 1; // 0-11
		  //console.log('monthIndex',monthIndex);
          const valueKey = viewMode === "sites" ? (repair.CustomerName || "") : (repair.DepartmentName || "");
			//console.log('valueKey: ', valueKey);
          if (!monthValueMap.has(monthIndex)) {
            monthValueMap.set(monthIndex,new Map());
          }

          const valueMap = monthValueMap.get(monthIndex)!;
		  //console.log('valueMap: ', valueMap);
          //valueMap.set(valueKey, (valueMap.get(valueKey) || 0) + 1);
		  valueMap.set(valueKey, (valueMap.get(valueKey) || 0) + repair.totalRR);
        }
      }//jaya EOC
		  
    });


    // Create data for exactly 12 months (Jan-Dec) using month names only
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    //console.log('month name');
	
    const data = monthNames.map((monthName, monthIndex) => {
      const valueMap = monthValueMap.get(monthIndex);
      const entry: Record<string, string | number> = { month: monthName };
//console.log('valueMap: ', valueMap);
//console.log('seriesKeys: ', seriesKeys);
      seriesKeys.forEach((key) => {
        entry[key] = valueMap?.get(key) || 0;
		//console.log('entry[key] : ', entry[key]  );
      });

      return entry;
    });

    return { chartData: data, seriesKeys };
    }, [selectedYear, selectedSites, selectedDepartments, viewMode, repairDyna]);

  const MAX_VISIBLE_SERIES = 10;

  // Message state for limit feedback
  const [limitMessage, setLimitMessage] = useState<string | null>(null);

  // Tooltip state for disabled legend items
  const [hoveredDisabledKey, setHoveredDisabledKey] = useState<string | null>(null);

  // Legend toggle state - show up to 10 by default
  // Initialize with first 10 series
  const [visibleSeries, setVisibleSeries] = useState<Set<string>>(() => {
    return new Set(seriesKeys.slice(0, MAX_VISIBLE_SERIES));
  });

  // Update visible series when seriesKeys change (reset to first 10)
  useEffect(() => {
    const newVisible = new Set(seriesKeys.slice(0, MAX_VISIBLE_SERIES));
    setVisibleSeries(newVisible);
    setLimitMessage(null); // Clear any limit message when series change
  }, [seriesKeys]);

  // Auto-dismiss limit message after 3 seconds
  useEffect(() => {
    if (limitMessage) {
      const timer = setTimeout(() => {
        setLimitMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [limitMessage]);

  const toggleSeries = (key: string) => {
    setVisibleSeries((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        // Hide series - always allowed
        next.delete(key);
        setLimitMessage(null); // Clear message when hiding
      } else {
        // Show series - check limit
        if (next.size >= MAX_VISIBLE_SERIES) {
          // Limit reached - show message and don't add
          setLimitMessage("You can display up to 10 sites or departments at the same time.");
          return prev;
        }
        // Under limit - add series
        next.add(key);
        setLimitMessage(null); // Clear message when successfully adding
      }
      return next;
    });
  };

  // Custom tooltip - only show visible series
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Filter to only show visible series
      const visibleSeriesArray = Array.from(visibleSeries);
      
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
          {visibleSeriesArray.map((key) => {
            const value = payload.find((p: any) => p.dataKey === key)?.value || 0;
            const color = LINE_COLORS[seriesKeys.indexOf(key) % LINE_COLORS.length];
            return (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 4,
                  color: "#475569",
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 2,
                    backgroundColor: color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontWeight: 500 }}>
                  {key}: {value}
                </span>
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
            data={chartData}
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
            {seriesKeys.map((key, index) => {
              if (!visibleSeries.has(key)) return null;
              const color = LINE_COLORS[index % LINE_COLORS.length];
              return (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={color}
                  strokeWidth={2}
                  dot={{ fill: color, r: 2 }}
                  activeDot={{ r: 4 }}
                  connectNulls
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Limit message */}
      {limitMessage && (
        <div className="repairs-by-site-limit-message">
          {limitMessage}
        </div>
      )}

      {/* Legend */}
      <div className="repair-trend-legend">
        {seriesKeys.map((key, index) => {
          const isVisible = visibleSeries.has(key);
          const isDisabled = !isVisible && visibleSeries.size >= MAX_VISIBLE_SERIES;
          const color = LINE_COLORS[index % LINE_COLORS.length];
          const showTooltip = isDisabled && hoveredDisabledKey === key;
          
          return (
            <div
              key={key}
              className="repair-trend-legend-item-wrapper"
              onMouseEnter={() => {
                if (isDisabled) {
                  setHoveredDisabledKey(key);
                }
              }}
              onMouseLeave={() => {
                setHoveredDisabledKey(null);
              }}
            >
              <button
                type="button"
                className={`repair-trend-legend-item ${!isVisible ? "repair-trend-legend-item--hidden" : ""} ${isDisabled ? "repair-trend-legend-item--disabled" : ""}`}
                onClick={() => toggleSeries(key)}
                disabled={isDisabled}
              >
                <div
                  className="repair-trend-legend-color"
                  style={{ backgroundColor: color }}
                />
                <span className="repair-trend-legend-label">{key}</span>
              </button>
              {showTooltip && (
                <div className="repair-trend-legend-tooltip">
                  You can select up to 10 items at the same time. Deselect another item to enable this one.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

