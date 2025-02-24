import React, { useState } from 'react';
import {
  Card,
  Stack,
  Button,
  Container,
  Typography,
  TextField,
  Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { signalApi } from '../../services/api/signal';

export default function SignalAssignment() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [signalUrl, setSignalUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await signalApi.assignSignal(userId, signalUrl);
      setSuccess('Сигнал успешно назначен пользователю');
      setTimeout(() => {
        navigate('/admin/users');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при назначении сигнала');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Назначение сигнала</Typography>
      </Stack>

      <Card sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="URL сигнала"
              value={signalUrl}
              onChange={(e) => setSignalUrl(e.target.value)}
              placeholder="https://www.mql5.com/ru/signals/1234567"
            />

            <Button
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Назначение...' : 'Назначить сигнал'}
            </Button>
          </Stack>
        </form>
      </Card>
    </Container>
  );
}
