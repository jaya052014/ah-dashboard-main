import { useState, useMemo, useEffect } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { ORDERS_MOCK } from "../data/orders";
import { filterOrdersByDateRange } from "../utils/dateRangeFilters";
import type { OrderRow, OrderStatus } from "../data/orders";
import type { DateRange } from "./DateRangeSelector";
import type { AllOrdersColumnsState } from "./allOrdersColumns";
import { ALL_ORDERS_DEFAULT_COLUMNS } from "./allOrdersColumns";
import type { AllOrdersColumnConfig } from "./allOrdersColumns";

type OrdersTableProps = {
  selectedOrgIds: string[];
  dateRange: DateRange;
  orders?: OrderRow[]; // Pre-filtered orders (if provided, uses these instead of filtering internally)
  columnsState: AllOrdersColumnsState;
  onRowClick?: (order: OrderRow) => void;
};

type SortField = "status" | "receivedDate" | null;
type SortDirection = "asc" | "desc";

const ROWS_PER_PAGE = 10;

const STATUS_ORDER: Record<OrderStatus, number> = {
  "Open": 1,
  "In Progress": 2,
  "Delayed": 3,
  "Completed": 4,
};

export function OrdersTable({ selectedOrgIds, dateRange, orders, columnsState, onRowClick }: OrdersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Filter data based on selected org and date range
  const filteredData = useMemo(() => {
    // If pre-filtered orders are provided, use those; otherwise filter internally
    let filtered = orders || ORDERS_MOCK.filter((row) => {
      // If no subsidiaries selected, show empty (Interpretation A)
      if (selectedOrgIds.length === 0) {
        return false;
      }
      // Filter by selected org IDs
      return selectedOrgIds.includes(row.orgId);
    });
    
    // Filter by date range (only if not using pre-filtered orders)
    if (!orders) {
      filtered = filterOrdersByDateRange(filtered, dateRange);
    }
    
    return filtered;
  }, [selectedOrgIds, dateRange, orders]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      if (sortField === "status") {
        const aOrder = STATUS_ORDER[a.status];
        const bOrder = STATUS_ORDER[b.status];
        return sortDirection === "asc" ? aOrder - bOrder : bOrder - aOrder;
      } else if (sortField === "receivedDate") {
        const aDate = new Date(a.receivedDate).getTime();
        const bDate = new Date(b.receivedDate).getTime();
        return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
      }
      return 0;
    });
    return sorted;
  }, [filteredData, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  // Reset to page 1 when filters or sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedOrgIds, dateRange, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined) return "—";
    return `$${value.toLocaleString("en-US")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronUpIcon className="orders-table-sort-icon" style={{ opacity: 0.3 }} />;
    }
    return sortDirection === "asc" ? (
      <ChevronUpIcon className="orders-table-sort-icon" />
    ) : (
      <ChevronDownIcon className="orders-table-sort-icon" />
    );
  };

  // Derive active columns from state
  const activeColumns = useMemo(() => {
    return columnsState.order
      .map((id) => ALL_ORDERS_DEFAULT_COLUMNS.find((c) => c.id === id))
      .filter((c): c is AllOrdersColumnConfig => Boolean(c))
      .filter((c) => columnsState.visible[c.id]);
  }, [columnsState]);

  const renderCell = (order: OrderRow, column: AllOrdersColumnConfig) => {
    switch (column.id) {
      case 'mrNumber':
        return <td key={column.id}>{order.id}</td>;
      case 'segmentRepair':
        return (
          <td key={column.id}>
            <div className="cell-two-line">
              <div className="table-cell-title">{order.segment}</div>
              <div className="table-cell-subtitle">{order.repairType}</div>
            </div>
          </td>
        );
      case 'commodity':
        return (
          <td key={column.id}>
            <div className="cell-two-line">
              <div className="table-cell-title">{order.commodityType}</div>
              <div className="table-cell-subtitle">{order.marsPart}</div>
            </div>
          </td>
        );
      case 'status':
        return (
          <td key={column.id}>
            <span className={`status-pill status-${order.status.toLowerCase().replace(/\s+/g, "-")}`}>
              {order.status}
            </span>
          </td>
        );
      case 'receivedCompleted':
        return (
          <td key={column.id}>
            <div className="cell-two-line">
              <div className="table-cell-title">Received: {formatDate(order.receivedDate)}</div>
              <div className="table-cell-subtitle">
                Completed: {order.completedDate ? formatDate(order.completedDate) : "—"}
              </div>
            </div>
          </td>
        );
      case 'poQty':
        return (
          <td key={column.id} className="orders-table-numeric">
            <div className="cell-two-line">
              <div className="table-cell-title">{order.customerPoNumber}</div>
              <div className="table-cell-subtitle">Qty: {order.qty}</div>
            </div>
          </td>
        );
      case 'sla':
        return (
          <td key={column.id}>
            <span className={`sla-pill sla-${order.slaStatus.toLowerCase().replace(/\s+/g, "-")}`}>
              {order.slaStatus}
            </span>
          </td>
        );
      case 'repairQuote':
        return (
          <td key={column.id} className="orders-table-numeric">
            <div className="cell-two-line">
              <div className="table-cell-title">Repair: {formatCurrency(order.repairPrice)}</div>
              <div className="table-cell-subtitle">Quote: {formatCurrency(order.quotePrice)}</div>
            </div>
          </td>
        );
      default:
        return null;
    }
  };

  return (
    <div className="orders-table-wrapper">
      <table className="orders-table">
        <thead>
          <tr>
            {activeColumns.map((col) => {
              const isSortable = col.id === 'status' || col.id === 'receivedCompleted';
              const sortField = col.id === 'status' ? 'status' : col.id === 'receivedCompleted' ? 'receivedDate' : null;
              const isNumeric = col.id === 'poQty' || col.id === 'repairQuote';
              return (
                <th
                  key={col.id}
                  className={
                    isNumeric
                      ? 'orders-table-numeric'
                      : isSortable
                      ? 'orders-table-sortable'
                      : ''
                  }
                  onClick={isSortable && sortField ? () => handleSort(sortField) : undefined}
                >
                  <div className="orders-table-header-content" style={isNumeric ? { justifyContent: "flex-end" } : {}}>
                    <span>{col.label}</span>
                    {isSortable && sortField ? getSortIcon(sortField) : <ChevronUpIcon className="orders-table-sort-icon" style={{ opacity: 0.3 }} />}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length > 0 ? (
            paginatedData.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? "orders-table-row-clickable" : ""}
                role={onRowClick ? "button" : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={(e) => {
                  if (onRowClick && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onRowClick(row);
                  }
                }}
              >
                {activeColumns.map((col) => renderCell(row, col))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={activeColumns.length} className="orders-table-empty">
                No orders available for the selected subsidiary.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {sortedData.length > 0 && totalPages > 1 && (
        <div className="orders-table-footer">
          <div className="orders-table-pagination-info">
            Showing {startIndex + 1}–{Math.min(endIndex, sortedData.length)} of{" "}
            {sortedData.length} orders
          </div>
          <div className="orders-table-pagination-controls">
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
          </div>
        </div>
      )}
    </div>
  );
}

