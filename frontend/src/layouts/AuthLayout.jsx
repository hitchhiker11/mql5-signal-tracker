import React from 'react';
import { Outlet } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Typography, Link } from '@mui/material';

const HeaderStyle = styled('header')(({ theme }) => ({
  top: 0,
  zIndex: 9,
  lineHeight: 0,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  position: 'absolute',
  padding: theme.spacing(3),
  justifyContent: 'space-between',
  [theme.breakpoints.up('md')]: {
    alignItems: 'flex-start',
    padding: theme.spacing(7, 5, 0, 7)
  }
}));

const RootStyle = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex'
  }
}));

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0)
}));

export default function AuthLayout() {
  return (
    <RootStyle>
      <HeaderStyle>
        <Link href="/" underline="none">
          <Typography variant="h3" sx={{ color: 'text.primary' }}>
            MQL5 Signal Parser
          </Typography>
        </Link>
      </HeaderStyle>

      <Container>
        <ContentStyle>
          <Outlet />
        </ContentStyle>
      </Container>
    </RootStyle>
  );
}
