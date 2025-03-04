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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Box
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { signalApi } from '../../services/api/signal';
import { adminApi } from '../../services/api/admin';
import LoadingButton from '@mui/lab/LoadingButton';

export default function SignalManagement() {
  const [signals, setSignals] = useState([]);
  const [users, setUsers] = useState([]);
  const [newSignalUrl, setNewSignalUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editDialog, setEditDialog] = useState(false);
  const [assignDialog, setAssignDialog] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [selectedUser, setSelectedUser] = useState('');
  const [addingSignal, setAddingSignal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSignals();
    fetchUsers();
  }, []);

  const fetchSignals = async () => {
    try {
      const response = await signalApi.getAllSignals();
      if (response?.data) {
        setSignals(response.data);
      }
    } catch (err) {
      console.error('Error fetching signals:', err);
      setError('Ошибка при загрузке сигналов');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await adminApi.getAllUsers();
      if (response?.data) {
        setUsers(response.data.filter(user => user.role !== 'admin'));
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Ошибка при загрузке пользователей');
    }
  };

  const handleAddSignal = async (e) => {
    e.preventDefault();
    if (!newSignalUrl || isSubmitting) return;

    setError('');
    setSuccess('');
    setIsSubmitting(true);
    
    try {
      const response = await signalApi.addSignal(newSignalUrl);
      await fetchSignals(); // Обновляем список сигналов
      setNewSignalUrl('');
      setSuccess('Сигнал успешно добавлен');
    } catch (err) {
      console.error('Error adding signal:', err);
      setError(err.response?.data?.message || 'Ошибка при добавлении сигнала');
    } finally {
      setIsSubmitting(false);
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

  const handleEdit = (signal) => {
    setSelectedSignal(signal);
    setEditDialog(true);
  };

  const handleAssign = (signal) => {
    setSelectedSignal(signal);
    setAssignDialog(true);
  };

  const handleSaveEdit = async () => {
    try {
      await signalApi.updateSignal(selectedSignal.id, selectedSignal);
      setSignals(signals.map(s => s.id === selectedSignal.id ? selectedSignal : s));
      setEditDialog(false);
    } catch (err) {
      setError('Ошибка при обновлении сигнала');
    }
  };

  const handleSaveAssign = async () => {
    if (!selectedSignal || !selectedUser) {
      setError('Выберите сигнал и пользователя');
      return;
    }

    try {
      await signalApi.assignSignal(selectedUser, selectedSignal.id);
      setSuccess('Сигнал успешно назначен пользователю');
      setAssignDialog(false);
      fetchSignals(); // Обновляем список сигналов
    } catch (err) {
      console.error('Error assigning signal:', err);
      setError(err.response?.data?.message || 'Ошибка при назначении сигнала');
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

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="URL сигнала"
          value={newSignalUrl}
          onChange={(e) => setNewSignalUrl(e.target.value)}
          sx={{ flexGrow: 1 }}
          disabled={isSubmitting}
        />
        <LoadingButton
          loading={isSubmitting}
          variant="contained"
          onClick={handleAddSignal}
          disabled={!newSignalUrl}
          loadingIndicator={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              Добавление...
            </Box>
          }
        >
          Добавить сигнал
        </LoadingButton>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Название</TableCell>
              <TableCell>URL</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {signals.map((signal) => (
              <TableRow key={signal.id}>
                <TableCell>{signal.id}</TableCell>
                <TableCell>{signal.name}</TableCell>
                <TableCell>{signal.url}</TableCell>
                <TableCell>{signal.status}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <IconButton onClick={() => handleEdit(signal)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(signal.id)} size="small">
                      <DeleteIcon />
                    </IconButton>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleAssign(signal)}
                    >
                      Привязать
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={editDialog} onClose={() => setEditDialog(false)}>
        <DialogTitle>Редактировать сигнал</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Название"
            value={selectedSignal?.name || ''}
            onChange={(e) => setSelectedSignal({...selectedSignal, name: e.target.value})}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="URL"
            value={selectedSignal?.url || ''}
            onChange={(e) => setSelectedSignal({...selectedSignal, url: e.target.value})}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Отмена</Button>
          <Button onClick={handleSaveEdit} variant="contained">Сохранить</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={assignDialog} onClose={() => setAssignDialog(false)}>
        <DialogTitle>Назначить сигнал пользователю</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Пользователь</InputLabel>
            <Select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.username || user.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog(false)}>Отмена</Button>
          <Button onClick={handleSaveAssign} variant="contained">
            Назначить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
