export type RepairStatus = 
  | "received" 
  | "under_evaluation" 
  | "waiting_approval" 
  | "in_progress" 
  | "rejected" 
  | "not_repairable" 
  | "completed";

export type CompletedSubStatus = "repairRejected" | "notRepairable" | "repairComplete";

export interface RepairCard {
  id: string;
  mrNumber: string;
  status: RepairStatus;
  completedSubStatus?: CompletedSubStatus; // only set when status === 'completed'
  dueDate: string;
  description: string;
  amount: number; // repair cost
}

export const REPAIR_CARDS_MOCK: RepairCard[] = [
  {
    id: "1",
    mrNumber: "MR-2024-001",
    status: "received",
    dueDate: "2024-01-20",
    description: "Leak detected in main valve assembly",
    amount: 125000.50,
  },
  {
    id: "2",
    mrNumber: "MR-2024-002",
    status: "under_evaluation",
    dueDate: "2024-01-22",
    description: "Motor replacement required",
    amount: 85000.25,
  },
  {
    id: "3",
    mrNumber: "MR-2024-003",
    status: "waiting_approval",
    dueDate: "2024-01-15",
    description: "Electrical system diagnostics needed",
    amount: 195989.65,
  },
  {
    id: "4",
    mrNumber: "MR-2024-004",
    status: "waiting_approval",
    dueDate: "2024-01-18",
    description: "Belt tension adjustment needed",
    amount: 45000.00,
  },
  {
    id: "5",
    mrNumber: "MR-2024-005",
    status: "waiting_approval",
    dueDate: "2024-01-20",
    description: "Routine maintenance and calibration",
    amount: 32000.50,
  },
  {
    id: "6",
    mrNumber: "MR-2024-006",
    status: "in_progress",
    dueDate: "2024-01-12",
    description: "Seal replacement and pressure testing",
    amount: 130571.19,
  },
  {
    id: "7",
    mrNumber: "MR-2024-007",
    status: "in_progress",
    dueDate: "2024-01-21",
    description: "Hydraulic system repair in progress",
    amount: 207571.69,
  },
  {
    id: "8",
    mrNumber: "MR-2024-008",
    status: "completed",
    completedSubStatus: "repairComplete",
    dueDate: "2024-01-10",
    description: "Pressure sensor calibration completed",
    amount: 125000.00,
  },
  {
    id: "9",
    mrNumber: "MR-2024-009",
    status: "completed",
    completedSubStatus: "repairComplete",
    dueDate: "2024-01-14",
    description: "Hydraulic system repair completed",
    amount: 250000.00,
  },
  {
    id: "10",
    mrNumber: "MR-2024-010",
    status: "completed",
    completedSubStatus: "repairRejected",
    dueDate: "2024-01-19",
    description: "Repair rejected due to cost exceeding threshold",
    amount: 45000.00,
  },
  {
    id: "11",
    mrNumber: "MR-2024-011",
    status: "completed",
    completedSubStatus: "notRepairable",
    dueDate: "2024-01-16",
    description: "Component beyond repair, replacement required",
    amount: 35000.00,
  },
  {
    id: "12",
    mrNumber: "MR-2024-012",
    status: "completed",
    completedSubStatus: "repairComplete",
    dueDate: "2024-01-13",
    description: "Mechanical failure resolved",
    amount: 180000.00,
  },
  {
    id: "13",
    mrNumber: "MR-2024-013",
    status: "waiting_approval",
    dueDate: "2024-01-17",
    description: "Electrical issue identified, awaiting parts",
    amount: 75000.00,
  },
  {
    id: "14",
    mrNumber: "MR-2024-014",
    status: "received",
    dueDate: "2024-01-25",
    description: "New repair request received",
    amount: 95000.00,
  },
  {
    id: "15",
    mrNumber: "MR-2024-015",
    status: "under_evaluation",
    dueDate: "2024-01-23",
    description: "Component evaluation in progress",
    amount: 110000.00,
  },
  {
    id: "16",
    mrNumber: "MR-2024-016",
    status: "rejected",
    dueDate: "2024-01-11",
    description: "Repair request rejected",
    amount: 28000.00,
  },
  {
    id: "17",
    mrNumber: "MR-2024-017",
    status: "not_repairable",
    dueDate: "2024-01-09",
    description: "Item determined warranty recapture",
    amount: 42000.00,
  },
];
