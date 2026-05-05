import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, CheckCircle2, Edit, UserPlus, FileText } from 'lucide-react';
import { useApi } from '@/hooks/useApi.js';
import { ticketsApi } from '@/lib/api.js';

const getIconForType = (type) => {
  switch (type) {
    case 'criacao': return <FileText className="h-4 w-4 text-blue-500" />;
    case 'status': return <Activity className="h-4 w-4 text-orange-500" />;
    case 'atribuicao': return <UserPlus className="h-4 w-4 text-purple-500" />;
    case 'parecer': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    default: return <Edit className="h-4 w-4 text-gray-500" />;
  }
};

export default function TicketActivityTab({ ticket }) {
  const { data, loading } = useApi(
    () => ticket?.id ? ticketsApi.get(ticket.id) : Promise.resolve({ activities: [] }),
    [ticket?.id]
  );

  const activities = data?.activities || ticket?.activities || [];

  if (loading) {
    return (
      <div className="py-4 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <Activity className="h-12 w-12 mb-4 opacity-20" />
        <p>Nenhuma atividade registrada para este chamado.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="py-4 pl-2">
        <div className="relative border-l-2 border-muted ml-3 space-y-8">
          {activities.map((activity, index) => {
            const date = activity.createdAt || activity.data;
            return (
              <div key={activity.id || index} className="relative pl-6">
                <div className="absolute -left-[11px] top-1 bg-background border-2 border-muted rounded-full p-1">
                  {getIconForType(activity.tipo)}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium">{activity.acao}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {date ? new Date(date).toLocaleString('pt-BR', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      }) : ''}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground/80">{activity.usuario}</span>
                    {' • '}
                    {activity.detalhes}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}
