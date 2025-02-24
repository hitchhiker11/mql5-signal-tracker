import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Tabs,
  Tab,
  Box,
  Typography,
  Grid,
  Divider,
  Chip,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Fade,
  Paper
} from '@mui/material';
import {
  Timeline,
  Assessment,
  Info,
  ShowChart,
  Compare,
  History
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area
} from 'recharts';

const TabPanel = ({ children, value, index, ...other }) => (
  <div hidden={value !== index} {...other}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const StatItem = ({ label, value, color = 'primary' }) => (
  <Box sx={{ mb: 2 }}>
    <Typography color="textSecondary" variant="body2">
      {label}
    </Typography>
    <Typography variant="h6" color={color}>
      {value}
    </Typography>
  </Box>
);

const SignalDetails = ({ signal }) => {
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const parsedData = signal.parsed_data;

  if (!parsedData) return null;

  const { generalInfo, statistics, distribution, tradeHistory } = parsedData;

  // Цветовая схема
  const COLORS = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    error: theme.palette.error.main,
    warning: theme.palette.warning.main,
    info: theme.palette.info.main
  };

  // Форматирование числовых данных
  const formatNumber = (value) => {
    if (typeof value === 'string') {
      const num = parseFloat(value.replace(/[^0-9.-]+/g, ''));
      return isNaN(num) ? value : num.toLocaleString();
    }
    return value;
  };

  // Подготовка данных для графиков
  const profitabilityData = [
    {
      name: 'Прибыльные',
      value: parseFloat(statistics['Прибыльных трейдов:']) || 0,
      color: COLORS.success
    },
    {
      name: 'Убыточные',
      value: parseFloat(statistics['Убыточных трейдов:']) || 0,
      color: COLORS.error
    }
  ];

  const tradingActivityData = [
    {
      name: 'Длинные',
      value: parseFloat(statistics['Длинных трейдов:']) || 0,
      color: COLORS.primary
    },
    {
      name: 'Короткие',
      value: parseFloat(statistics['Коротких трейдов:']) || 0,
      color: COLORS.secondary
    }
  ];

  return (
    <Fade in timeout={500}>
      {/* <Card> */}
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={(e, v) => setTabValue(v)}
              variant={isMobile ? "scrollable" : "fullWidth"}
              scrollButtons="auto"
            >
              <Tab icon={<Info />} label="Общая информация" />
              <Tab icon={<Assessment />} label="Статистика" />
              <Tab icon={<ShowChart />} label="Распределение" />
              <Tab icon={<History />} label="История сделок" />
              <Tab icon={<Compare />} label="Другие сигналы" />
            </Tabs>
          </Box>

          {/* Общая информация */}
          <TabPanel value={tabValue} index={0}>
            <Fade in timeout={500}>
              <Grid container spacing={3}>
                {Object.entries(generalInfo).map(([key, value], index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                      <StatItem 
                        label={key.replace(':', '')}
                        value={formatNumber(value)}
                        color={key.includes('Прирост') ? 'success.main' : 'primary'}
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Fade>
          </TabPanel>

          {/* Статистика */}
          <TabPanel value={tabValue} index={1}>
            <Fade in timeout={500}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Grid container spacing={2}>
                    {Object.entries(statistics)
                      .filter(([key]) => key !== '')
                      .map(([key, value], index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Paper elevation={3} sx={{ p: 2 }}>
                            <StatItem 
                              label={key.replace(':', '')}
                              value={formatNumber(value)}
                              color={
                                key.includes('Прибыль') ? 'success.main' :
                                key.includes('Убыток') ? 'error.main' :
                                'primary'
                              }
                            />
                          </Paper>
                        </Grid>
                    ))}
                  </Grid>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      Соотношение сделок
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={profitabilityData}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {profitabilityData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Fade>
          </TabPanel>

          {/* Распределение */}
          <TabPanel value={tabValue} index={2}>
            <Fade in timeout={500}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Paper elevation={3} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Распределение по инструментам
                    </Typography>
                    <Box sx={{ height: 400 }}>
                      <ResponsiveContainer>
                        <BarChart
                          data={distribution.filter(item => item.symbol && parseFloat(item.percentage) > 0)}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="symbol" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="percentage" fill={COLORS.primary} name="Процент" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Fade>
          </TabPanel>

          {/* История сделок */}
          <TabPanel value={tabValue} index={3}>
            <Fade in timeout={500}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Paper elevation={3} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      История сделок
                    </Typography>
                    {tradeHistory && tradeHistory.length > 0 ? (
                      <Box sx={{ height: 400 }}>
                        <ResponsiveContainer>
                          <LineChart
                            data={tradeHistory}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="profit" stroke={COLORS.success} name="Прибыль" />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    ) : (
                      <Typography color="textSecondary">
                        История сделок пока недоступна
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Fade>
          </TabPanel>

          {/* Другие сигналы */}
          <TabPanel value={tabValue} index={4}>
            <Fade in timeout={500}>
              <Grid container spacing={2}>
                {parsedData.authorSignals.map((authorSignal, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper 
                      elevation={3} 
                      sx={{ 
                        p: 2,
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'scale(1.02)',
                          cursor: 'pointer'
                        }
                      }}
                      onClick={() => window.open(authorSignal.url, '_blank')}
                    >
                      <Typography variant="h6" gutterBottom>
                        {authorSignal.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Открыть сигнал ↗
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Fade>
          </TabPanel>
        </CardContent>
      {/* </Card> */}
    </Fade>
  );
};

export default SignalDetails; 