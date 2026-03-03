export type OrderStatus = "Open" | "In Progress" | "Delayed" | "Completed";

export type SlaStatus = "On Time" | "At Risk" | "Breached";

export type OrderRow = {
  id: string; // MR number / order id
  segment: string; // e.g. "Pumps"
  repairType: string; // e.g. "Overhaul"
  commodityType: string; // e.g. "Centrifugal"
  marsPart: string; // e.g. "MARS-001"
  siteName: string; // subsidiary / site (for multi-org scenarios)
  receivedDate: string; // "YYYY-MM-DD"
  completedDate?: string; // optional, undefined if not completed
  customerPoNumber: string;
  qty: number;
  status: OrderStatus;
  slaStatus: SlaStatus;
  repairPrice?: number;
  quotePrice?: number;
  orgId: string; // matches selectedOrgId from the top selector
};

// Helper to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Generate dates relative to today (within last 90 days)
function getDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return formatDate(date);
}

// Map orgId to subsidiary name
const SUBSIDIARY_NAMES: Record<string, string> = {
  sub1: "Coca-Cola Refreshments",
  sub2: "Coca-Cola FEMSA",
  sub3: "Coca-Cola HBC",
  sub4: "Coca-Cola Amatil",
  sub5: "Coca-Cola European Partners",
  sub6: "Coca-Cola Bottling Co. United",
  sub7: "Coca-Cola Consolidated",
  sub8: "Swire Coca-Cola",
};

function getSubsidiaryName(orgId: string): string {
  return SUBSIDIARY_NAMES[orgId] || "Unknown Subsidiary";
}

export const ORDERS_MOCK: OrderRow[] = [
  // Coca-Cola Refreshments (sub1) - Open orders
  { id: "MR-2024-101", segment: "Pumps", repairType: "Overhaul", commodityType: "Centrifugal", marsPart: "MARS-101", siteName: getSubsidiaryName("sub1"), receivedDate: getDate(2), customerPoNumber: "PO-20001", qty: 1, status: "Open", slaStatus: "On Time", repairPrice: 4500, quotePrice: 4800, orgId: "sub1" },
  { id: "MR-2024-102", segment: "Motors", repairType: "Rewind", commodityType: "AC Motor", marsPart: "MARS-102", siteName: getSubsidiaryName("sub1"), receivedDate: getDate(4), customerPoNumber: "PO-20002", qty: 2, status: "Open", slaStatus: "At Risk", repairPrice: 3200, quotePrice: 3500, orgId: "sub1" },
  { id: "MR-2024-103", segment: "Gearboxes", repairType: "Bearing Replacement", commodityType: "Helical", marsPart: "MARS-103", siteName: getSubsidiaryName("sub1"), receivedDate: getDate(6), customerPoNumber: "PO-20003", qty: 1, status: "Open", slaStatus: "On Time", quotePrice: 2800, orgId: "sub1" },
  
  // Subsidiary 1 - In Progress
  { id: "MR-2024-104", segment: "Valves", repairType: "Seal Replacement", commodityType: "Ball Valve", marsPart: "MARS-104", siteName: getSubsidiaryName("sub1"), receivedDate: getDate(12), customerPoNumber: "PO-20004", qty: 3, status: "In Progress", slaStatus: "On Time", repairPrice: 1800, quotePrice: 1900, orgId: "sub1" },
  { id: "MR-2024-105", segment: "Pumps", repairType: "Impeller Repair", commodityType: "Submersible", marsPart: "MARS-105", siteName: getSubsidiaryName("sub1"), receivedDate: getDate(17), customerPoNumber: "PO-20005", qty: 1, status: "In Progress", slaStatus: "At Risk", repairPrice: 2100, quotePrice: 2200, orgId: "sub1" },
  { id: "MR-2024-106", segment: "Motors", repairType: "Inspection Only", commodityType: "DC Motor", marsPart: "MARS-106", siteName: getSubsidiaryName("sub1"), receivedDate: getDate(20), customerPoNumber: "PO-20006", qty: 1, status: "In Progress", slaStatus: "On Time", repairPrice: 500, quotePrice: 550, orgId: "sub1" },
  
  // Subsidiary 1 - Delayed
  { id: "MR-2024-107", segment: "Other", repairType: "General Repair", commodityType: "Compressor", marsPart: "MARS-107", siteName: getSubsidiaryName("sub1"), receivedDate: getDate(25), customerPoNumber: "PO-20007", qty: 1, status: "Delayed", slaStatus: "Breached", repairPrice: 5500, quotePrice: 5800, orgId: "sub1" },
  { id: "MR-2024-108", segment: "Gearboxes", repairType: "Overhaul", commodityType: "Worm", marsPart: "MARS-108", siteName: getSubsidiaryName("sub1"), receivedDate: getDate(28), customerPoNumber: "PO-20008", qty: 2, status: "Delayed", slaStatus: "At Risk", repairPrice: 4200, quotePrice: 4500, orgId: "sub1" },
  
  // Subsidiary 1 - Completed
  { id: "MR-2024-109", segment: "Pumps", repairType: "Bearing Replacement", commodityType: "Centrifugal", marsPart: "MARS-109", siteName: getSubsidiaryName("sub1"), receivedDate: getDate(35), completedDate: getDate(18), customerPoNumber: "PO-20009", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 1900, orgId: "sub1" },
  { id: "MR-2024-110", segment: "Valves", repairType: "Actuator Repair", commodityType: "Control Valve", marsPart: "MARS-110", siteName: getSubsidiaryName("sub1"), receivedDate: getDate(33), completedDate: getDate(16), customerPoNumber: "PO-20010", qty: 2, status: "Completed", slaStatus: "On Time", repairPrice: 3600, orgId: "sub1" },
  { id: "MR-2024-111", segment: "Motors", repairType: "Rewind", commodityType: "AC Motor", marsPart: "MARS-111", siteName: getSubsidiaryName("sub1"), receivedDate: getDate(40), completedDate: getDate(21), customerPoNumber: "PO-20011", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 3500, orgId: "sub1" },
  
  // Subsidiary 2 - Open orders
  { id: "MR-2024-201", segment: "Pumps", repairType: "Overhaul", commodityType: "Centrifugal", marsPart: "MARS-201", siteName: getSubsidiaryName("sub2"), receivedDate: getDate(3), customerPoNumber: "PO-30001", qty: 1, status: "Open", slaStatus: "On Time", repairPrice: 4800, quotePrice: 5000, orgId: "sub2" },
  { id: "MR-2024-202", segment: "Motors", repairType: "Rewind", commodityType: "AC Motor", marsPart: "MARS-202", siteName: getSubsidiaryName("sub2"), receivedDate: getDate(5), customerPoNumber: "PO-30002", qty: 1, status: "Open", slaStatus: "At Risk", quotePrice: 3800, orgId: "sub2" },
  { id: "MR-2024-203", segment: "Gearboxes", repairType: "Bearing Replacement", commodityType: "Helical", marsPart: "MARS-203", siteName: getSubsidiaryName("sub2"), receivedDate: getDate(7), customerPoNumber: "PO-30003", qty: 1, status: "Open", slaStatus: "On Time", repairPrice: 2600, quotePrice: 2800, orgId: "sub2" },
  
  // Subsidiary 2 - In Progress
  { id: "MR-2024-204", segment: "Valves", repairType: "Seal Replacement", commodityType: "Gate Valve", marsPart: "MARS-204", siteName: getSubsidiaryName("sub2"), receivedDate: getDate(14), customerPoNumber: "PO-30004", qty: 2, status: "In Progress", slaStatus: "On Time", repairPrice: 2200, quotePrice: 2400, orgId: "sub2" },
  { id: "MR-2024-205", segment: "Pumps", repairType: "Impeller Repair", commodityType: "Submersible", marsPart: "MARS-205", siteName: getSubsidiaryName("sub2"), receivedDate: getDate(18), customerPoNumber: "PO-30005", qty: 1, status: "In Progress", slaStatus: "At Risk", repairPrice: 2400, quotePrice: 2500, orgId: "sub2" },
  
  // Subsidiary 2 - Delayed
  { id: "MR-2024-206", segment: "Other", repairType: "General Repair", commodityType: "Compressor", marsPart: "MARS-206", siteName: getSubsidiaryName("sub2"), receivedDate: getDate(26), customerPoNumber: "PO-30006", qty: 1, status: "Delayed", slaStatus: "Breached", repairPrice: 6000, quotePrice: 6200, orgId: "sub2" },
  { id: "MR-2024-207", segment: "Gearboxes", repairType: "Overhaul", commodityType: "Worm", marsPart: "MARS-207", siteName: getSubsidiaryName("sub2"), receivedDate: getDate(29), customerPoNumber: "PO-30007", qty: 1, status: "Delayed", slaStatus: "At Risk", repairPrice: 4000, quotePrice: 4200, orgId: "sub2" },
  
  // Subsidiary 2 - Completed
  { id: "MR-2024-208", segment: "Pumps", repairType: "Bearing Replacement", commodityType: "Centrifugal", marsPart: "MARS-208", siteName: getSubsidiaryName("sub2"), receivedDate: getDate(36), completedDate: getDate(17), customerPoNumber: "PO-30008", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 2100, orgId: "sub2" },
  { id: "MR-2024-209", segment: "Valves", repairType: "Actuator Repair", commodityType: "Control Valve", marsPart: "MARS-209", siteName: getSubsidiaryName("sub2"), receivedDate: getDate(34), completedDate: getDate(15), customerPoNumber: "PO-30009", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 3400, orgId: "sub2" },
  { id: "MR-2024-210", segment: "Motors", repairType: "Rewind", commodityType: "AC Motor", marsPart: "MARS-210", siteName: getSubsidiaryName("sub2"), receivedDate: getDate(41), completedDate: getDate(20), customerPoNumber: "PO-30010", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 3900, orgId: "sub2" },
  
  // Subsidiary 3 - Open orders
  { id: "MR-2024-301", segment: "Pumps", repairType: "Overhaul", commodityType: "Centrifugal", marsPart: "MARS-301", siteName: getSubsidiaryName("sub3"), receivedDate: getDate(2), customerPoNumber: "PO-40001", qty: 1, status: "Open", slaStatus: "On Time", repairPrice: 4200, quotePrice: 4400, orgId: "sub3" },
  { id: "MR-2024-302", segment: "Motors", repairType: "Rewind", commodityType: "AC Motor", marsPart: "MARS-302", siteName: getSubsidiaryName("sub3"), receivedDate: getDate(4), customerPoNumber: "PO-40002", qty: 1, status: "Open", slaStatus: "At Risk", repairPrice: 3500, quotePrice: 3700, orgId: "sub3" },
  { id: "MR-2024-303", segment: "Gearboxes", repairType: "Bearing Replacement", commodityType: "Helical", marsPart: "MARS-303", siteName: getSubsidiaryName("sub3"), receivedDate: getDate(6), customerPoNumber: "PO-40003", qty: 1, status: "Open", slaStatus: "On Time", quotePrice: 2700, orgId: "sub3" },
  
  // Subsidiary 3 - In Progress
  { id: "MR-2024-304", segment: "Valves", repairType: "Seal Replacement", commodityType: "Ball Valve", marsPart: "MARS-304", siteName: getSubsidiaryName("sub3"), receivedDate: getDate(13), customerPoNumber: "PO-40004", qty: 3, status: "In Progress", slaStatus: "On Time", repairPrice: 1900, quotePrice: 2000, orgId: "sub3" },
  { id: "MR-2024-305", segment: "Pumps", repairType: "Impeller Repair", commodityType: "Submersible", marsPart: "MARS-305", siteName: getSubsidiaryName("sub3"), receivedDate: getDate(19), customerPoNumber: "PO-40005", qty: 1, status: "In Progress", slaStatus: "At Risk", repairPrice: 2000, quotePrice: 2100, orgId: "sub3" },
  
  // Subsidiary 3 - Delayed
  { id: "MR-2024-306", segment: "Other", repairType: "General Repair", commodityType: "Compressor", marsPart: "MARS-306", siteName: getSubsidiaryName("sub3"), receivedDate: getDate(27), customerPoNumber: "PO-40006", qty: 1, status: "Delayed", slaStatus: "Breached", repairPrice: 5800, quotePrice: 6000, orgId: "sub3" },
  { id: "MR-2024-307", segment: "Gearboxes", repairType: "Overhaul", commodityType: "Worm", marsPart: "MARS-307", siteName: getSubsidiaryName("sub3"), receivedDate: getDate(30), customerPoNumber: "PO-40007", qty: 2, status: "Delayed", slaStatus: "At Risk", repairPrice: 4100, quotePrice: 4300, orgId: "sub3" },
  
  // Subsidiary 3 - Completed
  { id: "MR-2024-308", segment: "Pumps", repairType: "Bearing Replacement", commodityType: "Centrifugal", marsPart: "MARS-308", siteName: getSubsidiaryName("sub3"), receivedDate: getDate(37), completedDate: getDate(19), customerPoNumber: "PO-40008", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 1800, orgId: "sub3" },
  { id: "MR-2024-309", segment: "Valves", repairType: "Actuator Repair", commodityType: "Control Valve", marsPart: "MARS-309", siteName: getSubsidiaryName("sub3"), receivedDate: getDate(32), completedDate: getDate(14), customerPoNumber: "PO-40009", qty: 2, status: "Completed", slaStatus: "On Time", repairPrice: 3700, orgId: "sub3" },
  { id: "MR-2024-310", segment: "Motors", repairType: "Rewind", commodityType: "AC Motor", marsPart: "MARS-310", siteName: getSubsidiaryName("sub3"), receivedDate: getDate(42), completedDate: getDate(19), customerPoNumber: "PO-40010", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 3600, orgId: "sub3" },
  
  // Root/All Subsidiaries - Additional orders
  { id: "MR-2024-401", segment: "Pumps", repairType: "Overhaul", commodityType: "Centrifugal", marsPart: "MARS-401", siteName: getSubsidiaryName("sub1"), receivedDate: getDate(1), customerPoNumber: "PO-50001", qty: 1, status: "Open", slaStatus: "On Time", quotePrice: 4600, orgId: "sub1" },
  { id: "MR-2024-402", segment: "Motors", repairType: "Rewind", commodityType: "DC Motor", marsPart: "MARS-402", siteName: getSubsidiaryName("sub2"), receivedDate: getDate(8), customerPoNumber: "PO-50002", qty: 1, status: "Open", slaStatus: "At Risk", repairPrice: 3300, quotePrice: 3600, orgId: "sub2" },
  { id: "MR-2024-403", segment: "Gearboxes", repairType: "Bearing Replacement", commodityType: "Helical", marsPart: "MARS-403", siteName: getSubsidiaryName("sub3"), receivedDate: getDate(9), customerPoNumber: "PO-50003", qty: 1, status: "Open", slaStatus: "On Time", repairPrice: 2900, quotePrice: 3100, orgId: "sub3" },
  { id: "MR-2024-404", segment: "Valves", repairType: "Seal Replacement", commodityType: "Ball Valve", marsPart: "MARS-404", siteName: getSubsidiaryName("sub1"), receivedDate: getDate(11), customerPoNumber: "PO-50004", qty: 2, status: "In Progress", slaStatus: "On Time", repairPrice: 2000, quotePrice: 2100, orgId: "sub1" },
  { id: "MR-2024-405", segment: "Pumps", repairType: "Impeller Repair", commodityType: "Submersible", marsPart: "MARS-405", siteName: getSubsidiaryName("sub2"), receivedDate: getDate(10), customerPoNumber: "PO-50005", qty: 1, status: "In Progress", slaStatus: "At Risk", repairPrice: 2300, quotePrice: 2400, orgId: "sub2" },
  { id: "MR-2024-406", segment: "Other", repairType: "General Repair", commodityType: "Compressor", marsPart: "MARS-406", siteName: getSubsidiaryName("sub3"), receivedDate: getDate(32), customerPoNumber: "PO-50006", qty: 1, status: "Delayed", slaStatus: "Breached", repairPrice: 5900, quotePrice: 6100, orgId: "sub3" },
  { id: "MR-2024-407", segment: "Gearboxes", repairType: "Overhaul", commodityType: "Worm", marsPart: "MARS-407", siteName: getSubsidiaryName("sub1"), receivedDate: getDate(39), completedDate: getDate(22), customerPoNumber: "PO-50007", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 4300, orgId: "sub1" },
  { id: "MR-2024-408", segment: "Valves", repairType: "Actuator Repair", commodityType: "Control Valve", marsPart: "MARS-408", siteName: getSubsidiaryName("sub2"), receivedDate: getDate(43), completedDate: getDate(22), customerPoNumber: "PO-50008", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 3500, orgId: "sub2" },
  { id: "MR-2024-409", segment: "Motors", repairType: "Inspection Only", commodityType: "DC Motor", marsPart: "MARS-409", siteName: getSubsidiaryName("sub3"), receivedDate: getDate(44), completedDate: getDate(23), customerPoNumber: "PO-50009", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 550, orgId: "sub3" },
  { id: "MR-2024-410", segment: "Pumps", repairType: "Bearing Replacement", commodityType: "Centrifugal", marsPart: "MARS-410", siteName: getSubsidiaryName("sub1"), receivedDate: getDate(46), completedDate: getDate(24), customerPoNumber: "PO-50010", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 2000, orgId: "sub1" },
  
  // Additional orders for comprehensive 6-month dataset (16+ weeks)
  // Week 1-2 (Recent)
  { id: "MR-2024-501", segment: "Pumps", repairType: "Overhaul", commodityType: "Centrifugal", marsPart: "MARS-501", siteName: getSubsidiaryName("sub1"), receivedDate: getDate(8), completedDate: getDate(1), customerPoNumber: "PO-60001", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 4700, orgId: "sub1" },
  { id: "MR-2024-502", segment: "Motors", repairType: "Rewind", commodityType: "AC Motor", marsPart: "MARS-502", siteName: getSubsidiaryName("sub2"), receivedDate: getDate(10), completedDate: getDate(3), customerPoNumber: "PO-60002", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 3800, orgId: "sub2" },
  { id: "MR-2024-503", segment: "Gearboxes", repairType: "Bearing Replacement", commodityType: "Helical", marsPart: "MARS-503", siteName: getSubsidiaryName("sub3"), receivedDate: getDate(12), completedDate: getDate(5), customerPoNumber: "PO-60003", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 2700, orgId: "sub3" },
  { id: "MR-2024-504", segment: "Valves", repairType: "Seal Replacement", commodityType: "Ball Valve", marsPart: "MARS-504", siteName: getSubsidiaryName("sub1"), receivedDate: getDate(15), completedDate: getDate(7), customerPoNumber: "PO-60004", qty: 2, status: "Completed", slaStatus: "On Time", repairPrice: 1950, orgId: "sub1" },
  
  // Week 3-4
  { id: "MR-2024-505", segment: "Pumps", repairType: "Impeller Repair", commodityType: "Submersible", marsPart: "MARS-505", siteName: getSubsidiaryName("sub2"), receivedDate: getDate(22), completedDate: getDate(14), customerPoNumber: "PO-60005", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 2250, orgId: "sub2" },
  { id: "MR-2024-506", segment: "Motors", repairType: "Inspection Only", commodityType: "DC Motor", marsPart: "MARS-506", siteName: getSubsidiaryName("sub3"), receivedDate: getDate(24), completedDate: getDate(16), customerPoNumber: "PO-60006", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 600, orgId: "sub3" },
  { id: "MR-2024-507", segment: "Gearboxes", repairType: "Overhaul", commodityType: "Worm", marsPart: "MARS-507", siteName: getSubsidiaryName("sub1"), receivedDate: getDate(26), completedDate: getDate(18), customerPoNumber: "PO-60007", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 4100, orgId: "sub1" },
  { id: "MR-2024-508", segment: "Valves", repairType: "Actuator Repair", commodityType: "Control Valve", marsPart: "MARS-508", siteName: getSubsidiaryName("sub2"), receivedDate: getDate(28), completedDate: getDate(20), customerPoNumber: "PO-60008", qty: 2, status: "Completed", slaStatus: "On Time", repairPrice: 3550, orgId: "sub2" },
  { id: "MR-2024-509", segment: "Pumps", repairType: "Bearing Replacement", commodityType: "Centrifugal", marsPart: "MARS-509", siteName: getSubsidiaryName("sub3"), receivedDate: getDate(30), completedDate: getDate(22), customerPoNumber: "PO-60009", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 1850, orgId: "sub3" },
  
  // Week 5-6
  { id: "MR-2024-510", segment: "Motors", repairType: "Rewind", commodityType: "AC Motor", marsPart: "MARS-510", siteName: getSubsidiaryName("sub1"), receivedDate: getDate(38), completedDate: getDate(28), customerPoNumber: "PO-60010", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 3650, orgId: "sub1" },
  { id: "MR-2024-511", segment: "Gearboxes", repairType: "Bearing Replacement", commodityType: "Helical", marsPart: "MARS-511", siteName: getSubsidiaryName("sub2"), receivedDate: getDate(40), completedDate: getDate(30), customerPoNumber: "PO-60011", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 2750, orgId: "sub2" },
  { id: "MR-2024-512", segment: "Valves", repairType: "Seal Replacement", commodityType: "Gate Valve", marsPart: "MARS-512", siteName: getSubsidiaryName("sub3"), receivedDate: getDate(42), completedDate: getDate(32), customerPoNumber: "PO-60012", qty: 2, status: "Completed", slaStatus: "On Time", repairPrice: 2050, orgId: "sub3" },
  { id: "MR-2024-513", segment: "Pumps", repairType: "Overhaul", commodityType: "Centrifugal", marsPart: "MARS-513", siteName: getSubsidiaryName("sub1"), receivedDate: getDate(44), completedDate: getDate(34), customerPoNumber: "PO-60013", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 4900, orgId: "sub1" },
  { id: "MR-2024-514", segment: "Motors", repairType: "Inspection Only", commodityType: "DC Motor", marsPart: "MARS-514", siteName: getSubsidiaryName("sub2"), receivedDate: getDate(46), completedDate: getDate(36), customerPoNumber: "PO-60014", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 580, orgId: "sub2" },
  
  // Week 7-8
  { id: "MR-2024-515", segment: "Gearboxes", repairType: "Overhaul", commodityType: "Worm", marsPart: "MARS-515", siteName: getSubsidiaryName("sub3"), receivedDate: getDate(52), completedDate: getDate(40), customerPoNumber: "PO-60015", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 4150, orgId: "sub3" },
  { id: "MR-2024-516", segment: "Valves", repairType: "Actuator Repair", commodityType: "Control Valve", marsPart: "MARS-516", siteName: getSubsidiaryName("sub1"), receivedDate: getDate(54), completedDate: getDate(42), customerPoNumber: "PO-60016", qty: 2, status: "Completed", slaStatus: "On Time", repairPrice: 3600, orgId: "sub1" },
  { id: "MR-2024-517", segment: "Pumps", repairType: "Bearing Replacement", commodityType: "Centrifugal", marsPart: "MARS-517", siteName: getSubsidiaryName("sub2"), receivedDate: getDate(56), completedDate: getDate(44), customerPoNumber: "PO-60017", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 1920, orgId: "sub2" },
  { id: "MR-2024-518", segment: "Motors", repairType: "Rewind", commodityType: "AC Motor", marsPart: "MARS-518", siteName: getSubsidiaryName("sub3"), receivedDate: getDate(58), completedDate: getDate(46), customerPoNumber: "PO-60018", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 3700, orgId: "sub3" },
  { id: "MR-2024-519", segment: "Gearboxes", repairType: "Bearing Replacement", commodityType: "Helical", marsPart: "MARS-519", siteName: getSubsidiaryName("sub1"), receivedDate: getDate(60), completedDate: getDate(48), customerPoNumber: "PO-60019", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 2800, orgId: "sub1" },
  
  // Week 9-10
  { id: "MR-2024-520", segment: "Valves", repairType: "Seal Replacement", commodityType: "Ball Valve", marsPart: "MARS-520", siteName: getSubsidiaryName("sub2"), receivedDate: getDate(66), completedDate: getDate(54), customerPoNumber: "PO-60020", qty: 3, status: "Completed", slaStatus: "On Time", repairPrice: 2100, orgId: "sub2" },
  { id: "MR-2024-521", segment: "Pumps", repairType: "Impeller Repair", commodityType: "Submersible", marsPart: "MARS-521", siteName: getSubsidiaryName("sub3"), receivedDate: getDate(68), completedDate: getDate(56), customerPoNumber: "PO-60021", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 2350, orgId: "sub3" },
  { id: "MR-2024-522", segment: "Motors", repairType: "Inspection Only", commodityType: "DC Motor", marsPart: "MARS-522", siteName: getSubsidiaryName("sub1"), receivedDate: getDate(70), completedDate: getDate(58), customerPoNumber: "PO-60022", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 620, orgId: "sub1" },
  { id: "MR-2024-523", segment: "Gearboxes", repairType: "Overhaul", commodityType: "Worm", marsPart: "MARS-523", siteName: getSubsidiaryName("sub2"), receivedDate: getDate(72), completedDate: getDate(60), customerPoNumber: "PO-60023", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 4250, orgId: "sub2" },
  { id: "MR-2024-524", segment: "Valves", repairType: "Actuator Repair", commodityType: "Control Valve", marsPart: "MARS-524", siteName: getSubsidiaryName("sub3"), receivedDate: getDate(74), completedDate: getDate(62), customerPoNumber: "PO-60024", qty: 2, status: "Completed", slaStatus: "On Time", repairPrice: 3750, orgId: "sub3" },
  
  // Week 11-12
  { id: "MR-2024-525", segment: "Pumps", repairType: "Bearing Replacement", commodityType: "Centrifugal", marsPart: "MARS-525", siteName: getSubsidiaryName("sub1"), receivedDate: getDate(80), completedDate: getDate(68), customerPoNumber: "PO-60025", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 1980, orgId: "sub1" },
  { id: "MR-2024-526", segment: "Motors", repairType: "Rewind", commodityType: "AC Motor", marsPart: "MARS-526", siteName: getSubsidiaryName("sub2"), receivedDate: getDate(82), completedDate: getDate(70), customerPoNumber: "PO-60026", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 3900, orgId: "sub2" },
  { id: "MR-2024-527", segment: "Gearboxes", repairType: "Bearing Replacement", commodityType: "Helical", marsPart: "MARS-527", siteName: getSubsidiaryName("sub3"), receivedDate: getDate(84), completedDate: getDate(72), customerPoNumber: "PO-60027", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 2850, orgId: "sub3" },
  { id: "MR-2024-528", segment: "Valves", repairType: "Seal Replacement", commodityType: "Gate Valve", marsPart: "MARS-528", siteName: getSubsidiaryName("sub1"), receivedDate: getDate(86), completedDate: getDate(74), customerPoNumber: "PO-60028", qty: 2, status: "Completed", slaStatus: "On Time", repairPrice: 2150, orgId: "sub1" },
  { id: "MR-2024-529", segment: "Pumps", repairType: "Overhaul", commodityType: "Centrifugal", marsPart: "MARS-529", siteName: getSubsidiaryName("sub2"), receivedDate: getDate(88), completedDate: getDate(76), customerPoNumber: "PO-60029", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 5100, orgId: "sub2" },
  
  // Week 13-14
  { id: "MR-2024-530", segment: "Motors", repairType: "Inspection Only", commodityType: "DC Motor", marsPart: "MARS-530", siteName: getSubsidiaryName("sub3"), receivedDate: getDate(94), completedDate: getDate(82), customerPoNumber: "PO-60030", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 650, orgId: "sub3" },
  { id: "MR-2024-531", segment: "Gearboxes", repairType: "Overhaul", commodityType: "Worm", marsPart: "MARS-531", siteName: getSubsidiaryName("sub1"), receivedDate: getDate(96), completedDate: getDate(84), customerPoNumber: "PO-60031", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 4400, orgId: "sub1" },
  { id: "MR-2024-532", segment: "Valves", repairType: "Actuator Repair", commodityType: "Control Valve", marsPart: "MARS-532", siteName: getSubsidiaryName("sub2"), receivedDate: getDate(98), completedDate: getDate(86), customerPoNumber: "PO-60032", qty: 2, status: "Completed", slaStatus: "On Time", repairPrice: 3850, orgId: "sub2" },
  { id: "MR-2024-533", segment: "Pumps", repairType: "Bearing Replacement", commodityType: "Centrifugal", marsPart: "MARS-533", siteName: getSubsidiaryName("sub3"), receivedDate: getDate(100), completedDate: getDate(88), customerPoNumber: "PO-60033", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 2050, orgId: "sub3" },
  { id: "MR-2024-534", segment: "Motors", repairType: "Rewind", commodityType: "AC Motor", marsPart: "MARS-534", siteName: getSubsidiaryName("sub1"), receivedDate: getDate(102), completedDate: getDate(90), customerPoNumber: "PO-60034", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 4000, orgId: "sub1" },
  
  // Week 15-16
  { id: "MR-2024-535", segment: "Gearboxes", repairType: "Bearing Replacement", commodityType: "Helical", marsPart: "MARS-535", siteName: getSubsidiaryName("sub2"), receivedDate: getDate(108), completedDate: getDate(96), customerPoNumber: "PO-60035", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 2900, orgId: "sub2" },
  { id: "MR-2024-536", segment: "Valves", repairType: "Seal Replacement", commodityType: "Ball Valve", marsPart: "MARS-536", siteName: getSubsidiaryName("sub3"), receivedDate: getDate(110), completedDate: getDate(98), customerPoNumber: "PO-60036", qty: 3, status: "Completed", slaStatus: "On Time", repairPrice: 2200, orgId: "sub3" },
  { id: "MR-2024-537", segment: "Pumps", repairType: "Impeller Repair", commodityType: "Submersible", marsPart: "MARS-537", siteName: getSubsidiaryName("sub1"), receivedDate: getDate(112), completedDate: getDate(100), customerPoNumber: "PO-60037", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 2450, orgId: "sub1" },
  { id: "MR-2024-538", segment: "Motors", repairType: "Inspection Only", commodityType: "DC Motor", marsPart: "MARS-538", siteName: getSubsidiaryName("sub2"), receivedDate: getDate(114), completedDate: getDate(102), customerPoNumber: "PO-60038", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 680, orgId: "sub2" },
  { id: "MR-2024-539", segment: "Gearboxes", repairType: "Overhaul", commodityType: "Worm", marsPart: "MARS-539", siteName: getSubsidiaryName("sub3"), receivedDate: getDate(116), completedDate: getDate(104), customerPoNumber: "PO-60039", qty: 1, status: "Completed", slaStatus: "On Time", repairPrice: 4500, orgId: "sub3" },
  { id: "MR-2024-540", segment: "Valves", repairType: "Actuator Repair", commodityType: "Control Valve", marsPart: "MARS-540", siteName: getSubsidiaryName("sub1"), receivedDate: getDate(118), completedDate: getDate(106), customerPoNumber: "PO-60040", qty: 2, status: "Completed", slaStatus: "On Time", repairPrice: 3950, orgId: "sub1" },
  
  // Additional orders for better distribution (some with different statuses)
  { id: "MR-2024-541", segment: "Pumps", repairType: "Overhaul", commodityType: "Centrifugal", marsPart: "MARS-541", siteName: getSubsidiaryName("sub2"), receivedDate: getDate(50), customerPoNumber: "PO-60041", qty: 1, status: "In Progress", slaStatus: "On Time", repairPrice: 5200, quotePrice: 5400, orgId: "sub2" },
  { id: "MR-2024-542", segment: "Motors", repairType: "Rewind", commodityType: "AC Motor", marsPart: "MARS-542", siteName: getSubsidiaryName("sub3"), receivedDate: getDate(55), customerPoNumber: "PO-60042", qty: 1, status: "Open", slaStatus: "At Risk", quotePrice: 4200, orgId: "sub3" },
  { id: "MR-2024-543", segment: "Gearboxes", repairType: "Bearing Replacement", commodityType: "Helical", marsPart: "MARS-543", siteName: getSubsidiaryName("sub1"), receivedDate: getDate(65), customerPoNumber: "PO-60043", qty: 1, status: "Delayed", slaStatus: "Breached", repairPrice: 3100, quotePrice: 3300, orgId: "sub1" },
  { id: "MR-2024-544", segment: "Valves", repairType: "Seal Replacement", commodityType: "Ball Valve", marsPart: "MARS-544", siteName: getSubsidiaryName("sub2"), receivedDate: getDate(75), customerPoNumber: "PO-60044", qty: 2, status: "In Progress", slaStatus: "On Time", repairPrice: 2300, quotePrice: 2500, orgId: "sub2" },
  { id: "MR-2024-545", segment: "Pumps", repairType: "Impeller Repair", commodityType: "Submersible", marsPart: "MARS-545", siteName: getSubsidiaryName("sub3"), receivedDate: getDate(85), customerPoNumber: "PO-60045", qty: 1, status: "Open", slaStatus: "On Time", quotePrice: 2600, orgId: "sub3" },
  { id: "MR-2024-546", segment: "Motors", repairType: "Inspection Only", commodityType: "DC Motor", marsPart: "MARS-546", siteName: getSubsidiaryName("sub1"), receivedDate: getDate(95), customerPoNumber: "PO-60046", qty: 1, status: "Delayed", slaStatus: "At Risk", repairPrice: 720, quotePrice: 800, orgId: "sub1" },
  { id: "MR-2024-547", segment: "Gearboxes", repairType: "Overhaul", commodityType: "Worm", marsPart: "MARS-547", siteName: getSubsidiaryName("sub2"), receivedDate: getDate(105), customerPoNumber: "PO-60047", qty: 1, status: "In Progress", slaStatus: "On Time", repairPrice: 4600, quotePrice: 4800, orgId: "sub2" },
  { id: "MR-2024-548", segment: "Valves", repairType: "Actuator Repair", commodityType: "Control Valve", marsPart: "MARS-548", siteName: getSubsidiaryName("sub3"), receivedDate: getDate(115), customerPoNumber: "PO-60048", qty: 2, status: "Open", slaStatus: "At Risk", quotePrice: 4100, orgId: "sub3" },
];

