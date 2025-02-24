import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

export const useWidth = () => {
  const theme = useTheme();
  const [width, setWidth] = useState(window.innerWidth);

  // Медиа-запросы для брейкпоинтов
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMd = useMediaQuery(theme.breakpoints.only('md'));
  const isLg = useMediaQuery(theme.breakpoints.only('lg'));
  const isXl = useMediaQuery(theme.breakpoints.only('xl'));

  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      setWidth(currentWidth);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Инициализация при монтировании

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Возвращаем текущую ширину и информацию о брейкпоинтах
  return width;
}; 