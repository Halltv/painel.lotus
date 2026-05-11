import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const isContratos = location.pathname === '/contratos';

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} userRole={user?.role} />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header />
        <main
          className={`flex-1 ${isContratos ? 'overflow-hidden p-0' : 'overflow-y-auto p-4'}`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}