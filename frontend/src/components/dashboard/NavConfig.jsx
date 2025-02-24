import {
  Home,
  Person,
  Assessment,
  People,
  Settings,
  Timeline
} from '@mui/icons-material';

const navConfig = {
  admin: [
    {
      title: 'Дашборд',
      path: '/admin/dashboard',
      icon: <Home />
    },
    {
      title: 'Пользователи',
      path: '/admin/users',
      icon: <People />
    },
    {
      title: 'Управление сигналами',
      path: '/admin/signals',
      icon: <Timeline />
    },
    {
      title: 'Настройки',
      path: '/admin/settings',
      icon: <Settings />
    }
  ],
  user: [
    {
      title: 'Дашборд',
      path: '/user/dashboard',
      icon: <Home />
    },
    {
      title: 'Мои сигналы',
      path: '/user/signals',
      icon: <Assessment />
    },
    {
      title: 'Профиль',
      path: '/user/profile',
      icon: <Person />
    }
  ]
};

export default navConfig;
