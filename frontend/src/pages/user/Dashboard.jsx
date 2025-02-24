import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Card,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { signalApi } from '../../services/api/signal';
import { useAuth } from '../../auth/useAuth';
import SignalStats from '../../components/user/SignalStats';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    fetchUserSignals();
  }, [isAuthenticated, navigate]);

  const fetchUserSignals = async () => {
    try {
      const response = await signalApi.getUserSignals();
      console.log('Signals response:', response); // Для отладки
      if (response?.data) {
        // Убедимся, что данные правильно структурированы
        const formattedSignals = response.data.map(signal => ({
          ...signal,
          stats: signal.stats ? 
            (typeof signal.stats === 'string' ? JSON.parse(signal.stats) : signal.stats) 
            : {}
        }));
        console.log('Formatted signals:', formattedSignals); // Для отладки
        setSignals(formattedSignals);
      }
    } catch (err) {
      console.error('Error fetching signals:', err);
      if (err.response?.status === 401) {
        // Не делаем автоматический выход при первой 401 ошибке
        console.log('Authentication error, retrying...');
        try {
          // Пробуем повторить запрос один раз
          const retryResponse = await signalApi.getUserSignals();
          if (retryResponse?.data) {
            setSignals(retryResponse.data);
            return;
          }
        } catch (retryErr) {
          console.error('Retry failed:', retryErr);
        }
      }
      setError('Ошибка при загрузке сигналов');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
        {/* <Typography variant="h4"></Typography> */}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {signals.length === 0 ? (
        <Card sx={{ p: 3 }}>
          <Typography>У вас пока нет назначенных сигналов</Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {signals.map((signal) => (
            <Grid item xs={12} key={signal.id}>
              <SignalStats signal={signal} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
