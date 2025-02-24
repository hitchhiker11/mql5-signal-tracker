import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Stack, AppBar, Toolbar, IconButton } from '@mui/material';
import { Menu, AccountCircle } from '@mui/icons-material';
import Sidebar from './Sidebar';
import AccountPopover from './AccountPopover';
import { useResponsive } from '../../hooks/useResponsive';

const APP_BAR_MOBILE = 64;
const APP_BAR_DESKTOP = 92;

const RootStyle = styled('div')({
  display: 'flex',
  minHeight: '100%',
  overflow: 'hidden'
});

const MainStyle = styled('div')(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  minHeight: '100%',
  paddingTop: APP_BAR_MOBILE + 24,
  paddingBottom: theme.spacing(10),
  [theme.breakpoints.up('lg')]: {
    paddingTop: APP_BAR_DESKTOP + 24,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  }
}));

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const isDesktop = useResponsive('up', 'lg');

  return (
    <RootStyle>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            onClick={() => setOpen(!open)}
            sx={{ mr: 1, color: 'text.primary' }}
          >
            <Menu />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />

          <Stack direction="row" spacing={2}>
            <AccountPopover />
          </Stack>
        </Toolbar>
      </AppBar>

      <Sidebar 
        isOpenSidebar={open} 
        onCloseSidebar={() => setOpen(false)} 
      />

      <MainStyle>
        <Outlet />
      </MainStyle>
    </RootStyle>
  );
}
