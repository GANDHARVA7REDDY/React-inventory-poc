import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Button, IconButton, MenuItem, TextField, Tooltip, Typography } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import DownloadIcon from '@mui/icons-material/Download';
import { TXN_TYPES } from '../domain/constants.js';
import { rejectTransactionChange } from '../domain/commands.js';
import { MOVEMENT_COLUMNS, dateRangeError, movementRows } from '../domain/reports.js';
import { toCsv, downloadCsv } from '../domain/csv.js';
import { formatDateTime, formatNumber, formatSigned } from '../domain/format.js';
import { useInventory } from '../context/InventoryContext.jsx';
import { useNotify } from '../context/NotificationProvider.jsx';
import useTableControls from '../hooks/useTableControls.js';
import DataTable from '../components/DataTable.jsx';
import FilterBar from '../components/FilterBar.jsx';
import PageHeader from '../components/PageHeader.jsx';
import ProductSelect from '../components/ProductSelect.jsx';

/** INV-10 Transaction History. Read-only: saved transactions can never be edited or deleted. */
export default function Transactions() {
  const { transactions, products, productsById } = useInventory();
  const notify = useNotify();
  const [params] = useSearchParams();
  const empty = { productId: '', type: '', from: '', to: '' };
  const [filters, setFilters] = useState({ ...empty, productId: params.get('productId') || '' });
  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));
  const rangeError = dateRangeError(filters.from, filters.to);

  const rows = useMemo(
    () => (rangeError ? [] : movementRows(transactions, productsById, filters)),
    [transactions, productsById, filters, rangeError],
  );
  const controls = useTableControls(rows, { initialSort: { key: 'timestamp', dir: 'desc' } });

  const tryChange = () => {
    const r = rejectTransactionChange();
    notify(r.message, 'warning');
  };

  const columns = [
    { key: 'id', label: 'Transaction ID' },
    { key: 'timestamp', label: 'Date', render: (r) => <Box sx={{ whiteSpace: 'nowrap' }}>{formatDateTime(r.timestamp)}</Box> },
    { key: 'productLabel', label: 'Product', minWidth: 200 },
    { key: 'type', label: 'Type' },
    {
      key: 'quantityChange', label: 'Quantity Change', align: 'right',
      render: (r) => <Typography component="span" fontWeight={600} color={r.quantityChange < 0 ? 'error.main' : 'success.main'}>{formatSigned(r.quantityChange)}</Typography>,
    },
    { key: 'balanceAfter', label: 'Balance After', align: 'right', render: (r) => formatNumber(r.balanceAfter) },
    { key: 'reference', label: 'Reference', hideBelow: 'md', render: (r) => r.reference || '—' },
    { key: 'remarks', label: 'Remarks', hideBelow: 'lg', minWidth: 220 },
    {
      key: 'lock', label: '', sortable: false, align: 'right',
      render: () => (
        <Tooltip title="Immutable. Edit and delete are not permitted">
          <IconButton size="small" aria-label="Edit or delete transaction (not permitted)" onClick={tryChange}><LockIcon fontSize="small" /></IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Stock movements"
        subtitle={`${rows.length} of ${transactions.length} transactions`}
        actions={
          <Button startIcon={<DownloadIcon />} variant="outlined" disabled={rows.length === 0}
            onClick={() => downloadCsv('transaction-history.csv', toCsv(MOVEMENT_COLUMNS, controls.sorted))}>
            Export CSV
          </Button>
        }
      />
      <FilterBar onClear={() => setFilters(empty)}>
        <ProductSelect size="small" label="Product" products={products} value={filters.productId} onChange={(id) => setFilters((f) => ({ ...f, productId: id }))} />
        <TextField size="small" select label="Type" value={filters.type} onChange={set('type')}>
          <MenuItem value="">All types</MenuItem>
          {Object.values(TXN_TYPES).map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
        </TextField>
        <TextField size="small" type="date" label="From" value={filters.from} onChange={set('from')} error={Boolean(rangeError)} helperText={rangeError} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField size="small" type="date" label="To" value={filters.to} onChange={set('to')} slotProps={{ inputLabel: { shrink: true } }} />
      </FilterBar>
      <DataTable columns={columns} controls={controls} emptyMessage="No transactions match the current filters." />
    </>
  );
}
