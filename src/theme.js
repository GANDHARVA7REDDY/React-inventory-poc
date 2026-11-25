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
      }
    : {
        mode: 'light',
        primary: { main: PALETTE.orange, light: '#F16001', dark: '#C10801', contrastText: '#000000' },
        secondary: { main: PALETTE.gray, light: PALETTE.lightGray, dark: PALETTE.darkGray, contrastText: '#FFFFFF' },
        background: { default: PALETTE.white, paper: 'rgba(249, 249, 249, 0.82)' },
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
            backgroundColor: isDark ? '#090A0D' : PALETTE.white,
            backgroundImage: isDark
              ? [
                  'radial-gradient(circle at 12% 0%, rgba(255, 122, 24, 0.17), transparent 30%)',
                  'radial-gradient(circle at 92% 12%, rgba(255, 255, 255, 0.055), transparent 25%)',
                  'linear-gradient(135deg, #090A0D 0%, #111216 52%, #090A0D 100%)',
                ].join(', ')
              : [
                  'radial-gradient(circle at 12% 0%, rgba(232, 80, 2, 0.10), transparent 32%)',
                  'radial-gradient(circle at 92% 12%, rgba(167, 167, 167, 0.16), transparent 28%)',
                  'linear-gradient(135deg, #F9F9F9 0%, #F0F0F0 52%, #F9F9F9 100%)',
                ].join(', '),
            backgroundAttachment: 'fixed',
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
          root: isDark
            ? {
                backgroundColor: 'rgba(20, 22, 27, 0.72)',
                backgroundImage: 'none',
                backdropFilter: 'blur(18px) saturate(135%)',
                WebkitBackdropFilter: 'blur(18px) saturate(135%)',
                border: '1px solid rgba(255, 255, 255, 0.105)',
                boxShadow: '0 12px 34px rgba(0, 0, 0, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.035)',
              }
            : {
                backgroundColor: 'rgba(249, 249, 249, 0.76)',
                backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.44), rgba(249,249,249,0.14))',
                backdropFilter: 'blur(18px) saturate(140%)',
                WebkitBackdropFilter: 'blur(18px) saturate(140%)',
                border: '1px solid rgba(100, 100, 100, 0.18)',
                boxShadow: '0 12px 32px rgba(51, 51, 51, 0.075), inset 0 1px 0 rgba(255,255,255,0.8)',
              },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? 'rgba(10, 11, 14, 0.76)' : 'rgba(249, 249, 249, 0.78)',
            backgroundImage: 'none',
            backdropFilter: 'blur(20px) saturate(145%)',
            WebkitBackdropFilter: 'blur(20px) saturate(145%)',
            borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(100, 100, 100, 0.16)',
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
            boxShadow: isDark ? '0 8px 28px rgba(0, 0, 0, 0.22)' : '0 8px 28px rgba(51, 51, 51, 0.07)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? 'rgba(12, 13, 16, 0.88)' : 'rgba(249, 249, 249, 0.9)',
            backgroundImage: 'none',
            backdropFilter: 'blur(22px) saturate(145%)',
            WebkitBackdropFilter: 'blur(22px) saturate(145%)',
            borderRight: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(100, 100, 100, 0.17)',
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
            color: isDark ? '#17100A' : '#000000',
            background: isDark
              ? 'linear-gradient(135deg, #FFA044 0%, #FF7414 100%)'
              : 'linear-gradient(135deg, #E85002 0%, #F16001 100%)',
            boxShadow: isDark ? '0 5px 18px rgba(255, 122, 24, 0.2)' : '0 5px 18px rgba(232, 80, 2, 0.18)',
            '&:hover': {
              background: isDark
                ? 'linear-gradient(135deg, #FFB15F 0%, #F76508 100%)'
                : 'linear-gradient(135deg, #F16001 0%, #E85002 100%)',
              boxShadow: isDark ? '0 8px 22px rgba(255, 122, 24, 0.28)' : '0 8px 22px rgba(232, 80, 2, 0.24)',
              transform: 'translateY(-1px)',
            },
          },
          outlined: {
            borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(100, 100, 100, 0.36)',
            '&:hover': {
              borderColor: isDark ? 'rgba(255, 162, 74, 0.72)' : 'rgba(232, 80, 2, 0.62)',
              backgroundColor: isDark ? 'rgba(255, 122, 24, 0.08)' : 'rgba(232, 80, 2, 0.055)',
            },
          },
          text: {
            '&:hover': { backgroundColor: isDark ? 'rgba(255, 122, 24, 0.1)' : 'rgba(232, 80, 2, 0.07)' },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.035)' : 'rgba(255, 255, 255, 0.72)',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? 'rgba(255, 255, 255, 0.17)' : 'rgba(100, 100, 100, 0.28)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? 'rgba(255, 162, 74, 0.65)' : 'rgba(232, 80, 2, 0.58)',
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
            borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.075)' : '1px solid rgba(100, 100, 100, 0.13)',
          },
          head: {
            fontWeight: 750,
            whiteSpace: 'nowrap',
            color: isDark ? '#F7F7F9' : PALETTE.darkGray,
            backgroundColor: isDark ? 'rgba(255, 122, 24, 0.075)' : 'rgba(232, 80, 2, 0.075)',
            borderBottom: isDark ? '1px solid rgba(255, 162, 74, 0.2)' : '1px solid rgba(232, 80, 2, 0.2)',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&.MuiTableRow-hover:hover': {
              backgroundColor: isDark ? 'rgba(255, 122, 24, 0.055)' : 'rgba(232, 80, 2, 0.055)',
            },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            marginBottom: 4,
            transition: 'background-color 160ms ease, border-color 160ms ease',
            '&:hover': { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.055)' : 'rgba(51, 51, 51, 0.045)' },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            '&:hover': { backgroundColor: isDark ? 'rgba(255, 122, 24, 0.12)' : 'rgba(232, 80, 2, 0.09)' },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: { borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(100, 100, 100, 0.17)' },
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
          outlined: { borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(100, 100, 100, 0.3)' },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? 'rgba(20, 22, 27, 0.94)' : 'rgba(249, 249, 249, 0.94)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.14)' : '1px solid rgba(100, 100, 100, 0.2)',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? 'rgba(25, 26, 31, 0.96)' : 'rgba(51, 51, 51, 0.96)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(255, 255, 255, 0.16)',
            backdropFilter: 'blur(12px)',
            fontSize: '0.75rem',
          },
        },
      },
    },
  });
}

// Keep compatibility with existing imports; dark remains the initial mode.
export const theme = createAppTheme('dark');
