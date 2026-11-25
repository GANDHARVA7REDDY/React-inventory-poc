import { RECORD_STATUS, STOCK_STATUS } from './constants.js';
import { endOfDay, parseDateInput, startOfDay } from './dates.js';
import { formatDateTime } from './format.js';

/** Filters shared by the Transaction History screen and the Stock Movement Report. */
export function filterTransactions(transactions, { productId = '', type = '', from = '', to = '' } = {}) {
  const fromDate = parseDateInput(from);
  const toDate = parseDateInput(to);
  const lo = fromDate ? startOfDay(fromDate).getTime() : -Infinity;
  const hi = toDate ? endOfDay(toDate).getTime() : Infinity;
  return transactions.filter((t) => {
    if (productId && t.productId !== productId) return false;
    if (type && t.type !== type) return false;
    const ts = new Date(t.timestamp).getTime();
    return ts >= lo && ts <= hi;
  });
}

export function dateRangeError(from, to) {
  const f = parseDateInput(from);
  const t = parseDateInput(to);
  return f && t && f > t ? '"From" date must not be after "To" date.' : '';
}

export function filterProductViews(views, { search = '', categoryId = '', stockStatus = '', status = '' } = {}) {
  const q = search.trim().toLowerCase();
  return views.filter((v) => {
    if (q && !v.code.toLowerCase().includes(q) && !v.name.toLowerCase().includes(q)) return false;
    if (categoryId && v.categoryId !== categoryId) return false;
    if (stockStatus && v.stockStatus !== stockStatus) return false;
    if (status && v.status !== status) return false;
    return true;
  });
}

/** Low-stock rows: active products that are Low or Out of stock (FR-012). */
export function lowStockRows(views, { categoryId = '', stockStatus = '' } = {}) {
  return filterProductViews(views, { categoryId, stockStatus, status: RECORD_STATUS.ACTIVE }).filter(
    (v) => v.stockStatus !== STOCK_STATUS.IN,
  );
}

export function movementRows(transactions, productsById, filters) {
  return filterTransactions(transactions, filters).map((t) => {
    const p = productsById.get(t.productId);
    return {
      ...t,
      productCode: p?.code ?? '?',
      productName: p?.name ?? 'Unknown product',
      productLabel: p ? `${p.code} — ${p.name}` : 'Unknown product',
    };
  });
}

/* CSV column definitions: exports use exactly the rows currently filtered on screen (BR-020). */
export const CURRENT_STOCK_COLUMNS = [
  { header: 'Product Code', value: (r) => r.code },
  { header: 'Product', value: (r) => r.name },
  { header: 'Category', value: (r) => r.categoryName },
  { header: 'Available Quantity', value: (r) => r.stock },
  { header: 'Unit Cost', value: (r) => r.unitCost },
  { header: 'Inventory Value', value: (r) => r.inventoryValue },
  { header: 'Stock Status', value: (r) => r.stockStatus },
  { header: 'Product Status', value: (r) => r.status },
];

export const MOVEMENT_COLUMNS = [
  { header: 'Transaction ID', value: (r) => r.id },
  { header: 'Product Code', value: (r) => r.productCode },
  { header: 'Product', value: (r) => r.productName },
  { header: 'Date', value: (r) => formatDateTime(r.timestamp) },
  { header: 'Transaction Type', value: (r) => r.type },
  { header: 'Quantity Change', value: (r) => r.quantityChange },
  { header: 'Balance After', value: (r) => r.balanceAfter },
  { header: 'Reference', value: (r) => r.reference },
  { header: 'Remarks', value: (r) => r.remarks },
];

export const LOW_STOCK_COLUMNS = [
  { header: 'Product Code', value: (r) => r.code },
  { header: 'Product', value: (r) => r.name },
  { header: 'Category', value: (r) => r.categoryName },
  { header: 'Available Quantity', value: (r) => r.stock },
  { header: 'Reorder Level', value: (r) => r.reorderLevel },
  { header: 'Shortfall', value: (r) => r.shortfall },
  { header: 'Stock Status', value: (r) => r.stockStatus },
];
