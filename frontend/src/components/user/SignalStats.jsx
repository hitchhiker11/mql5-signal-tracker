import React from 'react';
import {
  Card,
  Stack,
  Typography,
  Grid,
  Box,
  LinearProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';

const ProgressItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.neutral
}));

export default function SignalStats({ data }) {
  const {
    generalInfo,
    statistics,
    distribution
  } = data;

  const mainStats = [
    { label: 'Прирост', value: generalInfo['Прирост:'] },
    { label: 'Прибыль', value: generalInfo['Прибыль:'] },
    { label: 'Средства', value: generalInfo['Средства:'] },
    { label: 'Торговые дни', value: generalInfo['Торговые дни:'] }
  ];

  const tradingStats = [
    { label: 'Всего трейдов', value: statistics['Всего трейдов:'] },
    { label: 'Прибыльные трейды', value: statistics['Прибыльных трейдов:'] },
    { label: 'Убыточные трейды', value: statistics['Убыточных трейдов:'] },
    { label: 'Профит фактор', value: statistics['Профит фактор:'] }
  ];

  return (
    <Card sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Typography variant="h6">Статистика сигнала</Typography>

        <Grid container spacing={3}>
          {mainStats.map((stat) => (
            <Grid item xs={12} sm={6} md={3} key={stat.label}>
              <Stack spacing={0.5}>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
                <Typography variant="h6">{stat.value}</Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Торговая статистика
          </Typography>
          <Stack spacing={2}>
            {tradingStats.map((stat) => (
              <ProgressItem key={stat.label}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 1 }}
                >
                  <Typography variant="subtitle2">{stat.label}</Typography>
                  <Typography variant="subtitle2">{stat.value}</Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={parseFloat(stat.value) || 0}
                  sx={{ height: 8, bgcolor: 'grey.50016' }}
                />
              </ProgressItem>
            ))}
          </Stack>
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Распределение по инструментам
          </Typography>
          <Stack spacing={2}>
            {distribution
              .filter(item => item.symbol && item.percentage)
              .slice(0, 5)
              .map((item) => (
                <ProgressItem key={item.symbol}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 1 }}
                  >
                    <Typography variant="subtitle2">{item.symbol}</Typography>
                    <Typography variant="subtitle2">{item.percentage}%</Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={parseFloat(item.percentage)}
                    sx={{ height: 8, bgcolor: 'grey.50016' }}
                  />
                </ProgressItem>
              ))}
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}
