import type { AllRepairsRow, RepairStatus, StatusHistoryEntry } from "../components/tables/AllRepairsTable";
import { SITES, DEPARTMENTS } from "../constants/sitesAndDepartments";

// Get Year to Date range (Jan 1 of current year to today)
const getYtdRange = () => {
  const today = new Date();
  const yearStart = new Date(today.getFullYear(), 0, 1);
  const daysSinceYearStart = Math.floor((today.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
  return { yearStart, daysSinceYearStart, today };
};

// Helper to add days to a date
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Helper to format date as ISO string
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Helper to generate realistic customer part numbers (distinct from MFR Part #)
const generateCustomerPartNumber = (index: number, year: number): string => {
  // Use deterministic patterns to generate varied customer part numbers
  const patterns = [
    // Format: GM-CP-XXXXX
    () => `GM-CP-${48000 + (index % 1000)}`,
    // Format: CI-XXXXX-A
    () => `CI-${10000 + (index % 9000)}-${String.fromCharCode(65 + (index % 26))}`,
    // Format: CP-XXXXX
    () => `CP-${77000 + (index % 3000)}`,
    // Format: GM-PN-XXXXX
    () => `GM-PN-${52000 + (index % 2000)}`,
    // Format: CI-XXXXX-B
    () => `CI-${20000 + (index % 8000)}-${String.fromCharCode(66 + (index % 25))}`,
    // Format: CP-XXXXX-X
    () => `CP-${85000 + (index % 5000)}-${String.fromCharCode(65 + (index % 26))}`,
  ];
  
  const patternIndex = (index + year) % patterns.length;
  return patterns[patternIndex]();
};


// Generate realistic status history for a repair
// Returns an array of status transitions with dates
const generateStatusHistory = (
  finalStatus: RepairStatus,
  receivedDate: Date,
  index: number
): StatusHistoryEntry[] => {
  const history: StatusHistoryEntry[] = [];
  const { today } = getYtdRange();
  
  // Define realistic transition paths
  const transitionPaths: Record<RepairStatus, RepairStatus[][]> = {
    "Repair Logged": [
      ["Repair Logged"], // Initial status, can stay here
    ],
    "Awaiting Quote": [
      ["Repair Logged", "Awaiting Quote"], // Most common: starts from Repair Logged
      ["Awaiting Quote"], // Can also stay in this status (for backward compatibility)
    ],
    "PO": [
      ["Repair Logged", "Awaiting Quote", "PO"],
      ["Awaiting Quote", "PO"], // Can go directly from quote to PO
    ],
    "Awaiting Approval": [
      ["Repair Logged", "Awaiting Quote", "PO", "Awaiting Approval"],
      ["Repair Logged", "Awaiting Quote", "Awaiting Approval"],
      ["Awaiting Quote", "PO", "Awaiting Approval"],
      ["Awaiting Quote", "Awaiting Approval"], // Backward compatibility
    ],
    "In Progress": [
      ["Repair Logged", "Awaiting Quote", "PO", "Awaiting Approval", "In Progress"],
      ["Repair Logged", "Awaiting Quote", "Awaiting Approval", "In Progress"],
      ["Repair Logged", "Awaiting Quote", "In Progress"], // Sometimes skip approval
      ["Awaiting Quote", "PO", "Awaiting Approval", "In Progress"],
      ["Awaiting Quote", "Awaiting Approval", "In Progress"], // Backward compatibility
      ["Awaiting Quote", "In Progress"], // Backward compatibility
    ],
    "Completed": [
      ["Repair Logged", "Awaiting Quote", "PO", "Awaiting Approval", "In Progress", "Completed"],
      ["Repair Logged", "Awaiting Quote", "Awaiting Approval", "In Progress", "Completed"],
      ["Repair Logged", "Awaiting Quote", "In Progress", "Completed"], // Sometimes skip approval
      ["Awaiting Quote", "PO", "Awaiting Approval", "In Progress", "Completed"],
      ["Awaiting Quote", "Awaiting Approval", "In Progress", "Completed"], // Backward compatibility
      ["Awaiting Quote", "In Progress", "Completed"], // Backward compatibility
    ],
    "Rejected": [
      ["Repair Logged", "Awaiting Quote", "Rejected"], // Early rejection
      ["Repair Logged", "Awaiting Quote", "PO", "Awaiting Approval", "Rejected"], // Rejected after PO and approval
      ["Repair Logged", "Awaiting Quote", "Awaiting Approval", "Rejected"], // Rejected after approval request
      ["Awaiting Quote", "PO", "Rejected"], // Rejected after PO
      ["Awaiting Quote", "Rejected"], // Backward compatibility
      ["Awaiting Quote", "Awaiting Approval", "Rejected"], // Backward compatibility
    ],
    "Not Repairable": [
      ["Repair Logged", "Awaiting Quote", "Not Repairable"], // Early determination
      ["Repair Logged", "Awaiting Quote", "PO", "Awaiting Approval", "In Progress", "Not Repairable"], // Found during repair after PO
      ["Repair Logged", "Awaiting Quote", "Awaiting Approval", "In Progress", "Not Repairable"], // Found during repair
      ["Awaiting Quote", "PO", "Not Repairable"], // Not repairable after PO
      ["Awaiting Quote", "Not Repairable"], // Backward compatibility
      ["Awaiting Quote", "Awaiting Approval", "In Progress", "Not Repairable"], // Backward compatibility
    ],
  };
  
  // Select a path based on final status
  const paths = transitionPaths[finalStatus];
  const path = paths[index % paths.length];
  
  // Start with the first status from the path
  let currentDate = new Date(receivedDate);
  const firstStatus = path[0];
  history.push({ status: firstStatus, date: formatDate(currentDate) });
  
  // If the path only has one status, we're done
  if (path.length === 1) {
    return history;
  }
  
  // Generate dates for each transition (skip first since it's already added)
  for (let i = 1; i < path.length; i++) {
    const prevStatus = path[i - 1];
    const nextStatus = path[i];
    
    // Skip if transitioning from Repair Logged to itself (shouldn't happen, but safety check)
    if (prevStatus === nextStatus) continue;
    
    // Realistic duration between statuses (in days)
    let daysBetween: number;
    if (prevStatus === "Repair Logged" && nextStatus === "Awaiting Quote") {
      daysBetween = 1 + (index % 3); // 1-3 days from logged to quote
    } else if (prevStatus === "Awaiting Quote" && nextStatus === "PO") {
      daysBetween = 1 + (index % 4); // 1-4 days from quote to PO
    } else if (prevStatus === "PO" && nextStatus === "Awaiting Approval") {
      daysBetween = 1 + (index % 3); // 1-3 days from PO to approval
    } else if (prevStatus === "Awaiting Quote" && nextStatus === "Awaiting Approval") {
      daysBetween = 2 + (index % 5); // 2-6 days
    } else if (prevStatus === "Awaiting Approval" && nextStatus === "In Progress") {
      daysBetween = 1 + (index % 3); // 1-3 days
    } else if (prevStatus === "In Progress" && nextStatus === "Completed") {
      daysBetween = 5 + (index % 10); // 5-14 days
    } else if (prevStatus === "Awaiting Quote" && nextStatus === "In Progress") {
      daysBetween = 3 + (index % 7); // 3-9 days
    } else if (prevStatus === "Repair Logged" && nextStatus === "Rejected") {
      daysBetween = 1 + (index % 2); // 1-2 days (very early rejection)
    } else if (prevStatus === "Awaiting Quote" && nextStatus === "Rejected") {
      daysBetween = 1 + (index % 4); // 1-4 days
    } else if (prevStatus === "PO" && nextStatus === "Rejected") {
      daysBetween = 1 + (index % 3); // 1-3 days
    } else if (prevStatus === "Repair Logged" && nextStatus === "Not Repairable") {
      daysBetween = 1 + (index % 2); // 1-2 days (very early determination)
    } else if (prevStatus === "Awaiting Quote" && nextStatus === "Not Repairable") {
      daysBetween = 1 + (index % 3); // 1-3 days
    } else if (prevStatus === "PO" && nextStatus === "Not Repairable") {
      daysBetween = 1 + (index % 3); // 1-3 days
    } else if (prevStatus === "Awaiting Approval" && nextStatus === "Rejected") {
      daysBetween = 1 + (index % 2); // 1-2 days
    } else if (prevStatus === "In Progress" && nextStatus === "Not Repairable") {
      daysBetween = 3 + (index % 8); // 3-10 days
    } else {
      daysBetween = 2 + (index % 5); // Default: 2-6 days
    }
    
    currentDate = addDays(currentDate, daysBetween);
    
    // Ensure we don't go past today
    if (currentDate > today) {
      currentDate = new Date(today);
    }
    
    history.push({ status: nextStatus, date: formatDate(currentDate) });
  }
  
  return history;
};


// Helper to generate ETA string
const getEta = (daysInProgress: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + (7 - daysInProgress));
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]} ${date.getDate()}`;
};

// Helper to generate monthly distribution array ensuring all months have data
// Returns array of 12 objects with { month: 0-11, count: number }
const generateMonthlyDistribution = (
  totalCount: number,
  minPerMonth: number = 1,
  maxPerMonth: number = 100,
  variationSeed: number = 0
): Array<{ month: number; count: number }> => {
  // Ensure minimum coverage: at least minPerMonth per month
  const basePerMonth = Math.floor(totalCount / 12);
  const remainder = totalCount % 12;
  
  const distribution: Array<{ month: number; count: number }> = [];
  let allocated = 0;
  
  // First, allocate base amount to each month
  for (let month = 0; month < 12; month++) {
    let count = basePerMonth;
    // Distribute remainder across first few months
    if (month < remainder) {
      count += 1;
    }
    
    // Add variation based on month and seed (sine wave pattern for natural variation)
    const variation = Math.round(Math.sin((month + variationSeed) * 0.5) * 2);
    count = Math.max(minPerMonth, Math.min(maxPerMonth, count + variation));
    
    distribution.push({ month, count });
    allocated += count;
  }
  
  // Adjust if we over-allocated
  if (allocated > totalCount) {
    const diff = allocated - totalCount;
    for (let i = 0; i < diff && i < distribution.length; i++) {
      if (distribution[i].count > minPerMonth) {
        distribution[i].count -= 1;
      }
    }
  } else if (allocated < totalCount) {
    // Distribute remaining
    const diff = totalCount - allocated;
    for (let i = 0; i < diff; i++) {
      const monthIndex = (i + variationSeed) % 12;
      if (distribution[monthIndex].count < maxPerMonth) {
        distribution[monthIndex].count += 1;
      }
    }
  }
  
  return distribution;
};

// Generate mock data for 2025 with proper monthly distribution:
// Target totals (comparable to 2024):
// Repair Logged: 30 (distributed across months)
// Awaiting Quote: 240 (20 per month average, range 15-25)
// Awaiting Approval: 180 (15 per month average, range 10-20)
// In Progress: 300 (25 per month average, range 20-30)
// Completed: 600 (50 per month average, range 40-60)
// Rejected: 72 (6 per month average, range 3-9)
// Not Repairable: 60 (5 per month average, range 2-8)
// Total: 1482

const generateRepairsDataForCurrentYear = (): AllRepairsRow[] => {
  const data: AllRepairsRow[] = [];
  let rrCounter = 45100;

  // Use canonical lists from constants
  const sites = [...SITES];
  const departments = [...DEPARTMENTS];

  const manufacturers = ["Fanuc", "Siemens", "ABB", "Baldor", "Emerson", "Allen-Bradley", "Schneider", "Rockwell"];
  const companies = ["Skittles", "Gum & Mints", "Hersheys", "Acme Foods", "General Mills", "Nestle", "Mars"];

  const descriptions = [
    "Servo Amplifier", "Servo Motor – AC Drive Unit", "VFD – Variable Frequency Drive",
    "Pump Assembly", "Heat Exchanger", "Pressure Regulator", "Control Panel", "Motor Controller",
    "PLC Module", "Encoder Assembly", "Gearbox", "Bearing Assembly", "Valve Assembly",
    "Sensor Array", "Actuator", "Compressor Unit", "Fan Assembly", "Conveyor Belt Motor"
  ];

  // Helper to distribute items across sites/departments more evenly
  const getSiteForIndex = (index: number, total: number): string => {
    // Distribute more evenly across all sites
    const siteIndex = Math.floor((index / total) * sites.length);
    return sites[Math.min(siteIndex, sites.length - 1)];
  };

  const getDepartmentForIndex = (index: number, total: number): string => {
    // Distribute more evenly across all departments
    const deptIndex = Math.floor((index / total) * departments.length);
    return departments[Math.min(deptIndex, departments.length - 1)];
  };

  // Generate repairs with monthly distribution ensuring all statuses exist every month
  // Status totals for 2025:
  const statusTotals = {
    "Repair Logged": 30,
    "Awaiting Quote": 240,  // 20 per month average (range 15-25)
    "PO": 150,  // 12.5 per month average (range 8-17)
    "Awaiting Approval": 180,  // 15 per month average (range 10-20)
    "In Progress": 300,  // 25 per month average (range 20-30)
    "Completed": 600,  // 50 per month average (range 40-60)
    "Rejected": 72,  // 6 per month average (range 3-9)
    "Not Repairable": 60,  // 5 per month average (range 2-8)
  };

  // Generate monthly distributions for each status
  const monthlyDistributions = {
    "Repair Logged": generateMonthlyDistribution(statusTotals["Repair Logged"], 1, 4, 0),
    "Awaiting Quote": generateMonthlyDistribution(statusTotals["Awaiting Quote"], 15, 25, 1),
    "PO": generateMonthlyDistribution(statusTotals["PO"], 8, 17, 1.5),
    "Awaiting Approval": generateMonthlyDistribution(statusTotals["Awaiting Approval"], 10, 20, 2),
    "In Progress": generateMonthlyDistribution(statusTotals["In Progress"], 20, 30, 3),
    "Completed": generateMonthlyDistribution(statusTotals["Completed"], 40, 60, 4),
    "Rejected": generateMonthlyDistribution(statusTotals["Rejected"], 3, 9, 5),
    "Not Repairable": generateMonthlyDistribution(statusTotals["Not Repairable"], 2, 8, 6),
  };

  // Generate repairs for each status, distributed across months
  const statuses: RepairStatus[] = ["Repair Logged", "Awaiting Quote", "PO", "Awaiting Approval", "In Progress", "Completed", "Rejected", "Not Repairable"];
  
  for (const status of statuses) {
    const distribution = monthlyDistributions[status];
    let globalIndex = 0;
    
    // Generate repairs for each month
    for (const { month, count } of distribution) {
      for (let j = 0; j < count; j++) {
        const i = globalIndex++;
        const year = 2025;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const dayInMonth = Math.max(1, Math.min(daysInMonth, Math.floor(((j + 0.5) / count) * daysInMonth) + 1));
        const receivedDate = new Date(year, month, dayInMonth);
        const receivedDateStr = formatDate(receivedDate);
        
        // Generate status history - key is to ensure the status entry date is in the correct month
        // The Repair Trend Analysis chart counts repairs by when they entered each status
        let statusHistory: StatusHistoryEntry[];
        let actualReceivedDate = receivedDate;
        let actualReceivedDateStr = receivedDateStr;
        
        if (status === "Repair Logged") {
          statusHistory = [{ status: "Repair Logged", date: receivedDateStr }];
        } else if (status === "Awaiting Approval" && i < 8) {
          // Special handling for first 8 Awaiting Approval repairs - ensure they're in 1-3 months bucket
          const targetDaysIn1To3Months = [33, 38, 44, 52, 61, 69, 78, 87];
          const targetDays = targetDaysIn1To3Months[i];
          const today = new Date();
          const approvalDate = new Date(today);
          approvalDate.setDate(approvalDate.getDate() - targetDays);
          
          const repairLoggedDate = new Date(approvalDate);
          repairLoggedDate.setDate(repairLoggedDate.getDate() - (3 + (i % 3)));
          
          const awaitingQuoteDate = new Date(approvalDate);
          awaitingQuoteDate.setDate(awaitingQuoteDate.getDate() - (2 + (i % 3)));
          
          statusHistory = [
            { status: "Repair Logged", date: formatDate(repairLoggedDate) },
            { status: "Awaiting Quote", date: formatDate(awaitingQuoteDate) },
            { status: "Awaiting Approval", date: formatDate(approvalDate) },
          ];
          
          actualReceivedDate = repairLoggedDate;
          actualReceivedDateStr = formatDate(repairLoggedDate);
        } else {
          // For other statuses, generate history but ensure the final status entry is in the target month
          // Start by setting the target status entry date to be in the target month
          const targetStatusEntryDate = new Date(year, month, Math.min(dayInMonth + (j % 5), daysInMonth));
          
          // Generate history backwards from the target status entry date
          // First, generate a basic history
          statusHistory = generateStatusHistory(status, receivedDate, i);
          
          // Find and update the entry for the target status to be in the correct month
          const targetEntryIndex = statusHistory.findIndex((e) => e.status === status);
          if (targetEntryIndex >= 0) {
            statusHistory[targetEntryIndex].date = formatDate(targetStatusEntryDate);
            
            // Adjust previous entries to be before the target status entry
            for (let k = targetEntryIndex - 1; k >= 0; k--) {
              const prevDate = new Date(statusHistory[k + 1].date);
              const daysBefore = 1 + ((i + k) % 5); // 1-5 days before
              const adjustedDate = new Date(prevDate);
              adjustedDate.setDate(adjustedDate.getDate() - daysBefore);
              statusHistory[k].date = formatDate(adjustedDate);
            }
            
            // Update receivedDate to be the first entry date
            if (statusHistory.length > 0) {
              actualReceivedDate = new Date(statusHistory[0].date);
              actualReceivedDateStr = statusHistory[0].date;
            }
          }
        }
        
        // Calculate daysInProgress and eta for "In Progress" status
        let daysInProgress = 0;
        let daysInProgressDisplay = "";
        let eta = "";
        
        if (status === "In Progress") {
          const inProgressEntry = statusHistory.find((e) => e.status === "In Progress");
          const inProgressDate = inProgressEntry ? new Date(inProgressEntry.date) : actualReceivedDate;
          const daysSinceInProgress = Math.floor((new Date().getTime() - inProgressDate.getTime()) / (1000 * 60 * 60 * 24));
          
          // Generate realistic distribution
          const bucket = i % 10;
          if (bucket < 4) {
            daysInProgress = 1 + (i % 30);
          } else if (bucket < 8) {
            daysInProgress = 31 + (i % 60);
          } else {
            daysInProgress = 91 + (i % 110);
          }
          
          if (daysSinceInProgress > 0 && daysSinceInProgress <= 200) {
            daysInProgress = daysSinceInProgress;
          }
          daysInProgress = Math.max(1, Math.min(200, daysInProgress));
          daysInProgressDisplay = `${daysInProgress}d`;
          eta = getEta(daysInProgress);
        }
        
        data.push({
          rrNumber: `RR-${rrCounter++}`,
          description: descriptions[i % descriptions.length],
          details: `${manufacturers[i % manufacturers.length]} • ${companies[i % companies.length]}`,
          mfrPart: `PART-${year}-${1000 + i}-${status.substring(0, 3).toUpperCase()}`,
          customerPartNumber: generateCustomerPartNumber(i, year),
          status,
          daysInProgress,
          daysInProgressDisplay,
          eta,
          quote: 500 + (i * 75) + (Math.floor(i / 10) * 250), // Varied quote values: base 500, increment by 75, plus periodic bumps
          receivedDate: actualReceivedDateStr,
          site: getSiteForIndex(i, statusTotals[status]),
          department: getDepartmentForIndex(i, statusTotals[status]),
          statusHistory,
        });
      }
    }
  }


  return data;
};

// Generate historical data for a specific year
const generateHistoricalDataForYear = (year: number, startRrCounter: number): AllRepairsRow[] => {
  const data: AllRepairsRow[] = [];
  let rrCounter = startRrCounter;

  const sites = [...SITES];
  const departments = [...DEPARTMENTS];
  const manufacturers = ["Fanuc", "Siemens", "ABB", "Baldor", "Emerson", "Allen-Bradley", "Schneider", "Rockwell"];
  const companies = ["Skittles", "Gum & Mints", "Hersheys", "Acme Foods", "General Mills", "Nestle", "Mars"];
  const descriptions = [
    "Servo Amplifier", "Servo Motor – AC Drive Unit", "VFD – Variable Frequency Drive",
    "Pump Assembly", "Heat Exchanger", "Pressure Regulator", "Control Panel", "Motor Controller",
    "PLC Module", "Encoder Assembly", "Gearbox", "Bearing Assembly", "Valve Assembly",
    "Sensor Array", "Actuator", "Compressor Unit", "Fan Assembly", "Conveyor Belt Motor"
  ];

  const getSiteForIndex = (index: number, total: number): string => {
    const siteIndex = Math.floor((index / total) * sites.length);
    return sites[Math.min(siteIndex, sites.length - 1)];
  };

  const getDepartmentForIndex = (index: number, total: number): string => {
    const deptIndex = Math.floor((index / total) * departments.length);
    return departments[Math.min(deptIndex, departments.length - 1)];
  };

  // Generate status counts - year-specific totals for realistic year-over-year comparison
  const statusTotals = year === 2023 ? {
    "Repair Logged": 25,
    "Awaiting Quote": 200,  // 16.7 per month average (range 12-22)
    "PO": 120,  // 10 per month average (range 6-15) - minimum 4 per month to meet requirement
    "Awaiting Approval": 150,  // 12.5 per month average (range 8-18)
    "In Progress": 260,  // 21.7 per month average (range 17-27)
    "Completed": 550,  // 45.8 per month average (range 36-56)
    "Rejected": 65,  // 5.4 per month average (range 3-9)
    "Not Repairable": 50,  // 4.2 per month average (range 2-8)
  } : {
    "Repair Logged": 28,
    "Awaiting Quote": 220,  // 18 per month average (range 13-23) - slightly lower than 2025
    "PO": 140,  // 11.5 per month average (range 7-16) - slightly lower than 2025
    "Awaiting Approval": 170,  // 14 per month average (range 9-19) - slightly lower than 2025
    "In Progress": 280,  // 23 per month average (range 18-28) - slightly lower than 2025
    "Completed": 580,  // 48 per month average (range 38-58) - slightly lower than 2025
    "Rejected": 70,  // 6 per month average (range 3-9)
    "Not Repairable": 55,  // 5 per month average (range 2-8)
  };

  // Generate monthly distributions for each status - year-specific ranges
  const monthlyDistributions = year === 2023 ? {
    "Repair Logged": generateMonthlyDistribution(statusTotals["Repair Logged"], 1, 4, 10),
    "Awaiting Quote": generateMonthlyDistribution(statusTotals["Awaiting Quote"], 12, 22, 11),
    "PO": generateMonthlyDistribution(statusTotals["PO"], 6, 15, 11.3),
    "Awaiting Approval": generateMonthlyDistribution(statusTotals["Awaiting Approval"], 8, 18, 12),
    "In Progress": generateMonthlyDistribution(statusTotals["In Progress"], 17, 27, 13),
    "Completed": generateMonthlyDistribution(statusTotals["Completed"], 36, 56, 14),
    "Rejected": generateMonthlyDistribution(statusTotals["Rejected"], 3, 9, 15),
    "Not Repairable": generateMonthlyDistribution(statusTotals["Not Repairable"], 2, 8, 16),
  } : {
    "Repair Logged": generateMonthlyDistribution(statusTotals["Repair Logged"], 1, 4, 10),
    "Awaiting Quote": generateMonthlyDistribution(statusTotals["Awaiting Quote"], 13, 23, 11),
    "PO": generateMonthlyDistribution(statusTotals["PO"], 7, 16, 11.5),
    "Awaiting Approval": generateMonthlyDistribution(statusTotals["Awaiting Approval"], 9, 19, 12),
    "In Progress": generateMonthlyDistribution(statusTotals["In Progress"], 18, 28, 13),
    "Completed": generateMonthlyDistribution(statusTotals["Completed"], 38, 58, 14),
    "Rejected": generateMonthlyDistribution(statusTotals["Rejected"], 3, 9, 15),
    "Not Repairable": generateMonthlyDistribution(statusTotals["Not Repairable"], 2, 8, 16),
  };

  // Generate repairs for each status, distributed across months
  const statuses: RepairStatus[] = ["Repair Logged", "Awaiting Quote", "PO", "Awaiting Approval", "In Progress", "Completed", "Rejected", "Not Repairable"];
  
  for (const status of statuses) {
    const distribution = monthlyDistributions[status];
    let globalIndex = 0;
    
    // Generate repairs for each month
    for (const { month, count } of distribution) {
      for (let j = 0; j < count; j++) {
        const i = globalIndex++;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const dayInMonth = Math.max(1, Math.min(daysInMonth, Math.floor(((j + 0.5) / count) * daysInMonth) + 1));
        const receivedDate = new Date(year, month, dayInMonth);
        const receivedDateStr = formatDate(receivedDate);
        
        // Generate status history - ensure the status entry date is in the correct month
        let statusHistory: StatusHistoryEntry[];
        let actualReceivedDateStr = receivedDateStr;
        
        if (status === "Repair Logged") {
          statusHistory = [{ status: "Repair Logged", date: receivedDateStr }];
        } else {
          // For other statuses, generate history but ensure the final status entry is in the target month
          const targetStatusEntryDate = new Date(year, month, Math.min(dayInMonth + (j % 5), daysInMonth));
          
          // Generate history backwards from the target status entry date
          statusHistory = generateStatusHistory(status, receivedDate, i);
          
          // Find and update the entry for the target status to be in the correct month
          const targetEntryIndex = statusHistory.findIndex((e) => e.status === status);
          if (targetEntryIndex >= 0) {
            statusHistory[targetEntryIndex].date = formatDate(targetStatusEntryDate);
            
            // Adjust previous entries to be before the target status entry
            for (let k = targetEntryIndex - 1; k >= 0; k--) {
              const prevDate = new Date(statusHistory[k + 1].date);
              const daysBefore = 1 + ((i + k) % 5); // 1-5 days before
              const adjustedDate = new Date(prevDate);
              adjustedDate.setDate(adjustedDate.getDate() - daysBefore);
              statusHistory[k].date = formatDate(adjustedDate);
            }
            
            // Update receivedDate to be the first entry date
            if (statusHistory.length > 0) {
              actualReceivedDateStr = statusHistory[0].date;
            }
          }
        }
        
        // Calculate daysInProgress and eta for "In Progress" status
        let daysInProgress = 0;
        let daysInProgressDisplay = "";
        let eta = "";
        
        if (status === "In Progress") {
          const inProgressEntry = statusHistory.find((e) => e.status === "In Progress");
          const inProgressDate = inProgressEntry ? new Date(inProgressEntry.date) : receivedDate;
          
          // For historical years, check if repair was completed
          const completedEntry = statusHistory.find((e) => e.status === "Completed");
          let calculatedDays: number;
          
          if (completedEntry && year < new Date().getFullYear()) {
            const completedDate = new Date(completedEntry.date);
            const daysSinceInProgress = Math.floor((completedDate.getTime() - inProgressDate.getTime()) / (1000 * 60 * 60 * 24));
            calculatedDays = Math.max(1, Math.min(200, daysSinceInProgress));
          } else {
            const bucket = i % 10;
            if (bucket < 4) {
              calculatedDays = 1 + (i % 30);
            } else if (bucket < 8) {
              calculatedDays = 31 + (i % 60);
            } else {
              calculatedDays = 91 + (i % 110);
            }
          }
          
          daysInProgress = Math.max(1, Math.min(200, calculatedDays));
          daysInProgressDisplay = `${daysInProgress}d`;
          eta = getEta(daysInProgress);
        }
        
        data.push({
          rrNumber: `RR-${rrCounter++}`,
          description: descriptions[i % descriptions.length],
          details: `${manufacturers[i % manufacturers.length]} • ${companies[i % companies.length]}`,
          mfrPart: `PART-${year}-${1000 + i}-${status.substring(0, 3).toUpperCase()}`,
          customerPartNumber: generateCustomerPartNumber(i, year),
          status,
          daysInProgress,
          daysInProgressDisplay,
          eta,
          quote: 500 + (i * 75) + (Math.floor(i / 10) * 250), // Varied quote values: base 500, increment by 75, plus periodic bumps
          receivedDate: actualReceivedDateStr,
          site: getSiteForIndex(i, statusTotals[status]),
          department: getDepartmentForIndex(i, statusTotals[status]),
          statusHistory,
        });
      }
    }
  }

  return data;
};

const generateRepairsData = (): AllRepairsRow[] => {
  const currentYearData = generateRepairsDataForCurrentYear();
  const historical2024 = generateHistoricalDataForYear(2024, 40000);
  const historical2023 = generateHistoricalDataForYear(2023, 30000);
  
  return [...historical2023, ...historical2024, ...currentYearData];
};

export const ALL_REPAIRS_DATA: AllRepairsRow[] = generateRepairsData();
