import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Card,
  Stack,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import { adminApi } from '../../services/api/admin';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: {
      total: 0,
      active: 0,
      new: 0
    },
    signals: {
      total: 0,
      active: 0,
      pending: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardStats = async () => {
    try {
      const [usersResponse, signalsResponse] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getAllSignals()
      ]);
  
      if (usersResponse?.data && Array.isArray(usersResponse.data)) {
        const activeUsers = usersResponse.data.filter(user => user.status === 'active').length;
        setStats(prev => ({
          ...prev,
          users: {
            total: usersResponse.data.length,
            active: activeUsers,
            new: usersResponse.data.filter(user => {
              const createdAt = new Date(user.created_at);
              const now = new Date();
              const daysDiff = (now - createdAt) / (1000 * 60 * 60 * 24);
              return daysDiff <= 7;
            }).length
          }
        }));
      }
  
      if (signalsResponse?.data && Array.isArray(signalsResponse.data)) {
        setStats(prev => ({
          ...prev,
          signals: {
            total: signalsResponse.data.length,
            active: signalsResponse.data.filter(signal => signal.status === 'active').length,
            pending: signalsResponse.data.filter(signal => signal.status === 'pending').length
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Ошибка при загрузке статистики');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Панель администратора</Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Всего пользователей
              </Typography>
              <Typography variant="h3">{stats.users.total}</Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Активных пользователей
              </Typography>
              <Typography variant="h3">{stats.users.active}</Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Всего сигналов
              </Typography>
              <Typography variant="h3">{stats.signals.total}</Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Ожидают привязки
              </Typography>
              <Typography variant="h3">{stats.signals.pending}</Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
