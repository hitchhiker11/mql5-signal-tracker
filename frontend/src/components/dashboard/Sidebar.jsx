import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  Divider,
  Avatar,
  Typography,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  alpha,
  styled,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Timeline as TimelineIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../../auth/useAuth';

// ----------------------------------------------------------------------

const DRAWER_WIDTH = 280;

const StyledAccount = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2.5),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: alpha(theme.palette.grey[500], 0.12),
}));

// ----------------------------------------------------------------------

const getMenuItems = (role) => {
  const commonItems = [
    { text: 'Дашборд', icon: <DashboardIcon />, path: `/${role}/dashboard` }
  ];

  const adminItems = [
    { text: 'Пользователи', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Управление сигналами', icon: <TimelineIcon />, path: '/admin/signals' },
    { text: 'Профиль', icon: <PersonIcon />, path: '/admin/profile' }
  ];

  const userItems = [
    // { text: 'Мои сигналы', icon: <TimelineIcon />, path: '/user/signals' },
    // { text: 'Профиль', icon: <PersonIcon />, path: '/user/profile' }
  ];

  return [...commonItems, ...(role === 'admin' ? adminItems : userItems)];
};

export default function Sidebar({ open, onCloseNav, role = 'user', sx }) {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const menuItems = getMenuItems(role);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth/login');
    } catch (error) {
      console.error(error);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onCloseNav();
    }
  };

  const renderContent = (
    <>
      <Box sx={{ mb: 5, mx: 2.5 }}>
        <Box component="img" src="/logo.svg" sx={{ width: 40, height: 40, mt: 3, ml: 2 }} />
      </Box>

      <Box sx={{ mb: 3, mx: 2.5 }}>
        <StyledAccount>
          <Avatar 
            src={user?.photoURL} 
            alt="user photo"
            sx={{ 
              width: 40, 
              height: 40,
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText 
            }}
          >
            {user?.username?.charAt(0) || 'U'}
          </Avatar>

          <Box sx={{ ml: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
              {user?.username || 'Пользователь'}
            </Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {role === 'admin' ? 'Администратор' : 'Пользователь'}
            </Typography>
          </Box>
        </StyledAccount>
      </Box>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <List disablePadding sx={{ p: 1 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
            sx={{
              height: 48,
              borderRadius: 1,
              my: 0.5,
              px: 2,
              '&.Mui-selected': {
                color: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                },
              },
              '&:hover': {
                bgcolor: alpha(theme.palette.grey[500], 0.08),
              },
            }}
          >
            <ListItemIcon 
              sx={{ 
                minWidth: 0, 
                mr: open ? 3 : 'auto', 
                justifyContent: 'center',
                color: 'inherit'
              }}
            >
              {item.icon}
            </ListItemIcon>
            
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{ 
                noWrap: true, 
                fontSize: 14, 
                fontWeight: location.pathname === item.path ? 'fontWeightBold' : 'fontWeightMedium' 
              }}
              sx={{ opacity: open ? 1 : 0 }}
            />
          </ListItemButton>
        ))}
        
        <ListItemButton
          onClick={handleLogout}
          sx={{
            height: 48,
            borderRadius: 1,
            my: 0.5,
            px: 2,
            color: 'text.secondary',
            '&:hover': {
              bgcolor: alpha(theme.palette.grey[500], 0.08),
            },
          }}
        >
          <ListItemIcon sx={{ 
            minWidth: 0, 
            mr: open ? 3 : 'auto', 
            justifyContent: 'center',
            color: 'inherit'
          }}>
            <LogoutIcon />
          </ListItemIcon>
          
          <ListItemText 
            primary="Выйти" 
            primaryTypographyProps={{ noWrap: true, fontSize: 14 }}
            sx={{ opacity: open ? 1 : 0 }}
          />
        </ListItemButton>
      </List>
    </>
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: DRAWER_WIDTH },
        ...sx,
      }}
    >
      <Drawer
        open={open}
        variant="permanent"
        PaperProps={{
          sx: {
            width: open ? DRAWER_WIDTH : theme.spacing(9),
            bgcolor: 'background.default',
            borderRightStyle: 'dashed',
            boxShadow: (theme) => theme.shadows[2],
            transition: (theme) =>
              theme.transitions.create('width', {
                duration: theme.transitions.duration.shorter,
              }),
            overflowX: 'hidden',
          }
        }}
      >
        {renderContent}
      </Drawer>
    </Box>
  );
} 