import { useButtonPermissionStore } from '@/stores/modules/button-permission';

export interface OperationWidthOptions {
  basePerButton?: number;
  gap?: number;
  padding?: number;
  min?: number;
  max?: number;
  // Extra always-visible actions count (e.g., a toggle button without permission guard)
  extraFixedCount?: number;
}

// Compute an operation column width based on how many actions are allowed by permissions.
// This is a global utility that can be reused by any page.
export function computeOperationColumnWidth(codes: string[] | string, options: OperationWidthOptions = {}): number {
  const store = useButtonPermissionStore();
  const arr = Array.isArray(codes) ? codes : [codes];

  const base = options.basePerButton ?? 70; // approx width per text button
  const gap = options.gap ?? 8; // spacing between buttons
  const padding = options.padding ?? 0; // cell inner padding
  const min = options.min ?? 50; // minimum width for single short label
  const max = options.max ?? 320; // cap to avoid overly wide columns
  const extra = options.extraFixedCount ?? 0;

  const count = arr.reduce((acc, c) => (store.has(c) ? acc + 1 : acc), 0) + extra;
  if (count <= 0) return 0; // caller may choose to omit the column entirely when 0

  const raw = count * base + Math.max(0, count - 1) * gap + padding;
  return Math.max(min, Math.min(raw, max));
}

export function buildOperationColumns(
  baseColumns: any[],
  codes: string[],
  options?: OperationWidthOptions,
  extra?: { operationColKey?: string; operationTitle?: string; fixed?: 'left' | 'right' },
) {
  const width = computeOperationColumnWidth(codes, options);
  if (width > 0) {
    const col = {
      colKey: extra?.operationColKey ?? 'operation',
      title: extra?.operationTitle ?? 'Operations',
      fixed: extra?.fixed ?? 'right',
      width,
    };
    return [...baseColumns, col];
  }
  return [...baseColumns];
}
