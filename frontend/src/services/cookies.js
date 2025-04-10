import Cookies from 'js-cookie';

// Настройки cookies по умолчанию
const DEFAULT_OPTIONS = {
  path: '/',
  expires: 7, // 7 дней
  secure: process.env.NODE_ENV === 'production', // Secure в production
  sameSite: 'strict' // Строгие настройки SameSite для защиты от CSRF
};

// Ключи для cookies
export const COOKIE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user_data'
};

/**
 * Установка токена авторизации в cookie
 * @param {string} token - JWT токен
 * @param {Object} options - настройки cookie
 */
export const setAuthToken = (token, options = {}) => {
  Cookies.set(COOKIE_KEYS.TOKEN, token, { ...DEFAULT_OPTIONS, ...options });
};

/**
 * Установка refresh токена в cookie
 * @param {string} token - Refresh токен
 * @param {Object} options - настройки cookie
 */
export const setRefreshToken = (token, options = {}) => {
  // Устанавливаем более длительное время жизни для refresh токена
  Cookies.set(COOKIE_KEYS.REFRESH_TOKEN, token, { 
    ...DEFAULT_OPTIONS, 
    ...options,
    expires: 30 // 30 дней для refresh токена
  });
};

/**
 * Сохранение данных пользователя в cookie
 * @param {Object} user - данные пользователя
 */
export const setUserData = (user) => {
  Cookies.set(COOKIE_KEYS.USER, JSON.stringify(user), DEFAULT_OPTIONS);
};

/**
 * Получение токена авторизации из cookie
 * @returns {string|undefined} JWT токен
 */
export const getAuthToken = () => {
  return Cookies.get(COOKIE_KEYS.TOKEN);
};

/**
 * Получение refresh токена из cookie
 * @returns {string|undefined} Refresh токен
 */
export const getRefreshToken = () => {
  return Cookies.get(COOKIE_KEYS.REFRESH_TOKEN);
};

/**
 * Получение данных пользователя из cookie
 * @returns {Object|null} Данные пользователя
 */
export const getUserData = () => {
  const userData = Cookies.get(COOKIE_KEYS.USER);
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data from cookie:', error);
      return null;
    }
  }
  return null;
};

/**
 * Очистка всех cookies относящихся к авторизации
 */
export const clearAuthCookies = () => {
  Cookies.remove(COOKIE_KEYS.TOKEN, { path: '/' });
  Cookies.remove(COOKIE_KEYS.REFRESH_TOKEN, { path: '/' });
  Cookies.remove(COOKIE_KEYS.USER, { path: '/' });
};

/**
 * Проверка наличия токена в cookie
 * @returns {boolean}
 */
export const hasAuthToken = () => {
  return !!getAuthToken();
};

export default {
  setAuthToken,
  setRefreshToken,
  setUserData,
  getAuthToken,
  getRefreshToken,
  getUserData,
  clearAuthCookies,
  hasAuthToken
}; 