import type { ReactNode } from "react";

type KpiCardProps = {
  label: string;
  value: string | number;
  ytdValue?: number; // Optional YTD value to display below the main value
  trend?: string;
  amount?: number; // Optional dollar amount to display below the value
  icon?: ReactNode; // Optional icon to display next to the label
  iconBackgroundColor?: string; // Optional background color for icon container (status-specific tint)
  iconColor?: string; // Optional color for icon (status-specific)
  onClick?: () => void; // Click handler for the card
};

export function KpiCard({ label, value, ytdValue, trend, amount, icon, iconBackgroundColor, iconColor, onClick }: KpiCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value);
  };

  const cardClassName = `kpi-card${onClick ? " kpi-card--clickable" : ""}`;

  const content = (
    <>
      <div className="kpi-card-top-row">
        <div className="kpi-label">{label}</div>
        {icon && (
          <div 
            className="kpi-icon" 
            style={{
              backgroundColor: iconBackgroundColor || "rgba(37, 99, 235, 0.06)",
            }}
          >
            <span style={{ color: iconColor || "#2563eb", display: "inline-flex" }}>
              {icon}
            </span>
          </div>
        )}
      </div>
      <div className="kpi-value">{typeof value === "number" ? value.toLocaleString() : value}</div>
      {ytdValue !== undefined && (
        <div className="kpi-ytd">YTD: {ytdValue.toLocaleString()}</div>
      )}
      {amount !== undefined && (
        <div className="kpi-amount">{formatCurrency(amount)}</div>
      )}
      {trend && <div className="kpi-trend">{trend}</div>}
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={cardClassName} onClick={onClick}>
        {content}
      </button>
    );
  }

  return <article className={cardClassName}>{content}</article>;
}

