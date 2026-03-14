import type { RepairStatus } from "../components/tables/AllRepairsTable";
import type { ComponentType } from "react";
import {
  ClockIcon,
  InboxArrowDownIcon,
  WrenchScrewdriverIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

export interface RepairStatusConfig {
  label: string;
  shortLabel?: string;
  IconComponent: ComponentType<{ className?: string }>;
  // Color definitions for badges and KPI icons
  badgeBackground: string; // Light tinted background
  badgeTextColor: string; // Stronger text/icon color
  iconColor: string; // Color for KPI icons
}

export const REPAIR_STATUS_CONFIG: Record<RepairStatus, RepairStatusConfig> = {
  "Repair Logged": {
    label: "Logged",
    IconComponent: ClipboardDocumentIcon,
    badgeBackground: "#e0f2fe", // Cyan tint
    badgeTextColor: "#0891b2", // Cyan-600
    iconColor: "#06b6d4", // Cyan-500
  },
  "Awaiting Quote": {
    label: "Under Evaluation",
    IconComponent: ClockIcon,
    badgeBackground: "#f1f5f9", // Neutral gray-blue tint
    badgeTextColor: "#475569", // Slate-600
    iconColor: "#64748b", // Slate-500
  },
  "PO": {
    label: "Not Repairable",
    IconComponent: DocumentTextIcon,
    badgeBackground: "#e0e7ff", // Indigo tint
    badgeTextColor: "#6366f1", // Indigo-600
    iconColor: "#6366f1", // Indigo-500
  },
  "Awaiting Approval": {
    label: "Awaiting Approval",
    IconComponent: InboxArrowDownIcon,
    badgeBackground: "#fef3c7", // Amber/orange tint
    badgeTextColor: "#d97706", // Amber-600
    iconColor: "#f59e0b", // Amber-500
  },
  "In Progress": {
    label: "In Progress",
    IconComponent: WrenchScrewdriverIcon,
    badgeBackground: "#dbeafe", // Blue tint
    badgeTextColor: "#2563eb", // Blue-600
    iconColor: "#3b82f6", // Blue-500
  },
  "Completed": {
    label: "Completed",
    IconComponent: CheckCircleIcon,
    badgeBackground: "#d1fae5", // Green tint
    badgeTextColor: "#059669", // Emerald-600
    iconColor: "#10b981", // Emerald-500
  },
  "Rejected": {
    label: "Rejected",
    IconComponent: XCircleIcon,
    badgeBackground: "#fee2e2", // Red tint
    badgeTextColor: "#dc2626", // Red-600
    iconColor: "#ef4444", // Red-500
  },
  "Not Repairable": {
    label: "Warranty Recapture",
    IconComponent: ExclamationTriangleIcon,
    badgeBackground: "#f3e8ff", // Purple tint
    badgeTextColor: "#9333ea", // Purple-600
    iconColor: "#a855f7", // Purple-500
  },
  
  "LOGGED": {
    label: "Logged",
    IconComponent: ClipboardDocumentIcon,
    badgeBackground: "#e0f2fe", // Cyan tint
    badgeTextColor: "#0891b2", // Cyan-600
    iconColor: "#06b6d4", // Cyan-500
  },
  "UNDER_EVALUATION": {
    label: "Under Evaluation",
    IconComponent: ClockIcon,
    badgeBackground: "#f1f5f9", // Neutral gray-blue tint
    badgeTextColor: "#475569", // Slate-600
    iconColor: "#64748b", // Slate-500
  },
  
   "AWAITING_APPROVAL": {
    label: "Awaiting Approval",
    IconComponent: InboxArrowDownIcon,
    badgeBackground: "#fef3c7", // Amber/orange tint
    badgeTextColor: "#d97706", // Amber-600
    iconColor: "#f59e0b", // Amber-500
  },
  
  "IN_PROGRESS": {
    label: "In Progress",
    IconComponent: WrenchScrewdriverIcon,
    badgeBackground: "#dbeafe", // Blue tint
    badgeTextColor: "#2563eb", // Blue-600
    iconColor: "#3b82f6", // Blue-500
  },
  
   "COMPLETED": {
    label: "Completed",
    IconComponent: CheckCircleIcon,
    badgeBackground: "#d1fae5", // Green tint
    badgeTextColor: "#059669", // Emerald-600
    iconColor: "#10b981", // Emerald-500
  },
  "REJECTED": {
    label: "Rejected",
    IconComponent: XCircleIcon,
    badgeBackground: "#fee2e2", // Red tint
    badgeTextColor: "#dc2626", // Red-600
    iconColor: "#ef4444", // Red-500
  },
  "NOT_REPAIRABLE": {
    label: "Warranty Recapture",
    IconComponent: ExclamationTriangleIcon,
    badgeBackground: "#f3e8ff", // Purple tint
    badgeTextColor: "#9333ea", // Purple-600
    iconColor: "#a855f7", // Purple-500
  },
};

// All statuses (8 total) - ordered by lifecycle
export const ALL_STATUSES: RepairStatus[] = [
  "Repair Logged",
  "Awaiting Quote",
  "PO",
  "Awaiting Approval",
  "In Progress",
  "Completed",
  "Rejected",
  "Not Repairable",
];

// KPI statuses only (6 total, excludes "Logged")
export const KPI_STATUSES: RepairStatus[] = [
  "Awaiting Quote",
  "Awaiting Approval",
  "In Progress",
  "Completed",
  "Rejected",
  "Not Repairable",
];

export const API_STATUSES: RepairStatus[] = [
  "LOGGED",
  "UNDER_EVALUATION",  
  "AWAITING_APPROVAL",
  "IN_PROGRESS",
  "COMPLETED",
  "REJECTED",
  "NOT_REPAIRABLE",
];
