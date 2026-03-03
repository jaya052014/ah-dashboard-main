export type SearchResultType = 'report' | 'order' | 'supplier' | 'subsidiary';

export interface SearchResultItem {
  id: string;
  type: SearchResultType;
  label: string;       // Main label (e.g. "Open Orders & Repairs" or "MR-2024-105")
  description?: string; // Small helper text (e.g. "Report · Operations" or "Order · Pumps · Submersible")
  route?: string;      // Optional route we could navigate to later
}

export const GLOBAL_SEARCH_ITEMS: SearchResultItem[] = [
  // reports
  {
    id: 'report-open-orders',
    type: 'report',
    label: 'Open Orders & Repairs',
    description: 'Report · Corporate, plant & purchasing teams',
    route: '/open-orders',
  },
  {
    id: 'report-cost-savings',
    type: 'report',
    label: 'Cost Savings Report',
    description: 'Report · Cost savings & warranty recovery',
    route: '/cost-savings',
  },
  {
    id: 'report-cost-savings-subsidiary',
    type: 'report',
    label: 'Cost Savings by Subsidiary',
    description: 'Report · Breakdowns per subsidiary',
    route: '/cost-savings-by-subsidiary',
  },
  {
    id: 'report-supplier-scorecard',
    type: 'report',
    label: 'Supplier Scorecard',
    description: 'Report · Supplier performance across volume, margin, lead time',
    route: '/supplier-scorecard',
  },
  // orders (just a few demo examples)
  {
    id: 'order-mr-2024-101',
    type: 'order',
    label: 'MR-2024-101',
    description: 'Order · Pumps · Centrifugal · OPEN',
  },
  {
    id: 'order-mr-2024-106',
    type: 'order',
    label: 'MR-2024-106',
    description: 'Order · Motors · DC Motor · IN PROGRESS',
  },
  {
    id: 'order-mr-2024-102',
    type: 'order',
    label: 'MR-2024-102',
    description: 'Order · Pumps · Submersible · COMPLETED',
  },
  {
    id: 'order-mr-2024-103',
    type: 'order',
    label: 'MR-2024-103',
    description: 'Order · Motors · AC Motor · OPEN',
  },
  // suppliers
  {
    id: 'supplier-a',
    type: 'supplier',
    label: 'Supplier A',
    description: 'Supplier · High transaction volume · Strong margin',
  },
  {
    id: 'supplier-b',
    type: 'supplier',
    label: 'Supplier B',
    description: 'Supplier · Medium volume · Good on-time performance',
  },
  {
    id: 'supplier-c',
    type: 'supplier',
    label: 'Supplier C',
    description: 'Supplier · Low volume · Specialized components',
  },
  // subsidiaries
  {
    id: 'subsidiary-coca-cola-company',
    type: 'subsidiary',
    label: 'Coca-Cola Company',
    description: 'Subsidiary · All plants',
  },
  {
    id: 'subsidiary-coca-cola-refreshments',
    type: 'subsidiary',
    label: 'Coca-Cola Refreshments',
    description: 'Subsidiary · Refreshments business unit',
  },
];

