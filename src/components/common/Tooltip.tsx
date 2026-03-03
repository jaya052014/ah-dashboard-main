import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

type TooltipProps = {
  children: ReactNode;
  content: string;
  position?: "top" | "bottom";
};

export function Tooltip({ children, content, position = "top" }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0, actualPosition: position });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible || !triggerRef.current) return;

    const updatePosition = (useActualDimensions = false) => {
      if (!triggerRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const viewportPadding = 12;
      
      let tooltipHeight = 60; // Estimate
      let tooltipWidth = 240; // Estimate
      
      if (useActualDimensions && tooltipRef.current) {
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        tooltipHeight = tooltipRect.height;
        tooltipWidth = tooltipRect.width;
      }
      
      const tooltipHalfWidth = tooltipWidth / 2;

      let top = 0;
      let left = triggerRect.left + triggerRect.width / 2;
      let actualPosition = position;

      // Calculate position based on preferred position
      if (position === "top") {
        top = triggerRect.top - tooltipHeight - 8;
        // Check if tooltip would be clipped at top
        if (top < viewportPadding) {
          // Flip to bottom
          top = triggerRect.bottom + 8;
          actualPosition = "bottom";
        }
      } else {
        top = triggerRect.bottom + 8;
        // Check if tooltip would be clipped at bottom
        if (top + tooltipHeight > viewportHeight - viewportPadding) {
          // Flip to top
          top = triggerRect.top - tooltipHeight - 8;
          actualPosition = "top";
        }
      }

      // Ensure tooltip stays within viewport horizontally
      if (left - tooltipHalfWidth < viewportPadding) {
        left = viewportPadding + tooltipHalfWidth;
      } else if (left + tooltipHalfWidth > viewportWidth - viewportPadding) {
        left = viewportWidth - viewportPadding - tooltipHalfWidth;
      }

      setTooltipPosition({ top, left, actualPosition });
    };

    // Initial position calculation with estimates
    updatePosition(false);

    // Refine position after tooltip renders with actual dimensions
    const refineTimeout = setTimeout(() => {
      updatePosition(true);
    }, 0);

    const handleScroll = () => updatePosition(true);
    const handleResize = () => updatePosition(true);

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(refineTimeout);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isVisible, position]);

  const tooltipContent = isVisible && createPortal(
    <div
      ref={tooltipRef}
      className="approvals-overdue-tooltip-portal"
      style={{
        position: "fixed",
        top: `${tooltipPosition.top}px`,
        left: `${tooltipPosition.left}px`,
        transform: "translateX(-50%)",
        zIndex: 10000,
      }}
      data-position={tooltipPosition.actualPosition}
    >
      {content}
    </div>,
    document.body
  );

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        {children}
      </div>
      {tooltipContent}
    </>
  );
}
