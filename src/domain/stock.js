import { RECORD_STATUS, STOCK_STATUS, TXN_TYPES } from './constants.js';
import { isSameLocalDay } from './dates.js';

/**
 * Single source of truth for quantities: every movement (including the Opening
 * row written when a product is created) is a transaction, and
 *   Available Stock = Opening + Stock In - Stock Out + Net Adjustments
 * is simply the sum of all signed quantity changes for the product.
 */
export function computeStockMap(transactions) {
  const map = new Map();
  for (const t of transactions) {
    map.set(t.productId, (map.get(t.productId) || 0) + t.quantityChange);
  }
  return map;
}

export function getStock(transactions, productId) {
  let total = 0;
  for (const t of transactions) if (t.productId === productId) total += t.quantityChange;
  return total;
}

export function getStockStatus(stock, reorderLevel) {
  if (stock <= 0) return STOCK_STATUS.OUT;
  if (stock <= reorderLevel) return STOCK_STATUS.LOW;
  return STOCK_STATUS.IN;
}

export const calcShortfall = (reorderLevel, stock) => Math.max(0, reorderLevel - stock);

export const calcInventoryValue = (stock, unitCost) => Math.round(stock * unitCost * 100) / 100;

/** Product rows enriched with lookups and derived stock fields (flat, sortable). */
export function buildProductViews({ products, categories, suppliers }, stockMap) {
  const cats = new Map(categories.map((c) => [c.id, c]));
  const sups = new Map(suppliers.map((s) => [s.id, s]));
  return products.map((p) => {
    const stock = stockMap.get(p.id) || 0;
    return {
      ...p,
      categoryName: cats.get(p.categoryId)?.name ?? 'Unknown',
      supplierName: sups.get(p.supplierId)?.name ?? 'Unknown',
      stock,
      stockStatus: getStockStatus(stock, p.reorderLevel),
      inventoryValue: calcInventoryValue(stock, p.unitCost),
      shortfall: calcShortfall(p.reorderLevel, stock),
    };
  });
}

/** Dashboard indicators. Inactive products are excluded from every figure (FR-012). */
export function summarizeInventory(views, categories, transactions, now = new Date()) {
  const active = views.filter((v) => v.status === RECORD_STATUS.ACTIVE);
  const today = transactions.filter(
    (t) => t.type !== TXN_TYPES.OPENING && isSameLocalDay(new Date(t.timestamp), now),
  );
  const count = (type) => today.filter((t) => t.type === type).length;

  const byCategory = categories
    .filter((c) => c.status === RECORD_STATUS.ACTIVE)
    .map((c) => ({
      name: c.name,
      units: active.filter((v) => v.categoryId === c.id).reduce((s, v) => s + v.stock, 0),
    }));

  const replenishment = active
    .filter((v) => v.stockStatus !== STOCK_STATUS.IN)
    .sort((a, b) => (a.stock === 0) !== (b.stock === 0) ? (a.stock === 0 ? -1 : 1) : b.shortfall - a.shortfall);

  return {
    totalProducts: active.length,
    totalUnits: active.reduce((s, v) => s + v.stock, 0),
    lowStock: active.filter((v) => v.stockStatus === STOCK_STATUS.LOW).length,
    outOfStock: active.filter((v) => v.stockStatus === STOCK_STATUS.OUT).length,
    inventoryValue: Math.round(active.reduce((s, v) => s + v.inventoryValue, 0) * 100) / 100,
    todayTotal: today.length,
    todayReceipts: count(TXN_TYPES.STOCK_IN),
    todayIssues: count(TXN_TYPES.STOCK_OUT),
    todayAdjustments: count(TXN_TYPES.ADJUSTMENT),
    byCategory,
    replenishment,
  };
}
