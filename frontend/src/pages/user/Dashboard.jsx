import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Box,
  Stack,
  Alert,
  CircularProgress,
  Button,
  Divider,
  useTheme,
  IconButton,
  Tooltip,
  LinearProgress,
  Collapse
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { signalApi } from '../../services/api/signal';
import { useAuth } from '../../auth/useAuth';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import EventIcon from '@mui/icons-material/Event';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PieChartIcon from '@mui/icons-material/PieChart';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Регистрируем компоненты для Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

// Мок данные для графиков и статистики
const mockAccountData = {
  growth: {
    labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
    values: [0, 15, 25, 40, 55, 65, 70, 85, 90, 95, 100, 107]
  },
  yearGrowth: 107,
  funds: 1625.19,
  initialDeposit: 500.00,
  profit: 625.19,
  deposits: 500.00,
  withdrawals: 0.00
};

const mockTradesData = {
  total: 290,
  profitable: 219,
  unprofitable: 71,
  bestTrade: 43.08,
  worstTrade: -186.10,
  longTrades: 41.38,
  shortTrades: 58.62,
  avgProfit: 10.58,
  avgLoss: -23.83,
  lastTrade: '9 часов назад',
  tradesPerWeek: 9,
  avgHoldingTime: '7 часов'
};

const mockProfitLossData = {
  totalProfit: 2317.37,
  totalProfitPips: 3454338,
  totalLoss: -1692.18,
  totalLossPips: 2374872,
  maxWinStreak: 21,
  maxLossStreak: 11,
  maxProfitInStreak: 243.27,
  maxProfitInStreakTrades: 20,
  maxLossInStreak: -268.96,
  maxLossInStreakTrades: 2,
  expectation: 2.16,
  profitFactor: 1.37,
  sharpeRatio: 0.18,
  recoveryFactor: 2.27
};

const mockGrowthData = {
  monthlyGrowth: 11.90,
  yearlyForecast: 144.78
};

const mockDrawdownData = {
  absoluteDrawdown: 0.38,
  maxBalanceDrawdown: 16.72,
  maxBalanceDrawdownValue: 274.61,
  maxEquityDrawdown: 15.66,
  maxEquityDrawdownValue: 256.72
};

const mockInstrumentsData = {
  instruments: [
    { name: 'ETHUSDT', trades: 120, profit: 1125.45, profitPips: 1675890, buyPercent: 55, sellPercent: 45 },
    { name: 'BTCUSDT', trades: 95, profit: 872.63, profitPips: 1298752, buyPercent: 40, sellPercent: 60 },
    { name: 'AVAXUSDT', trades: 75, profit: 319.29, profitPips: 479696, buyPercent: 25, sellPercent: 75 }
  ]
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const theme = useTheme();
  
  // Состояние для отслеживания свернутого/развернутого состояния панели приветствия
  const [welcomeCardCollapsed, setWelcomeCardCollapsed] = useState(() => {
    // Получаем сохраненное состояние из localStorage
    const savedState = localStorage.getItem('userWelcomeCardCollapsed');
    return savedState ? JSON.parse(savedState) : false;
  });

  // Состояние карточек
  const [cardsCollapsed, setCardsCollapsed] = useState(() => {
    const savedState = localStorage.getItem('userDashboardCardsCollapsed');
    return savedState ? JSON.parse(savedState) : {
      account: false,
      trades: false,
      profitLoss: false,
      growth: false,
      drawdown: false,
      instruments: false
    };
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    fetchUserSignals();
  }, [isAuthenticated, navigate]);

  // Сохраняем состояние в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('userWelcomeCardCollapsed', JSON.stringify(welcomeCardCollapsed));
  }, [welcomeCardCollapsed]);

  // Сохраняем состояние карточек
  useEffect(() => {
    localStorage.setItem('userDashboardCardsCollapsed', JSON.stringify(cardsCollapsed));
  }, [cardsCollapsed]);

  const fetchUserSignals = async () => {
    try {
      setLoading(true);
      const response = await signalApi.getUserSignals();
      console.log('Signals response:', response); // Для отладки
      if (response?.data) {
        // Убедимся, что данные правильно структурированы
        const formattedSignals = response.data.map(signal => ({
          ...signal,
          stats: signal.stats ? 
            (typeof signal.stats === 'string' ? JSON.parse(signal.stats) : signal.stats) 
            : {}
        }));
        console.log('Formatted signals:', formattedSignals); // Для отладки
        setSignals(formattedSignals);
      }
    } catch (err) {
      console.error('Error fetching signals:', err);
      if (err.response?.status === 401) {
        // Не делаем автоматический выход при первой 401 ошибке
        console.log('Authentication error, retrying...');
        try {
          // Пробуем повторить запрос один раз
          const retryResponse = await signalApi.getUserSignals();
          if (retryResponse?.data) {
            setSignals(retryResponse.data);
            return;
          }
        } catch (retryErr) {
          console.error('Retry failed:', retryErr);
        }
      }
      setError('Ошибка при загрузке сигналов');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchUserSignals();
  };

  const handleToggleCollapse = () => {
    setWelcomeCardCollapsed(!welcomeCardCollapsed);
  };

  const handleToggleCardCollapse = (card) => {
    setCardsCollapsed({
      ...cardsCollapsed,
      [card]: !cardsCollapsed[card]
    });
  };

  // Получение сигнала с данными
  const getSignalData = () => {
    if (!signals || signals.length === 0) return null;
    
    // Берем первый сигнал из списка
    const signal = signals[0];
    
    // Проверяем наличие необходимых данных
    if (!signal.data) return null;
    
    return {
      id: signal.id,
      name: signal.name,
      author: signal.author,
      url: signal.url,
      lastUpdate: signal.data.lastUpdate,
      stats: signal.data.statistics || {},
      info: signal.data.generalInfo || {},
      distribution: signal.data.distribution || []
    };
  };

  // Получение статистических данных с проверкой наличия
  const getStatValue = (stats, key, defaultValue = '-') => {
    if (!stats) return defaultValue;
    return stats[key] !== undefined ? stats[key] : defaultValue;
  };

  // Обработка числового значения из строки (удаление единиц измерения)
  const parseNumericValue = (value, defaultValue = 0) => {
    if (!value || typeof value !== 'string') return defaultValue;
    
    // Извлекаем первое число из строки (может содержать разные символы)
    const match = value.match(/-?\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : defaultValue;
  };

  // Извлечение данных для графика роста из истории (пока заглушка)
  const prepareGrowthChartData = (signal) => {
    if (!signal) return null;
    
    // Определяем рост в процентах из данных сигнала
    const growthPercent = parseNumericValue(getStatValue(signal.info, 'Прирост:'), 0);
    
    // Генерируем данные для графика на основе текущего роста
    // (для полноценного графика нужны исторические данные)
    const labels = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    const currentMonth = new Date().getMonth();
    
    // Создаем массив с нарастающим значением
    const values = Array(12).fill(0).map((_, index) => {
      if (index > currentMonth) return null; // Будущие месяцы пустые
      return index === currentMonth ? growthPercent : growthPercent / (currentMonth + 1) * index;
    });
    
    return {
      labels,
      datasets: [
        {
          label: 'Прирост (%)',
          data: values,
          borderColor: theme.palette.primary.main,
          backgroundColor: theme.palette.primary.light + '40',
          fill: true,
          tension: 0.4
        }
      ]
    };
  };

  // Компонент статистической карточки
  const StatCard = ({ title, icon, collapsed, onToggle, children }) => (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          bgcolor: 'background.neutral'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {icon}
            <Typography variant="h6" sx={{ ml: 1 }}>
              {title}
            </Typography>
          </Box>
          <Tooltip title={collapsed ? "Развернуть" : "Свернуть"}>
            <IconButton 
              onClick={onToggle}
              sx={{ 
                transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
                transition: theme => theme.transitions.create('transform', {
                  duration: theme.transitions.duration.shorter
                })
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Collapse in={!collapsed} timeout="auto">
          <Box sx={{ p: 3 }}>
            {children}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
  
  // Компонент метрики
  const MetricItem = ({ label, value, color }) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6" color={color || 'text.primary'}>
        {value}
      </Typography>
    </Box>
  );

  // Строит двухколоночный грид с метриками из объекта
  const MetricsGrid = ({ data = [], columns = { xs: 2, sm: 2, md: 2, lg: 3 } }) => (
    <Grid container spacing={2}>
      {data.map((item, index) => (
        <Grid item xs={12 / columns.xs} sm={12 / columns.sm} md={12 / columns.md} lg={12 / columns.lg} key={index}>
          <MetricItem 
            label={item.label} 
            value={item.value} 
            color={item.color}
          />
        </Grid>
      ))}
    </Grid>
  );

  const renderWelcomeCard = () => {
    const signalData = getSignalData();
    
    return (
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ position: 'relative', p: welcomeCardCollapsed ? 1 : 3 }}>
          <Tooltip title={welcomeCardCollapsed ? "Развернуть" : "Свернуть"}>
            <IconButton 
              onClick={handleToggleCollapse}
              sx={{ 
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 1,
                transform: welcomeCardCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
                transition: theme => theme.transitions.create('transform', {
                  duration: theme.transitions.duration.shorter
                })
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Tooltip>
          
          <Collapse in={!welcomeCardCollapsed} timeout="auto">
            <Box 
              sx={{ 
                p: 3, 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundImage: 'linear-gradient(135deg, rgba(0, 171, 85, 0.24) 0%, rgba(0, 171, 85, 0) 100%)',
                borderRadius: 2,
              }}
            >
              <Box>
                <Typography variant="h4" sx={{ mb: 1 }}>
                  Добро пожаловать, {user?.username || 'Пользователь'}!
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  {signalData 
                    ? `Ваш торговый сигнал: ${signalData.name} от ${signalData.author}`
                    : 'Здесь вы можете отслеживать статистику по вашим торговым сигналам'}
                </Typography>
              </Box>
              <Button 
                variant="contained" 
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                sx={{ mt: { xs: 2, sm: 0 } }}
              >
                Обновить данные
              </Button>
            </Box>
          </Collapse>
          
          {welcomeCardCollapsed && (
            <Box 
              sx={{
                display: 'flex',
                justifyContent: 'center',
                py: 1
              }}
            >
              <Button 
                variant="contained" 
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                size="small"
              >
                Обновить данные
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  // Карточка данных о счете с графиком роста
  const renderAccountCard = () => {
    const signalData = getSignalData();
    if (!signalData) return null;
    
    const info = signalData.info;
    const stats = signalData.stats;
    
    // Подготовка данных для графика
    const growthChartData = prepareGrowthChartData(signalData);
    
    // Извлекаем метрики из данных
    const accountMetrics = [
      { 
        label: 'Прирост', 
        value: getStatValue(info, 'Прирост:', '0%'),
        color: 'success.main'
      },
      { 
        label: 'Средства',
        value: getStatValue(info, 'Средства:', '0.00 USD')
      },
      { 
        label: 'Баланс',
        value: getStatValue(info, 'Баланс:', '0.00 USD') 
      },
      { 
        label: 'Начальный депозит',
        value: getStatValue(info, 'Нач. депозит:', '0.00 USD')
      },
      { 
        label: 'Прибыль',
        value: getStatValue(info, 'Прибыль:', '0.00 USD'),
        color: 'success.main'
      },
      { 
        label: 'Общая прибыль',
        value: getStatValue(stats, 'Общая прибыль:', '0.00 USD'),
        color: 'success.main'
      },
      { 
        label: 'Пополнения / Снятия',
        value: `${getStatValue(info, 'Пополнения:', '0.00 USD')} / ${getStatValue(info, 'Снятия:', '0.00 USD')}`
      }
    ];

    return (
      <StatCard 
        title="Общая информация о счете" 
        icon={<AccountBalanceWalletIcon color="primary" />}
        collapsed={cardsCollapsed.account}
        onToggle={() => handleToggleCardCollapse('account')}
      >
        <Grid container spacing={3}>
          {/* <Grid item xs={12} md={6}>
            <Box sx={{ height: 250, mb: 3 }}>
              <Typography variant="subtitle2" align="center" gutterBottom>
                График прироста
              </Typography>
              {growthChartData ? (
                <Line 
                  data={growthChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return value + '%';
                          }
                        }
                      }
                    }
                  }}
                />
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography variant="body2" color="text.secondary">
                    Недостаточно данных для построения графика
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid> */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <MetricsGrid data={accountMetrics} columns={{ xs: 1, sm: 2, md: 2, lg: 2 }} />
            </Stack>
          </Grid>
        </Grid>
      </StatCard>
    );
  };

  // Карточка со статистикой сделок
  const renderTradesCard = () => {
    const signalData = getSignalData();
    if (!signalData) return null;
    
    const stats = signalData.stats;
    
    // Получаем данные о длинных/коротких сделках
    const longTradesStr = getStatValue(stats, 'Длинных трейдов:', '0 (0%)');
    const shortTradesStr = getStatValue(stats, 'Коротких трейдов:', '0 (0%)');
    
    // Извлекаем проценты из строк
    const longPercentMatch = longTradesStr.match(/\((\d+\.?\d*)%\)/);
    const shortPercentMatch = shortTradesStr.match(/\((\d+\.?\d*)%\)/);
    
    const longPercent = longPercentMatch ? parseFloat(longPercentMatch[1]) : 0;
    const shortPercent = shortPercentMatch ? parseFloat(shortPercentMatch[1]) : 0;
    
    // Данные для графика
    const longShortChartData = {
      labels: ['Длинные', 'Короткие'],
      datasets: [
        {
          data: [longPercent, shortPercent],
          backgroundColor: [
            theme.palette.success.main,
            theme.palette.error.main
          ],
          borderWidth: 1
        }
      ]
    };
    
    // Подготовка метрик для отображения
    const totalTrades = getStatValue(stats, 'Всего трейдов:', '0');
    const profitableTrades = getStatValue(stats, 'Прибыльных трейдов:', '0 (0%)');
    const unprofitableTrades = getStatValue(stats, 'Убыточных трейдов:', '0 (0%)');
    
    // Извлекаем количество и процент прибыльных трейдов
    const profitableMatch = profitableTrades.match(/(\d+)\s*\((\d+\.?\d*)%\)/);
    const profitableCount = profitableMatch ? profitableMatch[1] : '0';
    const profitablePercent = profitableMatch ? profitableMatch[2] : '0';
    
    // Извлекаем количество и процент убыточных трейдов
    const unprofitableMatch = unprofitableTrades.match(/(\d+)\s*\((\d+\.?\d*)%\)/);
    const unprofitableCount = unprofitableMatch ? unprofitableMatch[1] : '0';
    const unprofitablePercent = unprofitableMatch ? unprofitableMatch[2] : '0';
    
    const tradesMetrics = [
      { 
        label: 'Всего трейдов',
        value: totalTrades
      },
      { 
        label: 'Профитные',
        value: `${profitableCount} (${profitablePercent}%)`,
        color: 'success.main'
      },
      { 
        label: 'Убыточные',
        value: `${unprofitableCount} (${unprofitablePercent}%)`,
        color: 'error.main'
      },
      { 
        label: 'Лучший трейд',
        value: getStatValue(stats, 'Лучший трейд:', '0.00 USD'),
        color: 'success.main'
      },
      { 
        label: 'Длинные / Короткие сделки',
        value: `${longPercent}% / ${shortPercent}%`
      }
    ];

    return (
      <StatCard 
        title="Сделки" 
        icon={<ShowChartIcon color="info" />}
        collapsed={cardsCollapsed.trades}
        onToggle={() => handleToggleCardCollapse('trades')}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <MetricsGrid data={tradesMetrics} columns={{ xs: 1, sm: 2, md: 2, lg: 2 }} />
          </Grid>
          
          {/* <Grid item xs={12} md={5}>
            <Box sx={{ height: 260 }}>
              <Typography variant="subtitle2" align="center" gutterBottom>
                Соотношение длинных/коротких сделок
              </Typography>
              <Pie 
                data={longShortChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false
                }}
              />
            </Box>
          </Grid> */}
        </Grid>
      </StatCard>
    );
  };

  // Карточка прироста и прогноза
  const renderGrowthCard = () => {
    const signalData = getSignalData();
    if (!signalData) return null;
    
    const stats = signalData.stats;
    const info = signalData.info;
    
    // Получаем месячный прирост
    const monthlyGrowth = getStatValue(stats, 'Прирост в месяц:', '0%');
    
    // Рассчитываем годовой прогноз (если не указан)
    const monthlyGrowthValue = parseNumericValue(monthlyGrowth, 0);
    const yearlyForecast = (monthlyGrowthValue * 12).toFixed(2) + '%';
    
    const growthMetrics = [
      { 
        label: 'Прирост в месяц',
        value: monthlyGrowth,
        color: parseNumericValue(monthlyGrowth, 0) > 0 ? 'success.main' : 'error.main'
      },
      { 
        label: 'Годовой прогноз',
        value: yearlyForecast,
        color: parseNumericValue(yearlyForecast, 0) > 0 ? 'success.main' : 'error.main'
      }
    ];

    return (
      <StatCard 
        title="Прирост и прогноз" 
        icon={<EventIcon color="warning" />}
        collapsed={cardsCollapsed.growth}
        onToggle={() => handleToggleCardCollapse('growth')}
      >
        <MetricsGrid data={growthMetrics} columns={{ xs: 1, sm: 2, md: 2, lg: 2 }} />
      </StatCard>
    );
  };

  // Карточка распределения по инструментам
  const renderInstrumentsCard = () => {
    const signalData = getSignalData();
    if (!signalData) return null;
    
    // Проверяем наличие данных о распределении
    const distribution = signalData.distribution;
    if (!distribution || distribution.length === 0) {
      return (
        <StatCard 
          title="Распределение по инструментам" 
          icon={<PieChartIcon color="primary" />}
          collapsed={cardsCollapsed.instruments}
          onToggle={() => handleToggleCardCollapse('instruments')}
        >
          <Typography variant="body2" align="center">
            Нет данных о распределении по инструментам
          </Typography>
        </StatCard>
      );
    }
    
    // Фильтруем данные, убирая пустые элементы
    const validDistribution = distribution.filter(item => 
      item.symbol && (item.value !== undefined || item.trades !== undefined)
    );
    
    if (validDistribution.length === 0) {
      return (
        <StatCard 
          title="Распределение по инструментам" 
          icon={<PieChartIcon color="primary" />}
          collapsed={cardsCollapsed.instruments}
          onToggle={() => handleToggleCardCollapse('instruments')}
        >
          <Typography variant="body2" align="center">
            Нет данных о распределении по инструментам
          </Typography>
        </StatCard>
      );
    }

    return (
      <StatCard 
        title="Распределение по инструментам" 
        icon={<PieChartIcon color="primary" />}
        collapsed={cardsCollapsed.instruments}
        onToggle={() => handleToggleCardCollapse('instruments')}
      >
        <Typography variant="subtitle2" gutterBottom>
          Сделки
        </Typography>
        
        {validDistribution.map((item, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={2} sm={1}>
                <Typography variant="body2">{item.symbol}</Typography>
              </Grid>
              <Grid item xs={2} sm={1}>
                <Typography variant="body2">{item.value || item.trades || 0}</Typography>
              </Grid>
              <Grid item xs={8} sm={10}>
                <Box sx={{ display: 'flex', width: '100%' }}>
                  <Box sx={{ 
                    width: `${item.buyPercentage || 0}%`, 
                    bgcolor: theme.palette.success.main, 
                    height: 20, 
                    borderRadius: '4px 0 0 4px' 
                  }} />
                  <Box sx={{ 
                    width: `${item.sellPercentage || 100 - (item.buyPercentage || 0)}%`, 
                    bgcolor: theme.palette.error.main, 
                    height: 20, 
                    borderRadius: '0 4px 4px 0' 
                  }} />
                </Box>
              </Grid>
            </Grid>
          </Box>
        ))}
        
        <Typography variant="subtitle2" sx={{ mt: 4, mb: 2 }}>
          Общая прибыль, USD
        </Typography>
        
        {validDistribution.map((item, index) => (
          <Box key={`profit-${index}`} sx={{ mb: 3 }}>
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={2} sm={1}>
                <Typography variant="body2">{item.symbol}</Typography>
              </Grid>
              <Grid item xs={2} sm={1}>
                <Typography variant="body2">{item.profit || 0}</Typography>
              </Grid>
              <Grid item xs={8} sm={10}>
                <Box sx={{ 
                  width: `${Math.min((item.profitPercentage || 0), 100)}%`, 
                  bgcolor: theme.palette.primary.main, 
                  height: 20, 
                  borderRadius: '4px' 
                }} />
              </Grid>
            </Grid>
          </Box>
        ))}
        
        <Typography variant="subtitle2" sx={{ mt: 4, mb: 2 }}>
          Убыток, USD / Прибыль, USD
        </Typography>
        
        {validDistribution.map((item, index) => (
          <Box key={`pl-${index}`} sx={{ mb: 3 }}>
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={2} sm={1}>
                <Typography variant="body2">{item.symbol}</Typography>
              </Grid>
              <Grid item xs={10} sm={11}>
                <Box sx={{ display: 'flex', width: '100%' }}>
                  <Box sx={{ 
                    width: `${Math.min((item.lossPercentage || 0), 50)}%`, 
                    bgcolor: theme.palette.error.main, 
                    height: 20, 
                    borderRadius: '4px 0 0 4px' 
                  }} />
                  <Box sx={{ 
                    width: `${Math.min((item.gainPercentage || 0), 50)}%`, 
                    bgcolor: theme.palette.success.main, 
                    height: 20, 
                    borderRadius: '0 4px 4px 0' 
                  }} />
                </Box>
              </Grid>
            </Grid>
          </Box>
        ))}
      </StatCard>
    );
  };

  return (
    <Container maxWidth="xl">
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      ) : (
        <>
          {renderWelcomeCard()}
          
          {signals.length > 0 ? (
            <>
              {renderAccountCard()}
              {renderTradesCard()}
              {renderGrowthCard()}
              {/* Карточка распределения по инструментам закомментирована */}
              {/* {renderInstrumentsCard()} */}
            </>
          ) : (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 5 }}>
                <Typography variant="h6" paragraph>
                  У вас пока нет активных сигналов
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                  Обратитесь к администратору для получения доступа к торговым сигналам
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleRefresh}
                  startIcon={<RefreshIcon />}
                >
                  Обновить
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Container>
  );
}
