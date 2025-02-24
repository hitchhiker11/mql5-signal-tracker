import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Timeline as TimelineIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';

const DRAWER_WIDTH = 240;

const getMenuItems = (role) => {
  const commonItems = [
    { text: 'Панель управления', icon: <DashboardIcon />, path: `/${role}/dashboard` }
  ];

  const adminItems = [
    { text: 'Пользователи', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Управление сигналами', icon: <TimelineIcon />, path: '/admin/signals' }
  ];

  const userItems = [
    { text: 'Мои сигналы', icon: <TimelineIcon />, path: '/user/signals' },
    { text: 'Профиль', icon: <PersonIcon />, path: '/user/profile' }
  ];

  return [...commonItems, ...(role === 'admin' ? adminItems : userItems)];
};

export default function Sidebar({ open, role = 'user' }) {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const menuItems = getMenuItems(role);

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
          width: DRAWER_WIDTH,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }),
        ...(!open && {
          width: theme.spacing(7),
          '& .MuiDrawer-paper': {
            width: theme.spacing(7),
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          },
        }),
      }}
    >
      <Box sx={{ mt: 8 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
} 