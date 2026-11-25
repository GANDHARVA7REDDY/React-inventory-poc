import DashboardIcon from '@mui/icons-material/SpaceDashboard';
import InventoryIcon from '@mui/icons-material/Inventory2';
import CategoryIcon from '@mui/icons-material/Category';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import OutboxIcon from '@mui/icons-material/Outbox';
import TuneIcon from '@mui/icons-material/Tune';
import HistoryIcon from '@mui/icons-material/History';
import AssessmentIcon from '@mui/icons-material/Assessment';

/** Sidebar entries required by FR-001, in order. */
export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon />, exact: true },
  { label: 'Products', path: '/products', icon: <InventoryIcon /> },
  { label: 'Categories', path: '/categories', icon: <CategoryIcon /> },
  { label: 'Suppliers', path: '/suppliers', icon: <LocalShippingIcon /> },
  { label: 'Stock In', path: '/stock-in', icon: <MoveToInboxIcon /> },
  { label: 'Stock Out', path: '/stock-out', icon: <OutboxIcon /> },
  { label: 'Stock Adjustment', path: '/stock-adjustment', icon: <TuneIcon /> },
  { label: 'Transactions', path: '/transactions', icon: <HistoryIcon /> },
  { label: 'Reports', path: '/reports', icon: <AssessmentIcon /> },
];

export const isNavActive = (item, pathname) =>
  item.exact ? pathname === item.path : pathname === item.path || pathname.startsWith(`${item.path}/`);

export function getPageTitle(pathname) {
  if (pathname === '/products/new') return 'Add Product';
  if (/^\/products\/[^/]+\/edit$/.test(pathname)) return 'Edit Product';
  if (/^\/products\/[^/]+$/.test(pathname)) return 'Product Details';
  if (pathname === '/reports/low-stock') return 'Low Stock Report';
  const item = NAV_ITEMS.find((n) => isNavActive(n, pathname));
  return item ? item.label : 'Page not found';
}
