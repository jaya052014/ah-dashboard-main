import { useState, useMemo, useEffect } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { AppSelect } from "../common/AppSelect";
import { REPAIR_STATUS_CONFIG } from "../../constants/repairStatusConfig";

export type RepairStatus =
  | "Repair Logged"
  | "Awaiting Quote"
  | "PO"
  | "Awaiting Approval"
  | "In Progress"
  | "Completed"
  | "Rejected"
  | "Not Repairable";

export type DayRangeKey = "ALL" | "LTE_7" | "D8_30" | "D31_60" | "GT_60";

export type StatusHistoryEntry = {
  status: RepairStatus;
  date: string; // ISO date string (YYYY-MM-DD)
};

export type AllRepairsRow = {
  rrNumber: string;
  description: string;
  details: string;
  mfrPart: string;
  customerPartNumber?: string; // Customer part number (e.g., "GM-CP-48291")
  status: RepairStatus;
  daysInProgress: number; // numeric value for filtering
  daysInProgressDisplay: string; // e.g. "7d" for display
  eta: string; // e.g. "Dec 26"
  quote: number; // numeric, format with toLocaleString
  receivedDate?: string; // ISO date string for date range filtering (e.g. "2025-11-15")
  site?: string; // Site name for filtering
  department?: string; // Department name for filtering
  statusHistory?: StatusHistoryEntry[]; // Array of status transitions with dates
};

import type { AllRepairsColumnsState, AllRepairsColumnId } from "../allRepairsColumns";
import { ALL_REPAIRS_DEFAULT_COLUMNS } from "../allRepairsColumns";

type AllRepairsTableProps = {
  data: AllRepairsRow[];
  searchQuery?: string;
  columnsState?: AllRepairsColumnsState;
  selectedRowIds?: Set<string>;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  onRowClick?: (row: AllRepairsRow) => void;
};

type SortField = AllRepairsColumnId | null;
type SortDirection = "asc" | "desc";

// Status badge component with icon and refined styling
function StatusBadge({ status }: { status: RepairStatus }) {
  const config = REPAIR_STATUS_CONFIG[status];
  if (!config) return <span>{status}</span>;

  const IconComponent = config.IconComponent;

  return (
    <span
      className="status-pill"
      style={{
        backgroundColor: config.badgeBackground,
        color: config.badgeTextColor,
      }}
    >
      <span
        className="status-pill-icon-wrapper"
        style={{ color: config.badgeTextColor }}
      >
        <IconComponent className="status-pill-icon" />
      </span>
      <span className="status-pill-label">{config.label}</span>
    </span>
  );
}

const formatCurrency = (value: number) => {
  return `$${value.toLocaleString("en-US")}`;
};

export function AllRepairsTable({
  data,
  searchQuery = "",
  columnsState,
  selectedRowIds = new Set(),
  onSelectionChange,
  onRowClick,
}: AllRepairsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Default sort: Days in Progress DESC
  const [sortField, setSortField] = useState<SortField>("daysInProgress");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Filter by search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();
    return data.filter(
      (row) =>
        row.rrNumber.toLowerCase().includes(query) ||
        row.description.toLowerCase().includes(query) ||
        row.details.toLowerCase().includes(query) ||
        row.mfrPart.toLowerCase().includes(query) ||
        (row.customerPartNumber ?? "").toLowerCase().includes(query) ||
        row.status.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'rrNumber':
          aValue = a.rrNumber;
          bValue = b.rrNumber;
          break;
        case 'description':
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase();
          break;
        case 'mfrPart':
          aValue = a.mfrPart.toLowerCase();
          bValue = b.mfrPart.toLowerCase();
          break;
        case 'customerPartNumber':
          aValue = (a.customerPartNumber || '').toLowerCase();
          bValue = (b.customerPartNumber || '').toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'daysInProgress':
          aValue = a.daysInProgress;
          bValue = b.daysInProgress;
          break;
        case 'eta':
          aValue = a.eta;
          bValue = b.eta;
          break;
        case 'quote':
          aValue = a.quote;
          bValue = b.quote;
          break;
        default:
          return 0;
      }

      // Handle comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      } else {
        const comparison = String(aValue).localeCompare(String(bValue));
        return sortDirection === "asc" ? comparison : -comparison;
      }
    });

    return sorted;
  }, [filteredData, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  // Reset to page 1 when search, sort, or rows per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortField, sortDirection, rowsPerPage]);

  // Handle sort click: DESC -> ASC -> default (daysInProgress DESC)
  const handleSort = (field: AllRepairsColumnId) => {
    if (sortField === field) {
      // Same field: toggle direction
      if (sortDirection === "desc") {
        setSortDirection("asc");
      } else {
        // Return to default: daysInProgress DESC
        setSortField("daysInProgress");
        setSortDirection("desc");
      }
    } else {
      // New field: start with DESC
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Get sort icon for a column
  const getSortIcon = (field: AllRepairsColumnId) => {
    if (sortField !== field) {
      return <ChevronUpIcon className="orders-table-sort-icon" style={{ opacity: 0.3 }} />;
    }
    return sortDirection === "asc" ? (
      <ChevronUpIcon className="orders-table-sort-icon" />
    ) : (
      <ChevronDownIcon className="orders-table-sort-icon" />
    );
  };

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      const allIds = new Set(paginatedData.map(row => row.rrNumber));
      onSelectionChange(allIds);
    } else {
      onSelectionChange(new Set());
    }
  };

  const handleRowSelect = (rrNumber: string, checked: boolean) => {
    if (!onSelectionChange) return;
    const newSelection = new Set(selectedRowIds);
    if (checked) {
      newSelection.add(rrNumber);
    } else {
      newSelection.delete(rrNumber);
    }
    onSelectionChange(newSelection);
  };

  const isAllSelected = paginatedData.length > 0 && paginatedData.every(row => selectedRowIds.has(row.rrNumber));
  const isSomeSelected = paginatedData.some(row => selectedRowIds.has(row.rrNumber));

  // Derive active columns from state (or use default if not provided)
  const activeColumns = useMemo(() => {
    if (!columnsState) {
      // Default: all columns visible in default order
      return ALL_REPAIRS_DEFAULT_COLUMNS.filter(c => c.defaultVisible);
    }
    return columnsState.order
      .map((id) => ALL_REPAIRS_DEFAULT_COLUMNS.find((c) => c.id === id))
      .filter((c): c is typeof ALL_REPAIRS_DEFAULT_COLUMNS[0] => Boolean(c))
      .filter((c) => columnsState.visible[c.id]);
  }, [columnsState]);

  // Render cell content based on column ID
  const renderCell = (row: AllRepairsRow, columnId: string) => {
    switch (columnId) {
      case 'rrNumber':
        return (
          <span
            style={{
              color: "#2563eb",
              fontWeight: 500,
            }}
          >
            {row.rrNumber}
          </span>
        );
      case 'description':
        return (
          <div className="cell-two-line">
            <div className="cell-primary">{row.description}</div>
            <div className="cell-secondary">{row.details}</div>
          </div>
        );
      case 'mfrPart':
        return row.mfrPart;
      case 'customerPartNumber':
        return row.customerPartNumber || "—";
      case 'status':
        return <StatusBadge status={row.status} />;
      case 'daysInProgress':
        // Only show Days in Progress for "In Progress" status
        return row.status === "In Progress" ? row.daysInProgressDisplay : "—";
      case 'eta':
        // Only show ETA for "In Progress" status
        return row.status === "In Progress" ? row.eta : "—";
      case 'quote':
        return <span className="orders-table-numeric">{formatCurrency(row.quote)}</span>;
      default:
        return null;
    }
  };

  const totalColumns = activeColumns.length + (onSelectionChange ? 1 : 0);

  return (
    <div className="orders-table-wrapper">
      <table className="orders-table">
        <thead>
          <tr>
            {onSelectionChange && (
              <th className="orders-table-checkbox-header">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isSomeSelected && !isAllSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Select all rows"
                />
              </th>
            )}
            {activeColumns.map((column) => {
              const isNumeric = column.id === 'quote';
              return (
                <th
                  key={column.id}
                  className={`${isNumeric ? 'orders-table-numeric' : ''} orders-table-sortable`}
                  onClick={() => handleSort(column.id)}
                >
                  <div className="orders-table-header-content" style={isNumeric ? { justifyContent: "flex-end" } : {}}>
                    <span>{column.label}</span>
                    {getSortIcon(column.id)}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length > 0 ? (
            paginatedData.map((row, index) => {
              const isSelected = selectedRowIds.has(row.rrNumber);
              return (
              <tr
                key={`${row.rrNumber}-${index}`}
                onClick={() => onRowClick?.(row)}
                style={{ cursor: onRowClick ? "pointer" : "default" }}
                className={isSelected ? "orders-table-row-selected" : ""}
              >
                {onSelectionChange && (
                  <td className="orders-table-checkbox-cell" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedRowIds.has(row.rrNumber)}
                      onChange={(e) => handleRowSelect(row.rrNumber, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select ${row.rrNumber}`}
                    />
                  </td>
                )}
                {activeColumns.map((column) => (
                  <td
                    key={column.id}
                    className={column.id === 'quote' ? 'orders-table-numeric' : ''}
                  >
                    {renderCell(row, column.id)}
                  </td>
                ))}
              </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={totalColumns} className="orders-table-empty">
                No repairs found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {sortedData.length > 0 && (
        <div className="orders-table-footer">
          <div className="orders-table-pagination-info">
            Showing {startIndex + 1}–{Math.min(endIndex, sortedData.length)} of{" "}
            {sortedData.length} repairs
          </div>
          <div className="orders-table-pagination-controls">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", color: "#64748b", whiteSpace: "nowrap" }}>Rows per page:</span>
              <div style={{ position: "relative", zIndex: 1000 }}>
                <AppSelect
                  value={rowsPerPage.toString()}
                  options={[
                    { value: "5", label: "5" },
                    { value: "10", label: "10" },
                    { value: "25", label: "25" },
                    { value: "50", label: "50" },
                  ]}
                  onChange={(value) => {
                    const newPageSize = parseInt(value, 10);
                    setRowsPerPage(newPageSize);
                  }}
                  className="orders-table-rows-per-page-select"
                />
              </div>
            </div>
            {totalPages > 1 && (
              <>
                <button
                  type="button"
                  className="orders-table-pagination-btn"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className="orders-table-pagination-page">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  className="orders-table-pagination-btn"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

