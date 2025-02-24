import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import {
  Box,
  Drawer,
  Typography,
  Avatar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { useAuth } from '../../auth/useAuth';
import navConfig from './NavConfig';
import { useResponsive } from '../../hooks/useResponsive';

const DRAWER_WIDTH = 280;

const RootStyle = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('lg')]: {
    flexShrink: 0,
    width: DRAWER_WIDTH
  }
}));

const AccountStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2.5),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: theme.palette.grey[500_12]
}));

export default function Sidebar({ isOpenSidebar, onCloseSidebar }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDesktop = useResponsive('up', 'lg');

  const renderContent = (
    <Box sx={{ px: 2.5, py: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ mb: 5, mx: 2.5 }}>
        <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
          MQL5 Signal Parser
        </Typography>
      </Box>

      <AccountStyle>
        <Avatar src={user?.photoURL} alt="photoURL" />
        <Box sx={{ ml: 2 }}>
          <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
            {user?.username}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {user?.role}
          </Typography>
        </Box>
      </AccountStyle>

      <List disablePadding sx={{ p: 1 }}>
        {navConfig[user?.role === 'admin' ? 'admin' : 'user'].map((item) => (
          <ListItemButton
            key={item.title}
            onClick={() => navigate(item.path)}
            sx={{
              py: 2,
              px: 3,
              borderRadius: 1,
              ...(pathname === item.path && {
                color: 'primary.main',
                bgcolor: 'primary.lighter'
              })
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.title} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <RootStyle>
      {!isDesktop && (
        <Drawer
          open={isOpenSidebar}
          onClose={onCloseSidebar}
          PaperProps={{
            sx: { width: DRAWER_WIDTH }
          }}
        >
          {renderContent}
        </Drawer>
      )}

      {isDesktop && (
        <Drawer
          open
          variant="persistent"
          PaperProps={{
            sx: {
              width: DRAWER_WIDTH,
              bgcolor: 'background.default',
              borderRightStyle: 'dashed'
            }
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </RootStyle>
  );
} 