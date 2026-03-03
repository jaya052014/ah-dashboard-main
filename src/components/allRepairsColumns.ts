export type AllRepairsColumnId =
  | 'rrNumber'
  | 'description'
  | 'mfrPart'
  | 'customerPartNumber'
  | 'status'
  | 'daysInProgress'
  | 'eta'
  | 'quote';

export type AllRepairsColumnConfig = {
  id: AllRepairsColumnId;
  label: string;
  defaultVisible: boolean;
};

export const ALL_REPAIRS_DEFAULT_COLUMNS: AllRepairsColumnConfig[] = [
  { id: 'rrNumber', label: 'RR #', defaultVisible: true },
  { id: 'description', label: 'Description', defaultVisible: true },
  { id: 'mfrPart', label: 'MFR Part #', defaultVisible: true },
  { id: 'customerPartNumber', label: 'Customer Part #', defaultVisible: true },
  { id: 'status', label: 'Status', defaultVisible: true },
  { id: 'daysInProgress', label: 'Days in Progress', defaultVisible: true },
  { id: 'eta', label: 'ETA', defaultVisible: true },
  { id: 'quote', label: 'Price', defaultVisible: true },
];

export type AllRepairsColumnsState = {
  order: AllRepairsColumnId[];
  visible: Record<AllRepairsColumnId, boolean>;
};

export const getDefaultAllRepairsColumnsState = (): AllRepairsColumnsState => ({
  order: ALL_REPAIRS_DEFAULT_COLUMNS.map((c) => c.id),
  visible: ALL_REPAIRS_DEFAULT_COLUMNS.reduce(
    (acc, col) => ({ ...acc, [col.id]: col.defaultVisible }),
    {} as Record<AllRepairsColumnId, boolean>
  ),
});


