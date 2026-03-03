export type DashboardBlockId = 
  | "overview"
  | "allRepairs"
  | "repairTrendAnalysis"
  | "timeMetricsOverTime"
  | "costSavings"
  | "repairsOverTime"
  | "leadTimeAnalysis";

export type DashboardBlocksState = {
  order: DashboardBlockId[];
  visible: Record<DashboardBlockId, boolean>;
};

export const DASHBOARD_BLOCKS: Array<{
  id: DashboardBlockId;
  label: string;
  required?: boolean; // If true, checkbox is always enabled and disabled
}> = [
  { id: "overview", label: "Overview", required: true },
  { id: "allRepairs", label: "All Repairs", required: true },
  { id: "repairTrendAnalysis", label: "Repair Trend Analysis" },
  { id: "timeMetricsOverTime", label: "Time Metrics Over Time" },
  { id: "costSavings", label: "Cost Savings" },
  { id: "repairsOverTime", label: "Repair Participation by Customer Plant" },
  { id: "leadTimeAnalysis", label: "Lead Time Analysis" },
];

export function getDefaultDashboardBlocksState(): DashboardBlocksState {
  return {
    order: ["overview", "allRepairs", "repairTrendAnalysis", "costSavings", "timeMetricsOverTime", "repairsOverTime", "leadTimeAnalysis"],
    visible: {
      overview: true,
      allRepairs: true,
      repairTrendAnalysis: true,
      timeMetricsOverTime: true,
      costSavings: true,
      repairsOverTime: true,
      leadTimeAnalysis: true,
    },
  };
}

