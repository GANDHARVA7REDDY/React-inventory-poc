import { createTheme } from '@mui/material/styles';

// Colors sampled from the supplied palette reference.
const PALETTE = {
  orange: '#E85002',
  black: '#000000',
  white: '#F9F9F9',
  gray: '#646464',
  lightGray: '#A7A7A7',
  darkGray: '#333333',
  brandGradient: 'linear-gradient(90deg, #000000 0%, #C10801 35%, #F16001 70%, #D9C3AB 100%)',
};

export function createAppTheme(mode = 'dark') {
  const isDark = mode === 'dark';

  const palette = isDark
    ? {
        mode: 'dark',
        primary: { main: '#FF7A18', light: '#FFA24A', dark: '#D95C00', contrastText: '#17100A' },
        secondary: { main: '#FFFFFF', light: '#FFFFFF', dark: '#D7D7DB', contrastText: '#111216' },
        background: { default: '#090A0D', paper: '#14161B' },
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
      }
    : {
        mode: 'light',
        primary: { main: PALETTE.orange, light: '#F16001', dark: '#C10801', contrastText: '#000000' },
        secondary: { main: PALETTE.gray, light: PALETTE.lightGray, dark: PALETTE.darkGray, contrastText: '#FFFFFF' },
        background: { default: PALETTE.white, paper: '#FFFFFF' },
        text: { primary: PALETTE.black, secondary: PALETTE.gray, disabled: PALETTE.lightGray },
        divider: 'rgba(51, 51, 51, 0.14)',
        success: { main: '#16845B' },
        warning: { main: '#A65A00' },
        error: { main: '#C62828' },
        info: { main: '#245E91' },
        action: {
          hover: 'rgba(51, 51, 51, 0.045)',
          selected: 'rgba(232, 80, 2, 0.1)',
          disabledBackground: 'rgba(51, 51, 51, 0.08)',
        },
      };

  return createTheme({
    palette,
    shape: { borderRadius: 12 },
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
            backgroundColor: isDark ? '#090A0D' : PALETTE.white,
            minHeight: '100vh',
          },
          '*': {
            scrollbarColor: isDark ? 'rgba(255, 255, 255, 0.22) transparent' : 'rgba(100, 100, 100, 0.35) transparent',
            scrollbarWidth: 'thin',
          },
          '*::-webkit-scrollbar': { width: 8, height: 8 },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(100, 100, 100, 0.32)',
            borderRadius: 8,
          },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#14161B' : '#FFFFFF',
            backgroundImage: 'none',
            border: isDark ? '1px solid #292C33' : '1px solid #E1E1E1',
            boxShadow: isDark ? '0 2px 8px rgba(0, 0, 0, 0.18)' : '0 2px 8px rgba(51, 51, 51, 0.055)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#090A0D' : PALETTE.white,
            backgroundImage: 'none',
            borderBottom: isDark ? '1px solid #292C33' : '1px solid #DDDDDD',
            '&:after': isDark
              ? undefined
              : {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: '2px',
                  background: PALETTE.brandGradient,
                },
            boxShadow: 'none',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#0D0E12' : '#FFFFFF',
            backgroundImage: 'none',
            borderRight: isDark ? '1px solid #292C33' : '1px solid #DDDDDD',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 9,
            transition: 'transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease',
          },
          containedPrimary: {
            color: isDark ? '#17100A' : '#000000',
            background: isDark
              ? 'linear-gradient(135deg, #FFA044 0%, #FF7414 100%)'
              : 'linear-gradient(135deg, #E85002 0%, #F16001 100%)',
            boxShadow: 'none',
            '&:hover': {
              background: isDark
                ? 'linear-gradient(135deg, #FFB15F 0%, #F76508 100%)'
                : 'linear-gradient(135deg, #F16001 0%, #E85002 100%)',
              boxShadow: 'none',
              transform: 'translateY(-1px)',
            },
          },
          outlined: {
            borderColor: isDark ? '#454951' : '#A7A7A7',
            '&:hover': {
              borderColor: isDark ? '#FFA24A' : PALETTE.orange,
              backgroundColor: isDark ? '#21170F' : '#FFF1E9',
            },
          },
          text: {
            '&:hover': { backgroundColor: isDark ? '#21170F' : '#FFF1E9' },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 9,
            backgroundColor: isDark ? '#101115' : '#FFFFFF',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#454951' : '#BDBDBD',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#FFA24A' : PALETTE.orange,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#FF8A2A' : PALETTE.orange,
              borderWidth: 1.5,
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: isDark ? '#B5B8C0' : PALETTE.gray,
            '&.Mui-focused': { color: isDark ? '#FFA24A' : PALETTE.orange },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: isDark ? '1px solid #292C33' : '1px solid #E6E6E6',
          },
          head: {
            fontWeight: 750,
            whiteSpace: 'nowrap',
            color: isDark ? '#F7F7F9' : PALETTE.darkGray,
            backgroundColor: isDark ? '#21170F' : '#FFF1E9',
            borderBottom: isDark ? '1px solid #63300F' : '1px solid #F1C2AA',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&.MuiTableRow-hover:hover': {
              backgroundColor: isDark ? '#1E1A17' : '#FFF8F4',
            },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 9,
            marginBottom: 4,
            transition: 'background-color 160ms ease, border-color 160ms ease',
            '&:hover': { backgroundColor: isDark ? '#1B1D22' : '#F1F1F1' },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            '&:hover': { backgroundColor: isDark ? '#21170F' : '#FFF1E9' },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: { borderColor: isDark ? '#292C33' : '#DDDDDD' },
        },
      },
      MuiTabs: {
        styleOverrides: { indicator: { height: 3, borderRadius: 3, backgroundColor: isDark ? '#FF8A2A' : PALETTE.orange } },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 650,
            '&.Mui-selected': { color: isDark ? '#FFA24A' : PALETTE.orange },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 8, fontWeight: 650 },
          outlined: { borderColor: isDark ? '#454951' : '#A7A7A7' },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#14161B' : '#FFFFFF',
            backgroundImage: 'none',
            border: isDark ? '1px solid #363A43' : '1px solid #D7D7D7',
            boxShadow: isDark ? '0 8px 28px rgba(0,0,0,0.32)' : '0 8px 28px rgba(51,51,51,0.12)',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? '#333333' : '#333333',
            color: '#F9F9F9',
            border: isDark ? '1px solid #454951' : '1px solid #646464',
            fontSize: '0.75rem',
          },
        },
      },
    },
  });
}

// Keep compatibility with existing imports; dark remains the initial mode.
export const theme = createAppTheme('dark');
