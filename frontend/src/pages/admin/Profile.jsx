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
  Avatar,
  Box,
  Divider,
  useTheme,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../../auth/useAuth';
import { userApi } from '../../services/api/user';
import { adminApi } from '../../services/api/admin';
import { alpha } from '@mui/material/styles';
import PeopleIcon from '@mui/icons-material/People';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export default function AdminProfile() {
  const { user, updateUser } = useAuth();
  const theme = useTheme();
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
  const [statsLoading, setStatsLoading] = useState(true);
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalSignals: 0,
    lastLogin: 'Неизвестно'
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username,
        email: user.email,
        telegramAccount: user.telegramAccount || ''
      }));
      fetchAdminStats();
    }
  }, [user]);

  const fetchAdminStats = async () => {
    try {
      setStatsLoading(true);
      const [usersResponse, signalsResponse] = await Promise.all([
        adminApi.getAllUsers(),
        adminApi.getAllSignals()
      ]);

      if (usersResponse?.data && signalsResponse?.data) {
        setAdminStats({
          totalUsers: usersResponse.data.length,
          totalSignals: signalsResponse.data.length,
          lastLogin: user?.last_login ? new Date(user.last_login).toLocaleString() : 'Неизвестно'
        });
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

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
        <Typography variant="h4">Профиль администратора</Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Card sx={{ p: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar
                  src={user?.photoURL}
                  alt={user?.username}
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    mx: 'auto', 
                    mb: 2,
                    bgcolor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    fontSize: 40
                  }}
                >
                  {user?.username?.charAt(0) || 'A'}
                </Avatar>
                <Typography variant="h6">{user?.username}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Администратор
                </Typography>
                {user?.telegramAccount && (
                  <Typography variant="body2" color="text.secondary">
                    Telegram: {user.telegramAccount}
                  </Typography>
                )}
                <Divider sx={{ my: 2 }} />
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: 'text.secondary',
                    mb: 2
                  }}
                >
                  <Typography variant="body2">
                    Вы имеете полный доступ к управлению платформой.
                  </Typography>
                </Box>
              </Box>
            </Card>

            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Статистика администратора
              </Typography>
              {statsLoading ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <List disablePadding>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <PeopleIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Пользователи" 
                      secondary={adminStats.totalUsers} 
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <SignalCellularAltIcon color="info" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Сигналы" 
                      secondary={adminStats.totalSignals} 
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <AccessTimeIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Последний вход" 
                      secondary={adminStats.lastLogin} 
                    />
                  </ListItem>
                </List>
              )}
            </Card>
          </Stack>
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