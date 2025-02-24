import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Card,
  Stack,
  Link,
  Container,
  Typography,
  TextField,
  Button,
  Alert
} from '@mui/material';
import { authApi } from '../../services/api/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authApi.forgotPassword(email);
      setSuccess('Инструкции по восстановлению пароля отправлены на ваш email');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при отправке запроса');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Stack spacing={2} sx={{ mb: 5, position: 'relative' }}>
        <Typography variant="h4">Забыли пароль?</Typography>
        <Typography color="text.secondary">
          Введите email для восстановления пароля
        </Typography>
      </Stack>

      <Card sx={{ p: 3 }}>
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Отправка...' : 'Отправить'}
            </Button>
          </Stack>
        </form>

        <Typography variant="body2" align="center" sx={{ mt: 3 }}>
          Вспомнили пароль?{' '}
          <Link variant="subtitle2" component={RouterLink} to="/auth/login">
            Войти
          </Link>
        </Typography>
      </Card>
    </Container>
  );
}
