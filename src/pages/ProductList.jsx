import { useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Button, IconButton, MenuItem, TextField, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline';
import { RECORD_STATUS, STOCK_STATUS } from '../domain/constants.js';
import { setProductStatus } from '../domain/commands.js';
import { filterProductViews } from '../domain/reports.js';
import { formatCurrency, formatNumber } from '../domain/format.js';
import { useInventory } from '../context/InventoryContext.jsx';
import { useNotify } from '../context/NotificationProvider.jsx';
import useTableControls from '../hooks/useTableControls.js';
import DataTable from '../components/DataTable.jsx';
import FilterBar from '../components/FilterBar.jsx';
import PageHeader from '../components/PageHeader.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { RecordStatusChip, StockStatusChip } from '../components/StatusChip.jsx';

const EMPTY = { search: '', categoryId: '', stockStatus: '', status: '' };

export default function ProductList() {
  const { productViews, categories, run } = useInventory();
  const notify = useNotify();
  const navigate = useNavigate();
  const [filters, setFilters] = useState(EMPTY);
  const [confirm, setConfirm] = useState(null);
  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));

  const rows = useMemo(() => filterProductViews(productViews, filters), [productViews, filters]);
  const controls = useTableControls(rows, { initialSort: { key: 'code', dir: 'asc' } });

  const toggleStatus = () => {
    const { product, next } = confirm;
    const result = run(setProductStatus, product.id, next);
    setConfirm(null);
    if (result.ok) notify(`${product.name} is now ${next.toLowerCase()}. Its transaction history is preserved.`);
    else notify(result.message, 'error');
  };

  const columns = [
    { key: 'code', label: 'Product Code' },
    { key: 'name', label: 'Product Name', minWidth: 200 },
    { key: 'categoryName', label: 'Category', hideBelow: 'md' },
    { key: 'supplierName', label: 'Supplier', hideBelow: 'lg' },
    { key: 'unit', label: 'Unit', hideBelow: 'lg' },
    { key: 'unitCost', label: 'Unit Cost', align: 'right', hideBelow: 'sm', render: (r) => formatCurrency(r.unitCost) },
    { key: 'stock', label: 'Available Stock', align: 'right', render: (r) => formatNumber(r.stock) },
    { key: 'reorderLevel', label: 'Reorder Level', align: 'right', hideBelow: 'md' },
    { key: 'stockStatus', label: 'Stock Status', render: (r) => <StockStatusChip status={r.stockStatus} /> },
    { key: 'status', label: 'Status', hideBelow: 'sm', render: (r) => <RecordStatusChip status={r.status} /> },
    {
      key: 'actions', label: 'Actions', sortable: false, align: 'right',
      render: (r) => (
        <Box sx={{ whiteSpace: 'nowrap' }}>
          <Tooltip title="View"><IconButton size="small" aria-label={`View ${r.name}`} onClick={() => navigate(`/products/${r.id}`)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Edit"><IconButton size="small" aria-label={`Edit ${r.name}`} onClick={() => navigate(`/products/${r.id}/edit`)}><EditIcon fontSize="small" /></IconButton></Tooltip>
          {r.status === RECORD_STATUS.ACTIVE ? (
            <Tooltip title="Deactivate"><IconButton size="small" color="error" aria-label={`Deactivate ${r.name}`} onClick={() => setConfirm({ product: r, next: RECORD_STATUS.INACTIVE })}><BlockIcon fontSize="small" /></IconButton></Tooltip>
          ) : (
            <Tooltip title="Activate"><IconButton size="small" color="success" aria-label={`Activate ${r.name}`} onClick={() => setConfirm({ product: r, next: RECORD_STATUS.ACTIVE })}><CheckCircleIcon fontSize="small" /></IconButton></Tooltip>
          )}
        </Box>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Products"
        subtitle={`${rows.length} of ${productViews.length} products`}
        actions={<Button component={RouterLink} to="/products/new" variant="contained" startIcon={<AddIcon />}>Add Product</Button>}
      />
      <FilterBar onClear={() => setFilters(EMPTY)}>
        <TextField size="small" label="Search code or name" value={filters.search} onChange={set('search')} />
        <TextField size="small" select label="Category" value={filters.categoryId} onChange={set('categoryId')}>
          <MenuItem value="">All categories</MenuItem>
          {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
        </TextField>
        <TextField size="small" select label="Stock status" value={filters.stockStatus} onChange={set('stockStatus')}>
          <MenuItem value="">All</MenuItem>
          {Object.values(STOCK_STATUS).map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </TextField>
        <TextField size="small" select label="Status" value={filters.status} onChange={set('status')}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value={RECORD_STATUS.ACTIVE}>Active</MenuItem>
          <MenuItem value={RECORD_STATUS.INACTIVE}>Inactive</MenuItem>
        </TextField>
      </FilterBar>
      <DataTable columns={columns} controls={controls} emptyMessage="No products match the current filters." />
      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.next === RECORD_STATUS.INACTIVE ? 'Deactivate product?' : 'Activate product?'}
        message={
          confirm?.next === RECORD_STATUS.INACTIVE
            ? `${confirm?.product.name} will no longer be available for new stock transactions or alerts. Its history is kept.`
            : `${confirm?.product.name} will be available for stock transactions again.`
        }
        confirmLabel={confirm?.next === RECORD_STATUS.INACTIVE ? 'Deactivate' : 'Activate'}
        color={confirm?.next === RECORD_STATUS.INACTIVE ? 'error' : 'primary'}
        onConfirm={toggleStatus}
        onCancel={() => setConfirm(null)}
      />
    </>
  );
}
