import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  Stack,
  Divider,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { useAuth } from '../../auth/useAuth';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import TelegramIcon from '@mui/icons-material/Telegram';
import { isTelegramWebApp, loginWithTelegram } from '../../services/telegram';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isTelegramApp, setIsTelegramApp] = useState(false);

  useEffect(() => {
    // Проверяем, запущено ли приложение в Telegram Mini App
    setIsTelegramApp(isTelegramWebApp());
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(formData);
      if (response?.user?.role) {
        if (response.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/user/dashboard');
        }
      }
    } catch (err) {
      console.error('Ошибка входа:', err);
      setError(err.response?.data?.message || err.message || 'Ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  const handleTelegramLogin = async () => {
    setError('');
    setTelegramLoading(true);

    try {
      if (!isTelegramApp) {
        window.open('https://t.me/your_bot_username', '_blank');
        setError('Для входа через Telegram откройте бота в приложении Telegram');
        setTelegramLoading(false);
        return;
      }

      // Вызов авторизации через Telegram
      const response = await loginWithTelegram();
      if (response?.user?.role) {
        if (response.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/user/dashboard');
        }
      }
    } catch (err) {
      console.error('Ошибка входа через Telegram:', err);
      setError(err.message || 'Ошибка при входе через Telegram');
    } finally {
      setTelegramLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 480 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Вход
      </Typography>
      
      <Typography variant="body2" sx={{ mb: 5, color: 'text.secondary' }}>
        Нет аккаунта? {' '}
        <Link component={RouterLink} to="/auth/register" variant="subtitle2" sx={{ color: 'primary.main' }}>
          Зарегистрироваться
        </Link>
      </Typography>

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
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          
          <TextField
            fullWidth
            label="Пароль"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                name="rememberMe"
              />
            }
            label="Запомнить меня"
          />
          
          <Link component={RouterLink} to="/auth/forgot-password" variant="body2" underline="hover">
            Забыли пароль?
          </Link>
        </Stack>

        <Button
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          disabled={loading || telegramLoading}
          sx={{
            mt: 3,
            bgcolor: 'primary.main',
            color: (theme) => theme.palette.common.white,
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
        >
          {loading ? 'Вход...' : 'Войти'}
        </Button>
      </form>

      <Divider sx={{ my: 3 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          ИЛИ
        </Typography>
      </Divider>

      <Button
        fullWidth
        size="large"
        variant="outlined"
        color="primary"
        onClick={handleTelegramLogin}
        disabled={loading || telegramLoading}
        startIcon={<TelegramIcon />}
        sx={{ mb: 2 }}
      >
        {telegramLoading ? 'Обработка...' : 'Войти через Telegram'}
      </Button>
    </Box>
  );
}
