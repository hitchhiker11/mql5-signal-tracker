import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Card,
  Stack,
  Box
} from '@mui/material';
import { userApi } from '../../services/api/user';
import { signalApi } from '../../services/api/signal';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSignals: 0,
    activeUsers: 0,
    pendingAssignments: 0
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [usersResponse, signalsResponse] = await Promise.all([
        userApi.getStats(),
        signalApi.getStats()
      ]);

      setStats({
        totalUsers: usersResponse.data.total,
        totalSignals: signalsResponse.data.total,
        activeUsers: usersResponse.data.active,
        pendingAssignments: signalsResponse.data.pending
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  return (
    <Container>
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
              <Typography variant="h3">{stats.totalUsers}</Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Активные пользователи
              </Typography>
              <Typography variant="h3">{stats.activeUsers}</Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Всего сигналов
              </Typography>
              <Typography variant="h3">{stats.totalSignals}</Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Ожидают назначения
              </Typography>
              <Typography variant="h3">{stats.pendingAssignments}</Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
