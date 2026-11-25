export const STORAGE_KEYS = {
  products: 'inventory_products',
  categories: 'inventory_categories',
  suppliers: 'inventory_suppliers',
  transactions: 'inventory_transactions',
  settings: 'inventory_settings',
};

export const SCHEMA_VERSION = 1;

export const TXN_TYPES = {
  OPENING: 'Opening',
  STOCK_IN: 'Stock In',
  STOCK_OUT: 'Stock Out',
  ADJUSTMENT: 'Adjustment',
};

export const STOCK_STATUS = {
  IN: 'In Stock',
  LOW: 'Low Stock',
  OUT: 'Out of Stock',
};

export const RECORD_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

export const UNITS = ['Pieces', 'Boxes', 'Packs', 'Sets', 'Reams', 'Rolls', 'Meters'];

export const PAGE_SIZES = [5, 10, 20];
