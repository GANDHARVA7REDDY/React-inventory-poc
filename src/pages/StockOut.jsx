import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { RECORD_STATUS } from '../domain/constants.js';
import { nextTransactionId, stockOut } from '../domain/commands.js';
import { formatDateTime, formatNumber } from '../domain/format.js';
import { getStockStatus } from '../domain/stock.js';
import { useInventory } from '../context/InventoryContext.jsx';
import { useNotify } from '../context/NotificationProvider.jsx';
import useSubmitGuard from '../hooks/useSubmitGuard.js';
import ProductSelect from '../components/ProductSelect.jsx';
import { StockStatusChip } from '../components/StatusChip.jsx';

const BLANK = { productId: '', quantity: '', issuedTo: '', department: '', purpose: '' };

/** INV-08 Stock Out (issue). Blocks quantities above the available stock. */
export default function StockOut() {
  const { products, productViewById, transactions, run } = useInventory();
  const notify = useNotify();
  const [params] = useSearchParams();
  const { submitting, guard } = useSubmitGuard();
  const activeProducts = useMemo(() => products.filter((p) => p.status === RECORD_STATUS.ACTIVE), [products]);
  const preset = activeProducts.find((p) => p.id === params.get('productId'));

  const [values, setValues] = useState({ ...BLANK, productId: preset?.id || '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const set = (name) => (e) => setValues((v) => ({ ...v, [name]: e.target.value }));

  const selected = productViewById.get(values.productId);
  const qty = /^\d+$/.test(values.quantity) ? Number(values.quantity) : 0;
  const tooMany = selected && qty > selected.stock;
  const nextId = useMemo(() => nextTransactionId(transactions), [transactions]);

  const submit = (e) => {
    e.preventDefault();
    guard(() => {
      const result = run(stockOut, values);
      if (!result.ok) {
        setErrors(result.errors || {});
        setFormError(Object.keys(result.errors || {}).length ? 'Please correct the highlighted fields.' : result.message);
        return;
      }
      notify(`${result.record.id}: issued ${Math.abs(result.record.quantityChange)} unit(s). New balance: ${result.record.balanceAfter}.`);
      setErrors({});
      setFormError('');
      setValues(BLANK);
    });
  };

  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 2fr) minmax(260px, 1fr)' }, alignItems: 'start' }}>
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Box component="form" noValidate onSubmit={submit}>
          <Stack spacing={2.5}>
            {params.get('productId') && !preset && (
              <Alert severity="warning">The selected product is inactive or does not exist, so stock cannot be issued.</Alert>
            )}
            {formError && <Alert severity="error">{formError}</Alert>}
            <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))' }}>
              <TextField label="Transaction Reference" value={nextId} disabled helperText="Auto-generated" />
              <TextField label="Transaction Date" value={formatDateTime(new Date())} disabled helperText="Set automatically when saved" />
            </Box>
            <ProductSelect products={activeProducts} value={values.productId} onChange={(id) => setValues((v) => ({ ...v, productId: id }))} required error={errors.productId} helperText={errors.productId} />
            <TextField
              required label="Quantity Issued" type="number" value={values.quantity} onChange={set('quantity')}
              error={Boolean(errors.quantity)} helperText={errors.quantity || (selected ? `Available: ${formatNumber(selected.stock)}` : undefined)}
              slotProps={{ htmlInput: { min: 1, step: 1 } }}
            />
            <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))' }}>
              <TextField required label="Issued To" value={values.issuedTo} onChange={set('issuedTo')} error={Boolean(errors.issuedTo)} helperText={errors.issuedTo || 'Employee name'} />
              <TextField required label="Department" value={values.department} onChange={set('department')} error={Boolean(errors.department)} helperText={errors.department} />
            </Box>
            <TextField required label="Purpose" multiline minRows={2} value={values.purpose} onChange={set('purpose')} error={Boolean(errors.purpose)} helperText={errors.purpose} />
            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
              <Button onClick={() => { setValues(BLANK); setErrors({}); setFormError(''); }}>Reset</Button>
              <Button type="submit" variant="contained" disabled={submitting}>Issue Stock</Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>

      <Paper sx={{ p: 2.5 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>Stock preview</Typography>
        {selected ? (
          <Stack spacing={1}>
            <Typography>{selected.code} — {selected.name}</Typography>
            <Typography color="text.secondary">Current stock: <b>{formatNumber(selected.stock)}</b> {selected.unit}</Typography>
            {tooMany ? (
              <Alert severity="error">Quantity exceeds the available stock.</Alert>
            ) : (
              <>
                <Typography color="text.secondary">After issue: <b>{formatNumber(selected.stock - qty)}</b></Typography>
                <StockStatusChip status={getStockStatus(selected.stock - qty, selected.reorderLevel)} />
              </>
            )}
          </Stack>
        ) : (
          <Typography color="text.secondary">Select a product to see its current stock.</Typography>
        )}
      </Paper>
    </Box>
  );
}
