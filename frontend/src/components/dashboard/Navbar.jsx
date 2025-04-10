import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Stack,
  Box,
  Avatar,
  Badge,
  styled,
  alpha,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuth } from '../../auth/useAuth';
import AccountPopover from './AccountPopover';

// ----------------------------------------------------------------------

const DRAWER_WIDTH = 280;
const APPBAR_MOBILE = 64;
const APPBAR_DESKTOP = 92;

const StyledRoot = styled(AppBar)(({ theme, open }) => ({
  boxShadow: 'none',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)', // Safari
  backgroundColor: alpha(theme.palette.background.default, 0.8),
  color: theme.palette.text.primary,
  [theme.breakpoints.up('lg')]: {
    width: open ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
  },
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  minHeight: APPBAR_MOBILE,
  [theme.breakpoints.up('lg')]: {
    minHeight: APPBAR_DESKTOP,
    padding: theme.spacing(0, 5),
  },
}));

const StyledSearch = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.grey[500], 0.12),
  '&:hover': {
    backgroundColor: alpha(theme.palette.grey[500], 0.16),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 2),
}));

// ----------------------------------------------------------------------

export default function Navbar({ open, onOpenNav, isAdmin = false, sx }) {
  const { user } = useAuth();
  const theme = useTheme();

  return (
    <StyledRoot open={open} sx={{ ...sx }}>
      <StyledToolbar>
        <IconButton
          onClick={onOpenNav}
          sx={{
            mr: 1,
            color: 'text.primary',
            display: { lg: 'none' },
          }}
        >
          <MenuIcon />
        </IconButton>

        <Typography 
          variant="h5" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            color: theme.palette.primary.main,
            fontWeight: 700,
            display: { xs: 'none', md: 'block' }
          }}
        >
          {import.meta.env.VITE_APP_NAME || 'Meta Trader'}
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Stack
          direction="row"
          alignItems="center"
          spacing={{ xs: 0.5, sm: 1.5 }}
        >
          {!isAdmin && (
            <IconButton sx={{ color: 'text.primary' }}>
              <Badge badgeContent={0} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          )}
          
          <AccountPopover />
        </Stack>
      </StyledToolbar>
    </StyledRoot>
  );
} 