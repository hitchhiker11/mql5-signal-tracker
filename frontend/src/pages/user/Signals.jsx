import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Card,
  TextField,
  Button,
  Stack,
  Alert,
  Box,
  CircularProgress
} from '@mui/material';
import { signalApi } from '../../services/api/signal';
import SignalStats from '../../components/user/SignalStats';

export default function Signals() {
  const [signals, setSignals] = useState([]);
  const [newSignalUrl, setNewSignalUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchSignals = async () => {
    setLoading(true);
    try {
      const response = await signalApi.getUserSignals();
      setSignals(response.data);
    } catch (err) {
      console.error('Error fetching signals:', err);
      setError('Ошибка при загрузке сигналов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignals();
  }, []);

  const handleAddSignal = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Добавляем сигнал и получаем обновленные данные
      const response = await signalApi.addSignal(newSignalUrl);
      console.log('Added signal response:', response);
      
      // Обновляем список сигналов
      await fetchSignals();
      
      setNewSignalUrl('');
      setSuccess('Сигнал успешно добавлен');
    } catch (err) {
      console.error('Error adding signal:', err);
      setError(err.response?.data?.message || 'Ошибка при добавлении сигнала');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Мои сигналы</Typography>
      </Stack>

      {/* <Card sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleAddSignal}>
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              label="URL сигнала"
              value={newSignalUrl}
              onChange={(e) => setNewSignalUrl(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !newSignalUrl}
            >
              {loading ? <CircularProgress size={24} /> : 'Добавить'}
            </Button>
          </Stack>
        </form>
      </Card> */}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {signals.map((signal) => (
          <Grid item xs={12} key={signal.id}>
            <SignalStats signal={signal} onUpdate={fetchSignals} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
