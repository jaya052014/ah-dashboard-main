export type SupplierData = {
  id: string;
  name: string;
  monthlyTransactions: number[]; // 12 months
  monthlyMargin: number[]; // 12 months, as percentage
  monthlyLeadTime: number[]; // 12 months, in days
};

export const MOCK_SUPPLIERS: SupplierData[] = [
  {
    id: "supplier-1",
    name: "Supplier A",
    monthlyTransactions: [45, 52, 48, 61, 55, 58, 62, 59, 64, 57, 60, 66],
    monthlyMargin: [24.5, 25.2, 23.8, 26.1, 24.9, 25.5, 26.8, 25.3, 27.2, 24.7, 25.9, 26.5],
    monthlyLeadTime: [12, 11, 13, 10, 12, 11, 10, 12, 9, 11, 10, 9],
  },
  {
    id: "supplier-2",
    name: "Supplier B",
    monthlyTransactions: [38, 42, 40, 45, 43, 47, 50, 48, 52, 46, 49, 54],
    monthlyMargin: [22.3, 23.1, 21.9, 23.8, 22.6, 23.4, 24.2, 23.0, 24.5, 22.8, 23.6, 24.0],
    monthlyLeadTime: [15, 14, 16, 13, 15, 14, 13, 15, 12, 14, 13, 12],
  },
  {
    id: "supplier-3",
    name: "Supplier C",
    monthlyTransactions: [32, 35, 33, 38, 36, 40, 42, 39, 44, 37, 41, 46],
    monthlyMargin: [28.5, 29.2, 27.9, 30.1, 28.8, 29.6, 30.5, 29.3, 31.2, 28.7, 29.9, 30.3],
    monthlyLeadTime: [10, 9, 11, 8, 10, 9, 8, 10, 7, 9, 8, 7],
  },
  {
    id: "supplier-4",
    name: "Supplier D",
    monthlyTransactions: [28, 31, 29, 34, 32, 36, 38, 35, 40, 33, 37, 42],
    monthlyMargin: [20.5, 21.2, 19.8, 22.1, 20.9, 21.5, 22.8, 21.3, 23.2, 20.7, 21.9, 22.5],
    monthlyLeadTime: [18, 17, 19, 16, 18, 17, 16, 18, 15, 17, 16, 15],
  },
  {
    id: "supplier-5",
    name: "Supplier E",
    monthlyTransactions: [25, 28, 26, 30, 28, 32, 34, 31, 36, 29, 33, 38],
    monthlyMargin: [26.5, 27.2, 25.9, 28.1, 26.8, 27.6, 28.5, 27.3, 29.2, 26.7, 27.9, 28.3],
    monthlyLeadTime: [14, 13, 15, 12, 14, 13, 12, 14, 11, 13, 12, 11],
  },
];

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

