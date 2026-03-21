import { useMemo, useState, useEffect } from "react";
import { ALL_REPAIRS_DATA } from "../../data/allRepairsData";
import type { AllRepairsRow } from "../tables/AllRepairsTable";

type ViewMode = "sites" | "departments";

type LeadTimeAnalysisChartProps = {
  selectedYear: number;
  selectedSites: string[];
  selectedDepartments: string[];
  viewMode: ViewMode;
};

const METRIC_COLUMNS = [
  { key: "quoteTime", label: "Avg. Quote Time" },
  { key: "approvalTime", label: "Avg. Approval Time" },
  { key: "repairTime", label: "Avg. Repair Time" },
  { key: "expectedTime", label: "Avg. Expected Time" },
  { key: "overallTurnaroundTime", label: "Avg. Overall Turnaround Time" },
  { key: "variance", label: "Variance" },
] as const;

// Deterministic hash function for consistent value generation
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

// Generate deterministic value in range [min, max] based on seed
const deterministicValue = (seed: string, min: number, max: number): number => {
  const hash = hashString(seed);
  return min + (hash % (max - min + 1));
};

// Calculate time metrics with realistic, deterministic values that vary by year, site/department, and metric
const calculateTimeMetrics = (row: AllRepairsRow, selectedYear: number, viewMode: ViewMode) => {
  // Get year from receivedDate or statusHistory
  let rowYear = selectedYear;
  if (row.receivedDate) {
    try {
      const received = new Date(row.receivedDate);
      if (!isNaN(received.getTime())) {
        rowYear = received.getFullYear();
      }
    } catch (e) {
      // Use selectedYear as fallback
    }
  } else if (row.statusHistory && row.statusHistory.length > 0) {
    try {
      const firstStatus = row.statusHistory[0];
      const received = new Date(firstStatus.date);
      if (!isNaN(received.getTime())) {
        rowYear = received.getFullYear();
      }
    } catch (e) {
      // Use selectedYear as fallback
    }
  }
  else if (row.Year) {
    try {
      const received = new Date(row.Year);
      if (!isNaN(received.getTime())) {
        rowYear = received.getFullYear();
      }
    } catch (e) {
      // Use selectedYear as fallback
    }
  } 

  // Get group key (site or department)
  const groupKey = viewMode === "sites" 
    ? (row.site || "Unknown")
    : (row.department || "Unknown");

//console.log('row: ', row);
  // Create deterministic seeds for each metric based on year + group + metric type
  /*const baseSeed = `${rowYear}-${groupKey}`;
  
  // Generate realistic values with proper ranges
  // Quote Time: 2-24 days (varies by year and site/department)
  const quoteTime = deterministicValue(`${baseSeed}-quote`, 2, 24);
  
  // Approval Time: 2-8 days (varies by year and site/department)
  const approvalTime = deterministicValue(`${baseSeed}-approval`, 2, 8);
  
  // Repair Time: 4-24 days (varies by year and site/department) - NOT 0
  const repairTime = deterministicValue(`${baseSeed}-repair`, 4, 24);
  
  // Expected Time: 10-35 days (varies by year and site/department) - NOT stuck at 30
  const expectedTime = deterministicValue(`${baseSeed}-expected`, 10, 35);
  
  // Overall Turnaround Time: derived from quote + approval + repair with some variation
  // Base calculation: quote + approval + repair, then add deterministic variation
  const baseTurnaround = quoteTime + approvalTime + repairTime;
  const variation = deterministicValue(`${baseSeed}-turnaround`, -5, 10);
  const overallTurnaroundTime = Math.max(8, baseTurnaround + variation);
  
  // Variance: -10 to +10 days (includes negatives), NOT 0 everywhere
  const variance = deterministicValue(`${baseSeed}-variance`, -10, 10);*/
  
  const quoteTime = row.AvgQuoteTime;
  
  // Approval Time: 2-8 days (varies by year and site/department)
  const approvalTime = row.AvgApprovalTime;
  
  // Repair Time: 4-24 days (varies by year and site/department) - NOT 0
  const repairTime = row.AvgRepairTime;
  
  // Expected Time: 10-35 days (varies by year and site/department) - NOT stuck at 30
  const expectedTime = row.AvgExpectedTIme;
  
  // Overall Turnaround Time: derived from quote + approval + repair with some variation
  // Base calculation: quote + approval + repair, then add deterministic variation
  
  const overallTurnaroundTime = row.AvgTurnAroundTIme;
  
  // Variance: -10 to +10 days (includes negatives), NOT 0 everywhere
  const variance = row.Variance;
//console.log('variance: ', variance);
  return {
    quoteTime,
    approvalTime,
    repairTime,
    overallTurnaroundTime,
    expectedTime,
    variance,
  };
};

// Color scale: green (low) → yellow → orange → red (high)
// Fixed domain: 0-60 days for all metrics
const HEATMAP_MIN = 0;
const HEATMAP_MAX = 60;

const getColorForValue = (value: number): string => {
  // Clamp value to 0-60 range
  const clampedValue = Math.max(HEATMAP_MIN, Math.min(HEATMAP_MAX, value));
  
  // Normalize value to 0-1 range
  const normalized = clampedValue / HEATMAP_MAX;
  
  // Interpolate between colors
  // Green (#10b981) → Yellow (#fbbf24) → Orange (#f97316) → Red (#ef4444)
  if (normalized < 0.33) {
    // Green to Yellow
    const t = normalized / 0.33;
    return interpolateColor("#10b981", "#fbbf24", t);
  } else if (normalized < 0.66) {
    // Yellow to Orange
    const t = (normalized - 0.33) / 0.33;
    return interpolateColor("#fbbf24", "#f97316", t);
  } else {
    // Orange to Red
    const t = (normalized - 0.66) / 0.34;
    return interpolateColor("#f97316", "#ef4444", t);
  }
};

// Helper to interpolate between two hex colors
const interpolateColor = (color1: string, color2: string, factor: number): string => {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  if (!c1 || !c2) return color1;
  
  const r = Math.round(c1.r + (c2.r - c1.r) * factor);
  const g = Math.round(c1.g + (c2.g - c1.g) * factor);
  const b = Math.round(c1.b + (c2.b - c1.b) * factor);
  
  return `rgb(${r}, ${g}, ${b})`;
};

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

export function LeadTimeAnalysisChart({ selectedYear, selectedSites, selectedDepartments, viewMode }: LeadTimeAnalysisChartProps) {
  
  // Jaya - BOC
  const [repairOverAllMetrics, setRepairOverAllMetrics] = useState<any>(null);
  const [repairDyna, setRepair] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
		setRepair(null);
      setLoading(true);
      try {
        const response = await fetch('https://staging.junoedge.com/api/api/v1.0/dview/CustomerDashboard');
        const jsonData = await response.json();
		
		setRepairOverAllMetrics(jsonData.responseData['TimeMetricsOverall']); // Store the result in state
		setRepair(jsonData.responseData['TimeMetricsTable']); 
				console.log('TimeMetricsTable: ', jsonData.responseData['TimeMetricsTable']);		
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  	// Jaya - EOC
  
  // Calculate overall averages from filtered data
  const overallAverages = useMemo(() => {
	  
	  if (!repairOverAllMetrics || repairOverAllMetrics.length === 0) {
	
	  return {overallAverages: []};
		}
		
    // Calculate year boundaries
    const yearStart = new Date(selectedYear, 0, 1);
    const yearEnd = new Date(selectedYear, 11, 31, 23, 59, 59, 999);

    // Filter data by year and site/department filters
    //const filtered = ALL_REPAIRS_DATA.filter((row) => {
		//let filtered = repairOverAllMetrics.filter((row) => {
      // Year filter
      /*if (row.receivedDate) {
        try {
          const received = new Date(row.receivedDate);
          if (isNaN(received.getTime())) return false;
          if (received < yearStart || received > yearEnd) return false;
        } catch (e) {
          return false;
        }
      } else if (row.statusHistory && row.statusHistory.length > 0) {
        try {
          const firstStatus = row.statusHistory[0];
          const received = new Date(firstStatus.date);
          if (!isNaN(received.getTime())) {
            if (received < yearStart || received > yearEnd) return false;
          }
        } catch (e) {
          return false;
        }
      } else {
        return false;
      }

      // Site filter (applies regardless of viewMode)
      const hasSiteFilter = selectedSites.length > 0 && !selectedSites.includes("all");
      if (hasSiteFilter) {
        const rowSite = row.site || "";
        if (!selectedSites.includes(rowSite)) {
          return false;
        }
      }

      // Department filter (applies regardless of viewMode)
      const hasDepartmentFilter = selectedDepartments.length > 0 && !selectedDepartments.includes("all");
      if (hasDepartmentFilter) {
        const rowDepartment = row.department || "";
        if (!selectedDepartments.includes(rowDepartment)) {
          return false;
        }
      }

      return true;
    });

    // Calculate overall averages from all filtered rows
    const allQuoteTimes: number[] = [];
    const allApprovalTimes: number[] = [];
    const allRepairTimes: number[] = [];
    const allExpectedTimes: number[] = [];
    const allOverallTurnaroundTimes: number[] = [];
    const allVariances: number[] = [];

    filtered.forEach((row) => {
      const metrics = calculateTimeMetrics(row, selectedYear, viewMode);
      if (!metrics) return;

      allQuoteTimes.push(metrics.quoteTime);
      allApprovalTimes.push(metrics.approvalTime);
      allRepairTimes.push(metrics.repairTime);
      allExpectedTimes.push(metrics.expectedTime);
      allOverallTurnaroundTimes.push(metrics.overallTurnaroundTime);
      allVariances.push(metrics.variance);
    });

    const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;*/
let filtered = repairOverAllMetrics.filter((repair: any) => {
 //console.log('repair: ', repair);
	if (!repair.Year) return false;
			 
			 const repairDate = new Date(repair.Year, (repair.Month || 1) - 1, 1);
    return repairDate >= yearStart && repairDate <= yearEnd;
  });
  
  // Calculate overall averages from all filtered rows
    const allQuoteTimes: number[] = [];
    const allApprovalTimes: number[] = [];
    const allRepairTimes: number[] = [];
    const allExpectedTimes: number[] = [];
    const allOverallTurnaroundTimes: number[] = [];
    const allVariances: number[] = [];
  
  filtered.forEach((repair: any) => {
				  //console.log('repair: ', repair);
			 if (repair.Year) {
			const keys = Object.keys(repair);
			 //console.log('keys: ', keys);
          // Fallback: use receivedDate and current status if no statusHistory
          const date = new Date(repair.Year,0,1);
		  
          if (date >= yearStart && date <= yearEnd) {
			  
			allQuoteTimes.push(repair.AvgQuoteTime);
			allApprovalTimes.push(repair.AvgApprovalTime);
			allRepairTimes.push(repair.AvgRepairTime);
			allExpectedTimes.push(repair.AvgExpectedTIme);
			allOverallTurnaroundTimes.push(repair.AvgTurnAroundTIme);
			allVariances.push(repair.Variance);
			
            /*const monthIndex = repair.Month-1; // 0-11
            
            if (!monthMetricsMap.has(monthIndex)) {
              monthMetricsMap.set(monthIndex, new Map());
            }
            
            const timeMetricsOverTimeMap = monthMetricsMap.get(monthIndex)!;
			
			//console.log('timeMetricsOverTimeMap: ', timeMetricsOverTimeMap);
			//console.log('monthMetricsMap: ', monthMetricsMap);
			
			
            for(let i=2;i<=keys.length-1;i++) {
				//console.log('keys[i]:', keys[i]);
				timeMetricsOverTimeMap.set(keys[i], repair[keys[i]]);
				//console.log('timeMetricsOverTimeMap: inside for: ', timeMetricsOverTimeMap);
				
			}
			monthMetricsMap.set(monthIndex, timeMetricsOverTimeMap);*/
			//console.log('monthMetricsMap: ', monthMetricsMap);

          }
        }	
			  });


    return {
      overallTurnaroundTime: allOverallTurnaroundTimes,
      quoteTime: allQuoteTimes,
      approvalTime: allApprovalTimes,
      repairTime: allRepairTimes,
      expectedTime: allExpectedTimes,
      variance: allVariances,
    };
  }, [selectedYear, selectedSites, selectedDepartments, viewMode, repairOverAllMetrics]);

  const heatmapData = useMemo(() => {
    // Calculate year boundaries
    const yearStart = new Date(selectedYear, 0, 1);
    const yearEnd = new Date(selectedYear, 11, 31, 23, 59, 59, 999);
	
	console.log('repairDyna: ', repairDyna);
	 if (!repairDyna || repairDyna.length === 0) {
	
//console.log('repairDyna 2', repairDyna);	
		  return { heatmapData: [] };
		}
		
    // Filter data by year and site/department filters
    //const filtered = ALL_REPAIRS_DATA.filter((row) => {
		const filtered = repairDyna.filter((row) => {
      // Year filter
     /*if (row.receivedDate) {
        try {
          const received = new Date(row.receivedDate);
          if (isNaN(received.getTime())) return false;
          if (received < yearStart || received > yearEnd) return false;
        } catch (e) {
          return false;
        }
      } else if (row.statusHistory && row.statusHistory.length > 0) {
        try {
          const firstStatus = row.statusHistory[0];
          const received = new Date(firstStatus.date);
          if (!isNaN(received.getTime())) {
            if (received < yearStart || received > yearEnd) return false;
          }
        } catch (e) {
          return false;
        }
      } else {
        return false;
      }*/
	  
	  const rowYear = typeof row.Year === 'number' 
      ? row.Year 
      : new Date(row.Year).getFullYear();
    
    return rowYear === selectedYear;

      // Site filter (applies regardless of viewMode)
      const hasSiteFilter = selectedSites.length > 0 && !selectedSites.includes("all");
      if (hasSiteFilter) {
       // const rowSite = row.site || "";
	    const rowSite = row.CustomerName || "";
        if (!selectedSites.includes(rowSite)) {
          return false;
        }
      }

      // Department filter (applies regardless of viewMode)
      const hasDepartmentFilter = selectedDepartments.length > 0 && !selectedDepartments.includes("all");
      if (hasDepartmentFilter) {
        const rowDepartment = row.department || "";
        if (!selectedDepartments.includes(rowDepartment)) {
          return false;
        }
      }

      return true;
    });

    // Group by site or department and calculate averages
    const groupMap = new Map<string, {
      quoteTimes: number[];
      approvalTimes: number[];
      repairTimes: number[];
      expectedTimes: number[];
      overallTurnaroundTimes: number[];
      variances: number[];
    }>();


    filtered.forEach((row) => {
      const groupKey = viewMode === "sites" 
        ? (row.CustomerName || "Unknown")
        : (row.department || "Unknown");
      const metrics = calculateTimeMetrics(row, selectedYear, viewMode);
      
      if (!metrics) return;

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, {
          quoteTimes: [],
          approvalTimes: [],
          repairTimes: [],
          expectedTimes: [],
          overallTurnaroundTimes: [],
          variances: [],
        });
      }

      const groupData = groupMap.get(groupKey)!;
	  
      if (metrics.quoteTime !== null) groupData.quoteTimes.push(parseFloat(metrics.quoteTime));
      if (metrics.approvalTime !== null) groupData.approvalTimes.push(parseFloat(metrics.approvalTime));
      if (metrics.repairTime !== null) groupData.repairTimes.push(parseFloat(metrics.repairTime));
      if (metrics.expectedTime !== null) groupData.expectedTimes.push(parseFloat(metrics.expectedTime));
      if (metrics.overallTurnaroundTime !== null) groupData.overallTurnaroundTimes.push(parseFloat(metrics.overallTurnaroundTime));
      if (metrics.variance !== null) groupData.variances.push(parseFloat(metrics.variance));
    });

    // Calculate averages per group
    const groupAverages = Array.from(groupMap.entries()).map(([groupKey, data]) => {
      const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      
      return {
        groupKey,
        quoteTime: avg(data.quoteTimes),
        approvalTime: avg(data.approvalTimes),
        repairTime: avg(data.repairTimes),
        expectedTime: avg(data.expectedTimes),
        overallTurnaroundTime: avg(data.overallTurnaroundTimes),
		variance: avg(data.variances),
      };
    });

    // Sort alphabetically
    groupAverages.sort((a, b) => a.groupKey.localeCompare(b.groupKey));

    // Filter by selected sites or departments based on viewMode
    if (viewMode === "sites") {
      const hasSiteFilter = selectedSites.length > 0 && !selectedSites.includes("all");
      const filteredGroupAverages = hasSiteFilter
        ? groupAverages.filter((groupData) => selectedSites.includes(groupData.groupKey))
        : groupAverages;

      return { 
        groupAverages: filteredGroupAverages,
        hasFilter: hasSiteFilter,
        totalBeforeFilter: groupAverages.length,
      };
    } else {
      const hasDepartmentFilter = selectedDepartments.length > 0 && !selectedDepartments.includes("all");
      const filteredGroupAverages = hasDepartmentFilter
        ? groupAverages.filter((groupData) => selectedDepartments.includes(groupData.groupKey))
        : groupAverages;

      return { 
        groupAverages: filteredGroupAverages,
        hasFilter: hasDepartmentFilter,
        totalBeforeFilter: groupAverages.length,
      };
    }
  }, [selectedYear, selectedSites, selectedDepartments, viewMode, repairDyna]);

  // Fixed scale for legend: 0-60 days
  const overallMin = HEATMAP_MIN;
  const overallMax = HEATMAP_MAX;

  const formatValue = (value: number, isVariance = false): { number: string; unit: string } => {
    if (isNaN(value) || !isFinite(value)) return { number: "—", unit: "" };
    const rounded = Math.round(value * 10) / 10;
    if (isVariance && rounded < 0) {
      return { number: `(${Math.abs(rounded).toFixed(1)})`, unit: "days" };
    }
    return { number: rounded.toFixed(1), unit: "days" };
  };

  const summaryCards = [
    {
      label: "Overall Turnaround",
      value: overallAverages.overallTurnaroundTime,
    },
    {
      label: "Quote Time",
      value: overallAverages.quoteTime,
    },
    {
      label: "Approval Time",
      value: overallAverages.approvalTime,
    },
    {
      label: "Repair Time",
      value: overallAverages.repairTime,
    },
    {
      label: "Expected Time",
      value: overallAverages.expectedTime,
    },
    {
      label: "Variance",
      value: overallAverages.variance,
      isVariance: true,
    },
  ];

  return (
    <div>
      {/* Summary Cards */}
      <div
        className="lead-time-summary-cards"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        {summaryCards.map((card) => {
          return (
            <div
              key={card.label}
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                padding: "14px",
                border: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Row 1: Label (fixed height, truncated) */}
              <div
                title={card.label}
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  fontWeight: 500,
                  margin: 0,
                  lineHeight: "18px",
                  height: "18px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  marginBottom: "8px",
                }}
              >
                {card.label}
              </div>
              {/* Row 2: Amount */}
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#0f172a",
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                {(() => {
                  const formatted = formatValue(card.value, card.isVariance);
                  return (
                    <>
                      {formatted.number}
                      {formatted.unit && (
                        <span style={{ fontSize: "16px", fontWeight: 400, color: "#64748b", marginLeft: "4px" }}>
                          {formatted.unit}
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ width: "100%", overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            fontSize: 13,
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontWeight: 600,
                  color: "#64748b",
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  borderBottom: "1px solid #e2e8f0",
                  backgroundColor: "#f8fafc",
                  position: "sticky",
                  left: 0,
                  zIndex: 10,
                }}
              >
                {viewMode === "sites" ? "Site" : "Department"}
              </th>
              {METRIC_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: "12px 16px",
                    textAlign: "center",
                    fontWeight: 600,
                    color: "#64748b",
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    borderBottom: "1px solid #e2e8f0",
                    backgroundColor: "#f8fafc",
                    minWidth: 140,
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heatmapData?.groupAverages?.length === 0 ? (
              <tr>
                <td
                  colSpan={METRIC_COLUMNS.length + 1}
                  style={{
                    padding: "40px 20px",
                    textAlign: "center",
                    color: "#94a3b8",
                    fontStyle: "italic",
                  }}
                >
                  {heatmapData.hasFilter && heatmapData.totalBeforeFilter === 0
                    ? `No data available for ${selectedYear}`
                    : heatmapData.hasFilter && heatmapData.totalBeforeFilter > 0
                    ? viewMode === "sites"
                      ? "No sites selected. Select one or more sites to view Lead Time Analysis."
                      : "No departments selected. Select one or more departments to view Lead Time Analysis."
                    : `No data available for ${selectedYear}`}
                </td>
              </tr>
            ) : (
              heatmapData?.groupAverages?.map((groupData) => (
                <tr key={groupData.groupKey}>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontWeight: 500,
                      color: "#1e293b",
                      borderBottom: "1px solid #f1f5f9",
                      backgroundColor: "#ffffff",
                      position: "sticky",
                      left: 0,
                      zIndex: 5,
                    }}
                  >
                    {groupData.groupKey}
                  </td>
                  {METRIC_COLUMNS.map((col) => {
                    const value = groupData[col.key as keyof typeof groupData] as number;
					
                    // Use fixed 0-60 scale for all metrics
                    const color = getColorForValue(value);
                    const displayValue = isNaN(value) || !isFinite(value) ? "—" : value.toFixed(1);

                    // Determine text color based on background brightness
                    // color is already RGB string from interpolateColor, parse it
                    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                    const rgb = rgbMatch 
                      ? { r: parseInt(rgbMatch[1]), g: parseInt(rgbMatch[2]), b: parseInt(rgbMatch[3]) }
                      : { r: 16, g: 185, b: 129 }; // Default to green if parsing fails
                    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
                    const textColor = brightness > 180 ? "#1e293b" : "#ffffff";

                    return (
                      <td
                        key={col.key}
                        style={{
                          padding: "12px 16px",
                          textAlign: "center",
                          color: textColor,
                          borderBottom: "1px solid #f1f5f9",
                          backgroundColor: color,
                          fontWeight: 500,
                        }}
                      >
                        {displayValue}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Business Days color scale legend */}
      <div
        style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "#64748b",
              whiteSpace: "nowrap",
            }}
          >
            Business Days
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flex: 1,
              maxWidth: 300,
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: "#94a3b8",
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              {overallMin}
            </span>
            <div
              style={{
                flex: 1,
                height: 20,
                background: "linear-gradient(to right, #10b981, #fbbf24, #f97316, #ef4444)",
                borderRadius: 4,
              }}
            />
            <span
              style={{
                fontSize: 11,
                color: "#94a3b8",
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              {overallMax}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

