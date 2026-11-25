import { createTheme } from '@mui/material/styles';

// Dark glass surfaces, warm orange accents, and crisp white typography.
export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#FF7A18', light: '#FFA24A', dark: '#D95C00', contrastText: '#17100A' },
    secondary: { main: '#FFFFFF', light: '#FFFFFF', dark: '#D7D7DB', contrastText: '#111216' },
    background: { default: '#090A0D', paper: 'rgba(20, 22, 27, 0.78)' },
    text: { primary: '#F7F7F9', secondary: '#B5B8C0', disabled: '#777C86' },
    divider: 'rgba(255, 255, 255, 0.11)',
    success: { main: '#35C98B' },
    warning: { main: '#FFB547' },
    error: { main: '#FF626B' },
    info: { main: '#79BFFF' },
    action: {
      hover: 'rgba(255, 255, 255, 0.055)',
      selected: 'rgba(255, 122, 24, 0.14)',
      disabledBackground: 'rgba(255, 255, 255, 0.08)',
    },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 750, letterSpacing: '-0.035em' },
    h5: { fontWeight: 700, letterSpacing: '-0.025em' },
    h6: { fontWeight: 700, letterSpacing: '-0.02em' },
    button: { fontWeight: 700, letterSpacing: '0.01em' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#090A0D',
          backgroundImage: [
            'radial-gradient(circle at 12% 0%, rgba(255, 122, 24, 0.17), transparent 30%)',
            'radial-gradient(circle at 92% 12%, rgba(255, 255, 255, 0.055), transparent 25%)',
            'linear-gradient(135deg, #090A0D 0%, #111216 52%, #090A0D 100%)',
          ].join(', '),
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        },
        '*': { scrollbarColor: 'rgba(255, 255, 255, 0.22) transparent', scrollbarWidth: 'thin' },
        '*::-webkit-scrollbar': { width: 8, height: 8 },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(20, 22, 27, 0.72)',
          backgroundImage: 'none',
          backdropFilter: 'blur(18px) saturate(135%)',
          WebkitBackdropFilter: 'blur(18px) saturate(135%)',
          border: '1px solid rgba(255, 255, 255, 0.105)',
          boxShadow: '0 12px 34px rgba(0, 0, 0, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.035)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(10, 11, 14, 0.76)',
          backgroundImage: 'none',
          backdropFilter: 'blur(20px) saturate(145%)',
          WebkitBackdropFilter: 'blur(20px) saturate(145%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 28px rgba(0, 0, 0, 0.22)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(12, 13, 16, 0.88)',
          backgroundImage: 'none',
          backdropFilter: 'blur(22px) saturate(145%)',
          WebkitBackdropFilter: 'blur(22px) saturate(145%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          borderRadius: 10,
          transition: 'transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease',
        },
        containedPrimary: {
          color: '#17100A',
          background: 'linear-gradient(135deg, #FFA044 0%, #FF7414 100%)',
          boxShadow: '0 5px 18px rgba(255, 122, 24, 0.2)',
          '&:hover': {
            background: 'linear-gradient(135deg, #FFB15F 0%, #F76508 100%)',
            boxShadow: '0 8px 22px rgba(255, 122, 24, 0.28)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderColor: 'rgba(255, 255, 255, 0.2)',
          '&:hover': {
            borderColor: 'rgba(255, 162, 74, 0.72)',
            backgroundColor: 'rgba(255, 122, 24, 0.08)',
          },
        },
        text: { '&:hover': { backgroundColor: 'rgba(255, 122, 24, 0.1)' } },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.035)',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.17)' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 162, 74, 0.65)' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#FF8A2A', borderWidth: 1.5 },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: { root: { color: '#B5B8C0', '&.Mui-focused': { color: '#FFA24A' } } },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: '1px solid rgba(255, 255, 255, 0.075)' },
        head: {
          fontWeight: 750,
          whiteSpace: 'nowrap',
          color: '#F7F7F9',
          backgroundColor: 'rgba(255, 122, 24, 0.075)',
          borderBottom: '1px solid rgba(255, 162, 74, 0.2)',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: { '&.MuiTableRow-hover:hover': { backgroundColor: 'rgba(255, 122, 24, 0.055)' } },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          marginBottom: 4,
          transition: 'background-color 160ms ease, border-color 160ms ease',
          '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.055)' },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: { root: { '&:hover': { backgroundColor: 'rgba(255, 122, 24, 0.12)' } } },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: 'rgba(255, 255, 255, 0.1)' } },
    },
    MuiTabs: {
      styleOverrides: { indicator: { height: 3, borderRadius: 3, backgroundColor: '#FF8A2A' } },
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 650, '&.Mui-selected': { color: '#FFA24A' } },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 650 },
        outlined: { borderColor: 'rgba(255, 255, 255, 0.2)' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(20, 22, 27, 0.94)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'rgba(25, 26, 31, 0.96)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(12px)',
          fontSize: '0.75rem',
        },
      },
    },
  },
});
