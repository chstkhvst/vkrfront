// src/theme.ts
import { createTheme } from '@mui/material/styles';

const PRIMARY = {
  main: '#949cff',
  dark: '#7c84f4',
  light: '#b3b9ff',
  contrastText: '#ffffff',
};

const SECONDARY = {
  main: '#ffed86',
  dark: '#f4d96a',
  light: '#fff3a8',
  contrastText: '#2a2a2a',
};

export const customTheme = createTheme({
  palette: {
    mode: 'light',
    primary: PRIMARY,
    secondary: SECONDARY,

    background: {
      default: '#f4f6ff',
      paper: 'rgba(255,255,255,0.7)',
    },

    text: {
      primary: '#1f2340',
      secondary: '#5f6388',
    },
  },

  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },

  shape: {
    borderRadius: 14,
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: `
            radial-gradient(circle at 20% 20%, #949cff33, transparent 40%),
            radial-gradient(circle at 80% 0%, #ffed8644, transparent 35%),
            linear-gradient(180deg, #f6f7ff 0%, #eef1ff 100%)
          `,
          minHeight: '100vh',
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
        },
      },
    },

    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 18px',
        },

        containedPrimary: {
          background: 'linear-gradient(135deg, #949cff, #7c84f4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #7c84f4, #6c74e6)',
          },
        },

        containedSecondary: {
          background: 'linear-gradient(135deg, #ffed86, #ffe45c)',
          color: '#2a2a2a',
          '&:hover': {
            background: 'linear-gradient(135deg, #ffe45c, #f4d96a)',
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
          background: 'rgba(255,255,255,0.7)',
          border: '1px solid rgba(255,255,255,0.4)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
        },
      },
    },
  },
});

export default customTheme;