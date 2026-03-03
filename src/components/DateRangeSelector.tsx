import { useState, useRef, useEffect } from "react";

export type PresetKey = "LAST_14" | "LAST_30" | "LAST_90" | "YTD" | "CUSTOM";

export type DateRange = {
  preset: PresetKey;
  from: Date;
  to: Date;
};

type DateRangeSelectorProps = {
  value: DateRange;
  onChange: (range: DateRange) => void;
};

const PRESETS: Array<{ key: PresetKey; label: string }> = [
  { key: "LAST_14", label: "Last 14 days" },
  { key: "LAST_30", label: "Last 30 days" },
  { key: "LAST_90", label: "Last 90 days" },
  { key: "YTD", label: "Year to date" },
  { key: "CUSTOM", label: "Custom range" },
];

export function calculatePresetRange(preset: PresetKey): { from: Date; to: Date } {
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today

  switch (preset) {
    case "LAST_14": {
      const from = new Date(today);
      from.setDate(from.getDate() - 13);
      from.setHours(0, 0, 0, 0);
      return { from, to: today };
    }
    case "LAST_30": {
      const from = new Date(today);
      from.setDate(from.getDate() - 29);
      from.setHours(0, 0, 0, 0);
      return { from, to: today };
    }
    case "LAST_90": {
      const from = new Date(today);
      from.setDate(from.getDate() - 89);
      from.setHours(0, 0, 0, 0);
      return { from, to: today };
    }
    case "YTD": {
      const from = new Date(today.getFullYear(), 0, 1);
      from.setHours(0, 0, 0, 0);
      return { from, to: today };
    }
    case "CUSTOM":
      return { from: today, to: today };
    default:
      return { from: today, to: today };
  }
}

export function formatDateRange(range: DateRange): string {
  if (range.preset !== "CUSTOM") {
    const preset = PRESETS.find((p) => p.key === range.preset);
    return preset?.label || "Last 30 days";
  }
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };
  return `${formatDate(range.from)} – ${formatDate(range.to)}`;
}

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize custom dates when switching to CUSTOM preset
  useEffect(() => {
    if (value.preset === "CUSTOM") {
      const formatForInput = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };
      // Sync with current value when CUSTOM is active (only if inputs are empty or different)
      const expectedFrom = formatForInput(value.from);
      const expectedTo = formatForInput(value.to);
      if (!customFrom || !customTo || customFrom !== expectedFrom || customTo !== expectedTo) {
        setCustomFrom(expectedFrom);
        setCustomTo(expectedTo);
      }
    }
  }, [value.preset, value.from, value.to, customFrom, customTo]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [isOpen]);

  const handlePresetClick = (preset: PresetKey) => {
    if (preset === "CUSTOM") {
      onChange({ preset: "CUSTOM", from: value.from, to: value.to });
      // Don't close dropdown for custom
    } else {
      const { from, to } = calculatePresetRange(preset);
      onChange({ preset, from, to });
      setIsOpen(false);
    }
  };

  const handleApplyCustom = () => {
    if (!customFrom || !customTo) return;

    const from = new Date(customFrom);
    from.setHours(0, 0, 0, 0);
    const to = new Date(customTo);
    to.setHours(23, 59, 59, 999);

    if (from > to) {
      // Invalid range, swap them
      const temp = from;
      from.setTime(to.getTime());
      to.setTime(temp.getTime());
      to.setHours(23, 59, 59, 999);
    }

    onChange({ preset: "CUSTOM", from, to });
    setIsOpen(false);
  };

  const handleCancelCustom = () => {
    // Reset to current value
    const formatForInput = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    setCustomFrom(formatForInput(value.from));
    setCustomTo(formatForInput(value.to));
    setIsOpen(false);
  };

  return (
    <div className="date-range-selector" ref={dropdownRef}>
      <button
        type="button"
        className="date-range-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ marginRight: "6px", flexShrink: 0 }}
        >
          <path
            d="M3.33333 2.66667H4V1.33333C4 1.14924 4.14924 1 4.33333 1H5.66667C5.85076 1 6 1.14924 6 1.33333V2.66667H10V1.33333C10 1.14924 10.1492 1 10.3333 1H11.6667C11.8508 1 12 1.14924 12 1.33333V2.66667H12.6667C13.403 2.66667 14 3.26362 14 4V13.3333C14 14.0697 13.403 14.6667 12.6667 14.6667H3.33333C2.59695 14.6667 2 14.0697 2 13.3333V4C2 3.26362 2.59695 2.66667 3.33333 2.66667ZM12.6667 13.3333V6.66667H3.33333V13.3333H12.6667Z"
            fill="currentColor"
            fillOpacity="0.6"
          />
        </svg>
        <span>{formatDateRange(value)}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ marginLeft: "6px", flexShrink: 0 }}
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fillOpacity="0.6"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="date-range-selector-dropdown">
          <div className="date-range-selector-content">
            {/* LEFT COLUMN - Presets */}
            <div className="date-range-presets">
              {PRESETS.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  className={`date-range-preset ${value.preset === preset.key ? "date-range-preset--active" : ""}`}
                  onClick={() => handlePresetClick(preset.key)}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* RIGHT COLUMN - Custom Range */}
            <div className="date-range-custom">
              {value.preset === "CUSTOM" ? (
                <>
                  <div className="date-range-custom-inputs">
                    <div className="date-range-input-group">
                      <label className="date-range-input-label">From</label>
                      <input
                        type="date"
                        className="date-range-input"
                        value={customFrom}
                        onChange={(e) => setCustomFrom(e.target.value)}
                      />
                    </div>
                    <div className="date-range-input-group">
                      <label className="date-range-input-label">To</label>
                      <input
                        type="date"
                        className="date-range-input"
                        value={customTo}
                        onChange={(e) => setCustomTo(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="date-range-custom-actions">
                    <button
                      type="button"
                      className="date-range-cancel"
                      onClick={handleCancelCustom}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="date-range-apply"
                      onClick={handleApplyCustom}
                      disabled={!customFrom || !customTo}
                    >
                      Apply
                    </button>
                  </div>
                </>
              ) : (
                <div className="date-range-placeholder-text">
                  Select "Custom range" to choose specific dates
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
