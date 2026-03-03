import { useState, useMemo, useEffect } from "react";
import { SAVINGS_DETAILS_MOCK } from "../data/savingsDetails";

type SavingsDetailsTableProps = {
  selectedOrgIds: string[];
  selectedYear: number;
  selectedMonth: string; // "total" or month key like "Jan"
};

const ROWS_PER_PAGE = 10;

export function SavingsDetailsTable({
  selectedOrgIds,
  selectedYear,
  selectedMonth,
}: SavingsDetailsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    // If no subsidiaries selected, show empty (Interpretation A)
    let filtered = SAVINGS_DETAILS_MOCK.filter((row) => {
      if (selectedOrgIds.length === 0) {
        return false;
      }
      // Filter by selected org IDs
      if (!selectedOrgIds.includes(row.orgId)) {
        return false;
      }
      // Filter by year
      if (row.year !== selectedYear) {
        return false;
      }
      // Filter by month (if not "total")
      if (selectedMonth !== "total" && row.month !== selectedMonth) {
        return false;
      }
      return true;
    });
    return filtered;
  }, [selectedOrgIds, selectedYear, selectedMonth]);

  // Calculate totals for summary row
  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, row) => ({
        qty: acc.qty + row.qty,
        repairVsNewSavings: acc.repairVsNewSavings + row.repairVsNewSavings,
        noProblemFoundSavings: acc.noProblemFoundSavings + row.noProblemFoundSavings,
        warrantyRecovery: acc.warrantyRecovery + row.warrantyRecovery,
        totalCostSavings: acc.totalCostSavings + row.totalCostSavings,
      }),
      {
        qty: 0,
        repairVsNewSavings: 0,
        noProblemFoundSavings: 0,
        warrantyRecovery: 0,
        totalCostSavings: 0,
      }
    );
  }, [filteredData]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedOrgIds, selectedYear, selectedMonth]);

  const formatCurrency = (value: number) => `$${value.toLocaleString("en-US")}`;
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <div className="savings-table-card">
      <div className="savings-table-header">
        <h2 className="savings-table-title">Savings Details</h2>
        <p className="savings-table-subtitle">
          Line-item view of savings for the selected subsidiary, year and month.
        </p>
      </div>

      <div className="savings-table-wrapper">
        <table className="savings-table">
          <thead>
            <tr>
              <th>SEGMENT / REPAIR</th>
              <th>COMMODITY / PART</th>
              <th>COMPLETED / MR #</th>
              <th className="savings-table-numeric">PO # / QTY</th>
              <th className="savings-table-numeric">PRICE (REPAIR / NEW)</th>
              <th className="savings-table-numeric">SAVINGS (R VS N / TOTAL)</th>
              <th className="savings-table-numeric">OTHER (NPF / WARRANTY)</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="table-cell-two-line">
                      <div className="cell-line-primary">{row.segment}</div>
                      <div className="cell-line-secondary">{row.repairType}</div>
                    </div>
                  </td>
                  <td>
                    <div className="table-cell-two-line">
                      <div className="cell-line-primary">{row.commodityType}</div>
                      <div className="cell-line-secondary">{row.marsPart}</div>
                    </div>
                  </td>
                  <td>
                    <div className="table-cell-two-line">
                      <div className="cell-line-primary">{formatDate(row.completedDate)}</div>
                      <div className="cell-line-secondary">{row.mrNumber}</div>
                    </div>
                  </td>
                  <td className="savings-table-numeric">
                    <div className="table-cell-two-line">
                      <div className="cell-line-primary">{row.customerPoNumber}</div>
                      <div className="cell-line-secondary">{row.qty}</div>
                    </div>
                  </td>
                  <td className="savings-table-numeric">
                    <div className="table-cell-two-line">
                      <div className="cell-line-primary">{formatCurrency(row.repairPrice)}</div>
                      <div className="cell-line-secondary">{formatCurrency(row.priceOfNew)}</div>
                    </div>
                  </td>
                  <td className="savings-table-numeric">
                    <div className="table-cell-two-line">
                      <div className="cell-line-primary">{formatCurrency(row.repairVsNewSavings)}</div>
                      <div className="cell-line-secondary">{formatCurrency(row.totalCostSavings)}</div>
                    </div>
                  </td>
                  <td className="savings-table-numeric">
                    <div className="table-cell-two-line">
                      <div className="cell-line-primary">{formatCurrency(row.noProblemFoundSavings)}</div>
                      <div className="cell-line-secondary">{formatCurrency(row.warrantyRecovery)}</div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="savings-table-empty">
                  No data available for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
          {filteredData.length > 0 && (
            <tfoot>
              <tr className="savings-table-summary">
                <td>
                  <div className="table-cell-two-line">
                    <div className="cell-line-primary"><strong>Total</strong></div>
                    <div className="cell-line-secondary"></div>
                  </div>
                </td>
                <td>
                  <div className="table-cell-two-line">
                    <div className="cell-line-primary">—</div>
                    <div className="cell-line-secondary"></div>
                  </div>
                </td>
                <td>
                  <div className="table-cell-two-line">
                    <div className="cell-line-primary">—</div>
                    <div className="cell-line-secondary"></div>
                  </div>
                </td>
                <td className="savings-table-numeric">
                  <div className="table-cell-two-line">
                    <div className="cell-line-primary">—</div>
                    <div className="cell-line-secondary"><strong>{totals.qty}</strong></div>
                  </div>
                </td>
                <td className="savings-table-numeric">
                  <div className="table-cell-two-line">
                    <div className="cell-line-primary">—</div>
                    <div className="cell-line-secondary">—</div>
                  </div>
                </td>
                <td className="savings-table-numeric">
                  <div className="table-cell-two-line">
                    <div className="cell-line-primary"><strong>{formatCurrency(totals.repairVsNewSavings)}</strong></div>
                    <div className="cell-line-secondary"><strong>{formatCurrency(totals.totalCostSavings)}</strong></div>
                  </div>
                </td>
                <td className="savings-table-numeric">
                  <div className="table-cell-two-line">
                    <div className="cell-line-primary"><strong>{formatCurrency(totals.noProblemFoundSavings)}</strong></div>
                    <div className="cell-line-secondary"><strong>{formatCurrency(totals.warrantyRecovery)}</strong></div>
                  </div>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {filteredData.length > 0 && totalPages > 1 && (
        <div className="savings-table-footer">
          <div className="savings-table-pagination-info">
            Showing {startIndex + 1}–{Math.min(endIndex, filteredData.length)} of{" "}
            {filteredData.length} rows
          </div>
          <div className="savings-table-pagination-controls">
            <button
              type="button"
              className="savings-table-pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="savings-table-pagination-page">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              className="savings-table-pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

