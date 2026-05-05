import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useUsers } from '@/hooks/useUsers.js';
import { useWhatsAppInstances } from '@/hooks/useWhatsApp.js';
import { toast } from 'sonner';
import { Plus, Trash2, Wifi, WifiOff, RefreshCw, User, Shield, Smartphone } from 'lucide-react';

// ─── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab() {
  const { user, logout } = useAuth();
  const { updateProfile } = useUsers();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await updateProfile(user.id, { name });
      toast.success('Perfil atualizado com sucesso!');
    } catch (err) {
      toast.error(err.message || 'Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const roleLabels = { ADMIN: 'Administrador', GERENTE: 'Gerente', OPERADOR: 'Operador' };
  const roleVariants = { ADMIN: 'destructive', GERENTE: 'default', OPERADOR: 'secondary' };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meu Perfil</CardTitle>
        <CardDescription>Atualize seus dados pessoais.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 max-w-md">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
            {user?.avatar || user?.name?.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-lg">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <Badge variant={roleVariants[user?.role] || 'secondary'} className="mt-1">
              {roleLabels[user?.role] || user?.role}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={user?.email} disabled />
          <p className="text-xs text-muted-foreground">O email não pode ser alterado.</p>
        </div>
        <div className="flex gap-3 pt-2">
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
          <Button variant="outline" onClick={logout}>Sair da Conta</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── WhatsApp Tab ─────────────────────────────────────────────────────────────
function WhatsAppTab() {
  const { instances, loading, error, refetch, createInstance, deleteInstance, creating, deleting } = useWhatsAppInstances();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ instanceName: '', evolutionApiKey: '', evolutionBaseUrl: '', webhookUrl: '' });

  const handleCreate = async () => {
    try {
      await createInstance(form);
      toast.success('Instância criada! Aguardando QR Code...');
      setIsCreateOpen(false);
      setForm({ instanceName: '', evolutionApiKey: '', evolutionBaseUrl: '', webhookUrl: '' });
      refetch();
    } catch (err) {
      toast.error(err.message || 'Erro ao criar instância');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteInstance(deleteTarget.id);
      toast.success('Instância removida!');
      refetch();
    } catch (err) {
      toast.error(err.message || 'Erro ao remover instância');
    } finally {
      setDeleteTarget(null);
    }
  };

  const statusConfig = {
    connected: { label: 'Conectado', color: 'text-green-600', Icon: Wifi },
    connecting: { label: 'Conectando...', color: 'text-yellow-500', Icon: RefreshCw },
    disconnected: { label: 'Desconectado', color: 'text-muted-foreground', Icon: WifiOff },
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Instâncias WhatsApp</CardTitle>
            <CardDescription>Gerencie conexões com a Evolution API v2.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={refetch}><RefreshCw className="h-4 w-4" /></Button>
            <Button onClick={() => setIsCreateOpen(true)}><Plus className="h-4 w-4 mr-2" /> Nova Instância</Button>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-destructive text-sm">{error}</p>
          ) : loading ? (
            <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
          ) : instances.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium">Nenhuma instância configurada</p>
              <p className="text-sm mt-1">Crie uma instância para receber mensagens do WhatsApp.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {instances.map((inst) => {
                const sc = statusConfig[inst.status] || statusConfig.disconnected;
                return (
                  <div key={inst.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <sc.Icon className={`h-5 w-5 ${sc.color}`} />
                      <div>
                        <p className="font-medium">{inst.instanceName}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-xs">{inst.evolutionBaseUrl}</p>
                        <p className={`text-xs font-medium ${sc.color}`}>{sc.label}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(inst)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova Instância WhatsApp</DialogTitle>
            <DialogDescription>Configure a conexão com a Evolution API v2.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {[
              { key: 'instanceName', label: 'Nome da Instância', placeholder: 'Ex: Tiago.silva' },
              { key: 'evolutionApiKey', label: 'API Key (Evolution)', placeholder: 'Sua API Key global' },
              { key: 'evolutionBaseUrl', label: 'URL Base (Evolution)', placeholder: 'https://evo-api.claritymirror.shop' },
              { key: 'webhookUrl', label: 'URL do Webhook (opcional)', placeholder: 'https://seu-servidor.com/hcgi/api/webhooks/...' },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-1.5">
                <Label>{label}</Label>
                <Input value={form[key]} onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} />
              </div>
            ))}
            <Button onClick={handleCreate} disabled={creating || !form.instanceName || !form.evolutionApiKey || !form.evolutionBaseUrl} className="w-full">
              {creating ? 'Criando...' : 'Criar e Conectar Instância'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover instância</AlertDialogTitle>
            <AlertDialogDescription>Remover <strong>{deleteTarget?.instanceName}</strong>?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Admin Tab (ADMIN only) ───────────────────────────────────────────────────
function AdminTab() {
  const { users, loading, error, refetch, createUser, deleteUser, creating, deleting } = useUsers();
  const { user: me } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'OPERADOR' });

  const handleCreate = async () => {
    try {
      await createUser(form);
      toast.success('Usuário criado com sucesso!');
      setIsCreateOpen(false);
      setForm({ name: '', email: '', password: '', role: 'OPERADOR' });
      refetch();
    } catch (err) {
      toast.error(err.message || 'Erro ao criar usuário');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget.id);
      toast.success('Usuário desativado!');
      refetch();
    } catch (err) {
      toast.error(err.message || 'Erro ao desativar usuário');
    } finally {
      setDeleteTarget(null);
    }
  };

  const roleLabels = { ADMIN: 'Administrador', GERENTE: 'Gerente', OPERADOR: 'Operador' };
  const roleVariants = { ADMIN: 'destructive', GERENTE: 'default', OPERADOR: 'secondary' };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-destructive" /> Gestão de Usuários</CardTitle>
            <CardDescription>Área exclusiva de administradores.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={refetch}><RefreshCw className="h-4 w-4" /></Button>
            <Button onClick={() => setIsCreateOpen(true)}><Plus className="h-4 w-4 mr-2" /> Novo Usuário</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error ? <p className="p-6 text-destructive text-sm">{error}</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>{Array.from({ length: 5 }).map((_, j) => <TableCell key={j}><Skeleton className="h-5" /></TableCell>)}</TableRow>
                )) : users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                          {u.avatar || u.name?.substring(0, 2).toUpperCase()}
                        </div>
                        {u.name}
                        {u.id === me?.id && <Badge variant="outline" className="text-[10px]">Você</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                    <TableCell><Badge variant={roleVariants[u.role]}>{roleLabels[u.role]}</Badge></TableCell>
                    <TableCell><Badge variant={u.active ? 'default' : 'outline'}>{u.active ? 'Ativo' : 'Inativo'}</Badge></TableCell>
                    <TableCell className="text-right">
                      {u.id !== me?.id && u.active && (
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(u)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
            <DialogDescription>Crie um novo acesso ao sistema.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {[
              { key: 'name', label: 'Nome Completo', placeholder: 'João Silva', type: 'text' },
              { key: 'email', label: 'Email', placeholder: 'joao@lotus.com', type: 'email' },
              { key: 'password', label: 'Senha', placeholder: 'Mínimo 6 caracteres', type: 'password' },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key} className="space-y-1.5">
                <Label>{label}</Label>
                <Input type={type} value={form[key]} onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label>Papel</Label>
              <Select value={form.role} onValueChange={(v) => setForm(f => ({ ...f, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPERADOR">Operador</SelectItem>
                  <SelectItem value="GERENTE">Gerente</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreate} disabled={creating || !form.name || !form.email || !form.password} className="w-full">
              {creating ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar usuário</AlertDialogTitle>
            <AlertDialogDescription>Desativar <strong>{deleteTarget?.name}</strong>? Ele não conseguirá mais fazer login.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? 'Desativando...' : 'Desativar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Settings() {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'ADMIN';

  // Lê ?tab= da URL para abrir aba correta via Header
  const params = new URLSearchParams(location.search);
  const defaultTab = params.get('tab') === 'admin' && isAdmin ? 'admin' : 'perfil';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="inline-flex">
          <TabsTrigger value="perfil" className="flex items-center gap-2">
            <User className="h-4 w-4" /> Perfil
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" /> WhatsApp
          </TabsTrigger>
          {/* Aba Administração: SOMENTE ADMIN */}
          {isAdmin && (
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-destructive" />
              <span className="text-destructive">Administração</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="perfil"><ProfileTab /></TabsContent>
        <TabsContent value="whatsapp"><WhatsAppTab /></TabsContent>
        {isAdmin && <TabsContent value="admin"><AdminTab /></TabsContent>}
      </Tabs>
    </motion.div>
  );
}
