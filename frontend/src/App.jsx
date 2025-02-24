import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import theme from './theme';
import Router from './routes.jsx';
import { AuthProvider } from './auth/AuthContext';
import ScrollToTop from './components/ScrollToTop';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <ScrollToTop />
          <Router />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
