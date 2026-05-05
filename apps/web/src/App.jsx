
import React from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';

import LoginPage from './pages/LoginPage.jsx';
import HomePage from './pages/HomePage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Clients from './pages/Clients.jsx';
import Tickets from './pages/Tickets.jsx';
import WhatsApp from './pages/WhatsApp.jsx';
import Hub from './pages/Hub.jsx';
import AppPage from './pages/AppPage.jsx';
import Settings from './pages/Settings.jsx';
import Contratos from './pages/Contratos.jsx';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN', 'GERENTE']}><Dashboard /></ProtectedRoute>} />
              <Route path="/clientes" element={<Clients />} />
              <Route path="/tickets" element={<Tickets />} />
              <Route path="/whatsapp" element={<WhatsApp />} />
              <Route path="/hub" element={<Hub />} />
              <Route path="/app" element={<AppPage />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/contratos" element={<Contratos />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </Router>
        <Toaster position="top-right" />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
