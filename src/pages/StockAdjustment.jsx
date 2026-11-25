import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { RECORD_STATUS } from '../domain/constants.js';
import { adjustStock } from '../domain/commands.js';
import { formatDateTime, formatNumber, formatSigned } from '../domain/format.js';
import { useInventory } from '../context/InventoryContext.jsx';
import { useNotify } from '../context/NotificationProvider.jsx';
import useSubmitGuard from '../hooks/useSubmitGuard.js';
import ProductSelect from '../components/ProductSelect.jsx';

const BLANK = { productId: '', actualStock: '', reason: '' };

/** INV-09 Stock Adjustment: user enters the physical count, the difference is calculated. */
export default function StockAdjustment() {
  const { products, productViewById, run } = useInventory();
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
  const validActual = /^\d+$/.test(values.actualStock);
  const diff = selected && validActual ? Number(values.actualStock) - selected.stock : null;

  const submit = (e) => {
    e.preventDefault();
    guard(() => {
      const result = run(adjustStock, values);
      if (!result.ok) {
        setErrors(result.errors || {});
        setFormError(Object.keys(result.errors || {}).length ? 'Please correct the highlighted fields.' : result.message);
        return;
      }
      notify(`${result.record.id}: adjustment of ${formatSigned(result.record.quantityChange)} recorded. New balance: ${result.record.balanceAfter}.`);
      setErrors({});
      setFormError('');
      setValues(BLANK);
    });
  };

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, maxWidth: 820 }}>
      <Box component="form" noValidate onSubmit={submit}>
        <Stack spacing={2.5}>
          {params.get('productId') && !preset && (
            <Alert severity="warning">The selected product is inactive or does not exist, so it cannot be adjusted.</Alert>
          )}
          {formError && <Alert severity="error">{formError}</Alert>}
          <ProductSelect products={activeProducts} value={values.productId} onChange={(id) => setValues((v) => ({ ...v, productId: id }))} required error={errors.productId} helperText={errors.productId} />
          <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))' }}>
            <TextField label="Current Stock (system)" value={selected ? formatNumber(selected.stock) : ''} disabled />
            <TextField
              required label="Actual Stock (physical count)" type="number" value={values.actualStock} onChange={set('actualStock')}
              error={Boolean(errors.actualStock)} helperText={errors.actualStock} slotProps={{ htmlInput: { min: 0, step: 1 } }}
            />
            <TextField label="Adjustment Date" value={formatDateTime(new Date())} disabled helperText="Set automatically when saved" />
          </Box>
          {diff !== null && (
            <Alert severity={diff === 0 ? 'info' : diff < 0 ? 'warning' : 'success'}>
              {diff === 0 ? 'No difference: nothing to adjust.' : `Adjustment: ${formatSigned(diff)} (system ${selected.stock} → physical ${values.actualStock})`}
            </Alert>
          )}
          <TextField required label="Reason" multiline minRows={2} value={values.reason} onChange={set('reason')} error={Boolean(errors.reason)} helperText={errors.reason || 'e.g. damaged units, count mismatch, found stock'} />
          <Typography variant="caption" color="text.secondary">The adjustment is saved in the transaction history and cannot be edited later.</Typography>
          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button onClick={() => { setValues(BLANK); setErrors({}); setFormError(''); }}>Reset</Button>
            <Button type="submit" variant="contained" disabled={submitting}>Save Adjustment</Button>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
}
