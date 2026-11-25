import { useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, Button, MenuItem, Paper, Stack, TextField } from '@mui/material';
import { RECORD_STATUS, UNITS } from '../domain/constants.js';
import { createProduct, updateProduct } from '../domain/commands.js';
import { useInventory } from '../context/InventoryContext.jsx';
import { useNotify } from '../context/NotificationProvider.jsx';
import useSubmitGuard from '../hooks/useSubmitGuard.js';
import NotFoundMessage from '../components/NotFoundMessage.jsx';

const BLANK = {
  code: '', name: '', categoryId: '', supplierId: '', description: '', unit: '',
  unitCost: '', openingStock: '0', reorderLevel: '', status: RECORD_STATUS.ACTIVE,
};

/** INV-03 Add / Edit Product. Product Code and Opening Stock are locked when editing. */
export default function ProductForm() {
  const { id } = useParams();
  const { products, categories, suppliers, run } = useInventory();
  const notify = useNotify();
  const navigate = useNavigate();
  const { submitting, guard } = useSubmitGuard();
  const existing = id ? products.find((p) => p.id === id) : null;

  const [values, setValues] = useState(() => (existing ? { ...BLANK, ...existing, unitCost: String(existing.unitCost), openingStock: String(existing.openingStock), reorderLevel: String(existing.reorderLevel) } : BLANK));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  if (id && !existing) {
    return <NotFoundMessage title="Product not found" message="This product does not exist or may have been removed." backTo="/products" backLabel="Back to products" />;
  }

  const set = (name) => (e) => setValues((v) => ({ ...v, [name]: e.target.value }));
  // Active records are selectable; an inactive one stays visible only if the product already uses it.
  const categoryOptions = categories.filter((c) => c.status === RECORD_STATUS.ACTIVE || c.id === existing?.categoryId);
  const supplierOptions = suppliers.filter((s) => s.status === RECORD_STATUS.ACTIVE || s.id === existing?.supplierId);

  const submit = (e) => {
    e.preventDefault();
    guard(() => {
      const result = existing ? run(updateProduct, existing.id, values) : run(createProduct, values);
      if (!result.ok) {
        setErrors(result.errors || {});
        setFormError(Object.keys(result.errors || {}).length ? 'Please correct the highlighted fields.' : result.message);
        return;
      }
      notify(`Product "${result.record.name}" ${existing ? 'updated' : 'created'}.`);
      navigate(existing ? `/products/${existing.id}` : '/products');
    });
  };

  const field = (name, label, extra = {}) => (
    <TextField
      label={label} value={values[name]} onChange={set(name)} error={Boolean(errors[name])}
      helperText={errors[name] || extra.helperText} fullWidth {...extra}
    />
  );

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, maxWidth: 920 }}>
      <Box component="form" noValidate onSubmit={submit}>
        <Stack spacing={2.5}>
          {formError && <Alert severity="error">{formError}</Alert>}
          <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            {field('code', 'Product Code', {
              required: true, disabled: Boolean(existing),
              helperText: existing ? 'Code cannot be changed after creation.' : 'Unique, max 20 characters',
              slotProps: { htmlInput: { maxLength: 20 } },
            })}
            {field('name', 'Product Name', { required: true, slotProps: { htmlInput: { maxLength: 100 } } })}
            {field('categoryId', 'Category', {
              select: true, required: true,
              children: categoryOptions.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}{c.status === RECORD_STATUS.INACTIVE ? ' (inactive)' : ''}</MenuItem>),
            })}
            {field('supplierId', 'Supplier', {
              select: true, required: true,
              children: supplierOptions.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}{s.status === RECORD_STATUS.INACTIVE ? ' (inactive)' : ''}</MenuItem>),
            })}
            {field('unit', 'Unit of Measure', {
              select: true, required: true,
              children: UNITS.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>),
            })}
            {field('unitCost', 'Unit Cost (₹)', { required: true, type: 'number', slotProps: { htmlInput: { min: 0, step: '0.01' } } })}
            {field('openingStock', 'Opening Stock', {
              type: 'number', disabled: Boolean(existing), slotProps: { htmlInput: { min: 0, step: 1 } },
              helperText: existing ? 'Fixed at creation. Use Stock In, Stock Out or Adjustment to change stock.' : 'Whole number, 0 or more',
            })}
            {field('reorderLevel', 'Reorder Level', { required: true, type: 'number', slotProps: { htmlInput: { min: 0, step: 1 } } })}
            {field('status', 'Status', {
              select: true,
              children: [RECORD_STATUS.ACTIVE, RECORD_STATUS.INACTIVE].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>),
            })}
          </Box>
          {field('description', 'Description', {
            multiline: true, minRows: 3,
            helperText: errors.description || `${values.description.length}/500`,
          })}
          <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={1.5} justifyContent="flex-end">
            <Button component={RouterLink} to={existing ? `/products/${existing.id}` : '/products'}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>{existing ? 'Save Changes' : 'Create Product'}</Button>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
}
