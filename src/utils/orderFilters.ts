import type { OrderRow } from '../data/orders';
import type { OrderFilterState } from '../data/orderFilters';

export function applyOrderFilters(all: OrderRow[], filters: OrderFilterState): OrderRow[] {
  return all.filter((order) => {
    const { status, sla, segment, repairType, commodity, search } = filters;

    if (status.length > 0 && !status.includes(order.status)) return false;
    if (sla.length > 0 && !sla.includes(order.slaStatus)) return false;
    if (segment.length > 0 && !segment.includes(order.segment)) return false;
    if (repairType.length > 0 && !repairType.includes(order.repairType)) return false;
    if (commodity.length > 0 && !commodity.includes(order.commodityType)) return false;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const haystack = [
        order.id,
        order.segment,
        order.repairType,
        order.commodityType,
        order.customerPoNumber,
        order.slaStatus,
        order.marsPart,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

