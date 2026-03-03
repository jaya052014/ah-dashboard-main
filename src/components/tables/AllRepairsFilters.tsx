import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, TableCellsIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import type { RepairStatus, DayRangeKey } from "./AllRepairsTable";
import { REPAIR_STATUS_CONFIG, ALL_STATUSES } from "../../constants/repairStatusConfig";

type AllRepairsFiltersProps = {
  selectedStatuses: RepairStatus[];
  selectedDayRanges: DayRangeKey[];
  onStatusesChange: (statuses: RepairStatus[]) => void;
  onDayRangesChange: (ranges: DayRangeKey[]) => void;
  onManageColumns: () => void;
  onExport: (format: "xls" | "csv") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedOverdueBucket?: "sevenDaysOrLess" | "lessThanOneMonth" | "oneToThreeMonths" | "threePlusMonths" | "underOneMonth" | null;
  onOverdueBucketChange?: (bucket: "sevenDaysOrLess" | "lessThanOneMonth" | "oneToThreeMonths" | "threePlusMonths" | "underOneMonth" | null) => void;
  selectedRowIds?: Set<string>;
  allRepairsRows?: import("./AllRepairsTable").AllRepairsRow[];
  onBulkApprove?: (selectedIds: string[]) => void;
  onBulkReject?: (selectedIds: string[]) => void;
};

const STATUS_FILTER_OPTIONS: Array<{ label: string; value: RepairStatus | "ALL" }> = [
  { label: "All Statuses", value: "ALL" },
  ...ALL_STATUSES.map((status) => ({
    label: REPAIR_STATUS_CONFIG[status].label,
    value: status,
  })),
];

const DAY_FILTER_OPTIONS: Array<{ label: string; value: DayRangeKey }> = [
  { label: "All Days", value: "ALL" },
  { label: "≤ 7 days", value: "LTE_7" },
  { label: "8–30 days", value: "D8_30" },
  { label: "31–60 days", value: "D31_60" },
  { label: "61+ days", value: "GT_60" },
];

const STATUS_LABEL_MAP: Record<RepairStatus, string> = {
  "Repair Logged": REPAIR_STATUS_CONFIG["Repair Logged"].label,
  "Awaiting Quote": REPAIR_STATUS_CONFIG["Awaiting Quote"].label,
  "PO": REPAIR_STATUS_CONFIG["PO"].label,
  "Awaiting Approval": REPAIR_STATUS_CONFIG["Awaiting Approval"].label,
  "In Progress": REPAIR_STATUS_CONFIG["In Progress"].label,
  "Completed": REPAIR_STATUS_CONFIG["Completed"].label,
  "Rejected": REPAIR_STATUS_CONFIG["Rejected"].label,
  "Not Repairable": REPAIR_STATUS_CONFIG["Not Repairable"].label,
};

const DAY_RANGE_LABEL_MAP: Record<Exclude<DayRangeKey, "ALL">, string> = {
  LTE_7: "≤ 7 days",
  D8_30: "8–30 days",
  D31_60: "31–60 days",
  GT_60: "61+ days",
};


export function AllRepairsFilters({
  selectedStatuses,
  selectedDayRanges,
  onStatusesChange,
  onDayRangesChange,
  onManageColumns,
  onExport,
  searchQuery,
  onSearchChange,
  selectedOverdueBucket,
  onOverdueBucketChange,
  selectedRowIds = new Set(),
  allRepairsRows = [],
  onBulkApprove,
  onBulkReject,
}: AllRepairsFiltersProps) {
  const [openDropdowns, setOpenDropdowns] = useState<{
    status?: boolean;
    days?: boolean;
    export?: boolean;
    bulkAction?: boolean;
  }>({});
  const [localStatusSelections, setLocalStatusSelections] = useState<string[]>([]);
  const [localDaySelections, setLocalDaySelections] = useState<string[]>([]);
  const [dropdownSearch, setDropdownSearch] = useState<{
    status?: string;
    days?: string;
  }>({});
  const [isFiltersPopupOpen, setIsFiltersPopupOpen] = useState(false);
  const [localPopupStatusSelections, setLocalPopupStatusSelections] = useState<string[]>([]);
  const [localPopupDaySelections, setLocalPopupDaySelections] = useState<string[]>([]);
  const [localPopupSearch, setLocalPopupSearch] = useState<string>("");
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const bulkActionDropdownRef = useRef<HTMLDivElement>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const filtersPopupRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdowns({});
        setLocalStatusSelections([]);
        setLocalDaySelections([]);
        setDropdownSearch({});
      }
      // Also check export dropdown separately
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setOpenDropdowns((prev) => ({ ...prev, export: false }));
      }
      // Also check bulk action dropdown separately
      if (bulkActionDropdownRef.current && !bulkActionDropdownRef.current.contains(event.target as Node)) {
        setOpenDropdowns((prev) => ({ ...prev, bulkAction: false }));
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close export dropdown on ESC key
  useEffect(() => {
    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (openDropdowns.export) {
          setOpenDropdowns((prev) => ({ ...prev, export: false }));
        }
        if (openDropdowns.bulkAction) {
          setOpenDropdowns((prev) => ({ ...prev, bulkAction: false }));
        }
        if (isFiltersPopupOpen) {
          setIsFiltersPopupOpen(false);
        }
      }
    }

    if (openDropdowns.export || openDropdowns.bulkAction || isFiltersPopupOpen) {
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [openDropdowns.export, openDropdowns.bulkAction, isFiltersPopupOpen]);

  // Close filters popup on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filtersPopupRef.current && !filtersPopupRef.current.contains(event.target as Node)) {
        setIsFiltersPopupOpen(false);
      }
    }

    if (isFiltersPopupOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isFiltersPopupOpen]);

  const toggleDropdown = (key: "status" | "days") => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    // Initialize local selection when opening
    if (!openDropdowns[key]) {
      if (key === "status") {
        setLocalStatusSelections(selectedStatuses);
      } else {
        setLocalDaySelections(selectedDayRanges);
      }
      setDropdownSearch((prev) => ({
        ...prev,
        [key]: "",
      }));
    }
  };

  const handleApplyStatus = () => {
    const selections = localStatusSelections.filter((s) => s !== "ALL");
    if (selections.length === 0 || localStatusSelections.includes("ALL")) {
      onStatusesChange([]);
    } else {
      onStatusesChange(selections as RepairStatus[]);
    }
    setOpenDropdowns((prev) => ({ ...prev, status: false }));
    setDropdownSearch((prev) => ({ ...prev, status: "" }));
  };

  const handleApplyDays = () => {
    if (localDaySelections.length === 0 || localDaySelections.includes("ALL")) {
      onDayRangesChange(["ALL"]);
    } else {
      onDayRangesChange(localDaySelections as DayRangeKey[]);
    }
    setOpenDropdowns((prev) => ({ ...prev, days: false }));
    setDropdownSearch((prev) => ({ ...prev, days: "" }));
  };

  const handleClearStatus = () => {
    setLocalStatusSelections([]);
  };

  const handleClearDays = () => {
    setLocalDaySelections([]);
  };

  const toggleStatusOption = (value: string) => {
    setLocalStatusSelections((prev) => {
      if (value === "ALL") {
        return prev.includes("ALL") ? [] : ["ALL"];
      }
      const withoutAll = prev.filter((v) => v !== "ALL");
      if (withoutAll.includes(value)) {
        return withoutAll.filter((v) => v !== value);
      }
      return [...withoutAll, value];
    });
  };

  const toggleDayOption = (value: string) => {
    setLocalDaySelections((prev) => {
      if (value === "ALL") {
        return prev.includes("ALL") ? [] : ["ALL"];
      }
      const withoutAll = prev.filter((v) => v !== "ALL");
      if (withoutAll.includes(value)) {
        return withoutAll.filter((v) => v !== value);
      }
      return [...withoutAll, value];
    });
  };

  const getFilteredStatusOptions = () => {
    const search = dropdownSearch.status || "";
    if (!search.trim()) return STATUS_FILTER_OPTIONS;
    const lowerSearch = search.toLowerCase();
    return STATUS_FILTER_OPTIONS.filter((opt) =>
      opt.label.toLowerCase().includes(lowerSearch)
    );
  };

  const getFilteredDayOptions = () => {
    const search = dropdownSearch.days || "";
    if (!search.trim()) return DAY_FILTER_OPTIONS;
    const lowerSearch = search.toLowerCase();
    return DAY_FILTER_OPTIONS.filter((opt) =>
      opt.label.toLowerCase().includes(lowerSearch)
    );
  };

  const hasStatusSelection = selectedStatuses.length > 0;
  // Day selection is active if day ranges are selected OR if an overdue bucket is active
  // (overdue bucket syncs day ranges for UI consistency)
  const hasDaySelection = (selectedDayRanges.length > 0 && !selectedDayRanges.includes("ALL")) || 
    (selectedOverdueBucket !== null && selectedOverdueBucket !== undefined);
  const hasOverdueBucket = selectedOverdueBucket !== null && selectedOverdueBucket !== undefined;
  const hasAnyFilters = hasStatusSelection || hasDaySelection || hasOverdueBucket;

  const handleExportClick = (format: "xls" | "csv") => {
    onExport(format);
    setOpenDropdowns((prev) => ({ ...prev, export: false }));
  };

  // Mobile popup handlers
  const handleOpenFiltersPopup = () => {
    // Initialize local state with current values
    setLocalPopupStatusSelections(selectedStatuses);
    setLocalPopupDaySelections(selectedDayRanges);
    setLocalPopupSearch(searchQuery);
    setIsFiltersPopupOpen(true);
  };

  const handleApplyFiltersPopup = () => {
    // Apply all local selections
    const statusSelections = localPopupStatusSelections.filter((s) => s !== "ALL");
    if (statusSelections.length === 0 || localPopupStatusSelections.includes("ALL")) {
      onStatusesChange([]);
    } else {
      onStatusesChange(statusSelections as RepairStatus[]);
    }

    if (localPopupDaySelections.length === 0 || localPopupDaySelections.includes("ALL")) {
      onDayRangesChange(["ALL"]);
    } else {
      onDayRangesChange(localPopupDaySelections as DayRangeKey[]);
    }

    onSearchChange(localPopupSearch);
    setIsFiltersPopupOpen(false);
  };

  const handleCloseFiltersPopup = () => {
    // Don't apply changes, just close
    setIsFiltersPopupOpen(false);
  };

  const handleClearAllInPopup = () => {
    setLocalPopupStatusSelections([]);
    setLocalPopupDaySelections(["ALL"]);
    setLocalPopupSearch("");
  };

  const togglePopupStatusOption = (value: string) => {
    setLocalPopupStatusSelections((prev) => {
      if (value === "ALL") {
        return prev.includes("ALL") ? [] : ["ALL"];
      }
      const withoutAll = prev.filter((v) => v !== "ALL");
      if (withoutAll.includes(value)) {
        return withoutAll.filter((v) => v !== value);
      }
      return [...withoutAll, value];
    });
  };

  const togglePopupDayOption = (value: string) => {
    setLocalPopupDaySelections((prev) => {
      if (value === "ALL") {
        return prev.includes("ALL") ? [] : ["ALL"];
      }
      const withoutAll = prev.filter((v) => v !== "ALL");
      if (withoutAll.includes(value)) {
        return withoutAll.filter((v) => v !== value);
      }
      return [...withoutAll, value];
    });
  };

  return (
    <div ref={containerRef} className="all-orders-filters">
      {/* First row: Search + Filter buttons + Manage Columns + Export */}
      <div className="all-orders-filters-row">
        <div className="all-orders-filters-left">
          {/* Search */}
          <div className="all-orders-search-wrapper all-repairs-search-desktop">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="all-orders-search-icon"
            >
              <path
                d="M6.333 10.667A4.333 4.333 0 1 0 6.333 2a4.333 4.333 0 0 0 0 8.667ZM12 12l-2.35-2.35"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Search repairs"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="all-orders-search-input"
            />
          </div>

          {/* Select Action button */}
          <div ref={bulkActionDropdownRef} style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <button
              type="button"
              className="all-orders-filter-button"
              disabled={selectedRowIds.size === 0}
              onClick={() => {
                if (selectedRowIds.size > 0) {
                  setOpenDropdowns((prev) => ({ ...prev, bulkAction: !prev.bulkAction }));
                }
              }}
            >
              <span>Select Action</span>
              <ChevronDownIcon
                width={14}
                height={14}
                style={{
                  transform: openDropdowns.bulkAction ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              />
            </button>
            {/* Divider after Select Action */}
            <div className="all-orders-filter-divider" />
            {openDropdowns.bulkAction && selectedRowIds.size > 0 && (
              <div className="app-select-menu" style={{ minWidth: "160px" }}>
                {/* Calculate eligibility */}
                {(() => {
                  const selectedIds = Array.from(selectedRowIds);
                  const eligibleForApprove = selectedIds.filter(id => {
                    const repair = allRepairsRows.find(r => r.rrNumber === id);
                    return repair?.status === "Awaiting Approval";
                  });
                  const eligibleForReject = selectedIds.filter(id => {
                    const repair = allRepairsRows.find(r => r.rrNumber === id);
                    return repair?.status === "Awaiting Approval";
                  });
                  const canApprove = eligibleForApprove.length > 0;
                  const canReject = eligibleForReject.length > 0;

                  return (
                    <>
                      <button
                        type="button"
                        className={`app-select-option ${!canApprove ? "app-select-option--disabled" : ""}`}
                        disabled={!canApprove}
                        onClick={() => {
                          if (canApprove && onBulkApprove) {
                            onBulkApprove(selectedIds);
                            setOpenDropdowns((prev) => ({ ...prev, bulkAction: false }));
                          }
                        }}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className={`app-select-option ${!canReject ? "app-select-option--disabled" : ""}`}
                        disabled={!canReject}
                        onClick={() => {
                          if (canReject && onBulkReject) {
                            onBulkReject(selectedIds);
                            setOpenDropdowns((prev) => ({ ...prev, bulkAction: false }));
                          }
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        Reject
                      </button>
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Mobile: Filters button */}
          <div className="all-repairs-filters-mobile-button">
            <button
              type="button"
              className={`all-orders-filter-button ${
                hasAnyFilters ? "all-orders-filter-button--active" : ""
              }`}
              onClick={handleOpenFiltersPopup}
            >
              <span>Filters</span>
              {hasAnyFilters && <span className="all-orders-filter-dot" />}
            </button>
          </div>

          {/* Desktop: Individual filter dropdowns */}
          <div className="all-repairs-filters-desktop">
          {/* Status filter */}
          <div className="all-orders-filter-wrapper">
            <button
              type="button"
              className={`all-orders-filter-button ${
                openDropdowns.status ? "all-orders-filter-button--open" : ""
              } ${hasStatusSelection ? "all-orders-filter-button--active" : ""}`}
              onClick={() => toggleDropdown("status")}
            >
              <span>Status</span>
              <ChevronDownIcon className="all-orders-filter-chevron" />
              {hasStatusSelection && <span className="all-orders-filter-dot" />}
            </button>
            {openDropdowns.status && (
              <div className="all-orders-filter-dropdown">
                <div className="all-orders-filter-dropdown-search">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                    }}
                  >
                    <path
                      d="M6.333 10.667A4.333 4.333 0 1 0 6.333 2a4.333 4.333 0 0 0 0 8.667ZM12 12l-2.35-2.35"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={dropdownSearch.status || ""}
                    onChange={(e) =>
                      setDropdownSearch((prev) => ({ ...prev, status: e.target.value }))
                    }
                    className="all-orders-filter-dropdown-search-input"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="all-orders-filter-dropdown-list">
                  {getFilteredStatusOptions().map((option) => {
                    const isSelected = localStatusSelections.includes(option.value);
                    return (
                      <label
                        key={option.value}
                        className={`all-orders-filter-dropdown-option ${
                          isSelected ? "all-orders-filter-dropdown-option--selected" : ""
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleStatusOption(option.value)}
                          className="all-orders-filter-checkbox"
                        />
                        <span>{option.label}</span>
                      </label>
                    );
                  })}
                  {getFilteredStatusOptions().length === 0 && (
                    <div className="all-orders-filter-dropdown-empty">No options found</div>
                  )}
                </div>
                <div className="all-orders-filter-dropdown-footer">
                  <button
                    type="button"
                    className="all-orders-filter-dropdown-clear"
                    onClick={handleClearStatus}
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    className="all-orders-filter-dropdown-apply"
                    onClick={handleApplyStatus}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Days filter */}
          <div className="all-orders-filter-wrapper">
            <button
              type="button"
              className={`all-orders-filter-button ${
                openDropdowns.days ? "all-orders-filter-button--open" : ""
              } ${hasDaySelection ? "all-orders-filter-button--active" : ""}`}
              onClick={() => toggleDropdown("days")}
            >
              <span>Days in Progress</span>
              <ChevronDownIcon className="all-orders-filter-chevron" />
              {hasDaySelection && <span className="all-orders-filter-dot" />}
            </button>
            {openDropdowns.days && (
              <div className="all-orders-filter-dropdown">
                <div className="all-orders-filter-dropdown-search">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                    }}
                  >
                    <path
                      d="M6.333 10.667A4.333 4.333 0 1 0 6.333 2a4.333 4.333 0 0 0 0 8.667ZM12 12l-2.35-2.35"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={dropdownSearch.days || ""}
                    onChange={(e) =>
                      setDropdownSearch((prev) => ({ ...prev, days: e.target.value }))
                    }
                    className="all-orders-filter-dropdown-search-input"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="all-orders-filter-dropdown-list">
                  {getFilteredDayOptions().map((option) => {
                    const isSelected = localDaySelections.includes(option.value);
                    return (
                      <label
                        key={option.value}
                        className={`all-orders-filter-dropdown-option ${
                          isSelected ? "all-orders-filter-dropdown-option--selected" : ""
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleDayOption(option.value)}
                          className="all-orders-filter-checkbox"
                        />
                        <span>{option.label}</span>
                      </label>
                    );
                  })}
                  {getFilteredDayOptions().length === 0 && (
                    <div className="all-orders-filter-dropdown-empty">No options found</div>
                  )}
                </div>
                <div className="all-orders-filter-dropdown-footer">
                  <button
                    type="button"
                    className="all-orders-filter-dropdown-clear"
                    onClick={handleClearDays}
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    className="all-orders-filter-dropdown-apply"
                    onClick={handleApplyDays}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
        <div className="all-orders-filters-right">
          <button
            type="button"
            className="all-orders-manage-columns-button"
            aria-label="Manage table columns"
            title="Manage table columns"
            onClick={onManageColumns}
          >
            <TableCellsIcon style={{ width: "16px", height: "16px" }} />
          </button>
          <div className="all-orders-filter-wrapper" ref={exportDropdownRef}>
            <button
              type="button"
              className={`all-orders-manage-columns-button ${
                openDropdowns.export ? "all-orders-filter-button--open" : ""
              }`}
              aria-label="Export"
              title="Export"
              onClick={() => setOpenDropdowns((prev) => ({ ...prev, export: !prev.export }))}
            >
              <ArrowDownTrayIcon style={{ width: "16px", height: "16px" }} />
            </button>
            {openDropdowns.export && (
              <div className="app-select-menu" style={{ minWidth: "120px", right: 0, left: "auto" }}>
                <button
                  type="button"
                  className="app-select-option"
                  onClick={() => handleExportClick("xls")}
                >
                  .xls
                </button>
                <button
                  type="button"
                  className="app-select-option"
                  onClick={() => handleExportClick("csv")}
                >
                  .csv
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Second row: Filter chips */}
      {(() => {
        const hasStatusFilters = selectedStatuses.length > 0;
        const activeDayRanges = selectedDayRanges.filter(
          (r) => r !== "ALL"
        ) as Exclude<DayRangeKey, "ALL">[];
        // Day filters are considered active if either:
        // 1. There are active day ranges selected, OR
        // 2. An overdue bucket is selected (which syncs day ranges for UI)
        const hasDayFilters = activeDayRanges.length > 0 || (selectedOverdueBucket !== null && selectedOverdueBucket !== undefined);
        const hasOverdueBucket = selectedOverdueBucket !== null && selectedOverdueBucket !== undefined;
        const hasAnyFilters = hasStatusFilters || hasDayFilters || hasOverdueBucket;

        if (!hasAnyFilters) return null;

        const handleRemoveStatus = (status: RepairStatus) => {
          onStatusesChange(selectedStatuses.filter((s) => s !== status));
        };

        const handleRemoveDayRange = (range: Exclude<DayRangeKey, "ALL">) => {
          // If an overdue bucket is set, clear it when removing day ranges
          // (since overdue bucket sets specific day ranges, removing one changes the filter)
          if (hasOverdueBucket && onOverdueBucketChange) {
            onOverdueBucketChange(null);
          }
          
          const newRanges = selectedDayRanges.filter((r) => r !== range);
          if (newRanges.length === 0 || newRanges.every((r) => r === "ALL")) {
            onDayRangesChange(["ALL"]);
          } else {
            onDayRangesChange(newRanges.filter((r) => r !== "ALL") as DayRangeKey[]);
          }
        };

        const handleClearAll = () => {
          onStatusesChange([]);
          onDayRangesChange(["ALL"]);
          if (onOverdueBucketChange) {
            onOverdueBucketChange(null);
          }
        };

        return (
          <div className="all-orders-filter-chips">
            {/* Status chips */}
            {selectedStatuses.map((status) => (
              <button
                key={`status-${status}`}
                type="button"
                className="all-orders-filter-chip"
                onClick={() => handleRemoveStatus(status)}
              >
                <span className="all-orders-filter-chip-label">
                  Status: {STATUS_LABEL_MAP[status]}
                </span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="all-orders-filter-chip-close"
                >
                  <path
                    d="M9 3L3 9M3 3l6 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ))}

            {/* Days chips */}
            {activeDayRanges.map((range) => (
              <button
                key={`days-${range}`}
                type="button"
                className="all-orders-filter-chip"
                onClick={() => handleRemoveDayRange(range)}
              >
                <span className="all-orders-filter-chip-label">
                  Days in Progress: {DAY_RANGE_LABEL_MAP[range]}
                </span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="all-orders-filter-chip-close"
                >
                  <path
                    d="M9 3L3 9M3 3l6 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ))}

            {/* Clear all */}
            <button
              type="button"
              className="all-orders-filter-clear-all"
              onClick={handleClearAll}
            >
              Clear all
            </button>
          </div>
        );
      })()}

      {/* Mobile Filters Popup */}
      {isFiltersPopupOpen && (
        <div className="manage-columns-overlay">
          <div className="manage-columns-dialog" ref={filtersPopupRef} style={{ maxWidth: "90vw" }}>
            <div className="manage-columns-header">
              <div>
                <h3 className="manage-columns-title">Filters</h3>
                <p className="manage-columns-subtitle">Select filters to apply to the table.</p>
              </div>
              <button
                type="button"
                className="manage-columns-close"
                onClick={handleCloseFiltersPopup}
                aria-label="Close filters"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 5L5 15M5 5l10 10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="manage-columns-body" style={{ padding: "24px" }}>
              {/* Search */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#475569", marginBottom: "12px" }}>
                  Search
                </label>
                <div className="all-orders-search-wrapper" style={{ width: "100%" }}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="all-orders-search-icon"
                  >
                    <path
                      d="M6.333 10.667A4.333 4.333 0 1 0 6.333 2a4.333 4.333 0 0 0 0 8.667ZM12 12l-2.35-2.35"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search repairs"
                    value={localPopupSearch}
                    onChange={(e) => setLocalPopupSearch(e.target.value)}
                    className="all-orders-search-input"
                  />
                </div>
              </div>

              {/* Status filter */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#475569", marginBottom: "12px" }}>
                  Status
                </label>
                <div className="all-orders-filter-dropdown" style={{ position: "static", minWidth: "100%" }}>
                  <div className="all-orders-filter-dropdown-list" style={{ maxHeight: "200px" }}>
                    {STATUS_FILTER_OPTIONS.map((option) => {
                      const isSelected = localPopupStatusSelections.includes(option.value);
                      return (
                        <label
                          key={option.value}
                          className={`all-orders-filter-dropdown-option ${
                            isSelected ? "all-orders-filter-dropdown-option--selected" : ""
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => togglePopupStatusOption(option.value)}
                            className="all-orders-filter-checkbox"
                          />
                          <span>{option.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Days filter */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#475569", marginBottom: "12px" }}>
                  Days in Progress
                </label>
                <div className="all-orders-filter-dropdown" style={{ position: "static", minWidth: "100%" }}>
                  <div className="all-orders-filter-dropdown-list" style={{ maxHeight: "200px" }}>
                    {DAY_FILTER_OPTIONS.map((option) => {
                      const isSelected = localPopupDaySelections.includes(option.value);
                      return (
                        <label
                          key={option.value}
                          className={`all-orders-filter-dropdown-option ${
                            isSelected ? "all-orders-filter-dropdown-option--selected" : ""
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => togglePopupDayOption(option.value)}
                            className="all-orders-filter-checkbox"
                          />
                          <span>{option.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="manage-columns-footer" style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", gap: "12px" }}>
              <button
                type="button"
                className="all-orders-filter-dropdown-clear"
                onClick={handleClearAllInPopup}
                style={{ padding: "8px 16px" }}
              >
                Clear all
              </button>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className="all-orders-filter-dropdown-clear"
                  onClick={handleCloseFiltersPopup}
                  style={{ padding: "8px 16px" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="all-orders-filter-dropdown-apply"
                  onClick={handleApplyFiltersPopup}
                  style={{ padding: "8px 16px" }}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
