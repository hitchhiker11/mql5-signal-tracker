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
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { signalApi } from '../../services/api/signal';
import SignalDetails from './SignalDetails';

const ProgressItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.neutral
}));

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const SignalStats = ({ signal, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signalData, setSignalData] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

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
    if (!signal.data && retryCount === 0) {
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

  const parsedData = signal.data;
  
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

  const renderGeneralInfo = (generalInfo) => (
    <TableContainer component={Paper}>
      <Table>
        <TableBody>
          {Object.entries(generalInfo).map(([key, value]) => (
            <TableRow key={key}>
              <TableCell component="th" scope="row">{key}</TableCell>
              <TableCell align="right">{value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderStatistics = (statistics) => (
    <TableContainer component={Paper}>
      <Table>
        <TableBody>
          {Object.entries(statistics).map(([key, value]) => (
            key && <TableRow key={key}>
              <TableCell component="th" scope="row">{key}</TableCell>
              <TableCell align="right">{value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderDistribution = (distribution) => {
    // Фильтруем пустые записи и группируем по типу данных
    const validDistribution = distribution.filter(item => item.symbol && item.value);
    const chunkSize = validDistribution.length / 3;
    
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Символ</TableCell>
              <TableCell align="right">Значение</TableCell>
              <TableCell align="right">Процент</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {validDistribution.slice(0, chunkSize).map((item, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row">{item.symbol}</TableCell>
                <TableCell align="right">{item.value}</TableCell>
                <TableCell align="right">{item.percentage}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderSignalInfo = () => {
    const data = signalData?.data || signal.data;
    
    if (!data) {
      return (
        <>
          <Typography variant="h6">{signal.name}</Typography>
          <Typography color="textSecondary">
            {signal.author && `Автор: ${signal.author}`}
          </Typography>
          <Typography color="textSecondary">
            Нет данных для отображения
          </Typography>
        </>
      );
    }

    const { generalInfo, statistics, distribution } = data;

    return (
      <>
        <Typography variant="h6" gutterBottom>
          {signal.name || generalInfo.signalName}
        </Typography>
        <Typography color="textSecondary" gutterBottom>
          {signal.author || generalInfo.author}
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Обзор" />
            <Tab label="Общая информация" />
            <Tab label="Статистика" />
            <Tab label="Распределение" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <ProgressItem>
                <Typography variant="subtitle2">Прирост</Typography>
                <Typography variant="h6">{generalInfo['Прирост:'] || 'Н/Д'}</Typography>
              </ProgressItem>
            </Grid>
            <Grid item xs={12} sm={6}>
              <ProgressItem>
                <Typography variant="subtitle2">Прибыль</Typography>
                <Typography variant="h6">{generalInfo['Прибыль:'] || 'Н/Д'}</Typography>
              </ProgressItem>
            </Grid>
            <Grid item xs={12} sm={6}>
              <ProgressItem>
                <Typography variant="subtitle2">Всего трейдов</Typography>
                <Typography variant="h6">{statistics['Всего трейдов:'] || 'Н/Д'}</Typography>
              </ProgressItem>
            </Grid>
            <Grid item xs={12} sm={6}>
              <ProgressItem>
                <Typography variant="subtitle2">Прибыльных</Typography>
                <Typography variant="h6">{statistics['Прибыльных трейдов:'] || 'Н/Д'}</Typography>
              </ProgressItem>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {renderGeneralInfo(generalInfo)}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {renderStatistics(statistics)}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {renderDistribution(distribution)}
        </TabPanel>
      </>
    );
  };

  return (
    <Card>
      <CardContent>
        {loading ? (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          renderSignalInfo()
        )}
      </CardContent>
    </Card>
  );
};

export default SignalStats;
