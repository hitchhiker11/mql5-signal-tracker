import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Stack,
  Link,
  Typography,
  TextField,
  Button,
  Alert,
  Box
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
    <Box sx={{ maxWidth: 480 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Забыли пароль?
      </Typography>
      
      <Typography variant="body2" sx={{ mb: 5, color: 'text.secondary' }}>
        Пожалуйста, введите email, который вы использовали при регистрации. 
        Мы отправим вам инструкции по восстановлению пароля.
      </Typography>

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
            required
            placeholder="example@email.com"
          />

          <Button
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              mt: 2,
              bgcolor: 'primary.main',
              color: (theme) => theme.palette.common.white,
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            {loading ? 'Отправка...' : 'Восстановить пароль'}
          </Button>
        </Stack>
      </form>

      <Typography variant="body2" align="center" sx={{ mt: 3 }}>
        Вспомнили пароль?{' '}
        <Link variant="subtitle2" component={RouterLink} to="/auth/login" sx={{ color: 'primary.main' }}>
          Вернуться к входу
        </Link>
      </Typography>
    </Box>
  );
}
