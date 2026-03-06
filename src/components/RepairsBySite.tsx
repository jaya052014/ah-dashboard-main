import { useState } from "react";
import { AppSelect } from "./common/AppSelect";
import { RepairsBySiteChart } from "./charts/RepairsBySiteChart";

type RepairsBySiteProps = {
  selectedSites: string[];
  selectedDepartments: string[];
};

type ViewMode = "sites" | "departments";

const YEAR_OPTIONS = [
	{ value: "2026", label: "2026" },
  { value: "2025", label: "2025" },
  { value: "2024", label: "2024" },
  { value: "2023", label: "2023" },
  { value: "2022", label: "2022" },
];

export function RepairsBySite({ selectedSites, selectedDepartments }: RepairsBySiteProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("sites");
  const [selectedYear, setSelectedYear] = useState<string>("2026");

  return (
    <section className="orders-table-card dashboard-section">
      <div className="repair-trend-analysis-header">
        <div className="repair-trend-analysis-header-left">
          <h3 className="dashboard-section-title">Repair Participation by Customer Plant</h3>
          <p className="dashboard-section-subtitle">
            Compare repair volumes over time by site or department.
          </p>
        </div>
        <div className="repair-trend-analysis-header-right">
          <div className="repairs-by-site-controls">
            {/* Segmented switcher */}
            <div className="repairs-by-site-switcher">
              <button
                type="button"
                className={`repairs-by-site-switcher-button ${
                  viewMode === "sites" ? "repairs-by-site-switcher-button--active" : ""
                }`}
                onClick={() => setViewMode("sites")}
              >
                Sites
              </button>
              <button
                type="button"
                className={`repairs-by-site-switcher-button ${
                  viewMode === "departments" ? "repairs-by-site-switcher-button--active" : ""
                }`}
                onClick={() => setViewMode("departments")}
              >
                Departments
              </button>
            </div>
            <AppSelect
              value={selectedYear}
              options={YEAR_OPTIONS}
              onChange={setSelectedYear}
              placeholder="Select year"
              className="chart-year-selector"
            />
          </div>
        </div>
      </div>

      <RepairsBySiteChart
        selectedSites={selectedSites}
        selectedDepartments={selectedDepartments}
        selectedYear={parseInt(selectedYear, 10)}
        viewMode={viewMode}
		key = {viewMode}
      />
    </section>
  );
}

