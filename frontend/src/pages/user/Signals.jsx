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
  Box
} from '@mui/material';
import { signalApi } from '../../services/api/signal';
import SignalStats from '../../components/user/SignalStats';

export default function Signals() {
  const [signals, setSignals] = useState([]);
  const [newSignalUrl, setNewSignalUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSignals();
  }, []);

  const fetchSignals = async () => {
    setLoading(true);
    try {
      const response = await signalApi.getUserSignals();
      setSignals(response.data);
    } catch (err) {
      console.log(err);
      setError('Ошибка при загрузке сигналов');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSignal = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Сначала парсим сигнал
      const parseResponse = await signalApi.parseSignal(newSignalUrl);
      console.log('Parsed signal:', parseResponse.data);

      // Если парсинг успешен, добавляем сигнал
      const addResponse = await signalApi.addSignal(newSignalUrl);
      console.log('Added signal:', addResponse.data);

      setSignals([...signals, addResponse.data]);
      setNewSignalUrl('');
      setSuccess('Сигнал успешно добавлен');
    } catch (err) {
      console.error('Error:', err);
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

      <Card sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleAddSignal}>
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              label="URL сигнала MQL5"
              value={newSignalUrl}
              onChange={(e) => setNewSignalUrl(e.target.value)}
              placeholder="https://www.mql5.com/ru/signals/1234567"
            />
            <Button
              variant="contained"
              type="submit"
              disabled={loading}
              sx={{ minWidth: 120 }}
            >
              {loading ? 'Загрузка...' : 'Добавить'}
            </Button>
          </Stack>
        </form>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
      </Card>

      {signals.length === 0 ? (
        <Box textAlign="center" py={3}>
          <Typography color="text.secondary">
            У вас пока нет добавленных сигналов
          </Typography>
        </Box>
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
