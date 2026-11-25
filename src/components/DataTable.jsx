import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, Typography } from '@mui/material';
import { PAGE_SIZES } from '../domain/constants.js';

/**
 * Responsive data table. Wide tables scroll horizontally inside their card, and columns with
 * `hideBelow: 'sm' | 'md' | 'lg'` collapse on narrower screens.
 * columns: [{ key, label, sortable, align, render(row), hideBelow, minWidth }]
 */
export default function DataTable({ columns, controls, rowKey = 'id', emptyMessage = 'No records found.', onRowClick }) {
  const { pageRows, total, page, pageSize, setPage, setPageSize, sort, requestSort } = controls;
  const cellSx = (c) => (c.hideBelow ? { display: { xs: 'none', [c.hideBelow]: 'table-cell' } } : undefined);

  return (
    <Paper sx={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>
      <TableContainer sx={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <Table size="small" aria-label="data table" sx={{ width: '100%', minWidth: 'max-content' }}>
          <TableHead>
            <TableRow>
              {columns.map((c) => (
                <TableCell
                  key={c.key}
                  align={c.align}
                  sx={{ ...cellSx(c), minWidth: c.minWidth }}
                  sortDirection={sort.key === (c.sortKey || c.key) ? sort.dir : false}
                >
                  {c.sortable === false ? (
                    c.label
                  ) : (
                    <TableSortLabel
                      active={sort.key === (c.sortKey || c.key)}
                      direction={sort.key === (c.sortKey || c.key) ? sort.dir : 'asc'}
                      onClick={() => requestSort(c.sortKey || c.key)}
                    >
                      {c.label}
                    </TableSortLabel>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.map((row) => (
              <TableRow
                key={row[rowKey]}
                hover
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                sx={onRowClick ? { cursor: 'pointer' } : undefined}
              >
                {columns.map((c) => (
                  <TableCell key={c.key} align={c.align} sx={cellSx(c)}>
                    {c.render ? c.render(row) : row[c.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {pageRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">{emptyMessage}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(e) => setPageSize(Number(e.target.value))}
        rowsPerPageOptions={PAGE_SIZES}
        labelRowsPerPage="Rows"
        sx={{
          width: '100%',
          '& .MuiTablePagination-toolbar': {
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
            gap: 1,
            minHeight: 'auto',
            px: { xs: 1, sm: 2 },
            py: 1,
          },
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
            my: 0,
            whiteSpace: 'nowrap',
          },
          '& .MuiTablePagination-actions': { ml: 0 },
        }}
      />
    </Paper>
  );
}
