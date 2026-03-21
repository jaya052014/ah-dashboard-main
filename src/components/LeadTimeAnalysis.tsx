import { useState } from "react";
import { AppSelect } from "./common/AppSelect";
import { LeadTimeAnalysisChart } from "./charts/LeadTimeAnalysisChart";

type LeadTimeAnalysisProps = {
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

export function LeadTimeAnalysis({ selectedSites, selectedDepartments }: LeadTimeAnalysisProps) {
  // Default to 2025
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [viewMode, setViewMode] = useState<ViewMode>("sites");

  return (
    <section className="orders-table-card dashboard-section">
      <div className="repair-trend-analysis-header">
        <div className="repair-trend-analysis-header-left">
          <h3 className="dashboard-section-title">Lead Time Analysis</h3>
          <p className="dashboard-section-subtitle">
            Compare average time metrics by site or department using a heatmap view.
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
              
            </div>
            <AppSelect
              value={selectedYear}
              options={YEAR_OPTIONS}
              onChange={setSelectedYear}
              className="chart-year-selector"
            />
          </div>
        </div>
      </div>

      <LeadTimeAnalysisChart 
        selectedYear={parseInt(selectedYear, 10)}
        selectedSites={selectedSites}
        selectedDepartments={selectedDepartments}
        viewMode={viewMode}
      />
    </section>
  );
}

