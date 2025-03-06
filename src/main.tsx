import React from 'react';
import ReactDOM from 'react-dom/client';
import 'nes.css/css/nes.min.css';
import './index.css';

import App from './App.tsx';
// 导入 nes.css

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
