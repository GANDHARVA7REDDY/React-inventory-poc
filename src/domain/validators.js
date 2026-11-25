import { RECORD_STATUS, UNITS } from './constants.js';

const INT = /^\d+$/;
const MONEY = /^\d+(\.\d{1,2})?$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[\d\s\-()]{7,20}$/;

export const str = (v) => (v === null || v === undefined ? '' : String(v)).trim();
const norm = (v) => str(v).toLowerCase();
export const isActive = (r) => r?.status === RECORD_STATUS.ACTIVE;
export const hasErrors = (e) => Object.keys(e).length > 0;

function checkStatus(e, value) {
  if (![RECORD_STATUS.ACTIVE, RECORD_STATUS.INACTIVE].includes(value)) e.status = 'Status is required.';
}

function checkPositiveInt(e, field, label, value) {
  const v = str(value);
  if (v === '') e[field] = `${label} is required.`;
  else if (!INT.test(v)) e[field] = `${label} must be a whole number.`;
  else if (Number(v) <= 0) e[field] = `${label} must be greater than zero.`;
}

/* ------------------------------ Products ------------------------------ */

export function validateProduct(input, { products, categories, suppliers, existing = null }) {
  const e = {};
  const editing = Boolean(existing);

  if (!editing) {
    const code = str(input.code);
    if (!code) e.code = 'Product code is required.';
    else if (code.length > 20) e.code = 'Product code must be at most 20 characters.';
    else if (products.some((p) => norm(p.code) === norm(code))) e.code = `Product code "${code}" already exists.`;
  }

  const name = str(input.name);
  if (!name) e.name = 'Product name is required.';
  else if (name.length < 3 || name.length > 100) e.name = 'Product name must be 3–100 characters.';

  const status = input.status;
  checkStatus(e, status);

  const cat = categories.find((c) => c.id === input.categoryId);
  if (!input.categoryId) e.categoryId = 'Category is required.';
  else if (!cat) e.categoryId = 'Selected category does not exist.';
  else if (!isActive(cat) && !(editing && existing.categoryId === cat.id && status === RECORD_STATUS.INACTIVE)) {
    e.categoryId = 'Selected category is inactive.';
  }

  const sup = suppliers.find((s) => s.id === input.supplierId);
  if (!input.supplierId) e.supplierId = 'Supplier is required.';
  else if (!sup) e.supplierId = 'Selected supplier does not exist.';
  else if (!isActive(sup) && !(editing && existing.supplierId === sup.id)) {
    e.supplierId = 'Inactive suppliers cannot be selected.';
  }

  if (str(input.description).length > 500) e.description = 'Description must be at most 500 characters.';
  if (!UNITS.includes(input.unit)) e.unit = 'Unit of measure is required.';

  const cost = str(input.unitCost);
  if (cost === '') e.unitCost = 'Unit cost is required.';
  else if (!MONEY.test(cost)) e.unitCost = 'Unit cost must be a number with at most 2 decimals.';
  else if (Number(cost) <= 0) e.unitCost = 'Unit cost must be greater than zero.';

  const reorder = str(input.reorderLevel);
  if (reorder === '') e.reorderLevel = 'Reorder level is required.';
  else if (!INT.test(reorder)) e.reorderLevel = 'Reorder level must be a non-negative whole number.';

  if (!editing) {
    const opening = str(input.openingStock);
    if (opening !== '' && !INT.test(opening)) e.openingStock = 'Opening stock must be a non-negative whole number.';
  }
  return e;
}

/* ----------------------------- Categories ----------------------------- */

export function validateCategory(input, { categories, products, existing = null }) {
  const e = {};
  if (!existing) {
    const code = str(input.code);
    if (!code) e.code = 'Category code is required.';
    else if (code.length > 20) e.code = 'Category code must be at most 20 characters.';
    else if (categories.some((c) => norm(c.code) === norm(code))) e.code = `Category code "${code}" already exists.`;
  }
  const name = str(input.name);
  if (!name) e.name = 'Category name is required.';
  else if (name.length > 60) e.name = 'Category name must be at most 60 characters.';
  else if (categories.some((c) => c.id !== existing?.id && norm(c.name) === norm(name))) {
    e.name = `Category name "${name}" already exists.`;
  }
  if (str(input.description).length > 250) e.description = 'Description must be at most 250 characters.';
  checkStatus(e, input.status);
  if (existing && input.status === RECORD_STATUS.INACTIVE && !e.status) {
    if (products.some((p) => isActive(p) && p.categoryId === existing.id)) {
      e.status = 'This category is assigned to active products and cannot be deactivated.';
    }
  }
  return e;
}

/* ----------------------------- Suppliers ------------------------------ */

export function validateSupplier(input, { suppliers, existing = null }) {
  const e = {};
  if (!existing) {
    const code = str(input.code);
    if (!code) e.code = 'Supplier code is required.';
    else if (code.length > 20) e.code = 'Supplier code must be at most 20 characters.';
    else if (suppliers.some((s) => norm(s.code) === norm(code))) e.code = `Supplier code "${code}" already exists.`;
  }
  const name = str(input.name);
  if (!name) e.name = 'Supplier name is required.';
  else if (name.length > 100) e.name = 'Supplier name must be at most 100 characters.';
  if (str(input.contactPerson).length > 100) e.contactPerson = 'Contact person must be at most 100 characters.';
  const email = str(input.email);
  if (email && !EMAIL.test(email)) e.email = 'Enter a valid email address.';
  const phone = str(input.phone);
  if (phone && !PHONE.test(phone)) e.phone = 'Enter a valid phone number.';
  checkStatus(e, input.status);
  return e;
}

/* --------------------------- Stock movements -------------------------- */

function checkProduct(e, products, productId) {
  const product = products.find((p) => p.id === productId);
  if (!productId) e.productId = 'Product is required.';
  else if (!product) e.productId = 'Selected product does not exist.';
  else if (!isActive(product)) e.productId = 'Inactive products cannot be used in new stock transactions.';
  return product;
}

export function validateStockIn(input, { products, suppliers }) {
  const e = {};
  checkProduct(e, products, input.productId);
  const sup = suppliers.find((s) => s.id === input.supplierId);
  if (!input.supplierId) e.supplierId = 'Supplier is required.';
  else if (!sup) e.supplierId = 'Selected supplier does not exist.';
  else if (!isActive(sup)) e.supplierId = 'Inactive suppliers cannot be used for new stock receipts.';
  checkPositiveInt(e, 'quantity', 'Quantity received', input.quantity);
  const cost = str(input.unitCost);
  if (cost === '') e.unitCost = 'Unit cost is required.';
  else if (!MONEY.test(cost) || Number(cost) <= 0) e.unitCost = 'Unit cost must be a positive number (max 2 decimals).';
  if (str(input.referenceNumber).length > 50) e.referenceNumber = 'Reference number must be at most 50 characters.';
  if (str(input.remarks).length > 250) e.remarks = 'Remarks must be at most 250 characters.';
  return e;
}

export function validateStockOut(input, { products, currentStock }) {
  const e = {};
  checkProduct(e, products, input.productId);
  checkPositiveInt(e, 'quantity', 'Quantity issued', input.quantity);
  if (!e.quantity && !e.productId && Number(str(input.quantity)) > currentStock) {
    e.quantity = `Insufficient stock. Available quantity is ${currentStock}.`;
  }
  for (const [field, label, max] of [
    ['issuedTo', 'Issued to', 100],
    ['department', 'Department', 100],
    ['purpose', 'Purpose', 250],
  ]) {
    const v = str(input[field]);
    if (!v) e[field] = `${label} is required.`;
    else if (v.length > max) e[field] = `${label} must be at most ${max} characters.`;
  }
  return e;
}

export function validateAdjustment(input, { products, currentStock }) {
  const e = {};
  checkProduct(e, products, input.productId);
  const actual = str(input.actualStock);
  if (actual === '') e.actualStock = 'Actual stock is required.';
  else if (!INT.test(actual)) e.actualStock = 'Actual stock must be a non-negative whole number.';
  else if (!e.productId && Number(actual) === currentStock) {
    e.actualStock = 'Actual stock equals the system stock; there is nothing to adjust.';
  }
  const reason = str(input.reason);
  if (!reason) e.reason = 'Reason is required.';
  else if (reason.length > 250) e.reason = 'Reason must be at most 250 characters.';
  return e;
}
