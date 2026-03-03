export type OrderStage = "received" | "in_progress" | "completed";

interface OrderProgressBarProps {
  stage: OrderStage;
}

const STAGES = [
  { key: "received" as const, label: "Received" },
  { key: "in_progress" as const, label: "In Progress" },
  { key: "completed" as const, label: "Completed" },
];

const getStagePercent = (stage: OrderStage): number => {
  switch (stage) {
    case "received":
      return 33;
    case "in_progress":
      return 66;
    case "completed":
      return 100;
    default:
      return 0;
  }
};

const getStageIndex = (stage: OrderStage): number => {
  return STAGES.findIndex((s) => s.key === stage);
};

export function OrderProgressBar({ stage }: OrderProgressBarProps) {
  const percent = getStagePercent(stage);
  const currentStageIndex = getStageIndex(stage);
  const currentStageLabel = STAGES[currentStageIndex]?.label || "Received";

  // Calculate pill position, clamped to prevent overflow
  // Pill is centered on the fill edge using transform: translateX(-50%)
  // So we position it at the percent value, and CSS centers it
  // Clamp to ensure it doesn't overflow: min 2% (for left edge), max 98% (for right edge)
  const pillLeft = Math.max(2, Math.min(percent, 98));

  return (
    <div className="order-progress-bar-container">
      <div
        className="order-progress-bar-wrapper"
        role="progressbar"
        aria-label={`Order progress: ${percent}%`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div className="order-progress-bar-track">
          <div
            className="order-progress-bar-fill"
            style={{ width: `${percent}%` }}
          />
          <div
            className="order-progress-bar-pill"
            style={{ left: `${pillLeft}%` }}
          >
            {percent}%
          </div>
        </div>
      </div>
      <div className="order-progress-bar-status-label">
        {currentStageLabel}
      </div>
    </div>
  );
}

