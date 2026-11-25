import { Chip } from '@mui/material';
import { RECORD_STATUS, STOCK_STATUS } from '../domain/constants.js';

const STOCK_COLOR = {
  [STOCK_STATUS.IN]: 'success',
  [STOCK_STATUS.LOW]: 'warning',
  [STOCK_STATUS.OUT]: 'error',
};

export function StockStatusChip({ status }) {
  return <Chip size="small" label={status} color={STOCK_COLOR[status] || 'default'} variant="outlined" />;
}

export function RecordStatusChip({ status }) {
  return (
    <Chip
      size="small"
      label={status}
      color={status === RECORD_STATUS.ACTIVE ? 'success' : 'default'}
      variant={status === RECORD_STATUS.ACTIVE ? 'filled' : 'outlined'}
    />
  );
}
