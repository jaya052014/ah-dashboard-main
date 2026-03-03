import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { MOCK_SUPPLIERS, MONTHS } from "../data/mockSuppliers";
import { AppSelect } from "./common/AppSelect";
import { AppMultiSelect } from "./common/AppMultiSelect";

export function SupplierScorecardView() {
  // Initialize with all suppliers selected by default
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>(
    MOCK_SUPPLIERS.map((s) => s.id)
  );
  const [selectedCustomerGroup, setSelectedCustomerGroup] = useState<string>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("12months");
  const [repairStatus, setRepairStatus] = useState<string>("all");

  // Filter suppliers based on selection
  const filteredSuppliers = useMemo(() => {
    return MOCK_SUPPLIERS.filter((s) => selectedSuppliers.includes(s.id));
  }, [selectedSuppliers]);

  // Prepare data for transactions comparison chart
  const transactionsComparisonData = useMemo(() => {
    return filteredSuppliers.map((supplier) => ({
      name: supplier.name,
      transactions: supplier.monthlyTransactions.reduce((a, b) => a + b, 0),
    }));
  }, [filteredSuppliers]);

  // Prepare data for transactions trend chart
  const transactionsTrendData = useMemo(() => {
    return MONTHS.map((month, index) => {
      const dataPoint: Record<string, string | number> = { month };
      filteredSuppliers.forEach((supplier) => {
        dataPoint[supplier.name] = supplier.monthlyTransactions[index];
      });
      return dataPoint;
    });
  }, [filteredSuppliers]);

  // Prepare data for gross margin comparison chart
  const marginComparisonData = useMemo(() => {
    return filteredSuppliers.map((supplier) => ({
      name: supplier.name,
      margin: supplier.monthlyMargin.reduce((a, b) => a + b, 0) / supplier.monthlyMargin.length,
    }));
  }, [filteredSuppliers]);

  // Prepare data for gross margin trend chart
  const marginTrendData = useMemo(() => {
    return MONTHS.map((month, index) => {
      const dataPoint: Record<string, string | number> = { month };
      filteredSuppliers.forEach((supplier) => {
        dataPoint[supplier.name] = supplier.monthlyMargin[index];
      });
      return dataPoint;
    });
  }, [filteredSuppliers]);

  // Prepare data for lead time comparison chart
  const leadTimeComparisonData = useMemo(() => {
    return filteredSuppliers.map((supplier) => ({
      name: supplier.name,
      leadTime: supplier.monthlyLeadTime.reduce((a, b) => a + b, 0) / supplier.monthlyLeadTime.length,
    }));
  }, [filteredSuppliers]);

  // Prepare data for lead time trend chart
  const leadTimeTrendData = useMemo(() => {
    return MONTHS.map((month, index) => {
      const dataPoint: Record<string, string | number> = { month };
      filteredSuppliers.forEach((supplier) => {
        dataPoint[supplier.name] = supplier.monthlyLeadTime[index];
      });
      return dataPoint;
    });
  }, [filteredSuppliers]);

  // Calculate KPI values
  const totalTransactions = useMemo(() => {
    return filteredSuppliers.reduce(
      (sum, supplier) => sum + supplier.monthlyTransactions.reduce((a, b) => a + b, 0),
      0
    );
  }, [filteredSuppliers]);

  const averageGrossMargin = useMemo(() => {
    if (filteredSuppliers.length === 0) return 0;
    const allMargins = filteredSuppliers.flatMap((s) => s.monthlyMargin);
    return allMargins.reduce((a, b) => a + b, 0) / allMargins.length;
  }, [filteredSuppliers]);

  const averageLeadTime = useMemo(() => {
    if (filteredSuppliers.length === 0) return 0;
    const allLeadTimes = filteredSuppliers.flatMap((s) => s.monthlyLeadTime);
    return allLeadTimes.reduce((a, b) => a + b, 0) / allLeadTimes.length;
  }, [filteredSuppliers]);

  // Convert suppliers to options for multi-select
  const supplierOptions = MOCK_SUPPLIERS.map((supplier) => ({
    value: supplier.id,
    label: supplier.name,
  }));

  const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#3b82f6"];

  return (
    <>
      <header className="dashboard-header">
        <div className="dashboard-header-main">
          <div className="dashboard-title-row">
            <h1 className="dashboard-title">Supplier Scorecard</h1>
            <span className="dashboard-badge">Pilot</span>
          </div>
          <p className="dashboard-subtitle">
            Compare supplier performance across volume, margin, and lead time.
          </p>
        </div>
      </header>

      <div className="dashboard-page-content">
        {/* Filter Bar */}
        <section className="supplier-filters">
          <div className="supplier-filter-item">
            <AppMultiSelect
              label="SUPPLIER NAME"
              value={selectedSuppliers}
              options={supplierOptions}
              onChange={setSelectedSuppliers}
              selectAllLabel="All Suppliers"
            />
          </div>

          <div className="supplier-filter-item">
            <AppSelect
              label="Customer Group"
              value={selectedCustomerGroup}
              options={[
                { value: "all", label: "All Groups" },
                { value: "group1", label: "Group 1" },
                { value: "group2", label: "Group 2" },
              ]}
              onChange={setSelectedCustomerGroup}
            />
          </div>

          <div className="supplier-filter-item">
            <AppSelect
              label="Customer Name"
              value={selectedCustomer}
              options={[
                { value: "all", label: "All Customers" },
                { value: "customer1", label: "Customer 1" },
                { value: "customer2", label: "Customer 2" },
              ]}
              onChange={setSelectedCustomer}
            />
          </div>

          <div className="supplier-filter-item">
            <AppSelect
              label="Date Range"
              value={dateRange}
              options={[
                { value: "12months", label: "Previous 12 Months" },
                { value: "6months", label: "Previous 6 Months" },
                { value: "3months", label: "Previous 3 Months" },
              ]}
              onChange={setDateRange}
            />
          </div>

          <div className="supplier-filter-item">
            <AppSelect
              label="Repair Status"
              value={repairStatus}
              options={[
                { value: "all", label: "All" },
                { value: "open", label: "Open" },
                { value: "completed", label: "Completed" },
              ]}
              onChange={setRepairStatus}
            />
          </div>
        </section>

        {/* Main Content Grid: 3 columns (Comparison | Trend | KPI) */}
        <div className="supplier-main-grid dashboard-section">
        {/* Row 1: Transactions */}
        <div className="supplier-chart-card">
          <h3 className="supplier-chart-title"># of Transactions – Supplier Comparison</h3>
          <p className="supplier-chart-subtitle">Completed repairs for selected period.</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={transactionsComparisonData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="transactions" radius={[0, 8, 8, 0]}>
                {transactionsComparisonData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="supplier-chart-card">
          <h3 className="supplier-chart-title"># of Transactions – Trend</h3>
          <p className="supplier-chart-subtitle">Monthly transaction count by supplier.</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={transactionsTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              {filteredSuppliers.map((supplier, index) => (
                <Line
                  key={supplier.id}
                  type="monotone"
                  dataKey={supplier.name}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="supplier-kpi-card">
          <div className="supplier-kpi-label">TOTAL TRANSACTIONS</div>
          <div className="supplier-kpi-value">{totalTransactions.toLocaleString()}</div>
        </div>

        {/* Row 2: Gross Margin */}
        <div className="supplier-chart-card">
          <h3 className="supplier-chart-title">Gross Margin – Comparison</h3>
          <p className="supplier-chart-subtitle">Average gross margin by supplier.</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={marginComparisonData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, "dataMax + 5"]} />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
              <Bar dataKey="margin" radius={[0, 8, 8, 0]}>
                {marginComparisonData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="supplier-chart-card">
          <h3 className="supplier-chart-title">Gross Margin – Trend</h3>
          <p className="supplier-chart-subtitle">Monthly gross margin trend by supplier.</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={marginTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, "dataMax + 5"]} />
              <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
              <Legend />
              {filteredSuppliers.map((supplier, index) => (
                <Line
                  key={supplier.id}
                  type="monotone"
                  dataKey={supplier.name}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="supplier-kpi-card">
          <div className="supplier-kpi-label">GROSS MARGIN – GROUP</div>
          <div className="supplier-kpi-value">{averageGrossMargin.toFixed(1)}%</div>
        </div>

        {/* Row 3: Lead Time */}
        <div className="supplier-chart-card">
          <h3 className="supplier-chart-title">Average Lead Time – Comparison</h3>
          <p className="supplier-chart-subtitle">Average lead time in days by supplier.</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={leadTimeComparisonData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip formatter={(value: number) => `${value.toFixed(1)} days`} />
              <Bar dataKey="leadTime" radius={[0, 8, 8, 0]}>
                {leadTimeComparisonData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="supplier-chart-card">
          <h3 className="supplier-chart-title">Average Lead Time – Trend</h3>
          <p className="supplier-chart-subtitle">Monthly average lead time trend by supplier.</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={leadTimeTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toFixed(1)} days`} />
              <Legend />
              {filteredSuppliers.map((supplier, index) => (
                <Line
                  key={supplier.id}
                  type="monotone"
                  dataKey={supplier.name}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="supplier-kpi-card">
          <div className="supplier-kpi-label">AVERAGE LEAD TIME</div>
          <div className="supplier-kpi-value">
            {averageLeadTime % 1 === 0
              ? `${averageLeadTime.toFixed(0)} days`
              : `${averageLeadTime.toFixed(1)} days`}
          </div>
        </div>
        </div>
      </div>
    </>
  );
}

