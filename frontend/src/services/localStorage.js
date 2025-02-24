const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const THEME_KEY = 'theme';

export const storage = {
  // Auth
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),

  // User
  getUser: () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  setUser: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  removeUser: () => localStorage.removeItem(USER_KEY),

  // Theme
  getTheme: () => localStorage.getItem(THEME_KEY) || 'light',
  setTheme: (theme) => localStorage.setItem(THEME_KEY, theme),

  // Clear all
  clearAll: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};
