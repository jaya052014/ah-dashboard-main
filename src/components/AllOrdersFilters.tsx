import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import type { OrderFilterState, OrderFilterKey } from '../data/orderFilters';
import { orderFilterOptions } from '../data/orderFilters';

type AllOrdersFiltersProps = {
  value: OrderFilterState;
  onChange: (next: OrderFilterState) => void;
  onOpenManageColumns: () => void;
};

type FilterDropdownState = {
  [K in OrderFilterKey]?: boolean;
};

const FILTER_LABELS: Record<OrderFilterKey, string> = {
  status: 'Status',
  sla: 'SLA',
  segment: 'Segment',
  repairType: 'Repair',
  commodity: 'Commodity',
};

export function AllOrdersFilters({ value, onChange, onOpenManageColumns }: AllOrdersFiltersProps) {
  const [openDropdowns, setOpenDropdowns] = useState<FilterDropdownState>({});
  const [localSelections, setLocalSelections] = useState<Partial<Record<OrderFilterKey, string[]>>>({});
  const [dropdownSearch, setDropdownSearch] = useState<Partial<Record<OrderFilterKey, string>>>({});
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdowns({});
        setLocalSelections({});
        setDropdownSearch({});
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (key: OrderFilterKey) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    // Initialize local selection when opening
    if (!openDropdowns[key]) {
      setLocalSelections((prev) => ({
        ...prev,
        [key]: value[key] || [],
      }));
      setDropdownSearch((prev) => ({
        ...prev,
        [key]: '',
      }));
    }
  };

  const handleApply = (key: OrderFilterKey) => {
    onChange({
      ...value,
      [key]: localSelections[key] || [],
    });
    setOpenDropdowns((prev) => ({
      ...prev,
      [key]: false,
    }));
    setDropdownSearch((prev) => ({
      ...prev,
      [key]: '',
    }));
  };

  const handleClear = (key: OrderFilterKey) => {
    setLocalSelections((prev) => ({
      ...prev,
      [key]: [],
    }));
  };

  const toggleOption = (key: OrderFilterKey, option: string) => {
    setLocalSelections((prev) => {
      const current = prev[key] || [];
      const newSelection = current.includes(option)
        ? current.filter((v) => v !== option)
        : [...current, option];
      return {
        ...prev,
        [key]: newSelection,
      };
    });
  };

  const getFilteredOptions = (key: OrderFilterKey): string[] => {
    const search = dropdownSearch[key] || '';
    const options = orderFilterOptions[key];
    if (!search.trim()) return options;
    const lowerSearch = search.toLowerCase();
    return options.filter((opt) => opt.toLowerCase().includes(lowerSearch));
  };

  const hasActiveFilters = useMemo(() => {
    return (
      value.status.length > 0 ||
      value.sla.length > 0 ||
      value.segment.length > 0 ||
      value.repairType.length > 0 ||
      value.commodity.length > 0 ||
      value.search.trim().length > 0
    );
  }, [value]);

  const removeFilter = (key: OrderFilterKey, option: string) => {
    onChange({
      ...value,
      [key]: value[key].filter((v) => v !== option),
    });
  };

  const clearAllFilters = () => {
    onChange({
      status: [],
      sla: [],
      segment: [],
      repairType: [],
      commodity: [],
      search: '',
    });
  };

  const getFilterChips = () => {
    const chips: Array<{ key: OrderFilterKey; label: string; value: string }> = [];
    
    value.status.forEach((v) => chips.push({ key: 'status', label: 'Status', value: v }));
    value.sla.forEach((v) => chips.push({ key: 'sla', label: 'SLA', value: v }));
    value.segment.forEach((v) => chips.push({ key: 'segment', label: 'Segment', value: v }));
    value.repairType.forEach((v) => chips.push({ key: 'repairType', label: 'Repair', value: v }));
    value.commodity.forEach((v) => chips.push({ key: 'commodity', label: 'Commodity', value: v }));
    
    return chips;
  };

  return (
    <div ref={containerRef} className="all-orders-filters">
      {/* First row: Filter buttons + Search + Manage Columns */}
      <div className="all-orders-filters-row">
        <div className="all-orders-filters-left">
          {(Object.keys(FILTER_LABELS) as OrderFilterKey[]).map((key) => {
            const isOpen = openDropdowns[key];
            const hasSelection = value[key].length > 0;
            return (
              <div key={key} className="all-orders-filter-wrapper">
                <button
                  type="button"
                  className={`all-orders-filter-button ${isOpen ? 'all-orders-filter-button--open' : ''} ${hasSelection ? 'all-orders-filter-button--active' : ''}`}
                  onClick={() => toggleDropdown(key)}
                >
                  <span>{FILTER_LABELS[key]}</span>
                  <ChevronDownIcon className="all-orders-filter-chevron" />
                  {hasSelection && <span className="all-orders-filter-dot" />}
                </button>
                {isOpen && (
                  <div className="all-orders-filter-dropdown">
                    <div className="all-orders-filter-dropdown-search">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
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
                        value={dropdownSearch[key] || ''}
                        onChange={(e) => setDropdownSearch((prev) => ({ ...prev, [key]: e.target.value }))}
                        className="all-orders-filter-dropdown-search-input"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="all-orders-filter-dropdown-list">
                      {getFilteredOptions(key).map((option) => {
                        const isSelected = (localSelections[key] || []).includes(option);
                        return (
                          <label
                            key={option}
                            className={`all-orders-filter-dropdown-option ${isSelected ? 'all-orders-filter-dropdown-option--selected' : ''}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleOption(key, option)}
                              className="all-orders-filter-checkbox"
                            />
                            <span>{option}</span>
                          </label>
                        );
                      })}
                      {getFilteredOptions(key).length === 0 && (
                        <div className="all-orders-filter-dropdown-empty">No options found</div>
                      )}
                    </div>
                    <div className="all-orders-filter-dropdown-footer">
                      <button
                        type="button"
                        className="all-orders-filter-dropdown-clear"
                        onClick={() => handleClear(key)}
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        className="all-orders-filter-dropdown-apply"
                        onClick={() => handleApply(key)}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="all-orders-filters-right">
          <div className="all-orders-search-wrapper">
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
              placeholder="Search in orders"
              value={value.search}
              onChange={(e) => onChange({ ...value, search: e.target.value })}
              className="all-orders-search-input"
            />
          </div>
          <button
            type="button"
            className="all-orders-manage-columns-button"
            aria-label="Manage table columns"
            title="Manage table columns"
            onClick={onOpenManageColumns}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 4h12M2 8h12M2 12h12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Second row: Filter chips */}
      {hasActiveFilters && (
        <div className="all-orders-filter-chips">
          {getFilterChips().map((chip, index) => (
            <button
              key={`${chip.key}-${chip.value}-${index}`}
              type="button"
              className="all-orders-filter-chip"
              onClick={() => removeFilter(chip.key, chip.value)}
            >
              <span className="all-orders-filter-chip-label">{chip.label}: {chip.value}</span>
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
          {value.search.trim() && (
            <button
              type="button"
              className="all-orders-filter-chip"
              onClick={() => onChange({ ...value, search: '' })}
            >
              <span className="all-orders-filter-chip-label">Search: {value.search}</span>
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
          )}
          <button
            type="button"
            className="all-orders-filter-clear-all"
            onClick={clearAllFilters}
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

