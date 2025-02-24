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
  InputLabel
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { signalApi } from '../../services/api/signal';
import { userApi } from '../../services/api/user';

export default function SignalManagement() {
  const [signals, setSignals] = useState([]);
  const [users, setUsers] = useState([]);
  const [newSignalUrl, setNewSignalUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialog, setEditDialog] = useState(false);
  const [assignDialog, setAssignDialog] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    fetchSignals();
    fetchUsers();
  }, []);

  const fetchSignals = async () => {
    try {
      const response = await signalApi.getAllSignals();
      setSignals(response.data);
    } catch (err) {
      setError('Ошибка при загрузке сигналов');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userApi.getAllUsers();
      if (response?.data) {
        const filteredUsers = Array.isArray(response.data) 
          ? response.data.filter(user => user.role !== 'admin')
          : [];
        setUsers(filteredUsers);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Ошибка при загрузке пользователей');
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
    try {
      await signalApi.assignSignal(selectedUser, selectedSignal.id);
      setAssignDialog(false);
      fetchSignals(); // Обновляем список сигналов
    } catch (err) {
      setError('Ошибка при привязке сигнала');
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

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="URL сигнала"
          value={newSignalUrl}
          onChange={(e) => setNewSignalUrl(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <Button variant="contained" onClick={handleAddSignal}>
          Добавить сигнал
        </Button>
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

      {/* Диалог редактирования */}
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

      {/* Диалог привязки к пользователю */}
      <Dialog open={assignDialog} onClose={() => setAssignDialog(false)}>
        <DialogTitle>Привязать сигнал к пользователю</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Пользователь</InputLabel>
            <Select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog(false)}>Отмена</Button>
          <Button onClick={handleSaveAssign} variant="contained">Привязать</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
