import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Card,
  Stack,
  Alert
} from '@mui/material';
import { signalApi } from '../../services/api/signal';
import SignalStats from '../../components/user/SignalStats';

export default function UserDashboard() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserSignals();
  }, []);

  const fetchUserSignals = async () => {
    try {
      const response = await signalApi.getUserSignals();
      setSignals(response.data);
    } catch (err) {
      setError('Ошибка при загрузке сигналов');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Загрузка...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Панель управления</Typography>
      </Stack>

      {signals.length === 0 ? (
        <Card sx={{ p: 3 }}>
          <Typography>У вас пока нет назначенных сигналов</Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {signals.map((signal) => (
            <Grid item xs={12} key={signal.id}>
              <SignalStats data={signal} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
