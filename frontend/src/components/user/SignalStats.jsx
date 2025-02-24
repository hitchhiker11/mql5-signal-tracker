import React, { useState, useEffect } from 'react';
import {
  Card,
  Stack,
  Typography,
  Grid,
  Box,
  LinearProgress,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { signalApi } from '../../services/api/signal';
import SignalDetails from './SignalDetails';

const ProgressItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.neutral
}));

const SignalStats = ({ signal, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const handleUpdate = async () => {
    if (!signal.id) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await signalApi.updateSignal(signal.id);
      if (onUpdate) {
        await onUpdate();
      }
    } catch (err) {
      console.error('Error updating signal:', err);
      const errorMessage = err.response?.data?.message || 'Ошибка при обновлении данных';
      setError(errorMessage);
      
      // Попытка повторного запроса при ошибке
      if (retryCount < 2) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          handleUpdate();
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!signal.parsed_data && retryCount === 0) {
      handleUpdate();
    }
  }, [signal.id, retryCount]);

  if (!signal) {
    return (
      <Card>
        <CardContent>
          <Typography>Неизвестный сигнал</Typography>
        </CardContent>
      </Card>
    );
  }

  const parsedData = signal.parsed_data;
  
  if (!parsedData) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">{signal.name}</Typography>
          <Typography color="textSecondary">
            {signal.author && `Автор: ${signal.author}`}
          </Typography>
          <Typography color="textSecondary">
            Ожидание обновления данных...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const { generalInfo, statistics } = parsedData;

  const statItems = [
    { label: 'Прирост', value: generalInfo['Прирост:'] || 'Н/Д' },
    { label: 'Прибыль', value: generalInfo['Прибыль:'] || 'Н/Д' },
    { label: 'Средства', value: generalInfo['Средства:'] || 'Н/Д' },
    { label: 'Баланс', value: generalInfo['Баланс:'] || 'Н/Д' },
    { label: 'Всего трейдов', value: statistics['Всего трейдов:'] || 'Н/Д' },
    { label: 'Прибыльных', value: statistics['Прибыльных трейдов:'] || 'Н/Д' }
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {signal.name}
        </Typography>
        <Typography color="textSecondary" gutterBottom>
          {signal.author && `Автор: ${signal.author}`}
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <SignalDetails signal={signal} />
        )}
      </CardContent>
    </Card>
  );
};

export default SignalStats;
