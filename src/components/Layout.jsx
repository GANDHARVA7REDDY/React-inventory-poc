import { useState } from 'react';
import { useColorMode } from '../context/ColorModeContext.jsx';
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';
import {
  AppBar, Box, Chip, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Tooltip, Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import { NAV_ITEMS, getPageTitle, isNavActive } from '../navigation.jsx';

const DRAWER_WIDTH = 248;

/** Common layout: sidebar (permanent on desktop, slide-over on tablet/phone), header with page title, routed content. */
export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { mode, toggleColorMode } = useColorMode();
  const isDark = mode === 'dark';
  const { pathname } = useLocation();
  const title = getPageTitle(pathname);

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: isDark ? 'linear-gradient(180deg, rgba(255,122,24,0.045), transparent 32%)' : 'linear-gradient(180deg, rgba(232,80,2,0.055), transparent 32%)' }}>
      <Toolbar sx={{ gap: 1.5, minHeight: 76 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 2.5, display: 'grid', placeItems: 'center', background: isDark ? 'linear-gradient(135deg, #FFA044, #FF7414)' : 'linear-gradient(135deg, #E85002, #F16001)', boxShadow: isDark ? '0 5px 18px rgba(255,122,24,0.24)' : '0 5px 18px rgba(232,80,2,0.2)' }}>
          <WarehouseIcon sx={{ color: isDark ? '#17100A' : '#FFFFFF' }} />
        </Box>
        <Typography variant="subtitle1" fontWeight={800} noWrap sx={{ letterSpacing: '-0.02em' }}>Inventory Manager</Typography>
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
                borderRadius: 2, mb: 0.5, border: '1px solid transparent', color: 'text.secondary',
                '&.Mui-selected': {
                  bgcolor: isDark ? 'rgba(255,122,24,0.13)' : 'rgba(232,80,2,0.09)',
                  color: isDark ? 'primary.light' : 'primary.main',
                  borderColor: isDark ? 'rgba(255,162,74,0.22)' : 'rgba(232,80,2,0.2)',
                  boxShadow: isDark ? 'inset 3px 0 0 #FF7A18' : 'inset 3px 0 0 #E85002',
                  '&:hover': { bgcolor: isDark ? 'rgba(255,122,24,0.18)' : 'rgba(232,80,2,0.13)' },
                },
                '&.Mui-selected .MuiListItemIcon-root': { color: isDark ? 'primary.light' : 'primary.main' },
                '&:hover': { color: 'text.primary', bgcolor: isDark ? 'rgba(255,255,255,0.045)' : 'rgba(51,51,51,0.045)' },
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
        sx={{ width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` }, ml: { lg: `${DRAWER_WIDTH}px` }, borderWidth: '0 0 1px 0' }}
      >
        <Toolbar>
          <IconButton edge="start" aria-label="Open navigation" onClick={() => setMobileOpen(true)} sx={{ mr: 1, display: { xs: 'inline-flex', lg: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="h1" noWrap sx={{ flexGrow: 1, fontWeight: 750 }}>{title}</Typography>
          <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton
              onClick={toggleColorMode}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              sx={{ mr: 1, color: 'primary.main' }}
            >
              {isDark ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          <Chip label="Demo user" size="small" variant="outlined" sx={{
            display: { xs: 'none', md: 'inline-flex' },
            color: 'primary.light',
            borderColor: isDark ? 'rgba(255,162,74,0.35)' : 'rgba(232,80,2,0.28)',
            bgcolor: isDark ? 'rgba(255,122,24,0.07)' : 'rgba(232,80,2,0.045)',
          }} />
        </Toolbar>
      </AppBar>

      <Box component="aside" sx={{ width: { lg: DRAWER_WIDTH }, flexShrink: { lg: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', lg: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, maxWidth: 'calc(100vw - 48px)' } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{ display: { xs: 'none', lg: 'block' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, width: '100%', minWidth: 0, p: { xs: 1, sm: 1.5, md: 2, lg: 3 } }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
