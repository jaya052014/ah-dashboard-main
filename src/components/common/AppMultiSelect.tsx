import { useState, useRef, useEffect } from "react";

export type AppMultiSelectOption = {
  value: string;
  label: string;
};

type AppMultiSelectProps = {
  label?: string;
  value: string[];
  options: AppMultiSelectOption[];
  onChange: (newValue: string[]) => void;
  placeholder?: string;
  className?: string;
  selectAllLabel?: string;
  selectedLabel?: string; // Custom label for "X selected" text (e.g., "sites", "departments")
};

export function AppMultiSelect({
  label,
  value,
  options,
  onChange,
  placeholder = "Select...",
  className = "",
  selectAllLabel = "All Suppliers",
  selectedLabel = "suppliers",
}: AppMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Filter out "all" option for calculating allOptionValues (since it's handled separately)
  const individualOptions = options.filter((opt) => opt.value !== "all");
  const allOptionValues = individualOptions.map((opt) => opt.value);
  // Check if all individual options are selected (excluding "all" from count)
  const hasAllOption = options.some(opt => opt.value === "all");
  
  // Determine if "all" is selected: either "all" is in value, or all individual options are selected
  const allIndividualSelected = individualOptions.length > 0 && 
    individualOptions.every(opt => value.includes(opt.value));
  const allSelected = hasAllOption 
    ? (value.includes("all") || allIndividualSelected)
    : (value.length === options.length && options.length > 0);
  const someSelected = value.length > 0 && !allSelected;

  // Display text for trigger button
  // Handle singular/plural: if selectedLabel ends with 's', remove it for singular
  const singularLabel = selectedLabel.endsWith('s') ? selectedLabel.slice(0, -1) : selectedLabel;
  // Capitalize first letter of selectedLabel for "All X selected" text
  const capitalizedLabel = selectedLabel.charAt(0).toUpperCase() + selectedLabel.slice(1);
  const displayText = allSelected
    ? `All ${capitalizedLabel} selected`
    : someSelected
    ? `${value.length} ${value.length === 1 ? singularLabel : selectedLabel} selected`
    : placeholder;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [isOpen]);

  const handleToggleAll = () => {
    if (allSelected) {
      // Deselect all: clear everything
      onChange([]);
    } else {
      // Select all: if "all" option exists, use it; otherwise select all individual options
      if (hasAllOption) {
        // When selecting "all", we represent it as just ["all"] (not including all individual values)
        // This is the "implicit all" state - all items are selected implicitly
        onChange(["all"]);
      } else {
        onChange([...allOptionValues]);
      }
    }
  };

  const handleToggleOption = (optionValue: string) => {
    // If "all" is currently selected, clicking any option should:
    // - Remove "all"
    // - Select only that clicked option (switch to explicit selection)
    if (value.includes("all")) {
      onChange([optionValue]);
      return;
    }
    
    // Normal toggle behavior when "all" is not selected
    const valueWithoutAll = value.filter((v) => v !== "all");
    
    if (valueWithoutAll.includes(optionValue)) {
      // Unchecking: remove the option
      const newValue = valueWithoutAll.filter((v) => v !== optionValue);
      
      // If no options remain, return empty array
      onChange(newValue.length > 0 ? newValue : []);
    } else {
      // Checking: add the option
      const newValue = [...valueWithoutAll, optionValue];
      
      // Check if all individual options are now selected
      const allNowSelected = individualOptions.length > 0 && 
        individualOptions.every(opt => newValue.includes(opt.value));
      
      // If all individual options are selected, switch to "all" mode
      if (hasAllOption && allNowSelected) {
        onChange(["all"]);
      } else {
        onChange(newValue);
      }
    }
  };

  return (
    <div className={`app-select ${className}`} ref={dropdownRef}>
      {label && <label className="app-select-label">{label}</label>}
      <button
        ref={triggerRef}
        type="button"
        className={`app-select-trigger ${isOpen ? "app-select-trigger--open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        role="combobox"
      >
        <span className={!someSelected && !allSelected ? "app-select-placeholder" : ""}>
          {displayText}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            flexShrink: 0,
          }}
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="app-select-menu app-multiselect-menu" role="listbox">
          {/* Select All option */}
          <button
            type="button"
            className="app-multiselect-option app-multiselect-option--select-all"
            onClick={handleToggleAll}
            role="option"
          >
            <div className="app-multiselect-checkbox-wrapper">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => {}} // Handled by button onClick
                className="app-multiselect-checkbox"
                tabIndex={-1}
              />
            </div>
            <span className="app-multiselect-label">{selectAllLabel}</span>
          </button>

          {/* Individual options - filter out "all" option since it's handled by Select All button */}
          {options
            .filter((option) => option.value !== "all")
            .map((option) => {
              // If "all" is selected, all individual options appear selected (implicit)
              // Otherwise, check if this specific option is in the value array
              const isSelected = value.includes("all") || value.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`app-multiselect-option ${isSelected ? "app-multiselect-option--selected" : ""}`}
                  onClick={() => handleToggleOption(option.value)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="app-multiselect-checkbox-wrapper">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // Handled by button onClick
                      className="app-multiselect-checkbox"
                      tabIndex={-1}
                    />
                  </div>
                  <span className="app-multiselect-label">{option.label}</span>
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
}

