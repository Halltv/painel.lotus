import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, ChevronDown, ChevronUp, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '@/hooks/useApi.js';
import { ticketsApi } from '@/lib/api.js';

export default function TicketHistoryTab({ currentTicket }) {
  const [expandedId, setExpandedId] = useState(null);

  const clientName = currentTicket?.cliente || currentTicket?.clientName;

  const { data, loading } = useApi(
    () => clientName
      ? ticketsApi.list({ search: clientName })
      : Promise.resolve({ tickets: [] }),
    [clientName]
  );

  if (!currentTicket || !clientName) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <History className="h-12 w-12 mb-4 opacity-20" />
        <p>Selecione um cliente para ver o histórico de chamados.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3 py-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const history = (data?.tickets || [])
    .filter(t => t.id !== currentTicket.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <History className="h-12 w-12 mb-4 opacity-20" />
        <p>Nenhum outro chamado encontrado para este cliente.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-4 py-2">
        {history.map(ticket => {
          const isExpanded = expandedId === ticket.id;
          const parecer = ticket.parecerTecnico || ticket.parecer_tecnico;
          const dataCriacao = ticket.createdAt || ticket.data_criacao;

          return (
            <Card key={ticket.id} className="overflow-hidden transition-all duration-200 hover:border-primary/50">
              <CardContent className="p-0">
                <div
                  className="p-4 cursor-pointer flex items-start justify-between gap-4"
                  onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px] font-normal shrink-0">
                        {ticket.id.substring(0, 8)}
                      </Badge>
                      <h4 className="font-medium text-sm truncate">{ticket.titulo}</h4>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(dataCriacao).toLocaleDateString('pt-BR')}
                      </span>
                      <Badge variant="secondary" className="text-[10px] font-normal">
                        {ticket.status}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-4 pb-4 pt-2 border-t bg-muted/10 space-y-3">
                        <div>
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Problema</span>
                          <p className="text-sm mt-1 text-foreground/90">{ticket.descricao}</p>
                        </div>
                        {parecer && (
                          <div>
                            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Parecer Técnico</span>
                            <div className="bg-primary/5 border border-primary/10 rounded p-3 mt-1 text-sm text-foreground/90">
                              {parecer}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
}
