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

// soft utility colors for dense UI sections
export const SURFACE = {
  softPrimary: '#eef0ff',
  softSecondary: '#fff8d6',
  softSuccess: '#edf7f0',
  softError: '#fff1f3',
  softWarning: '#fff8e8',
  borderLight: '#e4e7f5',
};

export const customTheme = createTheme({
  palette: {
    mode: 'light',

    primary: PRIMARY,

    secondary: SECONDARY,

    success: {
      main: '#5fa777',
    },

    warning: {
      main: '#d6a63f',
    },

    error: {
      main: '#d96b7d',
    },

    background: {
      default: '#f4f6ff',
      // paper: 'rgba(255,255,255,0.7)',
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
      //градиент на фон
      styleOverrides: {
        body: {
          // background: `
          //   radial-gradient(circle at 15% 25%, #949cff22, transparent 45%), 
          //   radial-gradient(circle at 85% 10%, #ffed891a, transparent 40%),
          //   linear-gradient(180deg, #eef1ff 0%, #e4e8ff 100%)
          // `,
          // backgroundAttachment: 'fixed',
background: `
  radial-gradient(circle at 10% 20%, #949cff33, transparent 70%),
  radial-gradient(circle at 90% 10%, #e7d8ff22, transparent 65%),
  radial-gradient(circle at 50% 80%, #b8c0ff22, transparent 75%),
  linear-gradient(180deg, #f7f8ff 0%, #ecefff 100%)
`,
backgroundAttachment: 'fixed',
          minHeight: '100vh',
        },
      },
    },

    MuiPopover: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff', //комбобоксы
          backdropFilter: 'none',
        },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff', // Select
        },
      },
    },

    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff', //Autocomplete
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
          transition: 'all 0.2s ease',
          fontWeight: 600,
          textTransform: 'none',
        },

        // CONTAINED
        contained: {},

        containedPrimary: {
          background: '#949cff',
          color: '#ffed86',

          '&:hover': {
            background: 'linear-gradient(135deg, #7c84f4, #6c74e6)',
          },
        },

        containedSecondary: {
          background: 'linear-gradient(135deg, #ffed86, #ffe45c)',
          color: '#949cff',

          '&:hover': {
            background: 'linear-gradient(135deg, #ffe45c, #f4d96a)',
          },
        },

        containedSuccess: {
          background: '#5fa777',
          color: '#ffffff',

          '&:hover': {
            background: '#4f9467',
          },
        },

        containedError: {
          background: '#d96b7d',
          color: '#ffffff',

          '&:hover': {
            background: '#c45b6d',
          },
        },

        containedWarning: {
          background: '#d6a63f',
          color: '#ffffff',

          '&:hover': {
            background: '#bf9232',
          },
        },

        // TEXT
        text: {},

        textPrimary: {
          color: '#949cff',

          '&:hover': {
            backgroundColor: 'rgba(148, 156, 255, 0.08)',
            transform: 'translateY(-1px)',
          },
        },

        textSecondary: {
          color: '#ffed86',

          '&:hover': {
            backgroundColor: 'rgba(255, 237, 134, 0.12)',
            transform: 'translateY(-1px)',
          },
        },

        textSuccess: {
          color: '#5fa777',

          '&:hover': {
            backgroundColor: 'rgba(95, 167, 119, 0.08)',
            transform: 'translateY(-1px)',
          },
        },

        textError: {
          color: '#d96b7d',

          '&:hover': {
            backgroundColor: 'rgba(217, 107, 125, 0.08)',
            transform: 'translateY(-1px)',
          },
        },

        textWarning: {
          color: '#d6a63f',

          '&:hover': {
            backgroundColor: 'rgba(214, 166, 63, 0.08)',
            transform: 'translateY(-1px)',
          },
        },

        // OUTLINED
        outlined: {},

        outlinedPrimary: {
          borderColor: '#949cff',
          color: '#949cff',

          '&:hover': {
            borderColor: '#7c84f4',
            backgroundColor: 'rgba(148, 156, 255, 0.08)',
            transform: 'translateY(-1px)',
          },
        },

        outlinedSecondary: {
          borderColor: '#ffed86',
          color: '#ffed86',

          '&:hover': {
            borderColor: '#ffe45c',
            backgroundColor: 'rgba(255, 237, 134, 0.12)',
            transform: 'translateY(-1px)',
          },
        },

        outlinedSuccess: {
          borderColor: '#5fa777',
          color: '#5fa777',

          '&:hover': {
            borderColor: '#4f9467',
            backgroundColor: 'rgba(95, 167, 119, 0.08)',
            transform: 'translateY(-1px)',
          },
        },

        outlinedError: {
          borderColor: '#d96b7d',
          color: '#d96b7d',

          '&:hover': {
            borderColor: '#c45b6d',
            backgroundColor: 'rgba(217, 107, 125, 0.08)',
            transform: 'translateY(-1px)',
          },
        },

        outlinedWarning: {
          borderColor: '#d6a63f',
          color: '#d6a63f',

          '&:hover': {
            borderColor: '#bf9232',
            backgroundColor: 'rgba(214, 166, 63, 0.08)',
            transform: 'translateY(-1px)',
          },
        },

        // SIZE
        sizeLarge: {
          padding: '12px 24px',
          fontSize: '1rem',
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 10,
        },

        colorPrimary: {
          backgroundColor: '#eef0ff',
          color: '#6b72d6',
        },

        colorSuccess: {
          backgroundColor: '#edf7f0',
          color: '#3f7f56',
        },

        colorError: {
          backgroundColor: '#fff1f3',
          color: '#b85463',
        },

        colorWarning: {
          backgroundColor: '#fff8e8',
          color: '#9c7a2f',
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
          // background: 'rgba(255,255,255,0.7)',
          border: '1px solid rgba(255,255,255,0.4)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
        },
      },
    },
  },
});

export default customTheme;