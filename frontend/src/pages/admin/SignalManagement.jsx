import React, { useState, useEffect } from 'react';
import {
  Container,
  Stack,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { signalApi } from '../../services/api/signal';

export default function SignalManagement() {
  const [signals, setSignals] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newSignalUrl, setNewSignalUrl] = useState('');

  useEffect(() => {
    fetchSignals();
  }, []);

  const fetchSignals = async () => {
    setLoading(true);
    try {
      const response = await signalApi.getAllSignals();
      setSignals(response.data);
    } catch (err) {
      setError('Ошибка при загрузке сигналов');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSignal = async () => {
    try {
      await signalApi.addSignal(newSignalUrl);
      setOpenDialog(false);
      setNewSignalUrl('');
      fetchSignals();
    } catch (err) {
      setError('Ошибка при добавлении сигнала');
    }
  };

  const handleDeleteSignal = async (signalId) => {
    try {
      await signalApi.deleteSignal(signalId);
      fetchSignals();
    } catch (err) {
      setError('Ошибка при удалении сигнала');
    }
  };

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Управление сигналами</Typography>
        <Button variant="contained" onClick={() => setOpenDialog(true)}>
          Добавить сигнал
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>URL</TableCell>
                <TableCell>Название</TableCell>
                <TableCell>Автор</TableCell>
                <TableCell>Прирост</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {signals
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((signal) => (
                  <TableRow key={signal.id}>
                    <TableCell>{signal.url}</TableCell>
                    <TableCell>{signal.name}</TableCell>
                    <TableCell>{signal.author}</TableCell>
                    <TableCell>{signal.growth}</TableCell>
                    <TableCell>
                      <Button
                        color="error"
                        onClick={() => handleDeleteSignal(signal.id)}
                      >
                        Удалить
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={signals.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Добавить новый сигнал</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="URL сигнала"
            type="text"
            fullWidth
            value={newSignalUrl}
            onChange={(e) => setNewSignalUrl(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button onClick={handleAddSignal} variant="contained">
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
