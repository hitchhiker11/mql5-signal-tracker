import React, { useState, useEffect } from 'react';
import {
  Container,
  Stack,
  Typography,
  Card,
  TextField,
  Button,
  Alert,
  Grid,
  Avatar
} from '@mui/material';
import { useAuth } from '../../auth/useAuth';
import { userApi } from '../../services/api/user';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    telegramAccount: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username,
        email: user.email,
        telegramAccount: user.telegramAccount || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmNewPassword) {
          throw new Error('Новые пароли не совпадают');
        }
        if (!formData.currentPassword) {
          throw new Error('Введите текущий пароль');
        }
      }

      const updateData = {
        username: formData.username,
        email: formData.email,
        telegramAccount: formData.telegramAccount,
        ...(formData.newPassword && {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      };

      await userApi.updateProfile(updateData);
      setSuccess('Профиль успешно обновлен');
      
      if (updateUser) {
        updateUser({
          ...user,
          username: formData.username,
          email: formData.email,
          telegramAccount: formData.telegramAccount
        });
      }
    } catch (err) {
      setError(err.message || 'Ошибка при обновлении профиля');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Stack spacing={2} sx={{ mb: 5 }}>
        <Typography variant="h4">Профиль</Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              src={user?.photoURL}
              alt={user?.username}
              sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
            />
            <Typography variant="h6">{user?.username}</Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.role === 'admin' ? 'Администратор' : 'Пользователь'}
            </Typography>
            {user?.telegramAccount && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Telegram: {user.telegramAccount}
              </Typography>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
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
                  label="Telegram аккаунт"
                  name="telegramAccount"
                  placeholder="@username"
                  value={formData.telegramAccount}
                  onChange={handleChange}
                  helperText="Введите ваш username в Telegram (например, @username)"
                />

                <Typography variant="subtitle2">Изменить пароль</Typography>

                <TextField
                  fullWidth
                  label="Текущий пароль"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                />

                <TextField
                  fullWidth
                  label="Новый пароль"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                />

                <TextField
                  fullWidth
                  label="Подтвердите новый пароль"
                  name="confirmNewPassword"
                  type="password"
                  value={formData.confirmNewPassword}
                  onChange={handleChange}
                />

                <Button
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
              </Stack>
            </form>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
