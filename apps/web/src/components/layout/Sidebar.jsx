import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LayoutDashboard, Users, Ticket, MessageSquare, BookOpen, Download, Menu, FileText } from 'lucide-react';
import { cn } from '@/lib/utils.js';
import { Button } from '@/components/ui/button';

const navItems = [
  { icon: Home, label: 'Home', path: '/home' },
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['ADMIN', 'GERENTE'] },
  { icon: Users, label: 'Lotus Client', path: '/clientes' },
  { icon: Ticket, label: 'Lotus Chamados', path: '/tickets' },
  { icon: MessageSquare, label: 'Lotus Zap Zap', path: '/whatsapp' },
  { icon: BookOpen, label: 'Lotus Wiki', path: '/hub' },
  { icon: Download, label: 'Lotus APP', path: '/app' },
  { icon: FileText, label: 'Contratos', path: '/contratos' },
  // ← Settings REMOVIDO do menu lateral (acesso via perfil no Header)
];

export default function Sidebar({ collapsed, setCollapsed, userRole }) {
  return (
    <aside className={cn(
      "flex flex-col border-r bg-card transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!collapsed && <span className="font-bold text-xl text-primary tracking-tight">Lotus TEF</span>}
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="ml-auto">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {navItems
          .filter(item => !item.roles || item.roles.includes(userRole))
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
      </nav>
    </aside>
  );
}
