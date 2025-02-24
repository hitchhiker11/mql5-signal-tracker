import React from 'react';
import { Outlet } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { AuthGuard } from '../auth/AuthGuard';

const RootStyle = styled('div')({
  display: 'flex',
  minHeight: '100%',
  overflow: 'hidden'
});

const MainStyle = styled('div')(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  minHeight: '100%',
  paddingTop: 64 + 24,
  paddingBottom: theme.spacing(10),
  [theme.breakpoints.up('lg')]: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  }
}));

export default function UserLayout() {
  return (
    <AuthGuard>
      <RootStyle>
        <DashboardLayout />
        <MainStyle>
          <Outlet />
        </MainStyle>
      </RootStyle>
    </AuthGuard>
  );
}
