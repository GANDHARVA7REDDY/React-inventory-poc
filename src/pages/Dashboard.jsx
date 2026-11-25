import { useMemo } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useTheme } from '@mui/material';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import InventoryIcon from '@mui/icons-material/Inventory2';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { summarizeInventory } from '../domain/stock.js';
import { formatCurrency, formatNumber } from '../domain/format.js';
import { useInventory } from '../context/InventoryContext.jsx';
import StatCard from '../components/StatCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { StockStatusChip } from '../components/StatusChip.jsx';

const REPLENISH_LIMIT = 8;

/** INV-01 Dashboard: every figure is derived from current data, so it updates after each transaction. */
export default function Dashboard() {
  const { productViews, categories, transactions } = useInventory();
  const muiTheme = useTheme();
  const navigate = useNavigate();
  const s = useMemo(() => summarizeInventory(productViews, categories, transactions), [productViews, categories, transactions]);
  const shown = s.replenishment.slice(0, REPLENISH_LIMIT);

  return (
    <>
      <Box sx={{ display: 'grid', gap: 2, mb: 3, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))' }}>
        <StatCard label="Total Products" value={formatNumber(s.totalProducts)} caption="Active products" icon={<InventoryIcon />} onClick={() => navigate('/products')} />
        <StatCard label="Total Stock Units" value={formatNumber(s.totalUnits)} caption="Across active products" icon={<WarehouseIcon />} color="secondary.main" />
        <StatCard label="Low Stock Products" value={formatNumber(s.lowStock)} caption="At or below reorder level" icon={<WarningAmberIcon />} color="warning.main" onClick={() => navigate('/reports/low-stock')} />
        <StatCard label="Out of Stock" value={formatNumber(s.outOfStock)} caption="Zero quantity" icon={<RemoveShoppingCartIcon />} color="error.main" onClick={() => navigate('/reports/low-stock')} />
        <StatCard label="Inventory Value" value={formatCurrency(s.inventoryValue)} caption="Stock × unit cost" icon={<CurrencyRupeeIcon />} color="success.main" />
        <StatCard
          label="Today's Transactions" value={formatNumber(s.todayTotal)}
          caption={`${s.todayReceipts} receipts · ${s.todayIssues} issues · ${s.todayAdjustments} adjustments`}
          icon={<SwapHorizIcon />} onClick={() => navigate('/transactions')}
        />
      </Box>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) minmax(0, 1fr)' }, alignItems: 'start' }}>
        <Paper sx={{ p: 2 }}>
          <PageHeader title="Stock by category" subtitle="Available units of active products" />
          <Box sx={{ width: '100%', height: Math.max(260, s.byCategory.length * 56) }}>
            <ResponsiveContainer>
              <BarChart data={s.byCategory} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                <CartesianGrid stroke={muiTheme.palette.mode === 'dark' ? 'rgba(255,255,255,0.09)' : muiTheme.palette.divider} strokeDasharray="4 5" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fill: muiTheme.palette.mode === 'dark' ? '#B5B8C0' : muiTheme.palette.text.secondary, fontSize: 11 }} axisLine={{ stroke: muiTheme.palette.mode === 'dark' ? 'rgba(255,255,255,0.14)' : muiTheme.palette.divider }} tickLine={{ stroke: muiTheme.palette.mode === 'dark' ? 'rgba(255,255,255,0.14)' : muiTheme.palette.divider }} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fill: muiTheme.palette.mode === 'dark' ? '#D7D9DE' : muiTheme.palette.text.secondary }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [formatNumber(v), 'Units']} contentStyle={{ backgroundColor: muiTheme.palette.mode === 'dark' ? 'rgba(20,22,27,0.96)' : 'rgba(249,249,249,0.97)', border: muiTheme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.14)' : `1px solid ${muiTheme.palette.divider}`, borderRadius: 12, color: muiTheme.palette.text.primary, backdropFilter: 'blur(14px)', boxShadow: muiTheme.palette.mode === 'dark' ? '0 10px 30px rgba(0,0,0,0.32)' : '0 10px 30px rgba(51,51,51,0.12)' }} labelStyle={{ color: muiTheme.palette.primary.light, fontWeight: 700 }} itemStyle={{ color: muiTheme.palette.text.primary }} />
                <Bar dataKey="units" fill={muiTheme.palette.primary.main} radius={[0, 7, 7, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <PageHeader
            title="Needs replenishment"
            subtitle={`${s.replenishment.length} product(s) low or out of stock`}
            actions={<Button component={RouterLink} to="/reports/low-stock" size="small">Full report</Button>}
          />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Stock</TableCell>
                  <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Reorder</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shown.map((v) => (
                  <TableRow key={v.id} hover>
                    <TableCell>
                      <Typography component={RouterLink} to={`/products/${v.id}`} variant="body2" sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                        {v.code} — {v.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{formatNumber(v.stock)}</TableCell>
                    <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{v.reorderLevel}</TableCell>
                    <TableCell><StockStatusChip status={v.stockStatus} /></TableCell>
                  </TableRow>
                ))}
                {shown.length === 0 && (
                  <TableRow><TableCell colSpan={4} align="center">All active products are sufficiently stocked.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {s.replenishment.length > shown.length && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Showing {shown.length} of {s.replenishment.length}.
            </Typography>
          )}
        </Paper>
      </Box>
    </>
  );
}
