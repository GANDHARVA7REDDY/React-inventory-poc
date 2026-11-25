/**
 * Business commands. Each is a pure function:  (state, input, ...) => result
 *   success: { ok: true,  state: <new state>, changed: [<state keys to persist>], record }
 *   failure: { ok: false, errors: {field: msg}, message, code }
 * A failed command never returns a new state, so invalid forms cannot create or
 * modify records (BR-019). There is deliberately NO command that edits or deletes
 * a transaction (BR-010); rejectTransactionChange() exists only to report that.
 */
import { RECORD_STATUS, TXN_TYPES } from './constants.js';
import { getStock } from './stock.js';
import {
  hasErrors,
  isActive,
  str,
  validateAdjustment,
  validateCategory,
  validateProduct,
  validateStockIn,
  validateStockOut,
  validateSupplier,
} from './validators.js';

const fail = (errors = {}, message = 'Please correct the highlighted fields.', code = 'VALIDATION') => ({
  ok: false,
  errors,
  message,
  code,
});

export const newId = (prefix) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export function nextTransactionId(transactions) {
  let max = 0;
  for (const t of transactions) {
    const m = /^TXN-(\d+)$/.exec(t.id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `TXN-${String(max + 1).padStart(6, '0')}`;
}

function buildTransaction(state, product, now, change, fields) {
  const before = getStock(state.transactions, product.id);
  return {
    id: nextTransactionId(state.transactions),
    timestamp: now.toISOString(),
    productId: product.id,
    quantityChange: change,
    balanceAfter: before + change,
    ...fields,
  };
}

/* ------------------------------ Products ------------------------------ */

export function createProduct(state, input, now = new Date()) {
  const errors = validateProduct(input, state);
  if (hasErrors(errors)) return fail(errors);
  const opening = str(input.openingStock) === '' ? 0 : Number(str(input.openingStock));
  const product = {
    id: newId('prd'),
    code: str(input.code),
    name: str(input.name),
    categoryId: input.categoryId,
    supplierId: input.supplierId,
    description: str(input.description),
    unit: input.unit,
    unitCost: Number(str(input.unitCost)),
    openingStock: opening,
    reorderLevel: Number(str(input.reorderLevel)),
    status: input.status,
    createdAt: now.toISOString(),
  };
  const openingTxn = buildTransaction(state, { id: product.id }, now, opening, {
    type: TXN_TYPES.OPENING,
    reference: 'OPENING',
    remarks: 'Opening stock',
  });
  return {
    ok: true,
    state: {
      ...state,
      products: [...state.products, product],
      transactions: [...state.transactions, openingTxn],
    },
    changed: ['products', 'transactions'],
    record: product,
  };
}

/** Code and opening stock are immutable (BR-017): they are taken from the stored record, never the input. */
export function updateProduct(state, id, input) {
  const existing = state.products.find((p) => p.id === id);
  if (!existing) return fail({}, 'Product not found.', 'NOT_FOUND');
  const errors = validateProduct(input, { ...state, existing });
  if (hasErrors(errors)) return fail(errors);
  const updated = {
    ...existing,
    name: str(input.name),
    categoryId: input.categoryId,
    supplierId: input.supplierId,
    description: str(input.description),
    unit: input.unit,
    unitCost: Number(str(input.unitCost)),
    reorderLevel: Number(str(input.reorderLevel)),
    status: input.status,
  };
  return {
    ok: true,
    state: { ...state, products: state.products.map((p) => (p.id === id ? updated : p)) },
    changed: ['products'],
    record: updated,
  };
}

/** Deactivating never touches transactions (BR-018). */
export function setProductStatus(state, id, status) {
  const existing = state.products.find((p) => p.id === id);
  if (!existing) return fail({}, 'Product not found.', 'NOT_FOUND');
  if (status === RECORD_STATUS.ACTIVE) {
    const cat = state.categories.find((c) => c.id === existing.categoryId);
    if (!isActive(cat)) return fail({}, 'Activate the product\'s category first; it is currently inactive.', 'CATEGORY_INACTIVE');
  }
  const updated = { ...existing, status };
  return {
    ok: true,
    state: { ...state, products: state.products.map((p) => (p.id === id ? updated : p)) },
    changed: ['products'],
    record: updated,
  };
}

/* ----------------------------- Categories ----------------------------- */

export function saveCategory(state, input, id = null) {
  const existing = id ? state.categories.find((c) => c.id === id) : null;
  if (id && !existing) return fail({}, 'Category not found.', 'NOT_FOUND');
  const errors = validateCategory(input, { categories: state.categories, products: state.products, existing });
  if (hasErrors(errors)) return fail(errors);
  const record = {
    id: existing ? existing.id : newId('cat'),
    code: existing ? existing.code : str(input.code),
    name: str(input.name),
    description: str(input.description),
    status: input.status,
  };
  const categories = existing
    ? state.categories.map((c) => (c.id === id ? record : c))
    : [...state.categories, record];
  return { ok: true, state: { ...state, categories }, changed: ['categories'], record };
}

export function setCategoryStatus(state, id, status) {
  const existing = state.categories.find((c) => c.id === id);
  if (!existing) return fail({}, 'Category not found.', 'NOT_FOUND');
  const result = saveCategory(state, { ...existing, status }, id);
  if (!result.ok) return fail({}, result.errors.status || result.message, 'IN_USE');
  return result;
}

/* ----------------------------- Suppliers ------------------------------ */

export function saveSupplier(state, input, id = null) {
  const existing = id ? state.suppliers.find((s) => s.id === id) : null;
  if (id && !existing) return fail({}, 'Supplier not found.', 'NOT_FOUND');
  const errors = validateSupplier(input, { suppliers: state.suppliers, existing });
  if (hasErrors(errors)) return fail(errors);
  const record = {
    id: existing ? existing.id : newId('sup'),
    code: existing ? existing.code : str(input.code),
    name: str(input.name),
    contactPerson: str(input.contactPerson),
    email: str(input.email),
    phone: str(input.phone),
    status: input.status,
  };
  const suppliers = existing
    ? state.suppliers.map((s) => (s.id === id ? record : s))
    : [...state.suppliers, record];
  return { ok: true, state: { ...state, suppliers }, changed: ['suppliers'], record };
}

export function setSupplierStatus(state, id, status) {
  const existing = state.suppliers.find((s) => s.id === id);
  if (!existing) return fail({}, 'Supplier not found.', 'NOT_FOUND');
  return saveSupplier(state, { ...existing, status }, id);
}

/* --------------------------- Stock movements -------------------------- */

export function stockIn(state, input, now = new Date()) {
  const errors = validateStockIn(input, state);
  if (hasErrors(errors)) return fail(errors);
  const product = state.products.find((p) => p.id === input.productId);
  const qty = Number(str(input.quantity));
  const txn = buildTransaction(state, product, now, qty, {
    type: TXN_TYPES.STOCK_IN,
    reference: str(input.referenceNumber),
    remarks: str(input.remarks) || 'Stock received',
    supplierId: input.supplierId,
    unitCost: Number(str(input.unitCost)),
  });
  return { ok: true, state: { ...state, transactions: [...state.transactions, txn] }, changed: ['transactions'], record: txn };
}

export function stockOut(state, input, now = new Date()) {
  const product = state.products.find((p) => p.id === input.productId);
  const currentStock = product ? getStock(state.transactions, product.id) : 0;
  const errors = validateStockOut(input, { products: state.products, currentStock });
  if (hasErrors(errors)) return fail(errors, errors.quantity?.startsWith('Insufficient') ? errors.quantity : undefined);
  const qty = Number(str(input.quantity));
  if (currentStock - qty < 0) return fail({ quantity: 'Stock cannot become negative.' }); // BR-008 (defence in depth)
  const txn = buildTransaction(state, product, now, -qty, {
    type: TXN_TYPES.STOCK_OUT,
    reference: '',
    remarks: `${str(input.issuedTo)} (${str(input.department)}) — ${str(input.purpose)}`,
    issuedTo: str(input.issuedTo),
    department: str(input.department),
    purpose: str(input.purpose),
  });
  return { ok: true, state: { ...state, transactions: [...state.transactions, txn] }, changed: ['transactions'], record: txn };
}

export function adjustStock(state, input, now = new Date()) {
  const product = state.products.find((p) => p.id === input.productId);
  const currentStock = product ? getStock(state.transactions, product.id) : 0;
  const errors = validateAdjustment(input, { products: state.products, currentStock });
  if (hasErrors(errors)) return fail(errors);
  const actual = Number(str(input.actualStock));
  const diff = actual - currentStock;
  if (currentStock + diff < 0) return fail({ actualStock: 'Stock cannot become negative.' });
  const txn = buildTransaction(state, product, now, diff, {
    type: TXN_TYPES.ADJUSTMENT,
    reference: '',
    remarks: `${str(input.reason)} (system ${currentStock} → physical ${actual})`,
    reason: str(input.reason),
  });
  return { ok: true, state: { ...state, transactions: [...state.transactions, txn] }, changed: ['transactions'], record: txn };
}

/** BR-010 / AC-23: any attempt to edit or delete a saved transaction is refused. */
export function rejectTransactionChange() {
  return fail({}, 'Saved transactions are immutable and cannot be edited or deleted. Record an adjustment instead.', 'IMMUTABLE');
}
