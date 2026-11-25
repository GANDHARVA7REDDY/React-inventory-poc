import { useMemo, useState } from 'react';
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Stack, TextField, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline';
import { RECORD_STATUS } from '../domain/constants.js';
import useTableControls from '../hooks/useTableControls.js';
import useSubmitGuard from '../hooks/useSubmitGuard.js';
import { useNotify } from '../context/NotificationProvider.jsx';
import { useInventory } from '../context/InventoryContext.jsx';
import DataTable from './DataTable.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import { RecordStatusChip } from './StatusChip.jsx';
import PageHeader from './PageHeader.jsx';
import FilterBar from './FilterBar.jsx';

/**
 * Shared list + add/edit dialog + activate/deactivate for Categories and Suppliers.
 *
 * Props:
 *  entity        'category' | 'supplier' (label used in messages)
 *  rows          records to list
 *  columns       extra columns shown between the code and the status
 *  fields        [{ name, label, required, multiline, type, maxLength }] form fields (code is locked when editing)
 *  saveCommand   (state, input, id?) => result
 *  statusCommand (state, id, status) => result
 */
export default function MasterDataManager({ entity, rows, columns, fields, saveCommand, statusCommand }) {
  const { run } = useInventory();
  const notify = useNotify();
  const { submitting, guard } = useSubmitGuard();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dialog, setDialog] = useState(null); // { id|null, values }
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [confirm, setConfirm] = useState(null); // { row, next }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false;
      return !q || `${r.code} ${r.name}`.toLowerCase().includes(q);
    });
  }, [rows, search, statusFilter]);
  const controls = useTableControls(filtered, { initialSort: { key: 'code', dir: 'asc' } });

  const label = entity.charAt(0).toUpperCase() + entity.slice(1);
  const emptyValues = () => ({ ...Object.fromEntries(fields.map((f) => [f.name, ''])), status: RECORD_STATUS.ACTIVE });

  const openAdd = () => { setErrors({}); setFormError(''); setDialog({ id: null, values: emptyValues() }); };
  const openEdit = (row) => {
    setErrors({}); setFormError('');
    setDialog({ id: row.id, values: { ...emptyValues(), ...Object.fromEntries(fields.map((f) => [f.name, row[f.name] ?? ''])), status: row.status } });
  };
  const setValue = (name, v) => setDialog((d) => ({ ...d, values: { ...d.values, [name]: v } }));

  const save = () => guard(() => {
    const result = run(saveCommand, dialog.values, dialog.id);
    if (!result.ok) {
      setErrors(result.errors || {});
      setFormError(Object.keys(result.errors || {}).length ? '' : result.message);
      return;
    }
    notify(`${label} "${result.record.name}" ${dialog.id ? 'updated' : 'created'}.`);
    setDialog(null);
  });

  const changeStatus = () => {
    const { row, next } = confirm;
    const result = run(statusCommand, row.id, next);
    setConfirm(null);
    if (result.ok) notify(`${label} "${row.name}" is now ${next.toLowerCase()}.`);
    else notify(result.message, 'error');
  };

  const allColumns = [
    { key: 'code', label: `${label} Code` },
    { key: 'name', label: `${label} Name`, minWidth: 160 },
    ...columns,
    { key: 'status', label: 'Status', render: (r) => <RecordStatusChip status={r.status} /> },
    {
      key: 'actions', label: 'Actions', sortable: false, align: 'right',
      render: (r) => (
        <Box sx={{ whiteSpace: 'nowrap' }}>
          <Tooltip title="Edit"><IconButton size="small" aria-label={`Edit ${r.name}`} onClick={() => openEdit(r)}><EditIcon fontSize="small" /></IconButton></Tooltip>
          {r.status === RECORD_STATUS.ACTIVE ? (
            <Tooltip title="Deactivate"><IconButton size="small" color="error" aria-label={`Deactivate ${r.name}`} onClick={() => setConfirm({ row: r, next: RECORD_STATUS.INACTIVE })}><BlockIcon fontSize="small" /></IconButton></Tooltip>
          ) : (
            <Tooltip title="Activate"><IconButton size="small" color="success" aria-label={`Activate ${r.name}`} onClick={() => setConfirm({ row: r, next: RECORD_STATUS.ACTIVE })}><CheckCircleIcon fontSize="small" /></IconButton></Tooltip>
          )}
        </Box>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={`${label} Management`}
        subtitle={`${rows.length} ${entity === 'category' ? 'categories' : 'suppliers'} in total`}
        actions={<Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add {label}</Button>}
      />
      <FilterBar onClear={() => { setSearch(''); setStatusFilter(''); }}>
        <TextField size="small" label="Search code or name" value={search} onChange={(e) => setSearch(e.target.value)} />
        <TextField size="small" select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value={RECORD_STATUS.ACTIVE}>Active</MenuItem>
          <MenuItem value={RECORD_STATUS.INACTIVE}>Inactive</MenuItem>
        </TextField>
      </FilterBar>
      <DataTable columns={allColumns} controls={controls} emptyMessage={`No ${entity === 'category' ? 'categories' : 'suppliers'} match the filters.`} />

      <Dialog open={Boolean(dialog)} onClose={() => setDialog(null)} fullWidth maxWidth="sm">
        {dialog && (
          <Box component="form" noValidate onSubmit={(e) => { e.preventDefault(); save(); }}>
            <DialogTitle>{dialog.id ? `Edit ${label}` : `Add ${label}`}</DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                {formError && <Alert severity="error">{formError}</Alert>}
                {fields.map((f) => (
                  <TextField
                    key={f.name}
                    label={f.label}
                    required={f.required}
                    multiline={f.multiline}
                    minRows={f.multiline ? 2 : undefined}
                    type={f.type || 'text'}
                    value={dialog.values[f.name]}
                    onChange={(e) => setValue(f.name, e.target.value)}
                    disabled={f.name === 'code' && Boolean(dialog.id)}
                    error={Boolean(errors[f.name])}
                    helperText={errors[f.name] || (f.name === 'code' && dialog.id ? 'Code cannot be changed after creation.' : undefined)}
                    slotProps={{ htmlInput: { maxLength: f.maxLength } }}
                    fullWidth
                  />
                ))}
                <TextField
                  select label="Status" value={dialog.values.status} onChange={(e) => setValue('status', e.target.value)}
                  error={Boolean(errors.status)} helperText={errors.status} fullWidth
                >
                  <MenuItem value={RECORD_STATUS.ACTIVE}>Active</MenuItem>
                  <MenuItem value={RECORD_STATUS.INACTIVE}>Inactive</MenuItem>
                </TextField>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setDialog(null)}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={submitting}>Save</Button>
            </DialogActions>
          </Box>
        )}
      </Dialog>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.next === RECORD_STATUS.INACTIVE ? `Deactivate ${entity}?` : `Activate ${entity}?`}
        message={confirm ? `${confirm.row.name} will be marked ${confirm.next.toLowerCase()}.` : ''}
        confirmLabel={confirm?.next === RECORD_STATUS.INACTIVE ? 'Deactivate' : 'Activate'}
        color={confirm?.next === RECORD_STATUS.INACTIVE ? 'error' : 'primary'}
        onConfirm={changeStatus}
        onCancel={() => setConfirm(null)}
      />
    </>
  );
}
