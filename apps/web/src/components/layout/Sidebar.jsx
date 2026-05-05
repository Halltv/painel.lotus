import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LayoutDashboard, Users, Ticket, MessageSquare, BookOpen, Download, Menu, FileText } from 'lucide-react';
import { cn } from '@/lib/utils.js';
import { Button } from '@/components/ui/button';

const navItems = [
  { icon: Home,            label: 'Home',           path: '/home' },
  { icon: LayoutDashboard, label: 'Dashboard',      path: '/dashboard', roles: ['ADMIN', 'GERENTE'] },
  { icon: Users,           label: 'Lotus Client',   path: '/clientes' },
  { icon: Ticket,          label: 'Lotus Chamados', path: '/tickets' },
  { icon: MessageSquare,   label: 'Lotus Zap Zap',  path: '/whatsapp' },
  { icon: BookOpen,        label: 'Lotus Wiki',     path: '/hub' },
  { icon: Download,        label: 'Lotus APP',      path: '/app' },
  { icon: FileText,        label: 'Contratos',      path: '/contratos' },
];

export default function Sidebar({ collapsed, setCollapsed, userRole }) {
  return (
    <aside className={cn(
      'flex flex-col border-r bg-card transition-all duration-300 shrink-0',
      collapsed ? 'w-14' : 'w-56'
    )}>
      {/* Logo / toggle */}
      <div className={cn(
        'flex h-14 items-center border-b px-3',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        {!collapsed && (
          <span className="font-bold text-base text-primary tracking-tight truncate">Lotus TEF</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 shrink-0"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 px-1.5 overflow-y-auto space-y-0.5">
        {navItems
          .filter(item => !item.roles || item.roles.includes(userRole))
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) => cn(
                'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary/15 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                collapsed && 'justify-center px-0'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
      </nav>
    </aside>
  );
}
