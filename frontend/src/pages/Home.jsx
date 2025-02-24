import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Box, Button, Container, Typography } from '@mui/material';

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0)
}));

export default function Home() {
  return (
    <Container>
      <ContentStyle>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h3" paragraph>
            MQL5 Signal Parser
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 5 }}>
            Анализируйте и отслеживайте торговые сигналы MQL5
          </Typography>

          <Button
            to="/auth/login"
            size="large"
            variant="contained"
            component={RouterLink}
            sx={{ mx: 1 }}
          >
            Войти
          </Button>
          <Button
            to="/auth/register"
            size="large"
            variant="outlined"
            component={RouterLink}
            sx={{ mx: 1 }}
          >
            Регистрация
          </Button>
        </Box>
      </ContentStyle>
    </Container>
  );
}
