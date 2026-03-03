import type { OrderRow } from "../data/orders";
import type { DateRange } from "../components/DateRangeSelector";

export function filterByDateRange<T>(
  items: T[],
  getDate: (item: T) => Date,
  range: DateRange
): T[] {
  const { from, to } = range;
  return items.filter((item) => {
    const d = getDate(item);
    return d >= from && d <= to;
  });
}

export function filterOrdersByDateRange(orders: OrderRow[], range: DateRange): OrderRow[] {
  return filterByDateRange(orders, (order) => new Date(order.receivedDate), range);
}

export function filterRepairsByDateRange<T extends { receivedDate?: string }>(
  repairs: T[],
  range: DateRange
): T[] {
  return filterByDateRange(
    repairs,
    (repair) => {
      if (!repair.receivedDate) {
        // If no date, include it (or exclude based on your business logic)
        return new Date(); // Default to today for items without dates
      }
      return new Date(repair.receivedDate);
    },
    range
  );
}

