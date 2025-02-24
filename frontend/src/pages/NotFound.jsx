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

export default function NotFound() {
  return (
    <Container>
      <ContentStyle>
        <Box sx={{ maxWidth: 480, margin: 'auto', textAlign: 'center' }}>
          <Typography variant="h3" paragraph>
            Страница не найдена
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 5 }}>
            Извините, но запрашиваемая страница не существует.
          </Typography>

          <Button
            to="/"
            size="large"
            variant="contained"
            component={RouterLink}
          >
            На главную
          </Button>
        </Box>
      </ContentStyle>
    </Container>
  );
}
