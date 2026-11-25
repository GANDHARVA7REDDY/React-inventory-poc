import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, Button, MenuItem, Tab, Tabs, TextField, Typography } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { RECORD_STATUS, STOCK_STATUS, TXN_TYPES } from '../domain/constants.js';
import {
  CURRENT_STOCK_COLUMNS, LOW_STOCK_COLUMNS, MOVEMENT_COLUMNS, dateRangeError, filterProductViews, lowStockRows, movementRows,
} from '../domain/reports.js';
import { downloadCsv, toCsv } from '../domain/csv.js';
import { formatCurrency, formatDateTime, formatNumber, formatSigned } from '../domain/format.js';
import { useInventory } from '../context/InventoryContext.jsx';
import useTableControls from '../hooks/useTableControls.js';
import DataTable from '../components/DataTable.jsx';
import FilterBar from '../components/FilterBar.jsx';
import ProductSelect from '../components/ProductSelect.jsx';
import { RecordStatusChip, StockStatusChip } from '../components/StatusChip.jsx';

const TABS = [
  { type: 'current-stock', label: 'Current Stock' },
  { type: 'movement', label: 'Stock Movement' },
  { type: 'low-stock', label: 'Low Stock' },
];

/** Toolbar shared by all reports: record count and CSV export of exactly the filtered rows. */
function ReportActions({ count, summary, onExport }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <Typography variant="body2" color="text.secondary">{count} record(s){summary ? ` · ${summary}` : ''}</Typography>
      <Button startIcon={<DownloadIcon />} variant="contained" disabled={count === 0} onClick={onExport}>Export CSV</Button>
    </Box>
  );
}

function CurrentStockReport() {
  const { productViews, categories } = useInventory();
  const empty = { search: '', categoryId: '', stockStatus: '', status: RECORD_STATUS.ACTIVE };
  const [filters, setFilters] = useState(empty);
  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));
  const rows = useMemo(() => filterProductViews(productViews, filters), [productViews, filters]);
  const controls = useTableControls(rows, { initialSort: { key: 'code', dir: 'asc' } });
  const total = rows.reduce((s, r) => s + r.inventoryValue, 0);

  const columns = [
    { key: 'code', label: 'Product Code' },
    { key: 'name', label: 'Product', minWidth: 200 },
    { key: 'categoryName', label: 'Category', hideBelow: 'sm' },
    { key: 'stock', label: 'Available Qty', align: 'right', render: (r) => formatNumber(r.stock) },
    { key: 'unitCost', label: 'Unit Cost', align: 'right', hideBelow: 'md', render: (r) => formatCurrency(r.unitCost) },
    { key: 'inventoryValue', label: 'Inventory Value', align: 'right', render: (r) => formatCurrency(r.inventoryValue) },
    { key: 'stockStatus', label: 'Stock Status', render: (r) => <StockStatusChip status={r.stockStatus} /> },
    { key: 'status', label: 'Status', hideBelow: 'md', render: (r) => <RecordStatusChip status={r.status} /> },
  ];
  return (
    <>
      <FilterBar onClear={() => setFilters(empty)}>
        <TextField size="small" label="Search code or name" value={filters.search} onChange={set('search')} />
        <TextField size="small" select label="Category" value={filters.categoryId} onChange={set('categoryId')}>
          <MenuItem value="">All categories</MenuItem>
          {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
        </TextField>
        <TextField size="small" select label="Stock status" value={filters.stockStatus} onChange={set('stockStatus')}>
          <MenuItem value="">All</MenuItem>
          {Object.values(STOCK_STATUS).map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </TextField>
        <TextField size="small" select label="Product status" value={filters.status} onChange={set('status')}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value={RECORD_STATUS.ACTIVE}>Active</MenuItem>
          <MenuItem value={RECORD_STATUS.INACTIVE}>Inactive</MenuItem>
        </TextField>
      </FilterBar>
      <ReportActions count={rows.length} summary={`Total value ${formatCurrency(total)}`}
        onExport={() => downloadCsv('current-stock-report.csv', toCsv(CURRENT_STOCK_COLUMNS, controls.sorted))} />
      <DataTable columns={columns} controls={controls} emptyMessage="No products match the filters." />
    </>
  );
}

function MovementReport() {
  const { transactions, products, productsById } = useInventory();
  const empty = { productId: '', type: '', from: '', to: '' };
  const [filters, setFilters] = useState(empty);
  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));
  const rangeError = dateRangeError(filters.from, filters.to);
  const rows = useMemo(() => (rangeError ? [] : movementRows(transactions, productsById, filters)), [transactions, productsById, filters, rangeError]);
  const controls = useTableControls(rows, { initialSort: { key: 'timestamp', dir: 'desc' } });

  const columns = [
    { key: 'productLabel', label: 'Product', minWidth: 200 },
    { key: 'timestamp', label: 'Date', render: (r) => formatDateTime(r.timestamp) },
    { key: 'type', label: 'Transaction Type' },
    { key: 'quantityChange', label: 'Quantity Change', align: 'right', render: (r) => formatSigned(r.quantityChange) },
    { key: 'balanceAfter', label: 'Balance After', align: 'right', render: (r) => formatNumber(r.balanceAfter) },
  ];
  return (
    <>
      <FilterBar onClear={() => setFilters(empty)}>
        <ProductSelect size="small" products={products} value={filters.productId} onChange={(id) => setFilters((f) => ({ ...f, productId: id }))} />
        <TextField size="small" select label="Transaction type" value={filters.type} onChange={set('type')}>
          <MenuItem value="">All types</MenuItem>
          {Object.values(TXN_TYPES).map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
        </TextField>
        <TextField size="small" type="date" label="From" value={filters.from} onChange={set('from')} error={Boolean(rangeError)} helperText={rangeError} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField size="small" type="date" label="To" value={filters.to} onChange={set('to')} slotProps={{ inputLabel: { shrink: true } }} />
      </FilterBar>
      <ReportActions count={rows.length} onExport={() => downloadCsv('stock-movement-report.csv', toCsv(MOVEMENT_COLUMNS, controls.sorted))} />
      <DataTable columns={columns} controls={controls} emptyMessage="No movements match the filters." />
    </>
  );
}

/** INV-11 Low Stock Report: active Low / Out of Stock products with their shortfall. */
function LowStockReport() {
  const { productViews, categories } = useInventory();
  const empty = { categoryId: '', stockStatus: '' };
  const [filters, setFilters] = useState(empty);
  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));
  const rows = useMemo(() => lowStockRows(productViews, filters), [productViews, filters]);
  const controls = useTableControls(rows, { initialSort: { key: 'shortfall', dir: 'desc' } });

  const columns = [
    { key: 'code', label: 'Product Code' },
    { key: 'name', label: 'Product', minWidth: 200 },
    { key: 'categoryName', label: 'Category', hideBelow: 'sm' },
    { key: 'stock', label: 'Available Qty', align: 'right', render: (r) => formatNumber(r.stock) },
    { key: 'reorderLevel', label: 'Reorder Level', align: 'right' },
    { key: 'shortfall', label: 'Shortfall', align: 'right', render: (r) => <b>{r.shortfall}</b> },
    { key: 'stockStatus', label: 'Stock Status', render: (r) => <StockStatusChip status={r.stockStatus} /> },
  ];
  return (
    <>
      <FilterBar onClear={() => setFilters(empty)}>
        <TextField size="small" select label="Category" value={filters.categoryId} onChange={set('categoryId')}>
          <MenuItem value="">All categories</MenuItem>
          {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
        </TextField>
        <TextField size="small" select label="Stock status" value={filters.stockStatus} onChange={set('stockStatus')}>
          <MenuItem value="">Low and out of stock</MenuItem>
          <MenuItem value={STOCK_STATUS.LOW}>{STOCK_STATUS.LOW}</MenuItem>
          <MenuItem value={STOCK_STATUS.OUT}>{STOCK_STATUS.OUT}</MenuItem>
        </TextField>
      </FilterBar>
      <Alert severity="info" sx={{ mb: 2 }}>Shortfall = max(0, Reorder Level − Available Stock). Inactive products are excluded.</Alert>
      <ReportActions count={rows.length} onExport={() => downloadCsv('low-stock-report.csv', toCsv(LOW_STOCK_COLUMNS, controls.sorted))} />
      <DataTable columns={columns} controls={controls} emptyMessage="No products need replenishment." />
    </>
  );
}

/** INV-12 Inventory Reports: three reports in tabs, routed as /reports/:type. */
export default function Reports() {
  const { type } = useParams();
  const navigate = useNavigate();
  if (!TABS.some((t) => t.type === type)) return <Navigate to="/reports/current-stock" replace />;
  return (
    <>
      <Tabs
        value={type} onChange={(_, v) => navigate(`/reports/${v}`)} variant="scrollable" allowScrollButtonsMobile
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }} aria-label="Inventory reports"
      >
        {TABS.map((t) => <Tab key={t.type} value={t.type} label={t.label} />)}
      </Tabs>
      {type === 'current-stock' && <CurrentStockReport />}
      {type === 'movement' && <MovementReport />}
      {type === 'low-stock' && <LowStockReport />}
    </>
  );
}
