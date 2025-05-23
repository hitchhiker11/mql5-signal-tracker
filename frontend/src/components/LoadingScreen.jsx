import React from 'react';
import { Box, CircularProgress } from '@mui/material';

export default function LoadingScreen() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh'
      }}
    >
      <CircularProgress />
    </Box>
  );
} 