import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useApi } from '@/hooks/useApi.js';
import { ticketsApi, whatsappApi } from '@/lib/api.js';
import { AlertCircle, CheckCircle2, Info, MessageSquare, Ticket, TrendingUp } from 'lucide-react';

function StatCard({ label, value, sub, loading }) {
  return (
    <Card>
      <CardContent className="pt-6">
        {loading ? <Skeleton className="h-8 w-24 mb-2" /> : (
          <div className="text-3xl font-bold">{value}</div>
        )}
        <p className="text-sm font-medium">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

const urgenciaVariant = { 'Crítica': 'destructive', 'Alta': 'destructive', 'Média': 'secondary', 'Baixa': 'outline' };

export default function HomePage() {
  const { data: ticketsData, loading: ticketsLoading } = useApi(() => ticketsApi.list());
  const { data: convsData, loading: convsLoading } = useApi(() => whatsappApi.listConversations().catch(() => ({ conversations: [] })));

  const tickets = ticketsData?.tickets || [];
  const conversations = convsData?.conversations || [];

  const openTickets = tickets.filter(t => t.status !== 'Concluído').length;
  const criticalTickets = tickets.filter(t => t.urgencia === 'Crítica').length;
  const activeConvs = conversations.filter(c => c.status === 'active' || c.status === 'transferred').length;
  const recentTickets = [...tickets].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5);
  const recentConvs = [...conversations].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 4);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>

      {/* Banners */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary/10 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary">Avisos Importantes</CardTitle>
            <AlertCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-primary/80">Atualização do sistema programada para 15/04 às 02:00.</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">Informativo</CardTitle>
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-600/80 dark:text-blue-400/80">Novos manuais adicionados ao Hub.</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">Sucesso</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-600/80 dark:text-green-400/80">Meta de SLA atingida nesta semana.</p>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Chamados Abertos" value={openTickets} loading={ticketsLoading} sub="Total sem Concluído" />
        <StatCard label="Críticos" value={criticalTickets} loading={ticketsLoading} sub="Urgência crítica" />
        <StatCard label="Total de Chamados" value={tickets.length} loading={ticketsLoading} />
        <StatCard label="Conversas Ativas" value={activeConvs} loading={convsLoading} sub="WhatsApp" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Tickets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" /> Últimos Chamados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ticketsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : recentTickets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhum chamado encontrado.</p>
            ) : (
              <div className="space-y-3">
                {recentTickets.map(ticket => (
                  <div key={ticket.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="font-medium truncate text-sm">{ticket.titulo}</p>
                      <p className="text-xs text-muted-foreground truncate">{ticket.clientName || ticket.cliente}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={urgenciaVariant[ticket.urgencia] || 'outline'} className="text-xs">
                        {ticket.urgencia}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{ticket.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Conversations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" /> WhatsApp Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {convsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : recentConvs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhuma conversa. Configure o WhatsApp nas configurações.</p>
            ) : (
              <div className="space-y-3">
                {recentConvs.map(conv => {
                  const name = conv.contactName || conv.remoteJid?.split('@')[0] || 'Desconhecido';
                  const time = new Date(conv.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                  const statusColors = { active: 'bg-green-500', transferred: 'bg-yellow-500', closed: 'bg-gray-400' };
                  return (
                    <div key={conv.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                      <div className="min-w-0 flex-1 pr-3">
                        <p className="font-medium text-sm truncate">{name}</p>
                        <p className="text-xs text-muted-foreground truncate">{conv.remoteJid}</p>
                      </div>
                      <div className="text-right shrink-0 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${statusColors[conv.status] || 'bg-gray-400'}`} />
                        <span className="text-xs text-muted-foreground">{time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
