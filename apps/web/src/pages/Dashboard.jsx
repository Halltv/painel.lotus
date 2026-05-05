import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from '@/lib/utils.js';
import { useApi } from '@/hooks/useApi.js';
import { clientsApi, ticketsApi } from '@/lib/api.js';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--muted-foreground))'];

function StatCard({ title, value, sub, loading }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-8 w-32 mb-1" /> : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: clientsData, loading: clientsLoading } = useApi(() => clientsApi.list());
  const { data: ticketsData, loading: ticketsLoading } = useApi(() => ticketsApi.list());

  const clients = clientsData?.clients || [];
  const tickets = ticketsData?.tickets || [];

  const totalRevenue = clients.reduce((s, c) => s + (c.valorTef || 0), 0);
  const totalCost = clients.reduce((s, c) => s + (c.custo || 0), 0);
  const margin = totalRevenue - totalCost;
  const marginPct = totalRevenue > 0 ? ((margin / totalRevenue) * 100).toFixed(1) : 0;

  const tipoCount = clients.reduce((acc, c) => {
    acc[c.tipoTef] = (acc[c.tipoTef] || 0) + 1;
    return acc;
  }, {});

  const pieData = [
    { name: 'TEF Integrado', value: tipoCount['tef_integrado'] || 0 },
    { name: 'Maquininha', value: tipoCount['tef_maquininha_wireless'] || 0 },
    { name: 'PDV', value: tipoCount['automacao_pdv'] || 0 },
  ].filter(d => d.value > 0);

  // Tickets by status
  const statusCount = tickets.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  const statusData = Object.entries(statusCount).map(([name, count]) => ({ name, count }));

  // Revenue per client for bar chart (top 6)
  const revenueData = [...clients]
    .sort((a, b) => b.valorTef - a.valorTef)
    .slice(0, 6)
    .map(c => ({
      name: c.nome.split(' ')[0],
      revenue: Number(c.valorTef),
      cost: Number(c.custo),
    }));

  const loading = clientsLoading || ticketsLoading;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard Financeiro</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Faturamento Total" value={formatCurrency(totalRevenue)} sub={`${clients.length} clientes`} loading={loading} />
        <StatCard title="Custo Total" value={formatCurrency(totalCost)} loading={loading} />
        <StatCard title="Margem Bruta" value={formatCurrency(margin)} loading={loading} />
        <StatCard title="Margem %" value={`${marginPct}%`} loading={loading} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader><CardTitle>Receita vs Custo por Cliente</CardTitle></CardHeader>
          <CardContent className="pl-2">
            <div className="h-[280px] w-full">
              {loading ? <Skeleton className="h-full w-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v}`} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} />
                    <Bar dataKey="revenue" name="Receita" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="cost" name="Custo" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader><CardTitle>Distribuição de Soluções</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[220px] w-full">
              {loading ? <Skeleton className="h-full w-full rounded-full mx-auto" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-2 space-y-1">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="ml-auto font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Chamados por Status</CardTitle></CardHeader>
        <CardContent className="pl-2">
          <div className="h-[200px] w-full">
            {loading ? <Skeleton className="h-full w-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={120} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} />
                  <Bar dataKey="count" name="Chamados" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
