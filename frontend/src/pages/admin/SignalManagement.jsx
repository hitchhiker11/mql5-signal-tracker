import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Stack,
  TextField,
  Alert
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { signalApi } from '../../services/api/signal';

export default function SignalManagement() {
  const [signals, setSignals] = useState([]);
  const [newSignalUrl, setNewSignalUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSignals();
  }, []);

  const fetchSignals = async () => {
    try {
      const response = await signalApi.getAllSignals();
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
    try {
      const response = await signalApi.addSignal(newSignalUrl);
      setSignals([...signals, response.data]);
      setNewSignalUrl('');
    } catch (err) {
      setError('Ошибка при добавлении сигнала');
    }
  };

  const handleDelete = async (signalId) => {
    try {
      await signalApi.deleteSignal(signalId);
      setSignals(signals.filter(signal => signal.id !== signalId));
    } catch (err) {
      setError('Ошибка при удалении сигнала');
    }
  };

  if (loading) {
    return <Typography>Загрузка...</Typography>;
  }

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Управление сигналами</Typography>
      </Stack>

      <Paper sx={{ p: 2, mb: 3 }}>
        <form onSubmit={handleAddSignal}>
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              label="URL сигнала"
              value={newSignalUrl}
              onChange={(e) => setNewSignalUrl(e.target.value)}
            />
            <Button type="submit" variant="contained">
              Добавить
            </Button>
          </Stack>
        </form>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Название</TableCell>
              <TableCell>Автор</TableCell>
              <TableCell>URL</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {signals.map((signal) => (
              <TableRow key={signal.id}>
                <TableCell>{signal.id}</TableCell>
                <TableCell>{signal.name}</TableCell>
                <TableCell>{signal.author}</TableCell>
                <TableCell>{signal.url}</TableCell>
                <TableCell>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(signal.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
