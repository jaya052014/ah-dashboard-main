// Mock data for Repair Trend Analysis

export type RepairTrendDataPoint = {
  date: string; // ISO date string
  count: number;
  customerGroup?: string;
  companyName?: string;
  supplier?: string;
};

// Generate mock trend data for the last 12 months
const generateTrendData = (): RepairTrendDataPoint[] => {
  const data: RepairTrendDataPoint[] = [];
  const today = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(today);
    date.setMonth(date.getMonth() - i);
    date.setDate(1); // First day of month
    
    // Generate random count between 50 and 200
    const count = Math.floor(Math.random() * 150) + 50;
    
    data.push({
      date: date.toISOString().split('T')[0],
      count,
    });
  }
  
  return data;
};

export const REPAIR_TREND_MOCK_DATA: RepairTrendDataPoint[] = generateTrendData();

// Filter options
export const CUSTOMER_GROUP_OPTIONS = [
  { value: "all", label: "All Customer Groups" },
  { value: "retail", label: "Retail" },
  { value: "wholesale", label: "Wholesale" },
  { value: "enterprise", label: "Enterprise" },
];

export const COMPANY_NAME_OPTIONS = [
  { value: "all", label: "All Companies" },
  { value: "company-a", label: "Company A" },
  { value: "company-b", label: "Company B" },
  { value: "company-c", label: "Company C" },
];

export const SUPPLIER_OPTIONS = [
  { value: "all", label: "All Suppliers" },
  { value: "supplier-1", label: "Supplier 1" },
  { value: "supplier-2", label: "Supplier 2" },
  { value: "supplier-3", label: "Supplier 3" },
];

