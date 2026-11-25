import test from 'node:test';
import assert from 'node:assert/strict';

import { RECORD_STATUS, STOCK_STATUS, STORAGE_KEYS, TXN_TYPES } from '../src/domain/constants.js';
import { generateSeedData } from '../src/domain/seed.js';
import {
  adjustStock, createProduct, rejectTransactionChange, saveCategory, saveSupplier,
  setCategoryStatus, setProductStatus, stockIn, stockOut, updateProduct,
} from '../src/domain/commands.js';
import {
  buildProductViews, calcInventoryValue, calcShortfall, computeStockMap, getStockStatus, summarizeInventory,
} from '../src/domain/stock.js';
import { filterProductViews, filterTransactions, lowStockRows, CURRENT_STOCK_COLUMNS, movementRows, MOVEMENT_COLUMNS } from '../src/domain/reports.js';
import { toCsv } from '../src/domain/csv.js';
import { createStorage, entriesFromState } from '../src/services/storage.js';

const NOW = new Date('2026-11-24T10:00:00');
const fresh = () => generateSeedData(NOW);
const find = (s, code) => s.products.find((p) => p.code === code);
const stockOf = (s, code) => computeStockMap(s.transactions).get(find(s, code).id) || 0;
const must = (r) => { assert.equal(r.ok, true, JSON.stringify(r.errors || r.message)); return r.state; };

const validProduct = (s, over = {}) => ({
  code: 'NEW-001', name: 'Test Product', categoryId: s.categories[0].id, supplierId: s.suppliers[0].id,
  description: '', unit: 'Pieces', unitCost: '100', openingStock: '10', reorderLevel: '3', status: 'Active', ...over,
});

class MemoryStorage {
  constructor() { this.m = new Map(); this.failAfter = Infinity; this.writes = 0; }
  getItem(k) { return this.m.has(k) ? this.m.get(k) : null; }
  setItem(k, v) { if (++this.writes > this.failAfter) { this.failAfter = Infinity; throw Object.assign(new Error('quota'), { name: 'QuotaExceededError' }); } this.m.set(k, String(v)); }
  removeItem(k) { this.m.delete(k); }
}

/* ------------------------------ Seed data ------------------------------ */

test('AC-01 seed meets minimums: 20 products, 5 categories, 5 suppliers, 30 movements', () => {
  const s = fresh();
  assert.ok(s.products.length >= 20);
  assert.equal(s.categories.length, 5);
  assert.equal(s.suppliers.length, 5);
  assert.ok(s.transactions.filter((t) => t.type !== TXN_TYPES.OPENING).length >= 30);
});

test('seed data is internally consistent (opening rows, running balances, never negative, unique ids)', () => {
  const s = fresh();
  assert.equal(new Set(s.transactions.map((t) => t.id)).size, s.transactions.length);
  assert.equal(new Set(s.products.map((p) => p.code)).size, s.products.length);
  const running = new Map();
  const ordered = [...s.transactions].sort((a, b) => a.id.localeCompare(b.id));
  for (let i = 1; i < ordered.length; i++) assert.ok(ordered[i].timestamp >= ordered[i - 1].timestamp, 'ids follow time order');
  for (const t of ordered) {
    const bal = (running.get(t.productId) || 0) + t.quantityChange;
    assert.equal(t.balanceAfter, bal);
    assert.ok(bal >= 0);
    running.set(t.productId, bal);
  }
  for (const p of s.products) {
    const opening = s.transactions.find((t) => t.productId === p.id && t.type === TXN_TYPES.OPENING);
    assert.equal(opening.quantityChange, p.openingStock);
  }
});

test('seed covers every stock status for demos', () => {
  const s = fresh();
  const views = buildProductViews(s, computeStockMap(s.transactions));
  const statuses = new Set(views.map((v) => v.stockStatus));
  assert.ok(statuses.has(STOCK_STATUS.IN) && statuses.has(STOCK_STATUS.LOW) && statuses.has(STOCK_STATUS.OUT));
});

/* ----------------------------- Calculations ---------------------------- */

test('spec example: 20 + 15 - 8 - 2 = 25', () => {
  let s = must(createProduct(fresh(), validProduct(fresh(), { openingStock: '20' }), NOW));
  s = must(stockIn(s, { productId: find(s, 'NEW-001').id, supplierId: s.suppliers[0].id, quantity: '15', unitCost: '100' }, NOW));
  s = must(stockOut(s, { productId: find(s, 'NEW-001').id, quantity: '8', issuedTo: 'A', department: 'B', purpose: 'C' }, NOW));
  s = must(adjustStock(s, { productId: find(s, 'NEW-001').id, actualStock: '25', reason: 'Count' }, NOW));
  assert.equal(stockOf(s, 'NEW-001'), 25);
});

test('status thresholds, shortfall and inventory value', () => {
  assert.equal(getStockStatus(0, 5), STOCK_STATUS.OUT);
  assert.equal(getStockStatus(1, 5), STOCK_STATUS.LOW);
  assert.equal(getStockStatus(5, 5), STOCK_STATUS.LOW);
  assert.equal(getStockStatus(6, 5), STOCK_STATUS.IN);
  assert.equal(getStockStatus(0, 0), STOCK_STATUS.OUT);
  assert.equal(getStockStatus(1, 0), STOCK_STATUS.IN);
  assert.equal(calcShortfall(10, 3), 7);
  assert.equal(calcShortfall(3, 10), 0);
  assert.equal(calcInventoryValue(12, 650.5), 7806);
});

/* ------------------------------- Products ------------------------------ */

test('AC-02 valid product is added with an opening transaction', () => {
  const s0 = fresh();
  const s = must(createProduct(s0, validProduct(s0), NOW));
  assert.equal(s.products.length, s0.products.length + 1);
  assert.equal(stockOf(s, 'NEW-001'), 10);
  const t = s.transactions.at(-1);
  assert.equal(t.type, TXN_TYPES.OPENING);
  assert.equal(t.balanceAfter, 10);
});

test('AC-03 duplicate product code is rejected (case-insensitive) and nothing is saved', () => {
  const s0 = fresh();
  const r = createProduct(s0, validProduct(s0, { code: 'lap-001' }), NOW);
  assert.equal(r.ok, false);
  assert.match(r.errors.code, /already exists/);
});

test('AC-04 / BR-019 missing required fields give errors and no state', () => {
  const s0 = fresh();
  const r = createProduct(s0, { code: '', name: '', categoryId: '', supplierId: '', unit: '', unitCost: '', reorderLevel: '', status: '' }, NOW);
  assert.equal(r.ok, false);
  for (const f of ['code', 'name', 'categoryId', 'supplierId', 'unit', 'unitCost', 'reorderLevel']) assert.ok(r.errors[f], f);
  assert.equal(r.state, undefined);
});

test('product field validation rules', () => {
  const s = fresh();
  const bad = (over) => createProduct(s, validProduct(s, over), NOW);
  assert.ok(bad({ code: 'X'.repeat(21) }).errors.code);
  assert.ok(bad({ name: 'ab' }).errors.name);
  assert.ok(bad({ name: 'x'.repeat(101) }).errors.name);
  assert.ok(bad({ description: 'x'.repeat(501) }).errors.description);
  assert.ok(bad({ unitCost: '0' }).errors.unitCost);
  assert.ok(bad({ unitCost: '-5' }).errors.unitCost);
  assert.ok(bad({ openingStock: '-1' }).errors.openingStock);
  assert.ok(bad({ openingStock: '2.5' }).errors.openingStock);
  assert.ok(bad({ reorderLevel: '-1' }).errors.reorderLevel);
});

test('AC-05 / BR-017 edit updates the record but never code or opening stock', () => {
  const s0 = fresh();
  const p = find(s0, 'LAP-001');
  const s = must(updateProduct(s0, p.id, { ...p, code: 'HACK', openingStock: 999, name: 'Renamed Laptop', unitCost: '70000', reorderLevel: '6' }));
  const u = find(s, 'LAP-001');
  assert.equal(u.name, 'Renamed Laptop');
  assert.equal(u.unitCost, 70000);
  assert.equal(u.code, 'LAP-001');
  assert.equal(u.openingStock, p.openingStock);
  assert.equal(stockOf(s, 'LAP-001'), stockOf(s0, 'LAP-001'));
  assert.equal(s.transactions.length, s0.transactions.length);
});

test('AC-21 / BR-011 / BR-018 inactive product: new transactions blocked, history preserved', () => {
  const s0 = fresh();
  const p = find(s0, 'LAP-001');
  const s = must(setProductStatus(s0, p.id, RECORD_STATUS.INACTIVE));
  assert.equal(s.transactions.length, s0.transactions.length);
  assert.ok(stockIn(s, { productId: p.id, supplierId: s.suppliers[0].id, quantity: '1', unitCost: '1' }).errors.productId);
  assert.ok(stockOut(s, { productId: p.id, quantity: '1', issuedTo: 'a', department: 'b', purpose: 'c' }).errors.productId);
  assert.ok(adjustStock(s, { productId: p.id, actualStock: '1', reason: 'x' }).errors.productId);
});

test('inactive products are excluded from alerts and dashboard figures', () => {
  const s = fresh();
  const views = buildProductViews(s, computeStockMap(s.transactions));
  const inactive = views.find((v) => v.status === RECORD_STATUS.INACTIVE);
  const sum = summarizeInventory(views, s.categories, s.transactions, NOW);
  assert.ok(!sum.replenishment.some((v) => v.id === inactive.id));
  assert.equal(sum.totalProducts, views.filter((v) => v.status === 'Active').length);
  assert.ok(!lowStockRows(views).some((v) => v.id === inactive.id));
});

/* ---------------------- Categories and suppliers ----------------------- */

test('AC-06 new category can be used by a product; duplicates rejected', () => {
  let s = must(saveCategory(fresh(), { code: 'CAT-NEW', name: 'Storage', description: '', status: 'Active' }));
  s = must(createProduct(s, validProduct(s, { categoryId: s.categories.at(-1).id }), NOW));
  assert.equal(find(s, 'NEW-001').categoryId, s.categories.at(-1).id);
  assert.ok(saveCategory(s, { code: 'cat-new', name: 'Other', status: 'Active' }).errors.code);
  assert.ok(saveCategory(s, { code: 'CAT-X', name: '  storage ', status: 'Active' }).errors.name);
});

test('AC-24 category assigned to an active product cannot be deactivated', () => {
  const s = fresh();
  const r = setCategoryStatus(s, s.categories[0].id, RECORD_STATUS.INACTIVE);
  assert.equal(r.ok, false);
  assert.match(r.message, /active products/);
  const via = saveCategory(s, { ...s.categories[0], status: 'Inactive' }, s.categories[0].id);
  assert.equal(via.ok, false);
});

test('category with no active products can be deactivated, and then cannot be picked for a new product', () => {
  let s = must(saveCategory(fresh(), { code: 'CAT-EMPTY', name: 'Empty', status: 'Active' }));
  const cat = s.categories.at(-1);
  s = must(setCategoryStatus(s, cat.id, RECORD_STATUS.INACTIVE));
  assert.ok(createProduct(s, validProduct(s, { categoryId: cat.id }), NOW).errors.categoryId);
});

test('AC-07 supplier rules: unique code, valid email, inactive supplier blocked for products and receipts', () => {
  let s = must(saveSupplier(fresh(), { code: 'SUP-NEW', name: 'Fresh Supplier', email: 'a@b.com', status: 'Active' }));
  assert.ok(saveSupplier(s, { code: 'sup-new', name: 'Dup', status: 'Active' }).errors.code);
  assert.ok(saveSupplier(s, { code: 'SUP-X', name: '', status: 'Active' }).errors.name);
  assert.ok(saveSupplier(s, { code: 'SUP-X', name: 'N', email: 'not-an-email', status: 'Active' }).errors.email);
  const sup = s.suppliers.at(-1);
  s = must(saveSupplier(s, { ...sup, status: 'Inactive' }, sup.id));
  assert.ok(createProduct(s, validProduct(s, { supplierId: sup.id }), NOW).errors.supplierId);
  const p = find(s, 'LAP-001');
  assert.ok(stockIn(s, { productId: p.id, supplierId: sup.id, quantity: '1', unitCost: '1' }).errors.supplierId);
});

/* ---------------------------- Stock movements -------------------------- */

const inInput = (s, code, extra = {}) => ({ productId: find(s, code).id, supplierId: s.suppliers[0].id, quantity: '10', unitCost: '100', ...extra });
const outInput = (s, code, extra = {}) => ({ productId: find(s, code).id, quantity: '5', issuedTo: 'Dev', department: 'IT', purpose: 'Use', ...extra });

test('AC-08 / BR-004 receiving 10 units increases stock by 10 and records Unit Cost without changing master cost', () => {
  const s0 = fresh();
  const before = stockOf(s0, 'KBD-001');
  const s = must(stockIn(s0, inInput(s0, 'KBD-001', { unitCost: '999' }), NOW));
  assert.equal(stockOf(s, 'KBD-001'), before + 10);
  const t = s.transactions.at(-1);
  assert.equal(t.balanceAfter, before + 10);
  assert.equal(t.unitCost, 999);
  assert.equal(find(s, 'KBD-001').unitCost, 650);
});

test('AC-09 / BR-005 issuing 5 units decreases stock by 5', () => {
  const s0 = fresh();
  const before = stockOf(s0, 'KBD-001');
  const s = must(stockOut(s0, outInput(s0, 'KBD-001'), NOW));
  assert.equal(stockOf(s, 'KBD-001'), before - 5);
  assert.equal(s.transactions.at(-1).quantityChange, -5);
});

test('AC-10 / BR-006 / BR-008 issuing more than available is blocked; exactly available is allowed', () => {
  const s0 = fresh();
  const avail = stockOf(s0, 'DSK-001');
  const r = stockOut(s0, outInput(s0, 'DSK-001', { quantity: String(avail + 1) }));
  assert.equal(r.ok, false);
  assert.match(r.message, /Insufficient stock/);
  const s = must(stockOut(s0, outInput(s0, 'DSK-001', { quantity: String(avail) }), NOW));
  assert.equal(stockOf(s, 'DSK-001'), 0);
});

test('AC-11 zero / negative / fractional / blank quantities are rejected', () => {
  const s = fresh();
  for (const q of ['0', '-3', '1.5', '', 'abc']) {
    assert.ok(stockOut(s, outInput(s, 'KBD-001', { quantity: q })).errors.quantity, `out ${q}`);
    assert.ok(stockIn(s, inInput(s, 'KBD-001', { quantity: q })).errors.quantity, `in ${q}`);
  }
});

test('Stock Out requires Issued To, Department and Purpose; Stock In requires supplier and positive cost', () => {
  const s = fresh();
  const r = stockOut(s, outInput(s, 'KBD-001', { issuedTo: '', department: ' ', purpose: '' }));
  assert.ok(r.errors.issuedTo && r.errors.department && r.errors.purpose);
  assert.ok(stockIn(s, inInput(s, 'KBD-001', { supplierId: '' })).errors.supplierId);
  assert.ok(stockIn(s, inInput(s, 'KBD-001', { unitCost: '0' })).errors.unitCost);
});

test('AC-12 / BR-007 adjustment records signed difference (25 -> 22 is -3) and needs a reason', () => {
  let s = must(createProduct(fresh(), validProduct(fresh(), { openingStock: '25' }), NOW));
  const id = find(s, 'NEW-001').id;
  assert.ok(adjustStock(s, { productId: id, actualStock: '22', reason: '' }).errors.reason);
  s = must(adjustStock(s, { productId: id, actualStock: '22', reason: 'Damaged' }, NOW));
  const t = s.transactions.at(-1);
  assert.equal(t.type, TXN_TYPES.ADJUSTMENT);
  assert.equal(t.quantityChange, -3);
  assert.equal(t.balanceAfter, 22);
  assert.equal(stockOf(s, 'NEW-001'), 22);
});

test('adjustment cannot create negative inventory, no-op or fractional values', () => {
  const s = fresh();
  const id = find(s, 'KBD-001').id;
  assert.ok(adjustStock(s, { productId: id, actualStock: '-1', reason: 'x' }).errors.actualStock);
  assert.ok(adjustStock(s, { productId: id, actualStock: '2.5', reason: 'x' }).errors.actualStock);
  assert.ok(adjustStock(s, { productId: id, actualStock: String(stockOf(s, 'KBD-001')), reason: 'x' }).errors.actualStock);
});

test('AC-13 / AC-14 reaching zero shows Out of Stock; dropping to reorder level shows Low Stock', () => {
  let s = must(createProduct(fresh(), validProduct(fresh(), { openingStock: '10', reorderLevel: '4' }), NOW));
  const id = find(s, 'NEW-001').id;
  const status = () => buildProductViews(s, computeStockMap(s.transactions)).find((v) => v.id === id).stockStatus;
  assert.equal(status(), STOCK_STATUS.IN);
  s = must(stockOut(s, outInput(s, 'NEW-001', { quantity: '6' }), NOW));
  assert.equal(status(), STOCK_STATUS.LOW);
  s = must(stockOut(s, outInput(s, 'NEW-001', { quantity: '4' }), NOW));
  assert.equal(status(), STOCK_STATUS.OUT);
});

test('AC-15 / BR-014 dashboard figures recalculate after a transaction', () => {
  const s0 = fresh();
  const calc = (s) => summarizeInventory(buildProductViews(s, computeStockMap(s.transactions)), s.categories, s.transactions, NOW);
  const a = calc(s0);
  const s = must(stockIn(s0, inInput(s0, 'KBD-001', { quantity: '10' }), NOW));
  const b = calc(s);
  assert.equal(b.totalUnits, a.totalUnits + 10);
  assert.equal(b.inventoryValue, Math.round((a.inventoryValue + 10 * 650) * 100) / 100);
  assert.equal(b.todayReceipts, a.todayReceipts + 1);
  assert.equal(b.todayTotal, a.todayTotal + 1);
});

test('dashboard "today" counts exclude opening rows and older days', () => {
  const s = fresh();
  const views = buildProductViews(s, computeStockMap(s.transactions));
  const sum = summarizeInventory(views, s.categories, s.transactions, NOW);
  assert.equal(sum.todayTotal, sum.todayReceipts + sum.todayIssues + sum.todayAdjustments);
  assert.equal(sum.todayTotal, 2);
});

test('transaction ids stay unique and sequential', () => {
  let s = fresh();
  for (let i = 0; i < 5; i++) s = must(stockIn(s, inInput(s, 'KBD-001', { quantity: '1' }), NOW));
  assert.equal(new Set(s.transactions.map((t) => t.id)).size, s.transactions.length);
});

test('AC-23 / BR-010 modifying a saved transaction is refused', () => {
  const r = rejectTransactionChange();
  assert.equal(r.ok, false);
  assert.equal(r.code, 'IMMUTABLE');
});

test('failed commands never alter state (BR-019)', () => {
  const s = fresh();
  const snapshot = JSON.stringify(s);
  stockOut(s, outInput(s, 'KBD-001', { quantity: '9999' }));
  createProduct(s, validProduct(s, { code: '' }), NOW);
  saveCategory(s, { code: '', name: '' });
  assert.equal(JSON.stringify(s), snapshot);
});

/* ----------------------- Filters, history and reports ------------------- */

test('AC-16 / AC-17 history and product filters', () => {
  const s = fresh();
  const pid = find(s, 'KBD-001').id;
  const hist = filterTransactions(s.transactions, { productId: pid });
  assert.ok(hist.length >= 3 && hist.every((t) => t.productId === pid));
  assert.ok(filterTransactions(s.transactions, { type: TXN_TYPES.ADJUSTMENT }).every((t) => t.type === TXN_TYPES.ADJUSTMENT));
  const today = filterTransactions(s.transactions, { from: '2026-11-24', to: '2026-11-24' });
  assert.equal(today.length, 2);
  const views = buildProductViews(s, computeStockMap(s.transactions));
  assert.ok(filterProductViews(views, { search: 'logitech' }).every((v) => /logitech/i.test(v.name)));
  assert.ok(filterProductViews(views, { search: 'net-00' }).every((v) => v.code.startsWith('NET-00')));
  assert.ok(filterProductViews(views, { stockStatus: STOCK_STATUS.OUT }).every((v) => v.stock === 0));
});

test('AC-19 / AC-25 / BR-020 CSV export matches filtered rows and escapes content', () => {
  const s = fresh();
  const views = buildProductViews(s, computeStockMap(s.transactions));
  const rows = filterProductViews(views, { categoryId: s.categories[3].id, stockStatus: STOCK_STATUS.IN });
  const csv = toCsv(CURRENT_STOCK_COLUMNS, rows);
  const lines = csv.split('\r\n');
  assert.equal(lines.length, rows.length + 1);
  assert.equal(lines[0].split(',')[0], 'Product Code');
  assert.ok(lines[1].includes(String(rows[0].inventoryValue)));

  const tricky = toCsv([{ header: 'v', value: (r) => r }], ['a,b', 'say "hi"', '=SUM(A1)', 'x\ny', -3]);
  assert.equal(tricky, 'v\r\n"a,b"\r\n"say ""hi"""\r\n\'=SUM(A1)\r\n"x\ny"\r\n-3');
});

test('movement report rows follow filters and include product details', () => {
  const s = fresh();
  const byId = new Map(s.products.map((p) => [p.id, p]));
  const rows = movementRows(s.transactions, byId, { type: TXN_TYPES.STOCK_IN });
  assert.ok(rows.length > 0 && rows.every((r) => r.type === TXN_TYPES.STOCK_IN && r.productCode));
  assert.equal(toCsv(MOVEMENT_COLUMNS, rows).split('\r\n').length, rows.length + 1);
});

test('low stock report: only active Low/Out products with correct shortfall', () => {
  const s = fresh();
  const views = buildProductViews(s, computeStockMap(s.transactions));
  const rows = lowStockRows(views);
  assert.ok(rows.length > 0);
  for (const r of rows) {
    assert.ok(r.stock <= r.reorderLevel);
    assert.equal(r.shortfall, Math.max(0, r.reorderLevel - r.stock));
    assert.equal(r.status, 'Active');
  }
});

test('performance: 100 products and 600 transactions compute quickly', () => {
  let s = fresh();
  for (let i = 0; i < 100; i++) s = must(createProduct(s, validProduct(s, { code: `BULK-${i}`, openingStock: '1000' }), NOW));
  const id = find(s, 'BULK-0').id;
  for (let i = 0; i < 500; i++) s = must(stockIn(s, { productId: id, supplierId: s.suppliers[0].id, quantity: '1', unitCost: '1' }, NOW));
  const t0 = performance.now();
  const views = buildProductViews(s, computeStockMap(s.transactions));
  summarizeInventory(views, s.categories, s.transactions, NOW);
  assert.ok(performance.now() - t0 < 200);
  assert.equal(stockOf(s, 'BULK-0'), 1500);
});

/* ------------------------------- Storage -------------------------------- */

test('AC-01 / BR-016 first run seeds once; later loads do not overwrite saved records', () => {
  const backend = new MemoryStorage();
  const store = createStorage(backend);
  assert.equal(store.loadAll().status, 'first-run');
  assert.ok(store.saveMany(entriesFromState(fresh())).ok);

  let s = store.loadAll();
  assert.equal(s.status, 'ok');
  const next = must(stockIn(s.data, inInput(s.data, 'KBD-001'), NOW));
  assert.ok(store.saveMany([[STORAGE_KEYS.transactions, next.transactions]]).ok);

  const reloaded = createStorage(backend).loadAll(); // simulates browser refresh (AC-20 / BR-015)
  assert.equal(reloaded.status, 'ok');
  assert.equal(reloaded.data.transactions.length, next.transactions.length);
});

test('FR-015 corrupted or missing data is reported and never overwritten', () => {
  const backend = new MemoryStorage();
  const store = createStorage(backend);
  store.saveMany(entriesFromState(fresh()));
  backend.setItem(STORAGE_KEYS.products, '{not json');
  let r = store.loadAll();
  assert.equal(r.status, 'error');
  assert.equal(r.errors[0].key, STORAGE_KEYS.products);
  assert.equal(backend.getItem(STORAGE_KEYS.products), '{not json', 'raw value left untouched');

  backend.setItem(STORAGE_KEYS.products, JSON.stringify([{ id: 1 }]));
  assert.equal(store.loadAll().status, 'error');

  backend.setItem(STORAGE_KEYS.products, JSON.stringify([]));
  backend.removeItem(STORAGE_KEYS.transactions);
  r = store.loadAll();
  assert.equal(r.status, 'error', 'missing key after first run is an error, not a silent re-seed');
});

test('storage failures roll back multi-key writes', () => {
  const backend = new MemoryStorage();
  const store = createStorage(backend);
  const s = fresh();
  store.saveMany(entriesFromState(s));
  const before = backend.getItem(STORAGE_KEYS.products) + backend.getItem(STORAGE_KEYS.transactions);
  backend.failAfter = backend.writes + 1; // first write ok, second throws
  const res = store.saveMany([[STORAGE_KEYS.products, []], [STORAGE_KEYS.transactions, []]]);
  assert.equal(res.ok, false);
  assert.match(res.error, /full/);
  assert.equal(backend.getItem(STORAGE_KEYS.products) + backend.getItem(STORAGE_KEYS.transactions), before);
});

test('unavailable storage is reported, not thrown', () => {
  assert.equal(createStorage(null).loadAll().status, 'unavailable');
  assert.equal(createStorage(null).saveMany([['k', 1]]).ok, false);
});
