export type AllOrdersColumnId =
  | 'mrNumber'
  | 'segmentRepair'
  | 'commodity'
  | 'status'
  | 'receivedCompleted'
  | 'poQty'
  | 'sla'
  | 'repairQuote';

export type AllOrdersColumnConfig = {
  id: AllOrdersColumnId;
  label: string;
  defaultVisible: boolean;
};

export const ALL_ORDERS_DEFAULT_COLUMNS: AllOrdersColumnConfig[] = [
  { id: 'mrNumber', label: 'MR #', defaultVisible: true },
  { id: 'segmentRepair', label: 'SEGMENT / REPAIR', defaultVisible: true },
  { id: 'commodity', label: 'COMMODITY / PART', defaultVisible: true },
  { id: 'status', label: 'STATUS', defaultVisible: true },
  { id: 'receivedCompleted', label: 'RECEIVED / COMPLETED', defaultVisible: true },
  { id: 'poQty', label: 'PO # / QTY', defaultVisible: true },
  { id: 'sla', label: 'SLA', defaultVisible: true },
  { id: 'repairQuote', label: 'REPAIR / QUOTE', defaultVisible: true },
];

export type AllOrdersColumnsState = {
  order: AllOrdersColumnId[];
  visible: Record<AllOrdersColumnId, boolean>;
};

export const getDefaultAllOrdersColumnsState = (): AllOrdersColumnsState => ({
  order: ALL_ORDERS_DEFAULT_COLUMNS.map((c) => c.id),
  visible: ALL_ORDERS_DEFAULT_COLUMNS.reduce(
    (acc, col) => ({ ...acc, [col.id]: col.defaultVisible }),
    {} as Record<AllOrdersColumnId, boolean>
  ),
});

