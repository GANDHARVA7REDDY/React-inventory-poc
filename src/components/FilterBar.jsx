import { Box, Button, Paper } from '@mui/material';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';

/** Wrapping filter row. Children are fields; `onClear` renders the Clear Filters button. */
export default function FilterBar({ children, onClear }) {
  return (
    <Paper sx={{ p: 2, mb: 2, minWidth: 0 }}>
      <Box
        sx={{
          display: 'grid', gap: 2, alignItems: 'start',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
          minWidth: 0,
          '& > .MuiFormControl-root': { minWidth: 0, width: '100%' },
          '& > button': { justifySelf: 'start' },
        }}
      >
        {children}
        {onClear && (
          <Button startIcon={<FilterAltOffIcon />} onClick={onClear} sx={{ justifySelf: 'start', height: 40 }}>
            Clear Filters
          </Button>
        )}
      </Box>
    </Paper>
  );
}
