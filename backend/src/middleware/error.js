export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Ошибка валидации',
      errors: err.errors
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      message: 'Неавторизованный доступ'
    });
  }

  if (err.message === 'Failed to parse signal data') {
    return res.status(400).json({
      message: 'Ошибка при парсинге сигнала',
      error: err.message
    });
  }

  res.status(500).json({
    message: 'Внутренняя ошибка сервера',
    error: err.message
  });
}; 