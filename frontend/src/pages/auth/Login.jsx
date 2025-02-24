import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
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
import { useAuth } from '../../auth/useAuth';

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0)
}));

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await login(formData);
      if (response.data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <ContentStyle>
        <Stack direction="row" alignItems="center" sx={{ mb: 5 }}>
          <Typography variant="h4" gutterBottom>
            Вход в систему
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
                name="email"
                type="email"
                label="Email"
                value={formData.email}
                onChange={handleChange}
              />

              <TextField
                fullWidth
                name="password"
                type="password"
                label="Пароль"
                value={formData.password}
                onChange={handleChange}
              />
            </Stack>

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ my: 2 }}
            >
              <Link component={RouterLink} variant="subtitle2" to="/auth/forgot-password">
                Забыли пароль?
              </Link>
            </Stack>

            <Button
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </form>
        </Card>

        <Typography variant="body2" align="center" sx={{ mt: 3 }}>
          Нет аккаунта?{' '}
          <Link variant="subtitle2" component={RouterLink} to="/auth/register">
            Зарегистрироваться
          </Link>
        </Typography>
      </ContentStyle>
    </Container>
  );
}
