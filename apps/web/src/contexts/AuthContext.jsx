import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth } from '@/lib/api.js';

// ─────────────────────────────────────────────────────────────────────────────
// USUÁRIOS DE TESTE — sem banco de dados
// Adicione ou remova usuários aqui à vontade.
// Quando conectar o banco de verdade, basta apagar este bloco e o "if" abaixo.
// ─────────────────────────────────────────────────────────────────────────────
const DEV_USERS = [
  { email: 'admin@lotus.com',    password: 'admin123',    id: '1', name: 'Admin',    role: 'ADMIN',    avatar: 'AD' },
  { email: 'gerente@lotus.com',  password: 'gerente123',  id: '2', name: 'Gerente',  role: 'GERENTE',  avatar: 'GE' },
  { email: 'operador@lotus.com', password: 'operador123', id: '3', name: 'Operador', role: 'OPERADOR', avatar: 'OP' },
];
// ─────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('lotus_token');
    if (!token || token === 'undefined') {
      setLoading(false);
      return;
    }

    // Token de teste — restaura direto sem bater na API
    if (token.startsWith('dev_')) {
      const saved = localStorage.getItem('lotus_user');
      if (saved) {
        try { setUser(JSON.parse(saved)); } catch (_) {}
      }
      setLoading(false);
      return;
    }

    // Token real — tenta restaurar via API
    auth.me()
      .then((data) => {
        const userData = data.user ? data.user : data;
        setUser(userData);
      })
      .catch(() => {
        localStorage.removeItem('lotus_token');
        localStorage.removeItem('lotus_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    // Verifica primeiro se bate com um usuário de teste
    const devMatch = DEV_USERS.find(
      (u) => u.email === email.toLowerCase() && u.password === password
    );

    if (devMatch) {
      const { password: _, ...userData } = devMatch;
      const fakeToken = `dev_${userData.id}_${Date.now()}`;
      localStorage.setItem('lotus_token', fakeToken);
      localStorage.setItem('lotus_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    }

    // Sem match — tenta a API normalmente
    const data = await auth.login(email, password);
    const tokenDaApi = data.token || data.accessToken || data.jwt;
    const userData = data.user ? data.user : data;
    localStorage.setItem('lotus_token', tokenDaApi);
    localStorage.setItem('lotus_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    const token = localStorage.getItem('lotus_token');
    if (token && !token.startsWith('dev_')) {
      try { await auth.logout(); } catch (_) {}
    }
    setUser(null);
    localStorage.removeItem('lotus_token');
    localStorage.removeItem('lotus_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
