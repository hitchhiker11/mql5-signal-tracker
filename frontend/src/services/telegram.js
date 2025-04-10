/**
 * Сервис для работы с Telegram Mini App
 */

/**
 * Проверяет, запущено ли приложение внутри Telegram Web App
 * @returns {boolean}
 */
export const isTelegramWebApp = () => {
  return window.Telegram && window.Telegram.WebApp;
};

/**
 * Получает данные пользователя из Telegram Web App
 * @returns {Object|null} Данные пользователя Telegram или null
 */
export const getTelegramUser = () => {
  if (!isTelegramWebApp()) return null;
  
  const webApp = window.Telegram.WebApp;
  if (!webApp.initDataUnsafe || !webApp.initDataUnsafe.user) {
    return null;
  }
  
  return webApp.initDataUnsafe.user;
};

/**
 * Получает Telegram User ID текущего пользователя
 * @returns {number|null} Telegram User ID или null
 */
export const getTelegramUserId = () => {
  const user = getTelegramUser();
  return user ? user.id : null;
};

/**
 * Проверяет валидность Telegram WebApp данных
 * @param {string} initData - данные инициализации от Telegram
 * @returns {Promise<boolean>} Результат валидации
 */
export const validateTelegramWebAppData = async (initData) => {
  try {
    // В реальном приложении здесь должна быть отправка данных на сервер для валидации
    // с использованием hash и bot token на серверной стороне
    const response = await fetch('/api/auth/validate-telegram-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ initData }),
    });
    
    const data = await response.json();
    return data.isValid;
  } catch (error) {
    console.error('Error validating Telegram WebApp data:', error);
    return false;
  }
};

/**
 * Выполняет вход или регистрацию пользователя через Telegram
 * @returns {Promise<Object>} Результат аутентификации
 */
export const loginWithTelegram = async () => {
  if (!isTelegramWebApp()) {
    throw new Error('Не удалось получить данные Telegram. Убедитесь, что вы используете Telegram Mini App.');
  }
  
  const webApp = window.Telegram.WebApp;
  const initData = webApp.initData;
  
  if (!initData) {
    throw new Error('Отсутствуют данные инициализации Telegram');
  }
  
  try {
    const response = await fetch('/api/auth/telegram-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        initData,
        user: webApp.initDataUnsafe.user
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка аутентификации через Telegram');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Telegram login error:', error);
    throw error;
  }
};

/**
 * Связывает существующий аккаунт с Telegram
 * @param {string} telegramUsername - имя пользователя в Telegram
 * @returns {Promise<Object>} Результат связывания аккаунтов
 */
export const linkTelegramAccount = async (telegramUsername) => {
  try {
    const response = await fetch('/api/users/link-telegram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ telegramUsername }),
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка связывания аккаунта с Telegram');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error linking Telegram account:', error);
    throw error;
  }
};

export default {
  isTelegramWebApp,
  getTelegramUser,
  getTelegramUserId,
  validateTelegramWebAppData,
  loginWithTelegram,
  linkTelegramAccount
}; 