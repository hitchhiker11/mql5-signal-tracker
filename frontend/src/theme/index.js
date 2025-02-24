import { createTheme } from '@mui/material/styles';
import palette from './palette';
import typography from './typography';
import shadows from './shadows';

const theme = createTheme({
  palette,
  typography,
  shadows,
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none'
        }
      }
    }
  }
});

export default theme;
