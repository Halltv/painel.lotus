
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User } from 'lucide-react';

const urgencyBorderColors = {
  'Crítica': 'border-l-urgency-critical',
  'Alta': 'border-l-urgency-high',
  'Média': 'border-l-urgency-medium',
  'Baixa': 'border-l-urgency-low',
};

const urgencyBgColors = {
  'Crítica': 'bg-urgency-critical text-urgency-critical-foreground',
  'Alta': 'bg-urgency-high text-urgency-high-foreground',
  'Média': 'bg-urgency-medium text-urgency-medium-foreground',
  'Baixa': 'bg-urgency-low text-urgency-low-foreground',
};

export default function WikiTicketCard({ ticket, onClick }) {
  const previewText = ticket.parecer_tecnico 
    ? ticket.parecer_tecnico.substring(0, 100) + (ticket.parecer_tecnico.length > 100 ? '...' : '')
    : ticket.descricao.substring(0, 100) + (ticket.descricao.length > 100 ? '...' : '');

  return (
    <Card 
      className={`wiki-card-hover border-l-4 ${urgencyBorderColors[ticket.urgencia] || 'border-l-border'}`}
      onClick={() => onClick(ticket)}
    >
      <CardContent className="p-5">
        <div className="flex justify-between items-start gap-4 mb-3">
          <h3 className="font-semibold text-lg leading-tight line-clamp-1">{ticket.titulo}</h3>
          <Badge className={`${urgencyBgColors[ticket.urgencia]} whitespace-nowrap`}>
            {ticket.urgencia}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">
          {previewText}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {ticket.cliente}</span>
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(ticket.data_criacao).toLocaleDateString('pt-BR')}</span>
          </div>
          <Badge variant="outline" className="font-normal text-[10px]">{ticket.categoria}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
