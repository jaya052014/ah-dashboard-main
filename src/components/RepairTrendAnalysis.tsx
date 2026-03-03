import { useState } from "react";
import { AppSelect } from "./common/AppSelect";
import { RepairTrendAnalysisChart } from "./charts/RepairTrendAnalysisChart";

type RepairTrendAnalysisProps = {
  selectedSites: string[];
  selectedDepartments: string[];
};

const YEAR_OPTIONS = [
  { value: "2025", label: "2025" },
  { value: "2024", label: "2024" },
  { value: "2023", label: "2023" },
  { value: "2022", label: "2022" },
];

export function RepairTrendAnalysis({ selectedSites, selectedDepartments }: RepairTrendAnalysisProps) {
  const [selectedYear, setSelectedYear] = useState<string>("2025");
  const [compareWithPrevious, setCompareWithPrevious] = useState<boolean>(false);

  return (
    <section className="orders-table-card dashboard-section">
      <div className="repair-trend-analysis-header">
        <div className="repair-trend-analysis-header-left">
          <h3 className="dashboard-section-title">Repair Trend Analysis</h3>
          <p className="dashboard-section-subtitle">
            Analyze repair trends over time by status and date range.
          </p>
        </div>
        <div className="repair-trend-analysis-header-right" style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "nowrap" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              fontSize: "13px",
              color: "#475569",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            <input
              type="checkbox"
              checked={compareWithPrevious}
              onChange={(e) => setCompareWithPrevious(e.target.checked)}
              style={{
                width: "16px",
                height: "16px",
                cursor: "pointer",
                accentColor: "#2563eb",
                flexShrink: 0,
              }}
            />
            <span style={{ whiteSpace: "nowrap" }}>Compare with previous period</span>
          </label>
          <AppSelect
            value={selectedYear}
            options={YEAR_OPTIONS}
            onChange={setSelectedYear}
            placeholder="Select year"
            className="chart-year-selector"
          />
        </div>
      </div>

      <RepairTrendAnalysisChart
        selectedSites={selectedSites}
        selectedDepartments={selectedDepartments}
        selectedYear={parseInt(selectedYear, 10)}
        compareWithPrevious={compareWithPrevious}
      />
    </section>
  );
}
