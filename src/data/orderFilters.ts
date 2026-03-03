import { ORDERS_MOCK } from './orders';
import type { OrderRow } from './orders';

export type OrderFilterKey = 'status' | 'sla' | 'segment' | 'repairType' | 'commodity';

// Extract unique values from orders data, case-insensitively deduplicated
function getUniqueValues(orders: OrderRow[], field: keyof OrderRow): string[] {
  const values = new Set<string>();
  orders.forEach((order) => {
    const value = order[field];
    if (typeof value === 'string' && value.trim()) {
      values.add(value);
    }
  });
  return Array.from(values).sort();
}

export const orderFilterOptions: Record<OrderFilterKey, string[]> = {
  status: getUniqueValues(ORDERS_MOCK, 'status'),
  sla: getUniqueValues(ORDERS_MOCK, 'slaStatus'),
  segment: getUniqueValues(ORDERS_MOCK, 'segment'),
  repairType: getUniqueValues(ORDERS_MOCK, 'repairType'),
  commodity: getUniqueValues(ORDERS_MOCK, 'commodityType'),
};

export type OrderFilterState = {
  status: string[];
  sla: string[];
  segment: string[];
  repairType: string[];
  commodity: string[];
  search: string;
};

export const defaultOrderFilters: OrderFilterState = {
  status: [],
  sla: [],
  segment: [],
  repairType: [],
  commodity: [],
  search: '',
};

