import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, Sun, Moon, LogOut, User, Settings, Shield } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const pageNames = {
  '/home': 'Home',
  '/dashboard': 'Dashboard',
  '/clientes': 'Lotus Client',
  '/tickets': 'Lotus Chamados',
  '/whatsapp': 'Lotus Zap Zap',
  '/hub': 'Lotus Wiki',
  '/app': 'Lotus APP',
  '/settings': 'Configurações',
};

const roleLabels = { ADMIN: 'Admin', GERENTE: 'Gerente', OPERADOR: 'Operador' };
const roleVariants = { ADMIN: 'destructive', GERENTE: 'default', OPERADOR: 'secondary' };

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const currentPageName = pageNames[location.pathname] || 'Lotus TEF';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center flex-1 gap-4">
        <h2 className="text-lg font-semibold text-foreground hidden sm:block">{currentPageName}</h2>
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar clientes, tickets..."
            className="w-full bg-muted/50 pl-9"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                  {user?.avatar || user?.name?.substring(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1.5">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold leading-none">{user?.name}</p>
                  <Badge variant={roleVariants[user?.role] || 'secondary'} className="text-[10px] px-1.5">
                    {roleLabels[user?.role] || user?.role}
                  </Badge>
                </div>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Perfil — visível para todos */}
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <User className="mr-2 h-4 w-4" />
              <span>Meu Perfil</span>
            </DropdownMenuItem>

            {/* Configurações — SOMENTE ADMIN */}
            {isAdmin && (
              <DropdownMenuItem onClick={() => navigate('/settings?tab=admin')}>
                <Shield className="mr-2 h-4 w-4 text-destructive" />
                <span className="text-destructive font-medium">Administração</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
