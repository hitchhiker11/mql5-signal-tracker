import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Добавьте временную проверку
console.log('React version:', React.version);
console.log('Root element:', document.getElementById('root'));

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);