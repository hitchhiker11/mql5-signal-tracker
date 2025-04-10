import React from 'react';
import { Outlet } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Typography, Link, Container, Box, Stack } from '@mui/material';

// ----------------------------------------------------------------------

const StyledRoot = styled('div')({
  display: 'flex',
  minHeight: '100vh',
  overflow: 'hidden',
});

const StyledContent = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function AuthLayout() {
  return (
    <StyledRoot>
      <Container maxWidth="sm">
        <StyledContent>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mb={5}
          >
            <Box component="img" src="/logo.svg" sx={{ width: 40, height: 40 }} />
            <Typography variant="h4" gutterBottom>
              {import.meta.env.VITE_APP_NAME || 'Meta Trader'}
            </Typography>
          </Stack>

          <Outlet />

          <Typography
            variant="body2"
            align="center"
            sx={{ mt: 5, color: 'text.secondary' }}
          >
            © {new Date().getFullYear()} {import.meta.env.VITE_APP_NAME || 'Meta Trader'}. All rights reserved.
          </Typography>
        </StyledContent>
      </Container>
    </StyledRoot>
  );
}
