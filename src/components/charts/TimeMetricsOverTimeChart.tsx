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
import type { AllRepairsRow } from "../tables/AllRepairsTable";

type TimeMetricsOverTimeChartProps = {
  selectedStatuses: string[];
  selectedManufacturers: string[];
  selectedYear: number;
  compareWithPrevious?: boolean;
};

// Color palette for lines
const LINE_COLORS = [
  "#2563eb", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
];

/*
const METRIC_KEYS = [
  "avgApprovalTime",
  "avgExpectedTime",
  "avgOverallTurnaroundTime",
  "avgQuoteTime",
  "avgRepairTime",
  "variance",
] as const;

const METRIC_LABELS: Record<string, string> = {
  avgApprovalTime: "Avg. Approval Time",
  avgExpectedTime: "Avg. Expected Time",
  avgOverallTurnaroundTime: "Avg. Overall Turnaround Time",
  avgQuoteTime: "Avg. Quote Time",
  avgRepairTime: "Avg. Repair Time",
  variance: "Variance",
}; */

const METRIC_KEYS = [
  "AvgApprovalTime",
  "AvgExpectedTIme",
  "AvgTurnAroundTIme",
  "AvgQuoteTime",
  "AvgRepairTime",
  "Variance",
] as const;

const METRIC_LABELS: Record<string, string> = {
  AvgApprovalTime: "Avg. Approval Time",
  AvgExpectedTIme: "Avg. Expected Time",
  AvgTurnAroundTIme: "Avg. Overall Turnaround Time",
  AvgQuoteTime: "Avg. Quote Time",
  AvgRepairTime: "Avg. Repair Time",
  Variance: "Variance",
};

const MAX_VISIBLE_SERIES = 10;

export function TimeMetricsOverTimeChart({
  selectedStatuses,
  selectedManufacturers,
  selectedYear,
  compareWithPrevious = false,
}: TimeMetricsOverTimeChartProps) {
  const [visibleMetrics, setVisibleMetrics] = useState<Set<string>>(
    new Set(METRIC_KEYS)
  );
  const [hoveredDisabledKey, setHoveredDisabledKey] = useState<string | null>(null);

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
		
		setRepair(jsonData.responseData['TimeMetricsChart']); // Store the result in state
				//console.log('jsonData: ', jsonData.responseData['TimeMetricsChart']);		
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  	// Jaya - EOC
	
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

  // Calculate time metrics from status history with realistic fallbacks
  const calculateTimeMetrics = (row: AllRepairsRow, year: number) => {
    if (!row.statusHistory || row.statusHistory.length === 0) {
      return null;
    }

    const history = row.statusHistory;
    const receivedDate = new Date(history[0].date);
    
    // Find key dates
    const quoteEntry = history.find((e) => e.status === "Awaiting Quote");
    const approvalEntry = history.find((e) => e.status === "Awaiting Approval");
    const inProgressEntry = history.find((e) => e.status === "In Progress");
    const completedEntry = history.find((e) => e.status === "Completed");

    const quoteDate = quoteEntry ? new Date(quoteEntry.date) : null;
    const approvalDate = approvalEntry ? new Date(approvalEntry.date) : null;
    const inProgressDate = inProgressEntry ? new Date(inProgressEntry.date) : null;
    const completedDate = completedEntry ? new Date(completedEntry.date) : null;

    // Calculate metrics (in days)
    let quoteTime = quoteDate ? Math.ceil((quoteDate.getTime() - receivedDate.getTime()) / (1000 * 60 * 60 * 24)) : null;
    let approvalTime = approvalDate && quoteDate ? Math.ceil((approvalDate.getTime() - quoteDate.getTime()) / (1000 * 60 * 60 * 24)) : null;
    let repairTime = inProgressDate && completedDate ? Math.ceil((completedDate.getTime() - inProgressDate.getTime()) / (1000 * 60 * 60 * 24)) : null;
    const overallTurnaroundTime = completedDate ? Math.ceil((completedDate.getTime() - receivedDate.getTime()) / (1000 * 60 * 60 * 24)) : null;
    
    // Generate realistic fallback values if metrics are missing or invalid
    const seedBase = `${year}-${row.rrNumber}-${row.site || "Unknown"}`;
    
    if (quoteTime === null || quoteTime <= 0) {
      quoteTime = deterministicValue(`${seedBase}-quote`, 1, 6);
    }
    
    if (approvalTime === null || approvalTime <= 0) {
      approvalTime = deterministicValue(`${seedBase}-approval`, 2, 8);
    }
    
    if (repairTime === null || repairTime <= 0) {
      repairTime = deterministicValue(`${seedBase}-repair`, 8, 20);
    }
    
    // Expected time: use calculated if available, otherwise generate realistic value
    let expectedTime: number;
    if (quoteTime && approvalTime && repairTime) {
      expectedTime = quoteTime + approvalTime + repairTime;
      // Add some variation to make it more realistic
      const variation = deterministicValue(`${seedBase}-expected`, -3, 5);
      expectedTime = Math.max(20, Math.min(40, expectedTime + variation));
    } else if (overallTurnaroundTime) {
      expectedTime = overallTurnaroundTime;
    } else {
      expectedTime = deterministicValue(`${seedBase}-expected`, 20, 40);
    }
    
    // Variance: difference between expected and actual, with realistic range
    let variance: number;
    if (overallTurnaroundTime) {
      variance = overallTurnaroundTime - expectedTime;
      // Clamp variance to realistic range
      variance = Math.max(-10, Math.min(10, variance));
    } else {
      variance = deterministicValue(`${seedBase}-variance`, -5, 5);
    }

    return {
      quoteTime,
      approvalTime,
      repairTime,
      overallTurnaroundTime: overallTurnaroundTime || (quoteTime + approvalTime + repairTime + deterministicValue(`${seedBase}-turnaround`, -2, 8)),
      expectedTime,
      variance,
    };
  };

  const chartData = useMemo(() => {
	  
	   if (!repairDyna || repairDyna.length === 0) {
	
	  return {chartData: []};
		}
		//console.log('repairDyna: ', repairDyna);
    // Helper function to process data for a specific year
   /* const processYearData = (year: number) => {
      const yearStart = new Date(year, 0, 1);
      const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);

      // Filter data
     // let filtered = ALL_REPAIRS_DATA.filter((row) => {
		 let filtered = repairDyna.filter((row: any) => {
      // Filter by year (based on receivedDate)
      // If no receivedDate, include it (might be calculated from statusHistory)
      if (row.receivedDate) {
        try {
          const received = new Date(row.receivedDate);
          if (isNaN(received.getTime())) {
            // Invalid date, skip
            return false;
          }
          if (received < yearStart || received > yearEnd) {
            return false;
          }
        } catch (e) {
          // Invalid date format, skip
          return false;
        }
      } else {
        // If no receivedDate, try to get it from statusHistory
        if (row.statusHistory && row.statusHistory.length > 0) {
          try {
            const firstStatus = row.statusHistory[0];
            const received = new Date(firstStatus.date);
            if (!isNaN(received.getTime())) {
              if (received < yearStart || received > yearEnd) {
                return false;
              }
            }
          } catch (e) {
            // Can't determine date, skip
            return false;
          }
        } else {
          // No date info at all, skip
          return false;
        }
      }

      // Filter by status (empty array or ["all"] means all)
      if (selectedStatuses.length > 0 && !selectedStatuses.includes("all") && !selectedStatuses.includes(row.status)) {
        return false;
      }

      // Filter by manufacturer (extract from details field)
      if (selectedManufacturers.length > 0 && !selectedManufacturers.includes("all")) {
        const manufacturer = row.details?.split(" • ")[0];
        if (!manufacturer || !selectedManufacturers.includes(manufacturer)) {
          return false;
        }
      }

        return true;
      });

      if (filtered.length === 0) {
        return null;
      }

      // Group by month and calculate averages
      const monthBuckets: Record<number, {
        quoteTimes: number[];
        approvalTimes: number[];
        repairTimes: number[];
        overallTurnaroundTimes: number[];
        expectedTimes: number[];
        variances: number[];
      }> = {};

      // Initialize all months
      for (let month = 0; month < 12; month++) {
        monthBuckets[month] = {
          quoteTimes: [],
          approvalTimes: [],
          repairTimes: [],
          overallTurnaroundTimes: [],
          expectedTimes: [],
          variances: [],
        };
      }

      // Process each row
      filtered.forEach((row) => {
        const metrics = calculateTimeMetrics(row, year);
        if (!metrics) return;

        // Get month from receivedDate or statusHistory
        let received: Date | null = null;
        if (row.receivedDate) {
          try {
            received = new Date(row.receivedDate);
            if (isNaN(received.getTime())) {
              received = null;
            }
          } catch (e) {
            received = null;
          }
        }
        
        if (!received && row.statusHistory && row.statusHistory.length > 0) {
          try {
            received = new Date(row.statusHistory[0].date);
            if (isNaN(received.getTime())) {
              received = null;
            }
          } catch (e) {
            received = null;
          }
        }

        if (received) {
          const month = received.getMonth();

          if (metrics.quoteTime !== null) monthBuckets[month].quoteTimes.push(metrics.quoteTime);
          if (metrics.approvalTime !== null) monthBuckets[month].approvalTimes.push(metrics.approvalTime);
          if (metrics.repairTime !== null) monthBuckets[month].repairTimes.push(metrics.repairTime);
          if (metrics.overallTurnaroundTime !== null) monthBuckets[month].overallTurnaroundTimes.push(metrics.overallTurnaroundTime);
          if (metrics.expectedTime !== null) monthBuckets[month].expectedTimes.push(metrics.expectedTime);
          if (metrics.variance !== null) monthBuckets[month].variances.push(metrics.variance);
        }
      });

      // Calculate averages for each month with realistic variability
      // Helper function to add realistic month-to-month variation
      const addVariation = (baseValue: number, monthIndex: number, metricIndex: number): number => {
        if (baseValue === 0 || isNaN(baseValue)) return baseValue;
        
        // Seasonal patterns (different for each metric)
        const seasonalPatterns = [
          [0, -0.05, 0.1, 0.15, 0.2, 0.15, 0.1, 0.05, 0, -0.05, -0.1, -0.05], // Quote time: peaks in summer
          [0.1, 0.05, 0, -0.05, -0.1, -0.05, 0, 0.05, 0.1, 0.15, 0.1, 0.05], // Approval time: peaks in fall
          [-0.1, -0.05, 0, 0.05, 0.1, 0.15, 0.2, 0.15, 0.1, 0.05, 0, -0.05], // Repair time: peaks in summer
          [0, 0.05, 0.1, 0.15, 0.2, 0.15, 0.1, 0.05, 0, -0.05, -0.1, -0.05], // Overall turnaround: peaks in summer
          [0.05, 0, -0.05, -0.1, -0.05, 0, 0.05, 0.1, 0.15, 0.1, 0.05, 0], // Expected time: peaks in fall
          [-0.15, -0.1, -0.05, 0, 0.05, 0.1, 0.15, 0.1, 0.05, 0, -0.05, -0.1], // Variance: peaks in summer
        ];
        
        // Deterministic variation based on month and metric (using sine wave for smooth transitions)
        const phases = [0, Math.PI / 3, Math.PI / 2, Math.PI / 4, Math.PI / 6, Math.PI / 5];
        const amplitudes = [0.12, 0.10, 0.15, 0.13, 0.11, 0.14];
        const phase = phases[metricIndex] || 0;
        const amplitude = amplitudes[metricIndex] || 0.12;
        const deterministicVariation = Math.sin((monthIndex * Math.PI / 6) + phase) * amplitude;
        
        // Seasonal adjustment
        const seasonalAdjust = seasonalPatterns[metricIndex]?.[monthIndex] || 0;
        
        // Combine: base + seasonal + deterministic variation
        const variation = seasonalAdjust + deterministicVariation;
        const adjustedValue = baseValue * (1 + variation);
        
        // Ensure values stay within reasonable bounds (no negative, no extreme spikes)
        return Math.max(baseValue * 0.5, Math.min(baseValue * 1.8, adjustedValue));
      };
      
      // Calculate base averages first
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const baseAverages = monthNames.map((month, index) => {
        const bucket = monthBuckets[index];
        
        const avgQuoteTime = bucket.quoteTimes.length > 0
          ? bucket.quoteTimes.reduce((a, b) => a + b, 0) / bucket.quoteTimes.length
          : null;
        
        const avgApprovalTime = bucket.approvalTimes.length > 0
          ? bucket.approvalTimes.reduce((a, b) => a + b, 0) / bucket.approvalTimes.length
          : null;
        
        const avgRepairTime = bucket.repairTimes.length > 0
          ? bucket.repairTimes.reduce((a, b) => a + b, 0) / bucket.repairTimes.length
          : null;
        
        const avgOverallTurnaroundTime = bucket.overallTurnaroundTimes.length > 0
          ? bucket.overallTurnaroundTimes.reduce((a, b) => a + b, 0) / bucket.overallTurnaroundTimes.length
          : null;
        
        const avgExpectedTime = bucket.expectedTimes.length > 0
          ? bucket.expectedTimes.reduce((a, b) => a + b, 0) / bucket.expectedTimes.length
          : null;
        
        const avgVariance = bucket.variances.length > 0
          ? bucket.variances.reduce((a, b) => a + b, 0) / bucket.variances.length
          : null;

        return {
          month,
          avgQuoteTime,
          avgApprovalTime,
          avgRepairTime,
          avgOverallTurnaroundTime,
          avgExpectedTime,
          avgVariance,
        };
      });
      
      // If we have data, add variation. Otherwise, generate realistic mock data with variation
      const hasRealData = baseAverages.some(d => 
        d.avgQuoteTime !== null || d.avgApprovalTime !== null || d.avgRepairTime !== null
      );
      
      if (!hasRealData) {
        // Generate realistic mock data with variation
        // Ranges: Approval: 2-8, Quote: 1-6, Repair: 8-20, Overall: 18-40, Expected: 20-40, Variance: -5 to +5
        const baseValues = {
          quoteTime: 3.5, // Base ~3.5 days (range 1-6)
          approvalTime: 5, // Base ~5 days (range 2-8)
          repairTime: 14, // Base ~14 days (range 8-20) - purple line
          overallTurnaround: 29, // Base ~29 days (range 18-40) - orange line
          expectedTime: 30, // Base ~30 days (range 20-40)
          variance: 0, // Base ~0 (range -5 to +5)
        };
        
        // Helper to generate values within specific ranges with month-to-month variation
        const generateInRange = (base: number, min: number, max: number, monthIndex: number, metricIndex: number): number => {
          const variation = addVariation(base, monthIndex, metricIndex);
          // Clamp to range
          return Math.max(min, Math.min(max, variation));
        };
        
        return monthNames.map((month, index) => ({
          month,
          avgQuoteTime: Math.round(generateInRange(baseValues.quoteTime, 1, 6, index, 0) * 10) / 10,
          avgApprovalTime: Math.round(generateInRange(baseValues.approvalTime, 2, 8, index, 1) * 10) / 10,
          avgRepairTime: Math.round(generateInRange(baseValues.repairTime, 8, 20, index, 2) * 10) / 10,
          avgOverallTurnaroundTime: Math.round(generateInRange(baseValues.overallTurnaround, 18, 40, index, 3) * 10) / 10,
          avgExpectedTime: Math.round(generateInRange(baseValues.expectedTime, 20, 40, index, 4) * 10) / 10,
          variance: Math.round(generateInRange(baseValues.variance, -5, 5, index, 5) * 10) / 10,
        }));
      }
      
      // Apply variation to real data
      return baseAverages.map((data, index) => ({
        month: data.month,
        avgQuoteTime: data.avgQuoteTime !== null 
          ? Math.round(addVariation(data.avgQuoteTime, index, 0) * 10) / 10 
          : null,
        avgApprovalTime: data.avgApprovalTime !== null 
          ? Math.round(addVariation(data.avgApprovalTime, index, 1) * 10) / 10 
          : null,
        avgRepairTime: data.avgRepairTime !== null 
          ? Math.round(addVariation(data.avgRepairTime, index, 2) * 10) / 10 
          : null,
        avgOverallTurnaroundTime: data.avgOverallTurnaroundTime !== null 
          ? Math.round(addVariation(data.avgOverallTurnaroundTime, index, 3) * 10) / 10 
          : null,
        avgExpectedTime: data.avgExpectedTime !== null 
          ? Math.round(addVariation(data.avgExpectedTime, index, 4) * 10) / 10 
          : null,
        variance: data.avgVariance !== null 
          ? Math.round(addVariation(data.avgVariance, index, 5) * 10) / 10 
          : null,
      })
	  );
    };*/


 const processYearData = (year: number) => {
      const yearStart = new Date(year, 0, 1);
      const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);
 const monthMetricsMap = new Map<number, Map<RepairStatus, number>>();
		//const timeMetricsOverTimeMap ;
      // Filter data
     // let filtered = ALL_REPAIRS_DATA.filter((row) => {
		 let filtered = repairDyna.filter((repair: any) => {
			 //console.log('repairDyna: ', repairDyna);
			 
			 if (!repair.Year) return false;
			 
			 const repairDate = new Date(repair.Year, (repair.Month || 1) - 1, 1);
    return repairDate >= yearStart && repairDate <= yearEnd;
  });
			  filtered.forEach((repair: any) => {
				  //console.log('repair: ', repair);
			 if (repair.Year) {
			const keys = Object.keys(repair);
			 //console.log('keys: ', keys);
          // Fallback: use receivedDate and current status if no statusHistory
          const date = new Date(repair.Year,0,1);
		  
          if (date >= yearStart && date <= yearEnd) {
			
            const monthIndex = repair.Month-1; // 0-11
            
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
			monthMetricsMap.set(monthIndex, timeMetricsOverTimeMap);
			//console.log('monthMetricsMap: ', monthMetricsMap);

          }
        }	
			  });
			  //console.log('monthMetricsMap: ', monthMetricsMap);
			  return monthMetricsMap;
		
		// });
	 };
	 
    // Process current year data
    const currentYearData = processYearData(selectedYear);
	//console.log('currentYearData: ' , currentYearData);
    
    // Process previous year data if comparison is enabled
    const previousYear = selectedYear - 1;
    const previousYearData = compareWithPrevious ? processYearData(previousYear) : null;

    // Combine data - always create 12 months (Jan-Dec)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // If no current year data, return empty array
    if (!currentYearData || currentYearData.length === 0) {
      return { data: [], compareWithPrevious, previousYear: compareWithPrevious ? previousYear : undefined };
    }
    //console.log('hi');
    const data = monthNames.map((monthName, monthIndex) => {
		//console.log('monthIndex: ', monthIndex);
      const currentMonthData = currentYearData.get(monthIndex);
	  //console.log('currentMonthData: ', currentMonthData);
	  
      const previousMonthData = previousYearData?.get(monthIndex);
       //console.log('previousMonthData: ', previousMonthData);
      const entry: Record<string, string | number | null> = { month: monthName };
      
      // Add current year metrics
      METRIC_KEYS.forEach((key) => {
        entry[key] = currentMonthData?. get(key) ?? null;
      });
      
      // Add previous year metrics if comparison is enabled
      if (compareWithPrevious && previousMonthData) {
        METRIC_KEYS.forEach((key) => {
          entry[`${key}_prev`] = previousMonthData.get(key) ?? null;
        });
      }
      
      return entry;
    });
//console.log('data: ', data);
    return { data, compareWithPrevious, previousYear: compareWithPrevious ? previousYear : undefined };
  }, [repairDyna, selectedStatuses, selectedManufacturers, selectedYear, compareWithPrevious]);

  const toggleMetric = (metricKey: string) => {
    setVisibleMetrics((prev) => {
      const next = new Set(prev);
      if (next.has(metricKey)) {
        next.delete(metricKey);
      } else {
        next.add(metricKey);
      }
      return next;
    });
  };

  // Custom tooltip that only shows visible metrics
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;
//console.log('payload: ', payload);
    const isComparing = chartData.compareWithPrevious;
    const prevYear = chartData.previousYear;

    // Filter to only show visible metrics (exclude previous year lines from direct display)
    const visibleMetricKeys = Array.from(visibleMetrics).filter(key => !key.endsWith('_prev'));
    
    if (visibleMetricKeys.length === 0) return null;

    return (
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 10,
          border: "1px solid #e2e8f0",
          color: "#1e293b",
          fontSize: 13,
          fontWeight: 500,
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(15, 23, 42, 0.04)",
          padding: "8px 12px",
        }}
      >
        <div style={{ marginBottom: 4, fontWeight: 600, color: "#0f172a" }}>
          {label}
        </div>
        {visibleMetricKeys.map((metricKey) => {
          const currentValue = payload.find((p: any) => p.dataKey === metricKey)?.value ?? null;
          const prevValue = isComparing
            ? payload.find((p: any) => p.dataKey === `${metricKey}_prev`)?.value ?? null
            : null;
          
          // Skip if both values are null
          if (currentValue === null && prevValue === null) return null;
          
          const color = LINE_COLORS[METRIC_KEYS.indexOf(metricKey as any) % LINE_COLORS.length];
          
          return (
            <div key={metricKey} style={{ marginBottom: 6 }}>
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
                    backgroundColor: color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontWeight: 500 }}>
                  {METRIC_LABELS[metricKey] || metricKey}:
                </span>
              </div>
              <div style={{ marginLeft: 20, marginTop: 2 }}>
                {isComparing && prevValue !== null ? (
                  <>
                    <div style={{ color: "#1e293b", fontWeight: 500 }}>
                      {selectedYear}: {currentValue !== null ? `${Number(currentValue || 0).toFixed(1)} days` : 'N/A'}
                    </div>
                    <div style={{ color: "#64748b", fontSize: 12 }}>
                      {prevYear}: {prevValue !== null ? `${Number(prevValue || 0).toFixed(1)} days` : 'N/A'}
                    </div>
                  </>
                ) : (
                  <div style={{ color: "#1e293b", fontWeight: 500 }}>
                    {currentValue !== null ? `${Number(currentValue || 0).toFixed(1)} days` : 'N/A'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

let hasData;
//console.log('chartData: ', chartData);
if (chartData !== null  && chartData.data)
{
	 hasData = chartData.data.length > 0 && chartData.data.some((d: any) => 
    /*d.avgApprovalTime !== null || 
    d.avgExpectedTime !== null || 
    d.avgOverallTurnaroundTime !== null || 
    d.avgQuoteTime !== null || 
    d.avgRepairTime !== null || 
    d.variance !== null*/
	d.AvgApprovalTime !== null || 
    d.AvgExpectedTime !== null || 
    d.AvgOverallTurnaroundTime !== null || 
    d.AvgQuoteTime !== null || 
    d.AvgRepairTime !== null || 
    d.Variance !== null
  );
}
  

  return (
    <div style={{ position: "relative", overflow: "visible" }}>
      <div style={{ width: "100%", height: 300, position: "relative", overflow: "visible" }}>
        {!hasData ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748b",
              fontSize: 14,
            }}
          >
            No data available for the selected filters.
          </div>
        ) : (
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
              {METRIC_KEYS.map((key, index) => {
                if (!visibleMetrics.has(key)) return null;
                const color = LINE_COLORS[index % LINE_COLORS.length];
                
                return (
                  <React.Fragment key={key}>
                    {/* Current year line - solid */}
                    <Line
                      type="monotone"
                      dataKey={key}
                      stroke={color}
                      strokeWidth={2}
                      dot={{ fill: color, r: 2 }}
                      activeDot={{ r: 4 }}
                      connectNulls
                    />
                    {/* Previous year line - dashed, lower opacity */}
                    {chartData.compareWithPrevious && (
                      <Line
                        type="monotone"
                        dataKey={`${key}_prev`}
                        stroke={color}
                        strokeWidth={2}
                        strokeDasharray="6 6"
                        strokeOpacity={0.65}
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
        )}
      </div>

      {/* Legend */}
      <div className="repair-trend-legend">
        {METRIC_KEYS.map((key, index) => {
          const isVisible = visibleMetrics.has(key);
          const isDisabled = !isVisible && visibleMetrics.size >= MAX_VISIBLE_SERIES;
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
                onClick={() => toggleMetric(key)}
                disabled={isDisabled}
              >
                <div
                  className="repair-trend-legend-color"
                  style={{ backgroundColor: color }}
                />
                <span className="repair-trend-legend-label">{METRIC_LABELS[key]}</span>
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

