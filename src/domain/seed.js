import { RECORD_STATUS, SCHEMA_VERSION, TXN_TYPES } from './constants.js';

const DAY = 86_400_000;
const MIN = 60_000;

const CATEGORIES = [
  ['CAT-COMP', 'Computers', 'Laptops and desktop computers'],
  ['CAT-PERI', 'Peripherals', 'Keyboards, mice and printers'],
  ['CAT-DISP', 'Displays', 'Monitors and screens'],
  ['CAT-NETW', 'Networking', 'Switches, access points and cabling'],
  ['CAT-OFFC', 'Office Supplies', 'Paper, stationery and consumables'],
];

const SUPPLIERS = [
  ['SUP-001', 'TechSource India', 'Rohan Mehta', 'sales@techsource.example', '+91 98765 43210'],
  ['SUP-002', 'Digital Hub Distributors', 'Priya Nair', 'orders@digitalhub.example', '+91 98450 11223'],
  ['SUP-003', 'NetWorks Pvt Ltd', 'Imran Shaikh', 'support@networks.example', '+91 99001 22334'],
  ['SUP-004', 'Office Mart', 'Kavita Rao', 'hello@officemart.example', '+91 98860 55667'],
  ['SUP-005', 'Prime Peripherals', 'Arjun Das', 'trade@primeperi.example', '+91 97420 88990'],
];

// code, name, category, supplier, unit, unitCost, opening, reorder, status
const PRODUCTS = [
  ['LAP-001', 'Dell Latitude 5440 Laptop', 'CAT-COMP', 'SUP-001', 'Pieces', 68000, 15, 5],
  ['LAP-002', 'HP ProBook 450 G10 Laptop', 'CAT-COMP', 'SUP-001', 'Pieces', 62000, 10, 4],
  ['LAP-003', 'Lenovo ThinkPad E14 Laptop', 'CAT-COMP', 'SUP-001', 'Pieces', 58000, 8, 4],
  ['DSK-001', 'Dell OptiPlex 3000 Desktop', 'CAT-COMP', 'SUP-002', 'Pieces', 45000, 6, 3],
  ['KBD-001', 'Logitech K120 Keyboard', 'CAT-PERI', 'SUP-005', 'Pieces', 650, 60, 20],
  ['KBD-002', 'Dell KB216 Wired Keyboard', 'CAT-PERI', 'SUP-005', 'Pieces', 700, 40, 15],
  ['MSE-001', 'Logitech M90 Optical Mouse', 'CAT-PERI', 'SUP-005', 'Pieces', 400, 50, 20],
  ['MSE-002', 'HP X3000 Wireless Mouse', 'CAT-PERI', 'SUP-002', 'Pieces', 850, 30, 10],
  ['MON-001', 'Dell P2422H 24-inch Monitor', 'CAT-DISP', 'SUP-002', 'Pieces', 14500, 20, 8],
  ['MON-002', 'LG 27MP400 27-inch Monitor', 'CAT-DISP', 'SUP-002', 'Pieces', 17500, 12, 5],
  ['MON-003', 'HP P22v 22-inch Monitor', 'CAT-DISP', 'SUP-002', 'Pieces', 9800, 5, 5],
  ['PRN-001', 'HP LaserJet Pro M126 Printer', 'CAT-PERI', 'SUP-001', 'Pieces', 19500, 6, 3],
  ['PRN-002', 'Canon PIXMA G3010 Printer', 'CAT-PERI', 'SUP-001', 'Pieces', 15500, 4, 2],
  ['NET-001', 'TP-Link 8-Port Switch', 'CAT-NETW', 'SUP-003', 'Pieces', 1200, 25, 10],
  ['NET-002', 'D-Link 24-Port Gigabit Switch', 'CAT-NETW', 'SUP-003', 'Pieces', 9500, 5, 3],
  ['NET-003', 'Cat6 Patch Cable 2m', 'CAT-NETW', 'SUP-003', 'Pieces', 180, 100, 40],
  ['NET-004', 'Cat6 Cable Roll 305m', 'CAT-NETW', 'SUP-003', 'Rolls', 7800, 4, 2],
  ['NET-005', 'TP-Link Wi-Fi 6 Access Point', 'CAT-NETW', 'SUP-003', 'Pieces', 6500, 9, 4],
  ['OFF-001', 'A4 Copier Paper (500 sheets)', 'CAT-OFFC', 'SUP-004', 'Reams', 320, 200, 80],
  ['OFF-002', 'Ballpoint Pens (Box of 50)', 'CAT-OFFC', 'SUP-004', 'Boxes', 250, 30, 10],
  ['OFF-003', 'Heavy Duty Stapler', 'CAT-OFFC', 'SUP-004', 'Pieces', 280, 15, 5],
  ['OFF-004', 'Printer Toner Cartridge 88A', 'CAT-OFFC', 'SUP-001', 'Pieces', 6200, 8, 4],
  ['PRN-003', 'Epson L3250 Printer (discontinued)', 'CAT-PERI', 'SUP-001', 'Pieces', 16500, 3, 2, RECORD_STATUS.INACTIVE],
];

const IN = 'in';
const OUT = 'out';
const ADJ = 'adj';
const who = (to, dept, purpose) => ({ to, dept, purpose });

// daysAgo, product code, kind, quantity (signed for adjustments), details
const EVENTS = [
  [28, 'LAP-001', IN, 5, { supplier: 'SUP-001', ref: 'INV-24110', cost: 67500, remarks: 'Quarterly replenishment' }],
  [27, 'KBD-001', IN, 30, { supplier: 'SUP-005', ref: 'PO-1182', cost: 640 }],
  [26, 'MON-001', OUT, 4, who('Anita Sharma', 'Finance', 'New joiner workstations')],
  [25, 'LAP-003', OUT, 6, who('Ravi Kumar', 'Engineering', 'Developer laptop refresh')],
  [25, 'MSE-001', OUT, 10, who('Neha Joshi', 'HR', 'Onboarding kits')],
  [24, 'NET-004', OUT, 4, who('Suresh Patel', 'IT Infrastructure', 'Second floor cabling')],
  [23, 'OFF-001', OUT, 60, who('Office Admin', 'Administration', 'Monthly printing stock')],
  [22, 'OFF-001', IN, 100, { supplier: 'SUP-004', ref: 'OM-7741' }],
  [21, 'KBD-002', OUT, 20, who('Vikram Singh', 'Sales', 'Branch office setup')],
  [20, 'PRN-002', OUT, 2, who('Meera Iyer', 'Marketing', 'Design studio printers')],
  [20, 'MON-002', IN, 6, { supplier: 'SUP-002', ref: 'DH-3302', cost: 17200 }],
  [19, 'LAP-002', OUT, 3, who('Rahul Verma', 'Sales', 'Field team laptops')],
  [18, 'NET-003', OUT, 30, who('Suresh Patel', 'IT Infrastructure', 'Desk patching')],
  [18, 'NET-001', OUT, 12, who('Suresh Patel', 'IT Infrastructure', 'Meeting room switches')],
  [17, 'NET-001', IN, 10, { supplier: 'SUP-003', ref: 'NW-9015', cost: 1150 }],
  [16, 'OFF-004', OUT, 5, who('Office Admin', 'Administration', 'Printer toner replacement')],
  [15, 'MSE-002', ADJ, -2, { reason: 'Damaged units written off' }],
  [14, 'KBD-002', OUT, 8, who('Pooja Menon', 'Support', 'Replacement keyboards')],
  [13, 'DSK-001', OUT, 2, who('Karan Malhotra', 'Accounts', 'Workstation upgrade')],
  [12, 'MON-001', IN, 10, { supplier: 'SUP-002', ref: 'DH-3355', cost: 14100 }],
  [12, 'OFF-002', OUT, 12, who('Office Admin', 'Administration', 'Stationery requisition')],
  [11, 'LAP-001', OUT, 4, who('Divya Pillai', 'Engineering', 'New hires')],
  [10, 'NET-005', OUT, 3, who('Suresh Patel', 'IT Infrastructure', 'Wi-Fi coverage upgrade')],
  [9, 'OFF-003', ADJ, -1, { reason: 'Physical count mismatch' }],
  [8, 'PRN-001', OUT, 2, who('Meera Iyer', 'Marketing', 'Print room')],
  [8, 'KBD-001', OUT, 25, who('Vikram Singh', 'Sales', 'Branch office setup')],
  [7, 'MON-002', OUT, 5, who('Anita Sharma', 'Finance', 'Dual-monitor requests')],
  [6, 'NET-002', OUT, 1, who('Suresh Patel', 'IT Infrastructure', 'Server room expansion')],
  [6, 'MSE-001', ADJ, 2, { reason: 'Found during stock audit' }],
  [5, 'LAP-002', IN, 5, { supplier: 'SUP-001', ref: 'INV-24187', cost: 61500 }],
  [4, 'OFF-002', IN, 20, { supplier: 'SUP-004', ref: 'OM-7790' }],
  [3, 'MSE-002', OUT, 8, who('Neha Joshi', 'HR', 'Training lab')],
  [3, 'LAP-001', OUT, 3, who('Rahul Verma', 'Sales', 'Field team laptops')],
  [2, 'NET-003', IN, 50, { supplier: 'SUP-003', ref: 'NW-9102', cost: 175 }],
  [1, 'OFF-001', OUT, 40, who('Office Admin', 'Administration', 'Printing stock')],
  [1, 'MON-001', OUT, 6, who('Divya Pillai', 'Engineering', 'Test lab')],
  [0, 'KBD-001', IN, 20, { supplier: 'SUP-005', ref: 'PO-1204', cost: 645 }],
  [0, 'LAP-002', OUT, 2, who('Karan Malhotra', 'Accounts', 'Audit team laptops')],
];

/**
 * Builds the initial data set: 5 categories, 5 suppliers, 23 products and
 * 23 opening + 38 movement transactions. Balances are computed chronologically,
 * so the data is consistent with the stock calculation rules by construction.
 */
export function generateSeedData(now = new Date()) {
  const categories = CATEGORIES.map(([code, name, description], i) => ({
    id: `cat-${i + 1}`, code, name, description, status: RECORD_STATUS.ACTIVE,
  }));
  const suppliers = SUPPLIERS.map(([code, name, contactPerson, email, phone], i) => ({
    id: `sup-${i + 1}`, code, name, contactPerson, email, phone, status: RECORD_STATUS.ACTIVE,
  }));
  const catId = (code) => categories.find((c) => c.code === code).id;
  const supId = (code) => suppliers.find((s) => s.code === code).id;
  const createdAt = new Date(now.getTime() - 30 * DAY).toISOString();

  const products = PRODUCTS.map(([code, name, cat, sup, unit, unitCost, openingStock, reorderLevel, status], i) => ({
    id: `prd-${i + 1}`,
    code,
    name,
    categoryId: catId(cat),
    supplierId: supId(sup),
    description: '',
    unit,
    unitCost,
    openingStock,
    reorderLevel,
    status: status || RECORD_STATUS.ACTIVE,
    createdAt,
  }));
  const byCode = new Map(products.map((p) => [p.code, p]));

  const raw = [];
  const openingTime = now.getTime() - 30 * DAY;
  products.forEach((p, i) => {
    raw.push({
      time: openingTime + i * MIN,
      productId: p.id,
      change: p.openingStock,
      fields: { type: TXN_TYPES.OPENING, reference: 'OPENING', remarks: 'Opening stock' },
    });
  });

  EVENTS.forEach(([daysAgo, code, kind, qty, d], i) => {
    const p = byCode.get(code);
    const time = daysAgo > 0
      ? now.getTime() - daysAgo * DAY - ((i * 53) % 240) * MIN
      : now.getTime() - (EVENTS.length - i + 1) * 7 * MIN;
    if (kind === IN) {
      raw.push({
        time, productId: p.id, change: qty,
        fields: {
          type: TXN_TYPES.STOCK_IN, reference: d.ref || '', remarks: d.remarks || 'Stock received',
          supplierId: supId(d.supplier), unitCost: d.cost ?? p.unitCost,
        },
      });
    } else if (kind === OUT) {
      raw.push({
        time, productId: p.id, change: -qty,
        fields: {
          type: TXN_TYPES.STOCK_OUT, reference: '', remarks: `${d.to} (${d.dept}) — ${d.purpose}`,
          issuedTo: d.to, department: d.dept, purpose: d.purpose,
        },
      });
    } else {
      raw.push({
        time, productId: p.id, change: qty,
        fields: { type: TXN_TYPES.ADJUSTMENT, reference: '', remarks: d.reason, reason: d.reason },
      });
    }
  });

  raw.sort((a, b) => a.time - b.time);
  const running = new Map();
  const transactions = raw.map((r, i) => {
    const balanceAfter = (running.get(r.productId) || 0) + r.change;
    running.set(r.productId, balanceAfter);
    return {
      id: `TXN-${String(i + 1).padStart(6, '0')}`,
      timestamp: new Date(r.time).toISOString(),
      productId: r.productId,
      quantityChange: r.change,
      balanceAfter,
      ...r.fields,
    };
  });

  const settings = { schemaVersion: SCHEMA_VERSION, seededAt: now.toISOString(), currency: 'INR' };
  return { categories, suppliers, products, transactions, settings };
}
