import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Stack,
  Typography,
  CircularProgress,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Box,
  Select,
  MenuItem,
  Tabs,
  Tab,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { signalApi } from '../../services/api/signal';
import { adminApi } from '../../services/api/admin';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`signal-assignment-tabpanel-${index}`}
      aria-labelledby={`signal-assignment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SignalAssignmentModal({ open, onClose, userId, userName }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [signals, setSignals] = useState([]);
  const [signalsLoading, setSignalsLoading] = useState(false);
  const [selectedSignalId, setSelectedSignalId] = useState('');
  const [newSignalUrl, setNewSignalUrl] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (open) {
      fetchAvailableSignals();
    }
  }, [open]);

  const fetchAvailableSignals = async () => {
    setSignalsLoading(true);
    try {
      const response = await signalApi.getAllSignals();
      if (response?.data) {
        setSignals(response.data);
      }
    } catch (err) {
      console.error('Error fetching signals:', err);
      setError('Ошибка при загрузке списка сигналов');
    } finally {
      setSignalsLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };

  const handleAssignExistingSignal = async () => {
    if (!selectedSignalId) {
      setError('Необходимо выбрать сигнал');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await adminApi.assignSignalToUser(userId, selectedSignalId);
      setSuccess('Сигнал успешно назначен пользователю');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error assigning signal:', err);
      setError(err.response?.data?.message || 'Ошибка при назначении сигнала');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewSignal = async () => {
    if (!newSignalUrl) {
      setError('Необходимо указать URL сигнала');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Сначала добавляем новый сигнал
      const addResponse = await signalApi.addSignal(newSignalUrl);
      if (addResponse?.data?.id) {
        // Затем назначаем его пользователю
        await adminApi.assignSignalToUser(userId, addResponse.data.id);
        setSuccess('Сигнал успешно добавлен и назначен пользователю');
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error('Error adding and assigning signal:', err);
      setError(err.response?.data?.message || 'Ошибка при добавлении сигнала');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            Назначение сигнала {userName ? `пользователю ${userName}` : ''}
          </Typography>
          <IconButton onClick={onClose} disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      
      <Divider />

      <FormControl fullWidth sx={{ mt: 2, mb: 2, p: 2 }}>
        <Select
          value={tabValue}
          onChange={handleTabChange}
          displayEmpty
          inputProps={{ 'aria-label': 'Выбор типа назначения сигнала' }}
        >
          <MenuItem value={0}>Выбрать существующий</MenuItem>
          <MenuItem value={1}>Добавить новый</MenuItem>
        </Select>
      </FormControl>

      <DialogContent>
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

        <TabPanel value={tabValue} index={0}>
          {signalsLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : signals.length === 0 ? (
            <Typography color="text.secondary" align="center">
              Нет доступных сигналов. Пожалуйста, добавьте новый сигнал.
            </Typography>
          ) : (
            <FormControl component="fieldset">
              <FormLabel component="legend">Доступные сигналы</FormLabel>
              <RadioGroup
                aria-label="signals"
                name="signals"
                value={selectedSignalId}
                onChange={(e) => setSelectedSignalId(e.target.value)}
              >
                {signals.map((signal) => (
                  <FormControlLabel
                    key={signal.id}
                    value={signal.id}
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="subtitle2">
                          {signal.name || `Сигнал ${signal.id}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {signal.description || signal.url || 'Нет описания'}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="URL сигнала"
              value={newSignalUrl}
              onChange={(e) => setNewSignalUrl(e.target.value)}
              placeholder="https://www.mql5.com/ru/signals/1234567"
              helperText="Введите URL сигнала с сайта MQL5"
            />
          </Stack>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Отмена
        </Button>
        <Button
          onClick={tabValue === 0 ? handleAssignExistingSignal : handleAddNewSignal}
          variant="contained"
          disabled={loading || (tabValue === 0 && !selectedSignalId) || (tabValue === 1 && !newSignalUrl)}
        >
          {loading ? (
            <>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              Обработка...
            </>
          ) : (
            'Назначить сигнал'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 