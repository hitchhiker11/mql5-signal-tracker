import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, useTheme, useMediaQuery, styled, Drawer } from '@mui/material';
import Navbar from '../components/dashboard/Navbar';
import Sidebar from '../components/dashboard/Sidebar';

// ----------------------------------------------------------------------

const APP_BAR_MOBILE = 64;
const APP_BAR_DESKTOP = 92;
const DRAWER_WIDTH = 280;

const StyledRoot = styled('div')({
  display: 'flex',
  minHeight: '100%',
  overflow: 'hidden',
});

const Main = styled('div')(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  minHeight: '100%',
  paddingTop: APP_BAR_MOBILE + 24,
  paddingBottom: theme.spacing(10),
  [theme.breakpoints.up('lg')]: {
    paddingTop: APP_BAR_DESKTOP + 24,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  transition: theme.transitions.create(['margin'], {
    duration: theme.transitions.duration.shorter,
  }),
}));

// ----------------------------------------------------------------------

export default function UserLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [open, setOpen] = useState(!isMobile);
  const [openMobile, setOpenMobile] = useState(false);

  const handleOpenNav = () => {
    if (isMobile) {
      setOpenMobile(true);
    } else {
      setOpen(!open);
    }
  };

  const handleCloseMobileNav = () => {
    setOpenMobile(false);
  };

  return (
    <StyledRoot>
      <Navbar 
        open={open} 
        onOpenNav={handleOpenNav} 
        sx={{
          width: { lg: open ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' },
          ml: { lg: open ? `${DRAWER_WIDTH}px` : 0 },
          transition: theme => theme.transitions.create(['margin', 'width'], {
            duration: theme.transitions.duration.shorter,
          }),
        }} 
      />
      
      {/* Desktop Sidebar - постоянно видимый на больших экранах */}
      <Sidebar 
        open={open} 
        onCloseNav={() => setOpen(false)} 
        role="user"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          display: { xs: 'none', lg: 'block' },
        }}
      />
      
      {/* Mobile Sidebar - отображается как временное меню на малых экранах */}
      {isMobile && (
        <Drawer
          open={openMobile}
          onClose={handleCloseMobileNav}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            sx: { width: DRAWER_WIDTH },
          }}
        >
          <Sidebar 
            open={true} 
            onCloseNav={handleCloseMobileNav} 
            role="user"
          />
        </Drawer>
      )}
      
      <Main>
        <Container maxWidth="xl">
          <Outlet />
        </Container>
      </Main>
    </StyledRoot>
  );
}
