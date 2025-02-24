import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Navbar from '../components/dashboard/Navbar';
import Sidebar from '../components/dashboard/Sidebar';

export default function AdminLayout() {
  const [open, setOpen] = React.useState(true);

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar open={open} setOpen={setOpen} />
      <Sidebar open={open} role="admin" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          backgroundColor: 'background.default',
          minHeight: '100vh'
        }}
      >
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
