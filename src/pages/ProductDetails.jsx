import { useMemo } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Box, Button, Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import { RECORD_STATUS } from '../domain/constants.js';
import { formatCurrency, formatDateTime, formatNumber, formatSigned } from '../domain/format.js';
import { useInventory } from '../context/InventoryContext.jsx';
import NotFoundMessage from '../components/NotFoundMessage.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import { RecordStatusChip, StockStatusChip } from '../components/StatusChip.jsx';

function Info({ label, children }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography component="div" sx={{ overflowWrap: 'anywhere' }}>{children || '—'}</Typography>
    </Box>
  );
}

/** INV-04 Product Details with latest 10 transactions and a link to the full history. */
export default function ProductDetails() {
  const { id } = useParams();
  const { productViewById, transactions } = useInventory();
  const product = productViewById.get(id);

  const latest = useMemo(
    () => transactions
      .filter((t) => t.productId === id)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp) || b.id.localeCompare(a.id))
      .slice(0, 10),
    [transactions, id],
  );

  if (!product) {
    return <NotFoundMessage title="Product not found" message="This product does not exist or may have been removed." backTo="/products" backLabel="Back to products" />;
  }
  const active = product.status === RECORD_STATUS.ACTIVE;

  return (
    <>
      <PageHeader
        title={`${product.code} — ${product.name}`}
        subtitle={<><RecordStatusChip status={product.status} /></>}
        actions={
          <>
            <Button component={RouterLink} to={`/products/${id}/edit`} startIcon={<EditIcon />} variant="outlined">Edit</Button>
            <Button component={RouterLink} to={`/stock-in?productId=${id}`} disabled={!active} variant="outlined">Stock In</Button>
            <Button component={RouterLink} to={`/stock-out?productId=${id}`} disabled={!active} variant="outlined">Stock Out</Button>
            <Button component={RouterLink} to={`/stock-adjustment?productId=${id}`} disabled={!active} variant="outlined">Adjust</Button>
          </>
        }
      />

      <Box sx={{ display: 'grid', gap: 2, mb: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
        <StatCard label="Available Stock" value={`${formatNumber(product.stock)} ${product.unit}`} />
        <StatCard label="Inventory Value" value={formatCurrency(product.inventoryValue)} />
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">Stock Status</Typography>
          <Box sx={{ mt: 1 }}><StockStatusChip status={product.stockStatus} /></Box>
          <Typography variant="caption" color="text.secondary">Reorder level {product.reorderLevel}</Typography>
        </Paper>
      </Box>

      <Paper sx={{ p: 2.5, mb: 2 }}>
        <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <Info label="Product Code">{product.code}</Info>
          <Info label="Category">{product.categoryName}</Info>
          <Info label="Default Supplier">{product.supplierName}</Info>
          <Info label="Unit of Measure">{product.unit}</Info>
          <Info label="Unit Cost">{formatCurrency(product.unitCost)}</Info>
          <Info label="Opening Stock">{formatNumber(product.openingStock)}</Info>
          <Info label="Reorder Level">{product.reorderLevel}</Info>
          <Info label="Created">{formatDateTime(product.createdAt)}</Info>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Info label="Description">{product.description}</Info>
      </Paper>

      <PageHeader
        title="Latest transactions"
        subtitle="Most recent 10 movements"
        actions={<Button component={RouterLink} to={`/transactions?productId=${id}`} startIcon={<HistoryIcon />}>View full history</Button>}
      />
      <Paper sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Change</TableCell>
                <TableCell align="right">Balance After</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {latest.map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell>{t.id}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDateTime(t.timestamp)}</TableCell>
                  <TableCell>{t.type}</TableCell>
                  <TableCell align="right" sx={{ color: t.quantityChange < 0 ? 'error.main' : 'success.main', fontWeight: 600 }}>{formatSigned(t.quantityChange)}</TableCell>
                  <TableCell align="right">{formatNumber(t.balanceAfter)}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{t.remarks}</TableCell>
                </TableRow>
              ))}
              {latest.length === 0 && (
                <TableRow><TableCell colSpan={6} align="center">No transactions recorded.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
}
