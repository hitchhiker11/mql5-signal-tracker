import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);
    try {
      await authApi.register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      navigate('/auth/login', { state: { message: 'Регистрация успешна. Войдите в систему.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Stack spacing={2} sx={{ mb: 5, position: 'relative' }}>
        <Typography variant="h4">Регистрация</Typography>
        <Typography color="text.secondary">
          Заполните форму для создания аккаунта
        </Typography>
      </Stack>

      <Card sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Имя пользователя"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              label="Пароль"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              label="Подтвердите пароль"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            <Button
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
          </Stack>
        </form>
      </Card>

      <Typography variant="body2" align="center" sx={{ mt: 3 }}>
        Уже есть аккаунт?{' '}
        <Link variant="subtitle2" component={RouterLink} to="/auth/login">
          Войти
        </Link>
      </Typography>
    </Container>
  );
}
