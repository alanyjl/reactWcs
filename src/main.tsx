import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SignalRProvider } from './context/SignalRContext'; // 引入signalR连接
import { SystemStatusProvider } from './context/SystemStatusContext';
import { PointStatusProvider } from './context/PointStatusContext'; // 👈 引入点位状态交互
import { LicenseProvider } from './context/LicenseContext';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <LicenseProvider>
    <StrictMode>
      <SignalRProvider>
        <SystemStatusProvider>
          <PointStatusProvider>
            <App />
          </PointStatusProvider>
        </SystemStatusProvider>
      </SignalRProvider>
    </StrictMode>
  </LicenseProvider>,
);
