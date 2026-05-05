
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils.js';

const urgencyColors = {
  'Crítica': 'bg-urgency-critical text-white border-urgency-critical',
  'Alta': 'bg-urgency-high text-white border-urgency-high',
  'Média': 'bg-urgency-medium text-white border-urgency-medium',
  'Baixa': 'bg-urgency-low text-white border-urgency-low',
};

export default function TicketCard({ ticket, variant = 'complete', onClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: ticket.id,
    data: ticket,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  } : undefined;

  const urgencyClass = urgencyColors[ticket.urgencia] || 'bg-secondary text-secondary-foreground';

  if (variant === 'compact') {
    return (
      <Card 
        ref={setNodeRef} style={style} {...listeners} {...attributes}
        onClick={() => onClick(ticket)}
        className={cn("cursor-grab active:cursor-grabbing hover:shadow-md transition-all mb-2 border-l-4", `border-l-${urgencyClass.split(' ')[0].replace('bg-', '')}`)}
      >
        <CardContent className="p-3">
          <div className="flex justify-between items-start mb-1">
            <span className="text-xs font-medium text-muted-foreground">{ticket.id}</span>
          </div>
          <p className="font-medium text-sm leading-tight line-clamp-2">{ticket.titulo}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      ref={setNodeRef} style={style} {...listeners} {...attributes}
      onClick={() => onClick(ticket)}
      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-all mb-3 group"
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <span className="text-xs font-medium text-muted-foreground">{ticket.id}</span>
          <Badge className={cn("text-[10px] font-semibold", urgencyClass)}>
            {ticket.urgencia}
          </Badge>
        </div>
        <p className="font-medium text-sm leading-tight group-hover:text-primary transition-colors">{ticket.titulo}</p>
        <div className="flex justify-between items-center pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground truncate max-w-[120px]">{ticket.cliente}</span>
          <div className="flex items-center gap-2">
            {ticket.mensagens_nao_lidas > 0 && (
              <div className="flex items-center text-xs text-destructive font-medium">
                <MessageSquare className="h-3 w-3 mr-1" /> {ticket.mensagens_nao_lidas}
              </div>
            )}
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary" title={ticket.atribuido_a}>
              {ticket.atribuido_a.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
