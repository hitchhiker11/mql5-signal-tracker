export const validate = {
  email: (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  },

  password: (password) => {
    return password.length >= 6;
  },

  username: (username) => {
    return username.length >= 3;
  },

  signalUrl: (url) => {
    const re = /^https:\/\/www\.mql5\.com\/[a-z]{2}\/signals\/\d+$/;
    return re.test(url);
  }
};
