import React, { useState } from 'react';
import {
  Box,
  Drawer,
  useTheme,
  useMediaQuery,
  Backdrop
} from '@mui/material';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? sidebarOpen : true}
        onClose={() => setSidebarOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: theme.spacing(30),
            transition: theme.transitions.create(['width', 'transform'], {
              duration: theme.transitions.duration.standard,
            }),
            zIndex: theme.zIndex.drawer
          }
        }}
        ModalProps={{
          keepMounted: true
        }}
      >
        {/* Содержимое сайдбара */}
      </Drawer>

      <Backdrop
        open={isMobile && sidebarOpen}
        onClick={() => setSidebarOpen(false)}
        sx={{ 
          zIndex: theme.zIndex.drawer - 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          transition: theme.transitions.create(['margin', 'width'], {
            duration: theme.transitions.duration.standard,
          }),
          width: '100%'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 