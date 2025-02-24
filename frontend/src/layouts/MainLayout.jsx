import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import { styled } from '@mui/material/styles';

const MainStyle = styled('div')(({ theme }) => ({
  minHeight: '100vh',
  overflow: 'hidden',
  backgroundColor: theme.palette.background.default
}));

export default function MainLayout() {
  return (
    <MainStyle>
      <Container maxWidth="lg">
        <Box sx={{ py: 12 }}>
          <Outlet />
        </Box>
      </Container>
    </MainStyle>
  );
}
