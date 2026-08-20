import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // 1. นำเข้า BrowserRouter สำหรับจัดการหลายหน้า
import './index.css'
import App from './App.jsx'


if ('serviceWorker' in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/daily-work-log">
      <App />
    </BrowserRouter>
  </StrictMode>,
)