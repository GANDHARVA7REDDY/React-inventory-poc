import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#2f5bea' },
    secondary: { main: '#00897b' },
    background: { default: '#f4f6fb' },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
    MuiPaper: { defaultProps: { elevation: 0 }, styleOverrides: { root: { border: '1px solid #e3e8f2' } } },
    MuiTableCell: { styleOverrides: { head: { fontWeight: 700, whiteSpace: 'nowrap', backgroundColor: '#f8f9fd' } } },
  },
});
