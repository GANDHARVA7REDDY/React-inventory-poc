import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Box, Button, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { RECORD_STATUS } from '../domain/constants.js';
import { nextTransactionId, stockIn } from '../domain/commands.js';
import { formatDateTime, formatNumber } from '../domain/format.js';
import { useInventory } from '../context/InventoryContext.jsx';
import { useNotify } from '../context/NotificationProvider.jsx';
import useSubmitGuard from '../hooks/useSubmitGuard.js';
import ProductSelect from '../components/ProductSelect.jsx';
import { StockStatusChip } from '../components/StatusChip.jsx';
import { getStockStatus } from '../domain/stock.js';

/** INV-07 Stock In (receipt). Only active products and suppliers are selectable. */
export default function StockIn() {
  const { products, suppliers, productViewById, transactions, run } = useInventory();
  const notify = useNotify();
  const [params] = useSearchParams();
  const { submitting, guard } = useSubmitGuard();

  const activeProducts = useMemo(() => products.filter((p) => p.status === RECORD_STATUS.ACTIVE), [products]);
  const activeSuppliers = useMemo(() => suppliers.filter((s) => s.status === RECORD_STATUS.ACTIVE), [suppliers]);

  const preset = activeProducts.find((p) => p.id === params.get('productId'));
  const blank = (p) => ({ productId: p?.id || '', supplierId: p?.supplierId || '', quantity: '', unitCost: p ? String(p.unitCost) : '', referenceNumber: '', remarks: '' });
  const [values, setValues] = useState(() => blank(preset));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const set = (name) => (e) => setValues((v) => ({ ...v, [name]: e.target.value }));

  const selected = productViewById.get(values.productId);
  const qty = /^\d+$/.test(values.quantity) ? Number(values.quantity) : 0;
  const nextId = useMemo(() => nextTransactionId(transactions), [transactions]);

  const pickProduct = (id) => {
    const p = activeProducts.find((x) => x.id === id);
    const supplierOk = p && activeSuppliers.some((s) => s.id === p.supplierId);
    setValues((v) => ({ ...v, productId: id, supplierId: supplierOk ? p.supplierId : '', unitCost: p ? String(p.unitCost) : '' }));
  };

  const submit = (e) => {
    e.preventDefault();
    guard(() => {
      const result = run(stockIn, values);
      if (!result.ok) {
        setErrors(result.errors || {});
        setFormError(Object.keys(result.errors || {}).length ? 'Please correct the highlighted fields.' : result.message);
        return;
      }
      notify(`${result.record.id}: received ${result.record.quantityChange} unit(s). New balance: ${result.record.balanceAfter}.`);
      setErrors({});
      setFormError('');
      setValues(blank(null));
    });
  };

  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 2fr) minmax(260px, 1fr)' }, alignItems: 'start' }}>
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Box component="form" noValidate onSubmit={submit}>
          <Stack spacing={2.5}>
            {params.get('productId') && !preset && (
              <Alert severity="warning">The selected product is inactive or does not exist, so it cannot receive stock.</Alert>
            )}
            {formError && <Alert severity="error">{formError}</Alert>}
            <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
              <TextField label="Transaction Reference" value={nextId} disabled helperText="Auto-generated" />
              <TextField label="Transaction Date" value={formatDateTime(new Date())} disabled helperText="Set automatically when saved" />
            </Box>
            <ProductSelect products={activeProducts} value={values.productId} onChange={pickProduct} required error={errors.productId} helperText={errors.productId} />
            <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
              <TextField select required label="Supplier" value={values.supplierId} onChange={set('supplierId')} error={Boolean(errors.supplierId)} helperText={errors.supplierId}>
                {activeSuppliers.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </TextField>
              <TextField required label="Quantity Received" type="number" value={values.quantity} onChange={set('quantity')} error={Boolean(errors.quantity)} helperText={errors.quantity} slotProps={{ htmlInput: { min: 1, step: 1 } }} />
              <TextField required label="Unit Cost (₹)" type="number" value={values.unitCost} onChange={set('unitCost')} error={Boolean(errors.unitCost)} helperText={errors.unitCost || 'Recorded on this receipt; does not change the product master cost'} slotProps={{ htmlInput: { min: 0, step: '0.01' } }} />
              <TextField label="Reference Number" value={values.referenceNumber} onChange={set('referenceNumber')} error={Boolean(errors.referenceNumber)} helperText={errors.referenceNumber || 'Optional (invoice / PO number)'} />
            </Box>
            <TextField label="Remarks" multiline minRows={2} value={values.remarks} onChange={set('remarks')} error={Boolean(errors.remarks)} helperText={errors.remarks || 'Optional'} />
            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
              <Button onClick={() => { setValues(blank(null)); setErrors({}); setFormError(''); }}>Reset</Button>
              <Button type="submit" variant="contained" disabled={submitting}>Save Receipt</Button>
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
            <Typography color="text.secondary">After receipt: <b>{formatNumber(selected.stock + qty)}</b></Typography>
            <StockStatusChip status={getStockStatus(selected.stock + qty, selected.reorderLevel)} />
          </Stack>
        ) : (
          <Typography color="text.secondary">Select a product to see its current stock.</Typography>
        )}
      </Paper>
    </Box>
  );
}
