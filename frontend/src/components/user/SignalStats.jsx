import React from 'react';
import {
  Card,
  Stack,
  Typography,
  Grid,
  Box,
  LinearProgress,
  CardContent
} from '@mui/material';
import { styled } from '@mui/material/styles';

const ProgressItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.neutral
}));

const SignalStats = ({ signal }) => {
  // Если сигнал отсутствует, показываем сообщение об ошибке
  if (!signal) {
    return (
      <Card>
        <CardContent>
          <Typography>Неизвестный сигнал</Typography>
          <Typography color="textSecondary">
            Данные сигнала отсутствуют
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Если данные еще не загружены
  if (!signal.data) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">{signal.name}</Typography>
          <Typography color="textSecondary">
            {signal.author && `Автор: ${signal.author}`}
          </Typography>
          <Typography color="textSecondary">
            Ожидание загрузки статистики...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Преобразуем строку JSON в объект, если data является строкой
  const data = typeof signal.data === 'string' ? JSON.parse(signal.data) : signal.data;

  // Если нет статистики
  if (!data || !data.stats) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">{signal.name}</Typography>
          <Typography color="textSecondary">
            {signal.author && `Автор: ${signal.author}`}
          </Typography>
          <Typography color="textSecondary">
            Статистика сигнала отсутствует
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const stats = data.stats;

  const statItems = [
    { label: 'Прирост', value: stats['Прирост:'] || 'Н/Д' },
    { label: 'Просадка', value: stats['Просадка:'] || 'Н/Д' },
    { label: 'Прибыльность', value: stats['Прибыльность:'] || 'Н/Д' },
    { label: 'Фактор восстановления', value: stats['Фактор восстановления:'] || 'Н/Д' },
    { label: 'Сделки', value: stats['Сделки:'] || 'Н/Д' },
    { label: 'Математическое ожидание', value: stats['Математическое ожидание:'] || 'Н/Д' }
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>{signal.name}</Typography>
        <Typography color="textSecondary" gutterBottom>
          {signal.author && `Автор: ${signal.author}`}
        </Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {statItems.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  {item.label}
                </Typography>
                <Typography variant="h5" component="div">
                  {item.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SignalStats;
