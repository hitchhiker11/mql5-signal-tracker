import { createTheme } from '@mui/material/styles';
import { palette } from './theme/palette';
import typography from './theme/typography';

// Shadowing utility to create customized shadows
const customShadows = {
  z1: '0 1px 2px 0 rgba(145, 158, 171, 0.16)',
  z8: '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
  z12: '0 12px 24px -4px rgba(145, 158, 171, 0.16)',
  z16: '0 16px 32px -4px rgba(145, 158, 171, 0.16)',
  z20: '0 20px 40px -4px rgba(145, 158, 171, 0.16)',
  z24: '0 24px 48px 0 rgba(145, 158, 171, 0.16)',
  primary: '0 8px 16px 0 rgba(0, 171, 85, 0.24)',
  secondary: '0 8px 16px 0 rgba(51, 102, 255, 0.24)',
  info: '0 8px 16px 0 rgba(0, 184, 217, 0.24)',
  success: '0 8px 16px 0 rgba(54, 179, 126, 0.24)',
  warning: '0 8px 16px 0 rgba(255, 171, 0, 0.24)',
  error: '0 8px 16px 0 rgba(255, 86, 48, 0.24)',
};

const theme = createTheme({
  palette,
  typography,
  shape: { borderRadius: 8 },
  shadows: [
    'none',
    customShadows.z1,
    '0 3px 6px 0 rgba(145, 158, 171, 0.16)',
    '0 4px 8px 0 rgba(145, 158, 171, 0.16)',
    '0 5px 10px 0 rgba(145, 158, 171, 0.16)',
    '0 6px 12px 0 rgba(145, 158, 171, 0.16)',
    '0 7px 14px 0 rgba(145, 158, 171, 0.16)',
    customShadows.z8,
    '0 9px 18px 0 rgba(145, 158, 171, 0.16)',
    '0 10px 20px 0 rgba(145, 158, 171, 0.16)',
    '0 11px 22px 0 rgba(145, 158, 171, 0.16)',
    customShadows.z12,
    '0 13px 26px 0 rgba(145, 158, 171, 0.16)',
    '0 14px 28px 0 rgba(145, 158, 171, 0.16)',
    '0 15px 30px 0 rgba(145, 158, 171, 0.16)',
    customShadows.z16,
    '0 17px 34px 0 rgba(145, 158, 171, 0.16)',
    '0 18px 36px 0 rgba(145, 158, 171, 0.16)',
    '0 19px 38px 0 rgba(145, 158, 171, 0.16)',
    customShadows.z20,
    '0 21px 42px 0 rgba(145, 158, 171, 0.16)',
    '0 22px 44px 0 rgba(145, 158, 171, 0.16)',
    '0 23px 46px 0 rgba(145, 158, 171, 0.16)',
    customShadows.z24,
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          boxShadow: customShadows.primary,
          '&:hover': {
            boxShadow: customShadows.primary,
          },
        },
        outlinedPrimary: {
          border: `1px solid ${palette.primary.main}`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: customShadows.z8,
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default theme; 