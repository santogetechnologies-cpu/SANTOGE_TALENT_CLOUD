import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ScopeProvider } from './contexts/ScopeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AppRoutes } from './routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <ScopeProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </ScopeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
