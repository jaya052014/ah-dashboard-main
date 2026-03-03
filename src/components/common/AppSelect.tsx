import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export type AppSelectOption = {
  value: string;
  label: string;
};

type AppSelectProps = {
  label?: string;
  value: string;
  options: AppSelectOption[];
  onChange: (newValue: string) => void;
  placeholder?: string;
  className?: string;
};

export function AppSelect({
  label,
  value,
  options,
  onChange,
  placeholder = "Select...",
  className = "",
}: AppSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Find the selected option's label
  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption?.label || placeholder;

  // Calculate menu position when opening (using fixed positioning for portal)
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      setMenuPosition({
        top: triggerRect.bottom + 8, // Use viewport coordinates for fixed positioning
        left: triggerRect.left,
        width: triggerRect.width,
      });
    } else {
      setMenuPosition(null);
    }
  }, [isOpen]);

  // Update position on scroll/resize
  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const updatePosition = () => {
      if (triggerRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        setMenuPosition({
          top: triggerRect.bottom + 8, // Use viewport coordinates for fixed positioning
          left: triggerRect.left,
          width: triggerRect.width,
        });
      }
    };

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    }

    if (isOpen) {
      // Use setTimeout to ensure the dropdown menu is rendered before attaching the listener
      // This prevents the click event from immediately closing the dropdown
      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        setFocusedIndex(-1);
        triggerRef.current?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev < options.length - 1 ? prev + 1 : 0;
          return next;
        });
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev > 0 ? prev - 1 : options.length - 1;
          return next;
        });
      } else if (event.key === "Enter" && focusedIndex >= 0) {
        event.preventDefault();
        const option = options[focusedIndex];
        if (option) {
          onChange(option.value);
          setIsOpen(false);
          setFocusedIndex(-1);
          triggerRef.current?.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, focusedIndex, options, onChange]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setFocusedIndex(-1);
    triggerRef.current?.focus();
  };

  return (
    <div className={`app-select ${className}`} ref={dropdownRef}>
      {label && <label className="app-select-label">{label}</label>}
      <button
        ref={triggerRef}
        type="button"
        className={`app-select-trigger ${isOpen ? "app-select-trigger--open" : ""}`}
        onClick={(e) => {
          e.stopPropagation(); // Prevent event bubbling that might trigger outside-click handler
          setIsOpen(!isOpen);
          setFocusedIndex(value ? options.findIndex((opt) => opt.value === value) : 0);
        }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        role="combobox"
      >
        <span className={!selectedOption ? "app-select-placeholder" : ""}>{displayText}</span>
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
      {isOpen && menuPosition && createPortal(
        <div
          ref={menuRef}
          className="app-select-menu"
          role="listbox"
          style={{
            position: "fixed",
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            width: `${menuPosition.width}px`,
            zIndex: 10000,
            minWidth: "160px",
          }}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isFocused = index === focusedIndex;
            return (
              <button
                key={option.value}
                type="button"
                className={`app-select-option ${isSelected ? "app-select-option--selected" : ""} ${isFocused ? "app-select-option--focused" : ""}`}
                onClick={() => handleSelect(option.value)}
                role="option"
                aria-selected={isSelected}
              >
                {option.label}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}

