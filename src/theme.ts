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
    error: {
      main: '#f70e4480',
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
    MuiCssBaseline: { //градиент на фон
      styleOverrides: {
        body: {
    background: `
      radial-gradient(circle at 15% 25%, #949cff22, transparent 45%), 
      radial-gradient(circle at 85% 10%, #ffed891a, transparent 40%),
      linear-gradient(180deg, #eef1ff 0%, #e4e8ff 100%)
    `,
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
    contained: {
    },
    
    containedPrimary: {
      background: '#949cff',
      color: '#ffed86', // ← желтый текст на синей кнопке
      '&:hover': {
        background: 'linear-gradient(135deg, #7c84f4, #6c74e6)',
      },
    },

    containedSecondary: {
      background: 'linear-gradient(135deg, #ffed86, #ffe45c)',
      color: '#949cff', // ← синий текст на желтой кнопке
      '&:hover': {
        background: 'linear-gradient(135deg, #ffe45c, #f4d96a)',
      },
    },
    
    containedSuccess: {
      background: 'linear-gradient(135deg, #4caf50, #45a049)',
      color: '#ffffff',
      '&:hover': {
        background: 'linear-gradient(135deg, #45a049, #3e8e41)',
      },
    },
    
    containedError: {
      background: 'linear-gradient(135deg, #f44336, #d32f2f)',
      color: '#ffffff',
      '&:hover': {
        background: 'linear-gradient(135deg, #d32f2f, #c62828)',
      },
    },
    
    containedWarning: {
      background: 'linear-gradient(135deg, #ff9800, #f57c00)',
      color: '#ffffff',
      '&:hover': {
        background: 'linear-gradient(135deg, #f57c00, #ef6c00)',
      },
    },
    
    // TEXT 
    text: {
    },
    
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
      color: '#4caf50',
      '&:hover': {
        backgroundColor: 'rgba(76, 175, 80, 0.08)',
        transform: 'translateY(-1px)',
      },
    },
    
    textError: {
      color: '#f44336',
      '&:hover': {
        backgroundColor: 'rgba(244, 67, 54, 0.08)',
        transform: 'translateY(-1px)',
      },
    },
    
    textWarning: {
      color: '#ff9800',
      '&:hover': {
        backgroundColor: 'rgba(255, 152, 0, 0.08)',
        transform: 'translateY(-1px)',
      },
    },
    
    // OUTLINED 
    outlined: {
    },
    
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
      borderColor: '#4caf50',
      color: '#4caf50',
      '&:hover': {
        borderColor: '#45a049',
        backgroundColor: 'rgba(76, 175, 80, 0.08)',
        transform: 'translateY(-1px)',
      },
    },
    
    outlinedError: {
      borderColor: '#f44336',
      color: '#f44336',
      '&:hover': {
        borderColor: '#d32f2f',
        backgroundColor: 'rgba(244, 67, 54, 0.08)',
        transform: 'translateY(-1px)',
      },
    },
    
    outlinedWarning: {
      borderColor: '#ff9800',
      color: '#ff9800',
      '&:hover': {
        borderColor: '#f57c00',
        backgroundColor: 'rgba(255, 152, 0, 0.08)',
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