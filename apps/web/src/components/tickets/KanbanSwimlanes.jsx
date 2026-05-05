
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import TicketCard from './TicketCard.jsx';
import { cn } from '@/lib/utils.js';

const statuses = ['A Fazer', 'Em Andamento', 'Pendente Cliente', 'Concluído'];
const urgencies = [
  { level: 'Crítica', color: 'bg-urgency-critical/10 border-urgency-critical/30 text-urgency-critical' },
  { level: 'Alta', color: 'bg-urgency-high/10 border-urgency-high/30 text-urgency-high' },
  { level: 'Média', color: 'bg-urgency-medium/10 border-urgency-medium/30 text-urgency-medium' },
  { level: 'Baixa', color: 'bg-urgency-low/10 border-urgency-low/30 text-urgency-low' }
];

function DroppableCell({ id, tickets, onTicketClick }) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div 
      ref={setNodeRef} 
      className={cn(
        "p-2 min-h-[120px] border-r border-b transition-colors",
        isOver ? "bg-primary/10" : ""
      )}
    >
      {tickets.map(ticket => (
        <TicketCard key={ticket.id} ticket={ticket} variant="compact" onClick={onTicketClick} />
      ))}
    </div>
  );
}

export default function KanbanSwimlanes({ tickets, onTicketClick }) {
  return (
    <div className="flex-1 overflow-auto border rounded-xl bg-card">
      <div className="min-w-[800px]">
        {/* Header Row */}
        <div className="grid grid-cols-5 border-b bg-muted/50 sticky top-0 z-10">
          <div className="p-3 font-semibold text-sm text-muted-foreground border-r">Urgência</div>
          {statuses.map(status => (
            <div key={status} className="p-3 font-semibold text-sm text-foreground text-center border-r last:border-r-0">
              {status}
            </div>
          ))}
        </div>

        {/* Swimlane Rows */}
        {urgencies.map(({ level, color }) => (
          <div key={level} className="grid grid-cols-5 group">
            <div className={cn("p-3 border-r border-b font-medium text-sm flex items-center justify-center", color)}>
              <span className="-rotate-90 sm:rotate-0 whitespace-nowrap">{level}</span>
            </div>
            {statuses.map(status => {
              const cellId = `${status}|${level}`;
              const cellTickets = tickets.filter(t => t.status === status && t.urgencia === level);
              return (
                <DroppableCell 
                  key={cellId} 
                  id={cellId} 
                  tickets={cellTickets} 
                  onTicketClick={onTicketClick} 
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
