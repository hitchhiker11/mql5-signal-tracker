import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Card,
  Stack,
  Box,
  CircularProgress,
  Alert,
  CardHeader,
  CardContent,
  Divider,
  useTheme,
  Button,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import { adminApi } from '../../services/api/admin';
import RefreshIcon from '@mui/icons-material/Refresh';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export default function AdminDashboard() {
  const theme = useTheme();
  const [stats, setStats] = useState({
    users: {
      total: 0,
      active: 0,
      new: 0
    },
    signals: {
      total: 0,
      active: 0,
      pending: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Состояние для отслеживания свернутого/развернутого состояния панели приветствия
  const [welcomeCardCollapsed, setWelcomeCardCollapsed] = useState(() => {
    // Получаем сохраненное состояние из localStorage
    const savedState = localStorage.getItem('adminWelcomeCardCollapsed');
    return savedState ? JSON.parse(savedState) : false;
  });

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const [usersResponse, signalsResponse] = await Promise.all([
        adminApi.getAllUsers(),
        adminApi.getAllSignals()
      ]);

      if (usersResponse?.data) {
        const users = usersResponse.data;
        setStats(prev => ({
          ...prev,
          users: {
            total: users.length,
            active: users.filter(user => user.status === 'active').length,
            new: users.filter(user => {
              const createdAt = new Date(user.created_at);
              const now = new Date();
              return (now - createdAt) <= 7 * 24 * 60 * 60 * 1000;
            }).length
          }
        }));
      }

      if (signalsResponse?.data) {
        const signals = signalsResponse.data;
        setStats(prev => ({
          ...prev,
          signals: {
            total: signals.length,
            active: signals.filter(signal => signal.status === 'active').length,
            pending: signals.filter(signal => signal.status === 'pending').length
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Ошибка при загрузке статистики');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);
  
  // Сохраняем состояние в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('adminWelcomeCardCollapsed', JSON.stringify(welcomeCardCollapsed));
  }, [welcomeCardCollapsed]);

  const StatCard = ({ title, value, icon, color, description, growth }) => (
    <Card sx={{ height: '100%', boxShadow: theme.shadows[2] }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h3">
              {value}
            </Typography>
            {description && (
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                {description}
              </Typography>
            )}
          </Box>
          <Box 
            sx={{ 
              p: 1, 
              bgcolor: alpha => theme.palette[color].lighter, 
              borderRadius: 1 
            }}
          >
            {icon}
          </Box>
        </Box>
        {growth !== undefined && (
          <Box sx={{ mt: 2, mb: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={growth} 
              sx={{ 
                height: 8,
                bgcolor: theme.palette[color].lighter,
                '& .MuiLinearProgress-bar': {
                  bgcolor: theme.palette[color].main,
                },
                borderRadius: 5
              }} 
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const handleRefresh = () => {
    fetchDashboardStats();
  };
  
  const handleToggleCollapse = () => {
    setWelcomeCardCollapsed(!welcomeCardCollapsed);
  };

  const renderWelcomeCard = () => (
    <Card sx={{ mb: 4 }}>
      <CardContent sx={{ position: 'relative', p: welcomeCardCollapsed ? 1 : 3 }}>
        <Tooltip title={welcomeCardCollapsed ? "Развернуть" : "Свернуть"}>
          <IconButton 
            onClick={handleToggleCollapse}
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8,
              zIndex: 1
            }}
          >
            {welcomeCardCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </IconButton>
        </Tooltip>
        
        {welcomeCardCollapsed ? (
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
        ) : (
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
                Панель администратора
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Статистика пользователей и сигналов на платформе
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
        )}
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl">
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      ) : (
        <>
          {renderWelcomeCard()}

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Всего пользователей" 
                value={stats.users.total}
                icon={<PeopleAltIcon sx={{ color: theme.palette.primary.main }} />}
                color="primary"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Активных пользователей" 
                value={stats.users.active}
                icon={<PeopleAltIcon sx={{ color: theme.palette.success.main }} />}
                color="success"
                description={`${Math.round((stats.users.active / stats.users.total) * 100)}% от общего числа`}
                growth={(stats.users.active / stats.users.total) * 100}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Новых пользователей" 
                value={stats.users.new}
                icon={<PersonAddIcon sx={{ color: theme.palette.info.main }} />}
                color="info"
                description="За последние 7 дней"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Всего сигналов" 
                value={stats.signals.total}
                icon={<SignalCellularAltIcon sx={{ color: theme.palette.warning.main }} />}
                color="warning"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Активных сигналов" 
                value={stats.signals.active}
                icon={<SignalCellularAltIcon sx={{ color: theme.palette.success.main }} />}
                color="success"
                description={`${Math.round((stats.signals.active / stats.signals.total) * 100)}% от общего числа`}
                growth={(stats.signals.active / stats.signals.total) * 100}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Ожидают привязки" 
                value={stats.signals.pending}
                icon={<HourglassEmptyIcon sx={{ color: theme.palette.error.main }} />}
                color="error"
                description="Сигналы требуют назначения"
              />
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
}
