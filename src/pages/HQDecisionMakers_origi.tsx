import { useState, useMemo, useEffect } from "react";
import { Cog6ToothIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { KpiCard } from "../components/common/KpiCard";
import { Tooltip } from "../components/common/Tooltip";
import { AllRepairsTable, type AllRepairsRow, type RepairStatus, type DayRangeKey } from "../components/tables/AllRepairsTable";
import { AllRepairsFilters } from "../components/tables/AllRepairsFilters";
import { REPAIR_STATUS_CONFIG } from "../constants/repairStatusConfig";
import { RepairDetailsDrawer } from "../components/RepairDetailsDrawer";
import { ManageAllRepairsColumnsDialog } from "../components/ManageAllRepairsColumnsDialog";
import { RepairTrendAnalysis } from "../components/RepairTrendAnalysis";
import { TimeMetricsOverTime } from "../components/TimeMetricsOverTime";
import { CostSavings } from "../components/CostSavings";
import { RepairsBySite } from "../components/RepairsBySite";
import { LeadTimeAnalysis } from "../components/LeadTimeAnalysis";
import { SetUpYourViewDialog } from "../components/SetUpYourViewDialog";
import { getDefaultDashboardBlocksState, type DashboardBlocksState, DASHBOARD_BLOCKS } from "../components/dashboardBlocks";
import { RRInactivityBanner } from "../components/RRInactivityBanner";
import { ApproveModal } from "../components/ApproveModal";
import { RejectModal } from "../components/RejectModal";
import type { AllRepairsColumnsState } from "../components/allRepairsColumns";
import { getDefaultAllRepairsColumnsState } from "../components/allRepairsColumns";
import { ALL_REPAIRS_DATA } from "../data/allRepairsData";

type HQDecisionMakersProps = {
  onNavigate: (route: string) => void;
  selectedSites: string[];
  selectedDepartments: string[];
  onSitesChange: (sites: string[]) => void;
  onDepartmentsChange: (departments: string[]) => void;
  onOpenSetUpView: () => void;
  isSetUpViewOpen: boolean;
  onCloseSetUpView: () => void;
};


const AWAITING_STATUS_LABEL: RepairStatus = "Awaiting Approval";

// Helper function to get status summary (count and total amount)
function getStatusSummary(repairs: AllRepairsRow[], status: RepairStatus): { count: number; totalAmount: number } {
  const filtered = repairs.filter((repair) => repair.status === status);
  return {
    count: filtered.length,
    totalAmount: filtered.reduce((sum, repair) => sum + repair.quote, 0),
  };
}

// Helper function to get all status summaries
function getAllStatusSummaries(repairs: AllRepairsRow[]): Record<RepairStatus, { count: number; totalAmount: number }> {
  const statuses: RepairStatus[] = [
    "Repair Logged",
    "Awaiting Quote",
    "PO",
    "Awaiting Approval",
    "In Progress",
    "Completed",
    "Rejected",
    "Not Repairable",
  ];
  
  const summaries: Partial<Record<RepairStatus, { count: number; totalAmount: number }>> = {};
  for (const status of statuses) {
    summaries[status] = getStatusSummary(repairs, status);
  }
  
  return summaries as Record<RepairStatus, { count: number; totalAmount: number }>;
}

const ALL_REPAIRS_COLUMNS_STORAGE_KEY = 'ah-all-repairs-columns-state-v1';
const DASHBOARD_BLOCKS_STORAGE_KEY = 'ah-dashboard-blocks-state-v1';

export function HQDecisionMakers({ 
  onNavigate: _onNavigate,
  selectedSites,
  selectedDepartments,
  onSitesChange: _onSitesChange,
  onDepartmentsChange: _onDepartmentsChange,
  onOpenSetUpView: _onOpenSetUpView,
  isSetUpViewOpen,
  onCloseSetUpView,
}: HQDecisionMakersProps) {
  
  // Dashboard blocks state with localStorage persistence
  const [blocksState, setBlocksState] = useState<DashboardBlocksState>(() => {
    // Helper to normalize state: force required blocks visible and ensure all blocks in order
    const normalizeBlocksState = (state: DashboardBlocksState): DashboardBlocksState => {
      const requiredBlocks = DASHBOARD_BLOCKS.filter(b => b.required).map(b => b.id);
      const allBlockIds = DASHBOARD_BLOCKS.map(b => b.id);
      
      // Ensure all blocks are in order (add missing ones)
      const orderSet = new Set(state.order);
      const missingBlocks = allBlockIds.filter(id => !orderSet.has(id));
      const normalizedOrder = [...state.order, ...missingBlocks];
      
      // Force required blocks to be visible
      const normalizedVisible = { ...state.visible };
      requiredBlocks.forEach(id => {
        normalizedVisible[id] = true;
      });
      
      return {
        order: normalizedOrder,
        visible: normalizedVisible,
      };
    };

    try {
      const stored = localStorage.getItem(DASHBOARD_BLOCKS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate structure
        if (parsed && parsed.order && parsed.visible) {
          return normalizeBlocksState(parsed as DashboardBlocksState);
        }
      }
    } catch (e) {
      console.warn('Failed to load dashboard blocks state from localStorage', e);
    }
    return getDefaultDashboardBlocksState();
  });

  // Year selection state (default to 2025)
  // Note: Year selection is now handled by individual chart components
  const selectedYear = 2025;

  // Calculate Total Cost Savings YTD based on selected year
  // Data matches kpiDataByYearMonth from DashboardPage.tsx
  // Using total cost savings for the year as YTD
  const calculateYTDCostSavings = (year: number): number => {
    const yearData: Record<number, number> = {
      2025: 1532818, // Total Cost Savings YTD for 2025
      2024: 1532818, // total from kpiDataByYearMonth[2024].total.totalCostSavings
      2023: 1363500,
      2022: 1305000,
    };
    
    // If year data exists, use it; otherwise use 2024 (most recent available)
    return yearData[year] || yearData[2024] || 0;
  };

  const ytdCostSavings = useMemo(() => calculateYTDCostSavings(selectedYear), [selectedYear]);

  // Save to localStorage whenever blocksState changes
  // Normalize state before saving (force required blocks visible)
  useEffect(() => {
    const requiredBlocks = DASHBOARD_BLOCKS.filter(b => b.required).map(b => b.id);
    const allBlockIds = DASHBOARD_BLOCKS.map(b => b.id);
    
    // Ensure all blocks are in order (add missing ones)
    const orderSet = new Set(blocksState.order);
    const missingBlocks = allBlockIds.filter(id => !orderSet.has(id));
    const normalizedOrder = missingBlocks.length > 0 ? [...blocksState.order, ...missingBlocks] : blocksState.order;
    
    // Force required blocks to be visible
    const normalizedVisible = { ...blocksState.visible };
    let hasVisibleChanges = false;
    requiredBlocks.forEach(id => {
      if (!normalizedVisible[id]) {
        normalizedVisible[id] = true;
        hasVisibleChanges = true;
      }
    });
    
    // Only update state if normalization changed something
    if (hasVisibleChanges || missingBlocks.length > 0) {
      setBlocksState({
        order: normalizedOrder,
        visible: normalizedVisible,
      });
      return;
    }
    
    // Save normalized state to localStorage
    try {
      localStorage.setItem(DASHBOARD_BLOCKS_STORAGE_KEY, JSON.stringify({
        order: normalizedOrder,
        visible: normalizedVisible,
      }));
    } catch (e) {
      console.warn('Failed to save dashboard blocks state to localStorage', e);
    }
  }, [blocksState]);

  // Column management state with localStorage persistence
  const [columnsState, setColumnsState] = useState<AllRepairsColumnsState>(() => {
    try {
      const stored = localStorage.getItem(ALL_REPAIRS_COLUMNS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate structure
        if (parsed && parsed.order && parsed.visible) {
          return parsed as AllRepairsColumnsState;
        }
      }
    } catch (e) {
      console.warn('Failed to load column state from localStorage', e);
    }
    return getDefaultAllRepairsColumnsState();
  });

  const [isManageColumnsOpen, setIsManageColumnsOpen] = useState(false);

  // Save to localStorage whenever columnsState changes
  useEffect(() => {
    try {
      localStorage.setItem(ALL_REPAIRS_COLUMNS_STORAGE_KEY, JSON.stringify(columnsState));
    } catch (e) {
      console.warn('Failed to save column state to localStorage', e);
    }
  }, [columnsState]);


  // Single source of truth: All repairs data from shared data source
  const [allRepairsRows, setAllRepairsRows] = useState<AllRepairsRow[]>(ALL_REPAIRS_DATA);

  // Row selection state for bulk actions
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  // Bulk action modal state
  const [isBulkApproveModalOpen, setIsBulkApproveModalOpen] = useState(false);
  const [isBulkRejectModalOpen, setIsBulkRejectModalOpen] = useState(false);
  const [pendingBulkActionIds, setPendingBulkActionIds] = useState<string[]>([]);

  // Handler to update repair status
  const handleRepairUpdate = (rrNumber: string, updates: Partial<AllRepairsRow>) => {
    setAllRepairsRows((prev) =>
      prev.map((repair) =>
        repair.rrNumber === rrNumber ? { ...repair, ...updates } : repair
      )
    );
  };

  // Compute status summaries from the single source of truth (always use full dataset, not filtered)
  const statusSummaries = useMemo(() => getAllStatusSummaries(allRepairsRows), [allRepairsRows]);

  // Derive KPI cards data from status summaries using shared status config
  // Include all statuses in correct order: Logged, Under Evaluation, PO, Awaiting Approval, In Progress, Completed, Rejected, Warranty Recapture
  const ALL_KPI_STATUSES: RepairStatus[] = [
    "Repair Logged",
    "Awaiting Quote",
    "PO",
    "Awaiting Approval",
    "In Progress",
    "Completed",
    "Rejected",
    "Not Repairable",
  ];
  
  const statusKpiCards: Array<{
    status: RepairStatus;
    value: number;
    IconComponent: React.ComponentType<{ className?: string }>;
    iconBackgroundColor: string; // Tinted background matching status badge
    iconColor: string; // Icon color matching status badge
  }> = useMemo(() => {
    return ALL_KPI_STATUSES.map((status) => ({
      status,
      value: statusSummaries[status].count,
      IconComponent: REPAIR_STATUS_CONFIG[status].IconComponent,
      iconBackgroundColor: REPAIR_STATUS_CONFIG[status].badgeBackground,
      iconColor: REPAIR_STATUS_CONFIG[status].badgeTextColor,
    }));
  }, [statusSummaries]);

  // Calculate YTD tracker metrics (Logged, Approved, Completed) for selected year
  // YTD = from Jan 1 of selected year through today (or latest available data date)
  const ytdTrackerMetrics = useMemo(() => {
    const yearStart = new Date(selectedYear, 0, 1);
    const yearEnd = new Date(selectedYear, 11, 31, 23, 59, 59, 999);
    // For demo data, use yearEnd; in production, use today if it's within the year
    const today = new Date();
    const cutoffDate = today.getFullYear() === selectedYear && today < yearEnd ? today : yearEnd;

    // Filter repairs by site/department and year
    const filtered = allRepairsRows.filter((repair) => {
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

      // Year filter - check if repair has activity in the selected year
      // Use statusHistory to find when repair entered relevant statuses
      if (repair.statusHistory && repair.statusHistory.length > 0) {
        // Check if any status transition falls within the year
        const hasTransitionInYear = repair.statusHistory.some((entry) => {
          const entryDate = new Date(entry.date);
          return entryDate >= yearStart && entryDate <= cutoffDate;
        });
        if (!hasTransitionInYear) {
          return false;
        }
      } else if (repair.receivedDate) {
        // Fallback to receivedDate if no statusHistory
        const repairDate = new Date(repair.receivedDate);
        if (repairDate < yearStart || repairDate > cutoffDate) {
          return false;
        }
      } else {
        // No date info, skip
        return false;
      }

      return true;
    });

    // Helper to find when repair entered a specific status within YTD range
    const getStatusEntryDate = (repair: AllRepairsRow, targetStatus: RepairStatus): Date | null => {
      if (!repair.statusHistory || repair.statusHistory.length === 0) {
        // If no status history, use receivedDate as fallback for "Repair Logged"
        if (targetStatus === "Repair Logged" && repair.receivedDate) {
          const date = new Date(repair.receivedDate);
          return date >= yearStart && date <= cutoffDate ? date : null;
        }
        return null;
      }

      const entry = repair.statusHistory.find((e) => e.status === targetStatus);
      if (entry) {
        const entryDate = new Date(entry.date);
        if (entryDate >= yearStart && entryDate <= cutoffDate) {
          return entryDate;
        }
      }
      return null;
    };

    // Count repairs logged (YTD) - entered "Repair Logged" status within YTD range
    const loggedCount = filtered.filter((repair) => {
      const loggedDate = getStatusEntryDate(repair, "Repair Logged");
      return loggedDate !== null;
    }).length;

    // Count repairs approved (YTD) - entered "Awaiting Approval", "In Progress", or "Completed" within YTD range
    // (anything that has passed Under Evaluation/PO)
    const approvedCount = filtered.filter((repair) => {
      const awaitingApprovalDate = getStatusEntryDate(repair, "Awaiting Approval");
      const inProgressDate = getStatusEntryDate(repair, "In Progress");
      const completedDate = getStatusEntryDate(repair, "Completed");
      return awaitingApprovalDate !== null || inProgressDate !== null || completedDate !== null;
    }).length;

    // Count repairs completed (YTD) - entered "Completed" status within YTD range
    const completedCount = filtered.filter((repair) => {
      const completedDate = getStatusEntryDate(repair, "Completed");
      return completedDate !== null;
    }).length;

    return {
      logged: loggedCount,
      approved: approvedCount,
      completed: completedCount,
    };
  }, [allRepairsRows, selectedYear, selectedSites, selectedDepartments]);

  // Helper to get days since entering "Awaiting Approval" status
  const getDaysAwaitingApproval = (repair: AllRepairsRow): number => {
    if (repair.statusHistory && repair.statusHistory.length > 0) {
      // Find when it entered "Awaiting Approval"
      const approvalEntry = repair.statusHistory.find((entry) => entry.status === "Awaiting Approval");
      if (approvalEntry) {
        const today = new Date();
        const approvalDate = new Date(approvalEntry.date);
        const daysDiff = Math.floor((today.getTime() - approvalDate.getTime()) / (1000 * 60 * 60 * 24));
        return Math.max(0, daysDiff);
      }
    }
    // Fallback to daysInProgress if no status history
    return repair.daysInProgress;
  };

  // Calculate overdue approval counts by how long they've been awaiting approval
  // Based on status history (when they entered "Awaiting Approval")
  const overdueApprovalCounts = useMemo(() => {
    const awaitingApproval = allRepairsRows.filter((r) => r.status === "Awaiting Approval");
    
    // New 4-bucket system:
    // ≤ 7 days: 0-7 days
    // < 1 month: 8-30 days
    // 1–3 months: 31-90 days
    // 3+ months: 91+ days
    
    const sevenDaysOrLess = awaitingApproval.filter((r) => {
      const days = getDaysAwaitingApproval(r);
      return days >= 0 && days <= 7;
    });
    
    const lessThanOneMonth = awaitingApproval.filter((r) => {
      const days = getDaysAwaitingApproval(r);
      return days >= 8 && days <= 30;
    });
    
    const oneToThreeMonths = awaitingApproval.filter((r) => {
      const days = getDaysAwaitingApproval(r);
      return days >= 31 && days <= 90;
    });
    
    const threePlusMonths = awaitingApproval.filter((r) => {
      const days = getDaysAwaitingApproval(r);
      return days >= 91;
    });
    
    return {
      sevenDaysOrLess: sevenDaysOrLess.length,
      lessThanOneMonth: lessThanOneMonth.length,
      oneToThreeMonths: oneToThreeMonths.length,
      threePlusMonths: threePlusMonths.length,
      // Combined count for "Under 1 month" card row
      underOneMonth: sevenDaysOrLess.length + lessThanOneMonth.length,
    };
  }, [allRepairsRows]);

  // State for selected overdue bucket
  // "underOneMonth" represents the combined "≤ 7 days" + "< 1 month" buckets
  const [selectedOverdueBucket, setSelectedOverdueBucket] = useState<"sevenDaysOrLess" | "lessThanOneMonth" | "oneToThreeMonths" | "threePlusMonths" | "underOneMonth" | null>(null);

  // Filter state
  const [selectedStatuses, setSelectedStatuses] = useState<RepairStatus[]>([]);
  const [selectedDayRanges, setSelectedDayRanges] = useState<DayRangeKey[]>(["ALL"]);
  const [searchQuery, setSearchQuery] = useState("");

  // Drawer state
  const [selectedRepair, setSelectedRepair] = useState<AllRepairsRow | null>(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  // Update selected repair when allRepairsRows changes
  useEffect(() => {
    if (selectedRepair) {
      const updated = allRepairsRows.find((r) => r.rrNumber === selectedRepair.rrNumber);
      if (updated) {
        setSelectedRepair(updated);
      }
    }
  }, [allRepairsRows]);

  // Filter the rows based on selected filters (for table display only)
  // KPI cards always use the full allRepairsRows array
  const filteredRows = useMemo(() => {
    return allRepairsRows.filter((row) => {
      // Site filter
      const hasSiteFilter = selectedSites.length > 0 && !selectedSites.includes("all");
      if (hasSiteFilter) {
        const rowSite = row.site || "";
        if (!selectedSites.includes(rowSite)) {
          return false;
        }
      }

      // Department filter
      const hasDepartmentFilter = selectedDepartments.length > 0 && !selectedDepartments.includes("all");
      if (hasDepartmentFilter) {
        const rowDepartment = row.department || "";
        if (!selectedDepartments.includes(rowDepartment)) {
          return false;
        }
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch =
          row.rrNumber.toLowerCase().includes(q) ||
          row.description.toLowerCase().includes(q) ||
          row.details.toLowerCase().includes(q) ||
          row.mfrPart.toLowerCase().includes(q) ||
          (row.customerPartNumber ?? "").toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (selectedStatuses.length > 0) {
        if (!selectedStatuses.includes(row.status)) return false;
      }

      // Overdue bucket filter (applied when clicking Approvals Overdue rows)
      if (selectedOverdueBucket !== null) {
        // Must be "Awaiting Approval" status
        if (row.status !== "Awaiting Approval") return false;
        
        const days = getDaysAwaitingApproval(row);
        switch (selectedOverdueBucket) {
          case "sevenDaysOrLess":
            if (days < 0 || days > 7) return false;
            break;
          case "lessThanOneMonth":
            if (days < 8 || days > 30) return false;
            break;
          case "underOneMonth":
            // Combined: ≤ 7 days OR < 1 month (8-30 days)
            if (days < 0 || days > 30) return false;
            break;
          case "oneToThreeMonths":
            if (days < 31 || days > 90) return false;
            break;
          case "threePlusMonths":
            if (days < 91) return false;
            break;
        }
      }

      // Days filter (only applies if no overdue bucket is selected)
      // Only apply Days in Progress filter to "In Progress" status repairs
      if (selectedOverdueBucket === null) {
        const ranges = selectedDayRanges.filter((r) => r !== "ALL");
        if (ranges.length > 0) {
          // Only filter by days if status is "In Progress"
          if (row.status === "In Progress") {
            const d = row.daysInProgress;
            const inRange = ranges.some((range) => {
              switch (range) {
                case "LTE_7":
                  return d >= 0 && d <= 7;
                case "D8_30":
                  return d >= 8 && d <= 30;
                case "D31_60":
                  return d >= 31 && d <= 60;
                case "GT_60":
                  return d >= 61;
                default:
                  return true;
              }
            });
            if (!inRange) return false;
          } else {
            // For non-"In Progress" statuses, exclude them from Days in Progress filter
            return false;
          }
        }
      }

      return true;
    });
  }, [allRepairsRows, selectedSites, selectedDepartments, searchQuery, selectedStatuses, selectedDayRanges, selectedOverdueBucket]);

  const handleManageColumns = () => {
    setIsManageColumnsOpen(true);
  };

  const handleExport = (format: "xls" | "csv") => {
    // TODO: Implement export functionality
    console.log(`Export clicked: ${format}`);
  };

  // Reusable function to scroll to the All Repairs table section
  // Used by both the orange highlight card and all KPI cards
  const scrollToAllRepairs = () => {
    setTimeout(() => {
      const el = document.getElementById("all-repairs-table");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  // Reusable function to apply status filter (used by both KPI cards and dropdown)
  const applyStatusFilter = (statuses: RepairStatus[]) => {
    setSelectedStatuses(statuses);
  };


  // Handle clicking an overdue bucket row
  const handleOverdueBucketClick = (bucket: "underOneMonth" | "oneToThreeMonths" | "threePlusMonths") => {
    // Toggle: if clicking the same bucket, clear it; otherwise, set it
    if (selectedOverdueBucket === bucket) {
      setSelectedOverdueBucket(null);
      // Clear corresponding day ranges to sync dropdown state
      setSelectedDayRanges(["ALL"]);
      // Also clear status filter if it was set to "Awaiting Approval" only
      if (selectedStatuses.length === 1 && selectedStatuses[0] === "Awaiting Approval") {
        applyStatusFilter([]);
      }
    } else {
      setSelectedOverdueBucket(bucket);
      // Set corresponding day ranges to sync "Days in Progress" dropdown state
      // Note: Actual filtering uses overdue bucket logic, but this keeps UI in sync
      switch (bucket) {
        case "underOneMonth":
          // 0-30 days maps to all ranges that cover this period
          setSelectedDayRanges(["LTE_7", "D8_30"]);
          break;
        case "oneToThreeMonths":
          // 31-90 days maps to D31_60 (31-60) and GT_60 (61+)
          setSelectedDayRanges(["D31_60", "GT_60"]);
          break;
        case "threePlusMonths":
          // 91+ days maps to GT_60 (61+)
          setSelectedDayRanges(["GT_60"]);
          break;
      }
      // Set status filter to "Awaiting Approval" if not already set
      if (!selectedStatuses.includes("Awaiting Approval")) {
        applyStatusFilter([AWAITING_STATUS_LABEL]);
      }
      scrollToAllRepairs();
    }
  };

  const handleSelectStatusFromKpi = (statusKey: RepairStatus) => {
    // Toggle off if clicking the same card (check if it's already selected)
    if (selectedStatuses.length === 1 && selectedStatuses[0] === statusKey) {
      applyStatusFilter([]);
      // Don't scroll when clearing the filter
    } else {
      applyStatusFilter([statusKey]);
      scrollToAllRepairs();
    }
  };

  // Helper to handle site filter changes - simplified since AppMultiSelect now handles (All) logic

  // Bulk action handlers - open modals
  const handleBulkApproveClick = (selectedIds: string[]) => {
    const eligibleIds = selectedIds.filter(id => {
      const repair = allRepairsRows.find(r => r.rrNumber === id);
      return repair?.status === "Awaiting Approval";
    });
    if (eligibleIds.length > 0) {
      setPendingBulkActionIds(eligibleIds);
      setIsBulkApproveModalOpen(true);
    }
  };

  const handleBulkRejectClick = (selectedIds: string[]) => {
    const eligibleIds = selectedIds.filter(id => {
      const repair = allRepairsRows.find(r => r.rrNumber === id);
      return repair?.status === "Awaiting Approval";
    });
    if (eligibleIds.length > 0) {
      setPendingBulkActionIds(eligibleIds);
      setIsBulkRejectModalOpen(true);
    }
  };

  // Execute bulk approve after modal confirmation
  const handleBulkApproveConfirm = (_poNumber: string) => {
    const today = new Date();
    setAllRepairsRows((prev) =>
      prev.map((repair) => {
        if (pendingBulkActionIds.includes(repair.rrNumber) && repair.status === "Awaiting Approval") {
          const existingHistory = repair.statusHistory || [];
          return {
            ...repair,
            status: "In Progress",
            statusHistory: [
              ...existingHistory,
              {
                status: "In Progress",
                date: formatDate(today),
              },
            ],
          };
        }
        return repair;
      })
    );
    setSelectedRowIds(new Set());
    setIsBulkApproveModalOpen(false);
    setPendingBulkActionIds([]);
  };

  // Execute bulk reject after modal confirmation
  const handleBulkRejectConfirm = (_reason: string, _disposition: string) => {
    const today = new Date();
    setAllRepairsRows((prev) =>
      prev.map((repair) => {
        if (pendingBulkActionIds.includes(repair.rrNumber) && repair.status === "Awaiting Approval") {
          const existingHistory = repair.statusHistory || [];
          return {
            ...repair,
            status: "Rejected",
            statusHistory: [
              ...existingHistory,
              {
                status: "Rejected",
                date: formatDate(today),
              },
            ],
          };
        }
        return repair;
      })
    );
    setSelectedRowIds(new Set());
    setIsBulkRejectModalOpen(false);
    setPendingBulkActionIds([]);
  };

  // Calculate total quote amount for bulk approve modal
  const bulkApproveQuoteAmount = useMemo(() => {
    return pendingBulkActionIds.reduce((sum: number, id: string) => {
      const repair = allRepairsRows.find(r => r.rrNumber === id);
      return sum + (repair?.quote || 0);
    }, 0);
  }, [pendingBulkActionIds, allRepairsRows]);

  // Helper to format date
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  return (
    <>
      <header className="dashboard-header">
        <div className="dashboard-header-main">
          <div className="dashboard-title-row">
            <h1 className="dashboard-title">Repair Command Center</h1>
            <button
              type="button"
              onClick={_onOpenSetUpView}
              aria-label="Set up your view"
              className="dashboard-title-settings-button"
            >
              <Cog6ToothIcon style={{ width: "18px", height: "18px", color: "#475569" }} />
            </button>
          </div>
          <p className="dashboard-subtitle">
            Overview of repairs, status, and performance for Mars Incorporated participating plants.
          </p>
        </div>
        <div className="dashboard-header-actions">
          {/* Header actions removed */}
        </div>
      </header>

      {/* RR Inactivity Notification Banner */}
      <RRInactivityBanner />

      <div className="dashboard-page-content">
        {/* Dashboard Blocks - rendered based on blocksState order */}
        {blocksState.order.map((blockId) => {
          // Required blocks are always visible, others check visible state
          const block = DASHBOARD_BLOCKS.find((b) => b.id === blockId);
          const isRequired = block?.required === true;
          // Force required blocks to always render, regardless of stored visible state
          if (!isRequired && !blocksState.visible[blockId]) return null;

          switch (blockId) {
            case "overview":
              return (
                <section key={blockId} className="dashboard-top-section">
                  {/* Left column: Approvals Overdue card */}
                  <div className="dashboard-banners-column">
                    <div className="approvals-overdue-card">
                      {/* Cost Savings Section */}
                      <div className="approvals-overdue-cost-savings">
                        <div className="approvals-overdue-section-label-wrapper">
                          <div className="approvals-overdue-cost-savings-label">COST SAVINGS</div>
                          <Tooltip content="Total cost savings year-to-date generated through repaired parts.">
                            <div className="approvals-overdue-help-icon-wrapper">
                              <QuestionMarkCircleIcon className="approvals-overdue-help-icon" />
                            </div>
                          </Tooltip>
                        </div>
                        <div className="approvals-overdue-cost-savings-value">
                          ${ytdCostSavings.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="approvals-overdue-divider"></div>

                      {/* YTD Tracker Section - Stacked Layout */}
                      <div className="approvals-overdue-ytd-tracker">
                        <div className="approvals-overdue-section-label-wrapper">
                          <div className="approvals-overdue-ytd-tracker-title">Year to date</div>
                          <Tooltip content="Year-to-date metrics showing repairs logged, approved, and completed from January 1 through today.">
                            <div className="approvals-overdue-help-icon-wrapper">
                              <QuestionMarkCircleIcon className="approvals-overdue-help-icon" />
                            </div>
                          </Tooltip>
                        </div>
                        <div className="approvals-overdue-metric-grid">
                          <div className="approvals-overdue-metric-block">
                            <div className="approvals-overdue-metric-block-label">Logged</div>
                            <div className="approvals-overdue-metric-block-value">{ytdTrackerMetrics.logged}</div>
                          </div>
                          <div className="approvals-overdue-metric-block">
                            <div className="approvals-overdue-metric-block-label">Approved</div>
                            <div className="approvals-overdue-metric-block-value">{ytdTrackerMetrics.approved}</div>
                          </div>
                          <div className="approvals-overdue-metric-block">
                            <div className="approvals-overdue-metric-block-label">Completed</div>
                            <div className="approvals-overdue-metric-block-value">{ytdTrackerMetrics.completed}</div>
                          </div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="approvals-overdue-divider"></div>

                      {/* Approvals Overdue Section - Stacked Layout */}
                      <div className="approvals-overdue-section">
                        <div className="approvals-overdue-section-label-wrapper">
                          <div className="approvals-overdue-section-title">APPROVALS OVERDUE</div>
                          <Tooltip content="Repair requests waiting for approval, grouped by how long they've been pending.">
                            <div className="approvals-overdue-help-icon-wrapper">
                              <QuestionMarkCircleIcon className="approvals-overdue-help-icon" />
                            </div>
                          </Tooltip>
                        </div>
                        <div className="approvals-overdue-metric-grid">
                          {/* Item 1: Over 3 months */}
                          <div 
                            className={`approvals-overdue-metric-block approvals-overdue-metric-block--clickable ${selectedOverdueBucket === "threePlusMonths" ? "approvals-overdue-metric-block--active" : ""}`}
                            onClick={() => handleOverdueBucketClick("threePlusMonths")}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleOverdueBucketClick("threePlusMonths");
                              }
                            }}
                          >
                            <div className="approvals-overdue-metric-block-label">Over 3 months</div>
                            <div className="approvals-overdue-metric-block-value">{overdueApprovalCounts.threePlusMonths}</div>
                          </div>
                          
                          {/* Item 2: 1–3 months */}
                          <div 
                            className={`approvals-overdue-metric-block approvals-overdue-metric-block--clickable ${selectedOverdueBucket === "oneToThreeMonths" ? "approvals-overdue-metric-block--active" : ""}`}
                            onClick={() => handleOverdueBucketClick("oneToThreeMonths")}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleOverdueBucketClick("oneToThreeMonths");
                              }
                            }}
                          >
                            <div className="approvals-overdue-metric-block-label">1–3 months</div>
                            <div className="approvals-overdue-metric-block-value">{overdueApprovalCounts.oneToThreeMonths}</div>
                          </div>
                          
                          {/* Item 3: Under 1 month */}
                          <div 
                            className={`approvals-overdue-metric-block approvals-overdue-metric-block--clickable ${selectedOverdueBucket === "underOneMonth" ? "approvals-overdue-metric-block--active" : ""}`}
                            onClick={() => handleOverdueBucketClick("underOneMonth")}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleOverdueBucketClick("underOneMonth");
                              }
                            }}
                          >
                            <div className="approvals-overdue-metric-block-label">Under 1 month</div>
                            <div className="approvals-overdue-metric-block-value">{overdueApprovalCounts.underOneMonth}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right column: KPI Cards in 3x2 grid */}
                  <div className="dashboard-kpis-column">
                    <div className="dashboard-kpi-grid-3x2">
                      {statusKpiCards.map((card) => {
                        const IconComponent = card.IconComponent;
                        return (
                          <KpiCard
                            key={card.status}
                            label={REPAIR_STATUS_CONFIG[card.status].label}
                            value={card.value}
                            icon={<IconComponent />}
                            iconBackgroundColor={card.iconBackgroundColor}
                            iconColor={card.iconColor}
                            onClick={() => handleSelectStatusFromKpi(card.status)}
                          />
                        );
                      })}
                    </div>
                  </div>
                </section>
              );
            case "allRepairs":
              return (
                <section key={blockId} id="all-repairs-table" className="orders-table-card dashboard-section">
                  <h3 className="dashboard-section-title">All Repairs</h3>
                  <p className="dashboard-section-subtitle">
                    A complete list of repair requests across all statuses, showing current progress and key details for each repair.
                  </p>
                  <div className="all-orders-filters-wrapper">
                    <AllRepairsFilters
                      selectedStatuses={selectedStatuses}
                      selectedDayRanges={selectedDayRanges}
                      onStatusesChange={applyStatusFilter}
                      onDayRangesChange={setSelectedDayRanges}
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      onManageColumns={handleManageColumns}
                      onExport={handleExport}
                      selectedOverdueBucket={selectedOverdueBucket}
                      onOverdueBucketChange={(bucket) => {
                        setSelectedOverdueBucket(bucket);
                        // Clear day ranges when overdue bucket is cleared
                        if (bucket === null) {
                          setSelectedDayRanges(["ALL"]);
                        }
                      }}
                      selectedRowIds={selectedRowIds}
                      allRepairsRows={allRepairsRows}
                      onBulkApprove={handleBulkApproveClick}
                      onBulkReject={handleBulkRejectClick}
                    />
                  </div>
                  <AllRepairsTable
                    data={filteredRows}
                    searchQuery={searchQuery}
                    columnsState={columnsState}
                    selectedRowIds={selectedRowIds}
                    onSelectionChange={setSelectedRowIds}
                    onRowClick={(row) => {
                      setSelectedRepair(row);
                      setDrawerOpen(true);
                    }}
                  />
                </section>
              );
            case "repairTrendAnalysis":
              return (
                <RepairTrendAnalysis
                  key={blockId}
                  selectedSites={selectedSites}
                  selectedDepartments={selectedDepartments}
                />
              );
            case "timeMetricsOverTime":
              return <TimeMetricsOverTime key={blockId} />;
            case "costSavings":
              return <CostSavings key={blockId} />;
            case "repairsOverTime":
              return (
                <RepairsBySite
                  key={blockId}
                  selectedSites={selectedSites}
                  selectedDepartments={selectedDepartments}
                />
              );
            case "leadTimeAnalysis":
              return (
                <LeadTimeAnalysis 
                  key={blockId}
                  selectedSites={selectedSites}
                  selectedDepartments={selectedDepartments}
                />
              );
            default:
              return null;
          }
        })}
      </div>

      {/* Bulk Action Modals */}
      <ApproveModal
        isOpen={isBulkApproveModalOpen}
        onClose={() => {
          setIsBulkApproveModalOpen(false);
          setPendingBulkActionIds([]);
        }}
        onSubmit={handleBulkApproveConfirm}
        quoteAmount={bulkApproveQuoteAmount}
      />
      <RejectModal
        isOpen={isBulkRejectModalOpen}
        onClose={() => {
          setIsBulkRejectModalOpen(false);
          setPendingBulkActionIds([]);
        }}
        onSubmit={handleBulkRejectConfirm}
      />

      {/* Repair Details Drawer */}
      <RepairDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedRepair(null);
        }}
        repair={selectedRepair}
        onRepairUpdate={handleRepairUpdate}
      />

      {/* Manage Columns Dialog */}
      <ManageAllRepairsColumnsDialog
        open={isManageColumnsOpen}
        onClose={() => setIsManageColumnsOpen(false)}
        columnsState={columnsState}
        onChange={setColumnsState}
      />
      
        <SetUpYourViewDialog
          open={isSetUpViewOpen}
          onClose={onCloseSetUpView}
          blocksState={blocksState}
          onChange={setBlocksState}
        />
    </>
  );
}
