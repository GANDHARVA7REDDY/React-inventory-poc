import { useState } from 'react';
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';
import {
  AppBar, Box, Chip, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import { NAV_ITEMS, getPageTitle, isNavActive } from '../navigation.jsx';

const DRAWER_WIDTH = 248;

/** Common layout: sidebar (permanent on desktop, slide-over on tablet/phone), header with page title, routed content. */
export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const title = getPageTitle(pathname);

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ gap: 1.5 }}>
        <WarehouseIcon color="primary" />
        <Typography variant="subtitle1" fontWeight={700} noWrap>Inventory Manager</Typography>
      </Toolbar>
      <Divider />
      <List component="nav" aria-label="Main navigation" sx={{ px: 1, py: 1.5 }}>
        {NAV_ITEMS.map((item) => {
          const active = isNavActive(item, pathname);
          return (
            <ListItemButton
              key={item.path}
              component={RouterLink}
              to={item.path}
              selected={active}
              aria-current={active ? 'page' : undefined}
              onClick={() => setMobileOpen(false)}
              sx={{
                borderRadius: 2, mb: 0.5,
                '&.Mui-selected': { bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } },
                '&.Mui-selected .MuiListItemIcon-root': { color: 'inherit' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Typography variant="caption" color="text.secondary" sx={{ p: 2 }}>
        POC · data is kept in this browser (localStorage)
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        color="inherit"
        sx={{ width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }, ml: { md: `${DRAWER_WIDTH}px` }, borderWidth: '0 0 1px 0' }}
      >
        <Toolbar>
          <IconButton edge="start" aria-label="Open navigation" onClick={() => setMobileOpen(true)} sx={{ mr: 1, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="h1" noWrap sx={{ flexGrow: 1 }}>{title}</Typography>
          <Chip label="Demo user" size="small" variant="outlined" sx={{ display: { xs: 'none', sm: 'inline-flex' } }} />
        </Toolbar>
      </AppBar>

      <Box component="aside" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: { xs: 1.5, sm: 2, md: 3 } }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
