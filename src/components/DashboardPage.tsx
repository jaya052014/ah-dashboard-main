import { useState, useEffect, useMemo } from "react";
import { PhoneIcon } from "@heroicons/react/24/outline";
import { OpenOrdersByStatusChart } from "./charts/OpenOrdersByStatusChart";
import { RepairsOverTimeChart } from "./charts/RepairsOverTimeChart";
import { CostSavingsByMonthChart } from "./charts/CostSavingsByMonthChart";
import { SavingsByCategoryChart } from "./charts/SavingsByCategoryChart";
import { CostSavingsBySiteChart } from "./charts/CostSavingsBySiteChart";
import { SavingsDetailsTable } from "./SavingsDetailsTable";
import { OrdersTable } from "./OrdersTable";
import { OrderDetailsPanel } from "./OrderDetailsPanel";
import { SupplierScorecardView } from "./SupplierScorecardView";
import { DateRangeSelector, calculatePresetRange } from "./DateRangeSelector";
import { filterOrdersByDateRange } from "../utils/dateRangeFilters";
// import { GlobalSearch } from "./layout/GlobalSearch";
import { ORDERS_MOCK } from "../data/orders";
import type { OrderRow } from "../data/orders";
import type { DateRange } from "./DateRangeSelector";
import { AllOrdersFilters } from "./AllOrdersFilters";
import { defaultOrderFilters, type OrderFilterState } from "../data/orderFilters";
import { applyOrderFilters } from "../utils/orderFilters";
import {
  type AllOrdersColumnsState,
  getDefaultAllOrdersColumnsState,
} from "./allOrdersColumns";
import { ManageAllOrdersColumnsDialog } from "./ManageAllOrdersColumnsDialog";
import { AppSelect } from "./common/AppSelect";
import { KpiCard } from "./common/KpiCard";
import { Sidebar } from "./layout/Sidebar";
import { RequestsStubPage } from "./stubs/RequestsStubPage";
import { ReportsStubPage } from "./stubs/ReportsStubPage";
import { ContactRepModal } from "./ContactRepModal";
import { UserManagementStubPage } from "./stubs/UserManagementStubPage";
import { SettingsStubPage } from "./stubs/SettingsStubPage";
import { HQDecisionMakers } from "../pages/HQDecisionMakers";
import { AppMultiSelect } from "./common/AppMultiSelect";
import { MaintenanceManagers } from "../pages/MaintenanceManagers";
import ahGroupLogo from "../assets/ah-group-logo.png";
import clientLogo from "../assets/client-logo.png";
import { getSiteOptions, getDepartmentOptions } from "../constants/sitesAndDepartments";


// Organization tree structure
type OrgNode = {
  id: string;
  name: string;
  children?: OrgNode[];
};

const ORG_TREE: OrgNode = {
  id: "root",
  name: "Coca-Cola Company",
  children: [
    { id: "sub1", name: "Coca-Cola Refreshments" },
    { id: "sub2", name: "Coca-Cola FEMSA" },
    { id: "sub3", name: "Coca-Cola HBC" },
    { id: "sub4", name: "Coca-Cola Amatil" },
    { id: "sub5", name: "Coca-Cola European Partners" },
    { id: "sub6", name: "Coca-Cola Bottling Co. United" },
    { id: "sub7", name: "Coca-Cola Consolidated" },
    { id: "sub8", name: "Swire Coca-Cola" },
  ],
};

// Helper function to flatten org tree for dropdown
function flattenOrgTree(node: OrgNode, result: OrgNode[] = []): OrgNode[] {
  result.push(node);
  if (node.children) {
    node.children.forEach((child) => flattenOrgTree(child, result));
  }
  return result;
}

// Helper function to find org by id (not used in multi-select, but kept for potential future use)
// function findOrgById(id: string, node: OrgNode = ORG_TREE): OrgNode | null {
//   if (node.id === id) return node;
//   if (node.children) {
//     for (const child of node.children) {
//       const found = findOrgById(id, child);
//       if (found) return found;
//     }
//   }
//   return null;
// }


export function DashboardPage() {
  // Route-based navigation
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    // Default to Dashboard route
    return "/dashboard";
  });
  const [isSetUpViewOpen, setIsSetUpViewOpen] = useState(false);
  const [isContactRepModalOpen, setIsContactRepModalOpen] = useState(false);
  
  // Get all subsidiary IDs (excluding root) for default selection
  const allSubsidiaryIds = useMemo(() => {
    const allOrgs = flattenOrgTree(ORG_TREE);
    return allOrgs.filter((org) => org.id !== "root").map((org) => org.id);
  }, []);
  const [selectedOrgIds] = useState<string[]>(allSubsidiaryIds);
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Site and Department filter state - shared across dashboard
  // Use canonical lists from constants
  const SITE_OPTIONS = getSiteOptions();
  const DEPARTMENT_OPTIONS = getDepartmentOptions();
  
  const [selectedSites, setSelectedSites] = useState<string[]>(["all"]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(["all"]);

  const handleNavigate = (route: string) => {
    // Redirect root route to Dashboard
    const finalRoute = route === "/" ? "/dashboard" : route;
    setCurrentRoute(finalRoute);
  };

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  // Handle ESC key to close sidebar
  useEffect(() => {
    if (!sidebarOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSidebar();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen]);

  return (
    <div className="app-shell">
      {/* Top bar – always fixed at top, full width */}
      <header className="topbar">
        <div className="topbar-left">
          {/* Burger menu hidden but functionality kept */}
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
            className={`topbar-burger ${sidebarOpen ? "topbar-burger--active" : ""}`}
            style={{ display: "none" }}
          >
            <span className="sr-only">Toggle navigation</span>
            <span className="burger-icon">
              <span className="burger-line" />
              <span className="burger-line" />
              <span className="burger-line" />
            </span>
          </button>
          
          {/* Branding section: AH Group logo + Client logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              type="button"
              onClick={() => handleNavigate("/dashboard")}
              style={{ 
                background: "transparent", 
                border: "none", 
                padding: 0, 
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Go to Dashboard"
            >
              <img 
                src={ahGroupLogo} 
                alt="AH Group" 
                className="topbar-logo"
                aria-label="AH Group"
                style={{ height: "32px", width: "auto" }}
              />
            </button>
            
            {/* Vertical divider */}
            <div 
              style={{
                width: "1px",
                height: "32px",
                backgroundColor: "#E2E8F0",
                opacity: 0.5,
              }}
              aria-hidden="true"
            />
            
            {/* Client logo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "32px",
              }}
            >
              <img 
                src={clientLogo} 
                alt="Client Logo" 
                style={{ 
                  height: "32px", 
                  width: "auto",
                  maxWidth: "120px",
                  objectFit: "contain"
                }}
              />
            </div>
          </div>
        </div>

        <div className="topbar-center">
          {(currentRoute === "/" || currentRoute === "/dashboard") && (
            <div className="topbar-filters">
              <AppMultiSelect
                value={selectedSites}
                options={SITE_OPTIONS}
                onChange={setSelectedSites}
                placeholder="All sites"
                selectAllLabel="(All)"
                selectedLabel="sites"
                className="topbar-filter"
              />
              <AppMultiSelect
                value={selectedDepartments}
                options={DEPARTMENT_OPTIONS}
                onChange={setSelectedDepartments}
                placeholder="All departments"
                selectAllLabel="(All)"
                selectedLabel="departments"
                className="topbar-filter"
              />
            </div>
          )}
        </div>

        <div className="topbar-right">
          <button
            type="button"
            onClick={() => {
              setIsContactRepModalOpen(true);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              fontSize: "12px",
              fontWeight: 600,
              borderRadius: "9999px", // Fully rounded pill
              cursor: "pointer",
              transition: "all 0.15s ease",
              fontFamily: "inherit",
              border: "1px solid #e2e8f0",
              background: "#ffffff",
              color: "#475569",
              whiteSpace: "nowrap",
              height: "32px", // Match avatar height exactly
              lineHeight: "1",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f8fafc";
              e.currentTarget.style.borderColor = "#cbd5e1";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.borderColor = "#e2e8f0";
            }}
          >
            <PhoneIcon style={{ width: "16px", height: "16px" }} />
            <span>Contact Your AH Rep</span>
          </button>
          
          <div className="topbar-profile">
            <div className="topbar-avatar">AM</div>
          </div>
        </div>
      </header>

      {/* Flex container for sidebar and main content */}
      <div className="app-layout">
        <Sidebar
          open={sidebarOpen}
          activeRoute={currentRoute}
          onNavigate={handleNavigate}
          onClose={closeSidebar}
        />

        {/* Main content – resizes when sidebar is open */}
        <main className={`page-shell ${sidebarOpen ? "page-shell--sidebar-open" : ""}`}>
          <div className="page-content-wrapper">
            {(currentRoute === "/" || currentRoute === "/dashboard") && (
              <HQDecisionMakers 
                onNavigate={handleNavigate}
                selectedSites={selectedSites}
                selectedDepartments={selectedDepartments}
                onSitesChange={setSelectedSites}
                onDepartmentsChange={setSelectedDepartments}
                onOpenSetUpView={() => setIsSetUpViewOpen(true)}
                isSetUpViewOpen={isSetUpViewOpen}
                onCloseSetUpView={() => setIsSetUpViewOpen(false)}
              />
            )}
            {currentRoute === "/orders" && <OrdersView selectedOrgIds={selectedOrgIds} />}
            {currentRoute === "/savings" && (
              <SavingsView selectedOrgIds={selectedOrgIds} selectedYear={selectedYear} setSelectedYear={setSelectedYear} />
            )}
            {currentRoute === "/subsidiary-savings" && (
              <SiteSavingsView selectedOrgIds={selectedOrgIds} selectedYear={selectedYear} setSelectedYear={setSelectedYear} />
            )}
            {currentRoute === "/supplier-scorecard" && <SupplierScorecardView />}
            {currentRoute === "/requests" && <RequestsStubPage onNavigate={handleNavigate} />}
            {currentRoute === "/reports" && <ReportsStubPage onNavigate={handleNavigate} />}
            {currentRoute === "/maintenance-managers" && <MaintenanceManagers onNavigate={handleNavigate} />}
            {currentRoute === "/user-management" && <UserManagementStubPage onNavigate={handleNavigate} />}
            {currentRoute === "/settings" && <SettingsStubPage onNavigate={handleNavigate} />}
          </div>
        </main>
      </div>
      
      <ContactRepModal
        isOpen={isContactRepModalOpen}
        onClose={() => setIsContactRepModalOpen(false)}
      />
    </div>
  );
}

/* ------------------ ORDERS VIEW ------------------ */

type OrdersViewProps = {
  selectedOrgIds: string[];
};

function OrdersView({ selectedOrgIds }: OrdersViewProps) {
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Date range state - default to Last 30 days
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const { from, to } = calculatePresetRange("LAST_30");
    return { preset: "LAST_30", from, to };
  });

  // Order filters state
  const [orderFilters, setOrderFilters] = useState<OrderFilterState>(defaultOrderFilters);

  // Column state
  const [columnsState, setColumnsState] = useState<AllOrdersColumnsState>(
    getDefaultAllOrdersColumnsState
  );
  const [isManageColumnsOpen, setIsManageColumnsOpen] = useState(false);

  // Close panel when selectedOrgIds changes
  useEffect(() => {
    setIsDetailsOpen(false);
    setSelectedOrder(null);
  }, [selectedOrgIds]);

  const handleRowClick = (order: OrderRow) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleClosePanel = () => {
    setIsDetailsOpen(false);
    setSelectedOrder(null);
  };

  // Get base filtered orders (by org and date range)
  // If no subsidiaries selected, show empty state (Interpretation A)
  const baseFilteredOrders = useMemo(() => {
    if (selectedOrgIds.length === 0) {
      return [];
    }
    let filtered = ORDERS_MOCK.filter((row: OrderRow) => {
      return selectedOrgIds.includes(row.orgId);
    });
    filtered = filterOrdersByDateRange(filtered, dateRange);
    return filtered;
  }, [selectedOrgIds, dateRange]);

  // Apply order filters to base filtered orders
  const filteredOrders = useMemo(() => {
    return applyOrderFilters(baseFilteredOrders, orderFilters);
  }, [baseFilteredOrders, orderFilters]);

  // Calculate KPIs from filtered orders
  const { totalOpenOrders, onTimeRepairsPercent, avgRepairDuration, plantsAtRisk } = useMemo(() => {
    const filtered = baseFilteredOrders;
    
    // Calculate KPIs
    const totalOpen = filtered.filter((o: OrderRow) => o.status === "Open").length;
    
    const completed = filtered.filter((o: OrderRow) => o.status === "Completed" && o.completedDate);
    const onTime = completed.filter((o: OrderRow) => o.slaStatus === "On Time").length;
    const onTimePercent = completed.length > 0 ? Math.round((onTime / completed.length) * 100) : 0;
    
    // Calculate average repair duration (simplified - days between received and completed)
    const durations = completed
      .map((o: OrderRow) => {
        if (!o.completedDate) return null;
        const received = new Date(o.receivedDate);
        const completed = new Date(o.completedDate);
        return Math.ceil((completed.getTime() - received.getTime()) / (1000 * 60 * 60 * 24));
      })
      .filter((d): d is number => d !== null);
    const avgDuration = durations.length > 0 
      ? (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(1)
      : "0.0";
    
    // Plants at risk (orders with "At Risk" or "Breached" SLA)
    const atRisk = filtered.filter((o: OrderRow) => 
      o.slaStatus === "At Risk" || o.slaStatus === "Breached"
    ).length;
    
    return {
      totalOpenOrders: totalOpen,
      onTimeRepairsPercent: onTimePercent,
      avgRepairDuration: avgDuration,
      plantsAtRisk: atRisk,
    };
  }, [selectedOrgIds, dateRange]);

  return (
    <>
      <header className="dashboard-header">
        <div className="dashboard-header-main">
          <div className="dashboard-title-row">
            <h1 className="dashboard-title">Open Orders &amp; Repair Status</h1>
            <span className="dashboard-badge">MVP · Pilot</span>
          </div>

          <p className="dashboard-subtitle">
            Role-based dashboard for corporate, plant and purchasing teams to
            self-serve insights without Excel or Tableau.
          </p>
        </div>

        <div className="dashboard-header-actions">
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
        </div>
      </header>

      <div className="dashboard-page-content">
        {/* 4 KPI widgets (main report) */}
        <section className="dashboard-kpis">
          <KpiCard label="Total open orders" value={totalOpenOrders.toString()} trend="+8.3% vs last 30d" />
          <KpiCard label="On-time repairs" value={`${onTimeRepairsPercent}%`} trend="+2.1 pts" />
          <KpiCard label="Avg repair duration" value={`${avgRepairDuration} days`} trend="-0.4 days" />
          <KpiCard label="Plants at risk" value={plantsAtRisk.toString()} trend="2 with SLA breach" />
        </section>

        {/* Charts */}
        <section className="dashboard-grid dashboard-section">
          <OpenOrdersByStatusChart selectedOrgIds={selectedOrgIds} dateRange={dateRange} />
          <RepairsOverTimeChart selectedOrgIds={selectedOrgIds} dateRange={dateRange} />
        </section>

        {/* Orders Table */}
        <section className="orders-table-card dashboard-section">
          <h3 className="dashboard-section-title">All Orders</h3>
          <p className="dashboard-section-subtitle">
            Line-item view of orders for the selected subsidiary.
          </p>
          <div className="all-orders-filters-wrapper">
            <AllOrdersFilters
              value={orderFilters}
              onChange={setOrderFilters}
              onOpenManageColumns={() => setIsManageColumnsOpen(true)}
            />
          </div>
          <OrdersTable
            selectedOrgIds={selectedOrgIds}
            dateRange={dateRange}
            orders={filteredOrders}
            columnsState={columnsState}
            onRowClick={handleRowClick}
          />
          <ManageAllOrdersColumnsDialog
            open={isManageColumnsOpen}
            onClose={() => setIsManageColumnsOpen(false)}
            columnsState={columnsState}
            onChange={setColumnsState}
          />
        </section>
      </div>

      {/* Order Details Panel */}
      <OrderDetailsPanel
        order={selectedOrder}
        isOpen={isDetailsOpen}
        onClose={handleClosePanel}
      />
    </>
  );
}

/* ------------------ SAVINGS VIEW ------------------ */

type MonthKey = "total" | "Jan" | "Feb" | "Mar" | "Apr" | "May" | "Jun" | "Jul" | "Aug" | "Sep" | "Oct" | "Nov" | "Dec";

// Monthly totals data structure
const monthlyTotalsByYear: Record<number, Record<string, number>> = {
  2024: {
    total: 1532818,
    Jan: 30476,
    Feb: 96782,
    Mar: 112029,
    Apr: 130287,
    May: 277799,
    Jun: 194216,
    Jul: 187546,
    Aug: 159155,
    Sep: 186292,
    Oct: 221629,
    Nov: 198432,
    Dec: 175643,
  },
  2023: {
    total: 1363500,
    Jan: 28500,
    Feb: 92000,
    Mar: 108000,
    Apr: 125000,
    May: 265000,
    Jun: 185000,
    Jul: 178000,
    Aug: 152000,
    Sep: 175000,
    Oct: 210000,
    Nov: 190000,
    Dec: 168000,
  },
  2022: {
    total: 1305000,
    Jan: 27000,
    Feb: 88000,
    Mar: 105000,
    Apr: 120000,
    May: 255000,
    Jun: 180000,
    Jul: 172000,
    Aug: 148000,
    Sep: 170000,
    Oct: 205000,
    Nov: 185000,
    Dec: 165000,
  },
};

// KPI data by year and month
type KpiData = {
  totalCostSavings: number;
  warrantyRecovery: number;
  noProblemsFound: number;
  costSavingsPercent: string;
  avgQuoteLeadTime: string;
  avgApprovalLeadTime: string;
  avgCompletionLeadTime: string;
  trend: string;
};

const kpiDataByYearMonth: Record<number, Record<string, KpiData>> = {
  2024: {
    total: {
      totalCostSavings: 1532818,
      warrantyRecovery: 116036,
      noProblemsFound: 23428,
      costSavingsPercent: "48.18%",
      avgQuoteLeadTime: "20 days",
      avgApprovalLeadTime: "9 days",
      avgCompletionLeadTime: "23 days",
      trend: "+12.4% vs LY",
    },
    Jan: {
      totalCostSavings: 30476,
      warrantyRecovery: 3000,
      noProblemsFound: 500,
      costSavingsPercent: "47.2%",
      avgQuoteLeadTime: "22 days",
      avgApprovalLeadTime: "10 days",
      avgCompletionLeadTime: "25 days",
      trend: "+8.1% vs LY",
    },
    Feb: {
      totalCostSavings: 96782,
      warrantyRecovery: 9000,
      noProblemsFound: 1800,
      costSavingsPercent: "47.8%",
      avgQuoteLeadTime: "21 days",
      avgApprovalLeadTime: "9 days",
      avgCompletionLeadTime: "24 days",
      trend: "+9.2% vs LY",
    },
    Mar: {
      totalCostSavings: 112029,
      warrantyRecovery: 11000,
      noProblemsFound: 2200,
      costSavingsPercent: "48.1%",
      avgQuoteLeadTime: "20 days",
      avgApprovalLeadTime: "9 days",
      avgCompletionLeadTime: "23 days",
      trend: "+10.5% vs LY",
    },
    Apr: {
      totalCostSavings: 130287,
      warrantyRecovery: 12800,
      noProblemsFound: 2500,
      costSavingsPercent: "48.3%",
      avgQuoteLeadTime: "20 days",
      avgApprovalLeadTime: "8 days",
      avgCompletionLeadTime: "22 days",
      trend: "+11.2% vs LY",
    },
    May: {
      totalCostSavings: 277799,
      warrantyRecovery: 27000,
      noProblemsFound: 5400,
      costSavingsPercent: "48.5%",
      avgQuoteLeadTime: "19 days",
      avgApprovalLeadTime: "8 days",
      avgCompletionLeadTime: "21 days",
      trend: "+13.1% vs LY",
    },
    Jun: {
      totalCostSavings: 194216,
      warrantyRecovery: 18800,
      noProblemsFound: 3800,
      costSavingsPercent: "48.2%",
      avgQuoteLeadTime: "20 days",
      avgApprovalLeadTime: "9 days",
      avgCompletionLeadTime: "23 days",
      trend: "+12.8% vs LY",
    },
    Jul: {
      totalCostSavings: 187546,
      warrantyRecovery: 18200,
      noProblemsFound: 3600,
      costSavingsPercent: "48.0%",
      avgQuoteLeadTime: "20 days",
      avgApprovalLeadTime: "9 days",
      avgCompletionLeadTime: "23 days",
      trend: "+12.1% vs LY",
    },
    Aug: {
      totalCostSavings: 159155,
      warrantyRecovery: 15400,
      noProblemsFound: 3100,
      costSavingsPercent: "47.9%",
      avgQuoteLeadTime: "21 days",
      avgApprovalLeadTime: "9 days",
      avgCompletionLeadTime: "24 days",
      trend: "+11.5% vs LY",
    },
    Sep: {
      totalCostSavings: 186292,
      warrantyRecovery: 18000,
      noProblemsFound: 3600,
      costSavingsPercent: "48.1%",
      avgQuoteLeadTime: "20 days",
      avgApprovalLeadTime: "9 days",
      avgCompletionLeadTime: "23 days",
      trend: "+12.3% vs LY",
    },
    Oct: {
      totalCostSavings: 221629,
      warrantyRecovery: 21500,
      noProblemsFound: 4300,
      costSavingsPercent: "48.4%",
      avgQuoteLeadTime: "19 days",
      avgApprovalLeadTime: "8 days",
      avgCompletionLeadTime: "22 days",
      trend: "+13.5% vs LY",
    },
    Nov: {
      totalCostSavings: 198432,
      warrantyRecovery: 19200,
      noProblemsFound: 3800,
      costSavingsPercent: "48.2%",
      avgQuoteLeadTime: "20 days",
      avgApprovalLeadTime: "9 days",
      avgCompletionLeadTime: "23 days",
      trend: "+12.6% vs LY",
    },
    Dec: {
      totalCostSavings: 175643,
      warrantyRecovery: 17000,
      noProblemsFound: 3400,
      costSavingsPercent: "48.0%",
      avgQuoteLeadTime: "20 days",
      avgApprovalLeadTime: "9 days",
      avgCompletionLeadTime: "23 days",
      trend: "+12.0% vs LY",
    },
  },
  2023: {
    total: {
      totalCostSavings: 1363500,
      warrantyRecovery: 108000,
      noProblemsFound: 21500,
      costSavingsPercent: "45.0%",
      avgQuoteLeadTime: "22 days",
      avgApprovalLeadTime: "10 days",
      avgCompletionLeadTime: "26 days",
      trend: "+4.5% vs LY",
    },
    Jan: {
      totalCostSavings: 28500,
      warrantyRecovery: 2800,
      noProblemsFound: 450,
      costSavingsPercent: "44.5%",
      avgQuoteLeadTime: "23 days",
      avgApprovalLeadTime: "11 days",
      avgCompletionLeadTime: "27 days",
      trend: "+5.1% vs LY",
    },
    Feb: {
      totalCostSavings: 92000,
      warrantyRecovery: 8500,
      noProblemsFound: 1700,
      costSavingsPercent: "44.8%",
      avgQuoteLeadTime: "22 days",
      avgApprovalLeadTime: "10 days",
      avgCompletionLeadTime: "26 days",
      trend: "+4.8% vs LY",
    },
    Mar: {
      totalCostSavings: 108000,
      warrantyRecovery: 10000,
      noProblemsFound: 2000,
      costSavingsPercent: "45.0%",
      avgQuoteLeadTime: "22 days",
      avgApprovalLeadTime: "10 days",
      avgCompletionLeadTime: "26 days",
      trend: "+4.5% vs LY",
    },
    Apr: {
      totalCostSavings: 125000,
      warrantyRecovery: 11600,
      noProblemsFound: 2300,
      costSavingsPercent: "45.2%",
      avgQuoteLeadTime: "22 days",
      avgApprovalLeadTime: "10 days",
      avgCompletionLeadTime: "25 days",
      trend: "+4.2% vs LY",
    },
    May: {
      totalCostSavings: 265000,
      warrantyRecovery: 24600,
      noProblemsFound: 4900,
      costSavingsPercent: "45.5%",
      avgQuoteLeadTime: "21 days",
      avgApprovalLeadTime: "9 days",
      avgCompletionLeadTime: "24 days",
      trend: "+3.8% vs LY",
    },
    Jun: {
      totalCostSavings: 185000,
      warrantyRecovery: 17100,
      noProblemsFound: 3400,
      costSavingsPercent: "45.1%",
      avgQuoteLeadTime: "22 days",
      avgApprovalLeadTime: "10 days",
      avgCompletionLeadTime: "26 days",
      trend: "+4.0% vs LY",
    },
    Jul: {
      totalCostSavings: 178000,
      warrantyRecovery: 16500,
      noProblemsFound: 3300,
      costSavingsPercent: "45.0%",
      avgQuoteLeadTime: "22 days",
      avgApprovalLeadTime: "10 days",
      avgCompletionLeadTime: "26 days",
      trend: "+4.3% vs LY",
    },
    Aug: {
      totalCostSavings: 152000,
      warrantyRecovery: 14000,
      noProblemsFound: 2800,
      costSavingsPercent: "44.9%",
      avgQuoteLeadTime: "23 days",
      avgApprovalLeadTime: "10 days",
      avgCompletionLeadTime: "27 days",
      trend: "+4.6% vs LY",
    },
    Sep: {
      totalCostSavings: 175000,
      warrantyRecovery: 16300,
      noProblemsFound: 3200,
      costSavingsPercent: "45.1%",
      avgQuoteLeadTime: "22 days",
      avgApprovalLeadTime: "10 days",
      avgCompletionLeadTime: "26 days",
      trend: "+4.4% vs LY",
    },
    Oct: {
      totalCostSavings: 210000,
      warrantyRecovery: 19500,
      noProblemsFound: 3900,
      costSavingsPercent: "45.3%",
      avgQuoteLeadTime: "21 days",
      avgApprovalLeadTime: "9 days",
      avgCompletionLeadTime: "25 days",
      trend: "+4.1% vs LY",
    },
    Nov: {
      totalCostSavings: 190000,
      warrantyRecovery: 17600,
      noProblemsFound: 3500,
      costSavingsPercent: "45.2%",
      avgQuoteLeadTime: "22 days",
      avgApprovalLeadTime: "10 days",
      avgCompletionLeadTime: "26 days",
      trend: "+4.2% vs LY",
    },
    Dec: {
      totalCostSavings: 168000,
      warrantyRecovery: 15700,
      noProblemsFound: 3100,
      costSavingsPercent: "45.0%",
      avgQuoteLeadTime: "22 days",
      avgApprovalLeadTime: "10 days",
      avgCompletionLeadTime: "26 days",
      trend: "+4.5% vs LY",
    },
  },
  2022: {
    total: {
      totalCostSavings: 1305000,
      warrantyRecovery: 103000,
      noProblemsFound: 20500,
      costSavingsPercent: "43.5%",
      avgQuoteLeadTime: "24 days",
      avgApprovalLeadTime: "11 days",
      avgCompletionLeadTime: "28 days",
      trend: "Baseline",
    },
    Jan: {
      totalCostSavings: 27000,
      warrantyRecovery: 2700,
      noProblemsFound: 430,
      costSavingsPercent: "43.2%",
      avgQuoteLeadTime: "25 days",
      avgApprovalLeadTime: "12 days",
      avgCompletionLeadTime: "29 days",
      trend: "Baseline",
    },
    Feb: {
      totalCostSavings: 88000,
      warrantyRecovery: 8200,
      noProblemsFound: 1600,
      costSavingsPercent: "43.5%",
      avgQuoteLeadTime: "24 days",
      avgApprovalLeadTime: "11 days",
      avgCompletionLeadTime: "28 days",
      trend: "Baseline",
    },
    Mar: {
      totalCostSavings: 105000,
      warrantyRecovery: 9800,
      noProblemsFound: 1900,
      costSavingsPercent: "43.6%",
      avgQuoteLeadTime: "24 days",
      avgApprovalLeadTime: "11 days",
      avgCompletionLeadTime: "28 days",
      trend: "Baseline",
    },
    Apr: {
      totalCostSavings: 120000,
      warrantyRecovery: 11200,
      noProblemsFound: 2200,
      costSavingsPercent: "43.7%",
      avgQuoteLeadTime: "24 days",
      avgApprovalLeadTime: "11 days",
      avgCompletionLeadTime: "27 days",
      trend: "Baseline",
    },
    May: {
      totalCostSavings: 255000,
      warrantyRecovery: 23700,
      noProblemsFound: 4700,
      costSavingsPercent: "43.8%",
      avgQuoteLeadTime: "23 days",
      avgApprovalLeadTime: "10 days",
      avgCompletionLeadTime: "26 days",
      trend: "Baseline",
    },
    Jun: {
      totalCostSavings: 180000,
      warrantyRecovery: 16700,
      noProblemsFound: 3300,
      costSavingsPercent: "43.6%",
      avgQuoteLeadTime: "24 days",
      avgApprovalLeadTime: "11 days",
      avgCompletionLeadTime: "28 days",
      trend: "Baseline",
    },
    Jul: {
      totalCostSavings: 172000,
      warrantyRecovery: 16000,
      noProblemsFound: 3200,
      costSavingsPercent: "43.5%",
      avgQuoteLeadTime: "24 days",
      avgApprovalLeadTime: "11 days",
      avgCompletionLeadTime: "28 days",
      trend: "Baseline",
    },
    Aug: {
      totalCostSavings: 148000,
      warrantyRecovery: 13700,
      noProblemsFound: 2700,
      costSavingsPercent: "43.4%",
      avgQuoteLeadTime: "25 days",
      avgApprovalLeadTime: "11 days",
      avgCompletionLeadTime: "29 days",
      trend: "Baseline",
    },
    Sep: {
      totalCostSavings: 170000,
      warrantyRecovery: 15800,
      noProblemsFound: 3100,
      costSavingsPercent: "43.6%",
      avgQuoteLeadTime: "24 days",
      avgApprovalLeadTime: "11 days",
      avgCompletionLeadTime: "28 days",
      trend: "Baseline",
    },
    Oct: {
      totalCostSavings: 205000,
      warrantyRecovery: 19100,
      noProblemsFound: 3800,
      costSavingsPercent: "43.7%",
      avgQuoteLeadTime: "23 days",
      avgApprovalLeadTime: "10 days",
      avgCompletionLeadTime: "27 days",
      trend: "Baseline",
    },
    Nov: {
      totalCostSavings: 185000,
      warrantyRecovery: 17100,
      noProblemsFound: 3400,
      costSavingsPercent: "43.6%",
      avgQuoteLeadTime: "24 days",
      avgApprovalLeadTime: "11 days",
      avgCompletionLeadTime: "28 days",
      trend: "Baseline",
    },
    Dec: {
      totalCostSavings: 165000,
      warrantyRecovery: 15400,
      noProblemsFound: 3000,
      costSavingsPercent: "43.5%",
      avgQuoteLeadTime: "24 days",
      avgApprovalLeadTime: "11 days",
      avgCompletionLeadTime: "28 days",
      trend: "Baseline",
    },
  },
};

type MonthStripProps = {
  selectedMonth: MonthKey;
  selectedYear: number;
  onChange: (month: MonthKey) => void;
};

function MonthStrip({ selectedMonth, selectedYear, onChange }: MonthStripProps) {
  const months: MonthKey[] = ["total", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const yearTotals = monthlyTotalsByYear[selectedYear] || monthlyTotalsByYear[2024];

  return (
    <div className="month-strip">
      {months.map((month) => {
        const total = yearTotals[month] || 0;
        const formattedTotal = total.toLocaleString("en-US");
        
        return (
          <button
            key={month}
            type="button"
            className={`month-pill ${selectedMonth === month ? "month-pill--active" : ""}`}
            onClick={() => onChange(month)}
          >
            <div className="month-pill-label">{month}</div>
            <div className="month-pill-total">{formattedTotal}</div>
          </button>
        );
      })}
    </div>
  );
}

type SavingsViewProps = {
  selectedOrgIds: string[];
  selectedYear: number;
  setSelectedYear: (year: number) => void;
};

function SavingsView({ selectedOrgIds, selectedYear, setSelectedYear }: SavingsViewProps) {
  const [selectedMonth, setSelectedMonth] = useState<MonthKey>("total");

  return (
    <>
      <header className="dashboard-header">
        <div className="dashboard-header-main">
          <div className="dashboard-title-row">
            <h1 className="dashboard-title">Cost Savings &amp; Warranty Recovery</h1>
            <span className="dashboard-badge">Customer Report</span>
          </div>

          <p className="dashboard-subtitle">
            Cost savings, warranty recovery and repair performance
            metrics with month-by-month breakdown.
          </p>
        </div>

        <div className="dashboard-header-actions">
          <AppSelect
            value={selectedYear.toString()}
            options={[
              { value: "2024", label: "2024" },
              { value: "2023", label: "2023" },
              { value: "2022", label: "2022" },
            ]}
            onChange={(value) => setSelectedYear(Number(value))}
            className="header-pill-select-wrapper"
          />
        </div>
      </header>

      <div className="dashboard-page-content">
        {/* 1. Charts row on top */}
        <section className="savings-top-row">
          <CostSavingsByMonthChart selectedYear={selectedYear} selectedMonth={selectedMonth} selectedOrgIds={selectedOrgIds} />
          <SavingsByCategoryChart selectedYear={selectedYear} selectedMonth={selectedMonth} selectedOrgIds={selectedOrgIds} />
        </section>

        {/* 2. KPI + month selector block beneath charts */}
        <section className="savings-month-strip-section dashboard-section">
          <MonthStrip selectedMonth={selectedMonth} selectedYear={selectedYear} onChange={setSelectedMonth} />
        </section>

        {/* SUMMARY ROW: 1 big card left (30%) + 6 cards right (3x2, 70%) */}
        <section className="savings-summary-grid dashboard-section">
          <div className="savings-summary-left">
            <div className="hero-kpi-card">
              <div className="hero-kpi-label">Total Cost Savings</div>
              <div className="hero-kpi-value">
                ${(() => {
                  const yearData = kpiDataByYearMonth[selectedYear] || kpiDataByYearMonth[2024];
                  const monthData = yearData[selectedMonth] || yearData.total;
                  return monthData.totalCostSavings.toLocaleString("en-US");
                })()}
              </div>
              <div className="hero-kpi-trend">
                {(() => {
                  const yearData = kpiDataByYearMonth[selectedYear] || kpiDataByYearMonth[2024];
                  const monthData = yearData[selectedMonth] || yearData.total;
                  return monthData.trend;
                })()}
              </div>
            </div>
          </div>

          <div className="savings-summary-right">
            {(() => {
              const yearData = kpiDataByYearMonth[selectedYear] || kpiDataByYearMonth[2024];
              const monthData = yearData[selectedMonth] || yearData.total;
              return (
                <>
                  <KpiCard 
                    label="Warranty recovery" 
                    value={`$${monthData.warrantyRecovery.toLocaleString("en-US")}`} 
                    trend={selectedMonth === "total" ? "+8.1% vs LY" : "Monthly"} 
                  />
                  <KpiCard 
                    label="No problems found" 
                    value={`$${monthData.noProblemsFound.toLocaleString("en-US")}`} 
                    trend={selectedMonth === "total" ? "Inspection only" : "Monthly"} 
                  />
                  <KpiCard 
                    label="% cost savings" 
                    value={monthData.costSavingsPercent} 
                    trend={selectedMonth === "total" ? "+3.2 pts" : "Monthly"} 
                  />
                  <KpiCard 
                    label="Avg quote lead time" 
                    value={monthData.avgQuoteLeadTime} 
                    trend={selectedMonth === "total" ? "-2.5 days" : "Monthly"} 
                  />
                  <KpiCard 
                    label="Avg approval lead time" 
                    value={monthData.avgApprovalLeadTime} 
                    trend={selectedMonth === "total" ? "-1.8 days" : "Monthly"} 
                  />
                  <KpiCard 
                    label="Avg completion lead time" 
                    value={monthData.avgCompletionLeadTime} 
                    trend={selectedMonth === "total" ? "-3.1 days" : "Monthly"} 
                  />
                </>
              );
            })()}
          </div>
        </section>

        {/* 3. Savings Details Table */}
        <section className="savings-details-section dashboard-section">
          <SavingsDetailsTable
            selectedOrgIds={selectedOrgIds}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
          />
        </section>
      </div>
    </>
  );
}

/* ------------------ SITE SAVINGS VIEW ------------------ */

type SiteSavingsViewProps = {
  selectedOrgIds: string[];
  selectedYear: number;
  setSelectedYear: (year: number) => void;
};

function SiteSavingsView({ selectedOrgIds: _selectedOrgIds, selectedYear, setSelectedYear }: SiteSavingsViewProps) {
  // Note: CostSavingsBySiteChart currently shows all subsidiaries; 
  // selectedOrgIds could be used to filter in the future if needed
  return (
    <>
      <header className="dashboard-header">
        <div className="dashboard-header-main">
          <div className="dashboard-title-row">
            <h1 className="dashboard-title">Cost Savings by Subsidiary</h1>
            <span className="dashboard-badge">Subsidiary Comparison</span>
          </div>

          <p className="dashboard-subtitle">
            Total cost savings by subsidiary for the selected year.
          </p>
        </div>

        <div className="dashboard-header-actions">
          <AppSelect
            value={selectedYear.toString()}
            options={[
              { value: "2024", label: "2024" },
              { value: "2023", label: "2023" },
              { value: "2022", label: "2022" },
            ]}
            onChange={(value) => setSelectedYear(Number(value))}
            className="header-pill-select-wrapper"
          />
        </div>
      </header>

      <div className="dashboard-page-content">
        <section className="dashboard-section">
          <CostSavingsBySiteChart selectedYear={selectedYear} />
        </section>
      </div>
    </>
  );
}

/* ------------------ SHARED KPI CARD ------------------ */
