
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import TicketCard from './TicketCard.jsx';
import { cn } from '@/lib/utils.js';

const columns = ['A Fazer', 'Em Andamento', 'Pendente Cliente', 'Concluído'];

function DroppableColumn({ id, title, tickets, onTicketClick }) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div className="flex flex-col bg-muted/40 rounded-xl p-4 min-w-[300px] w-[300px] max-h-full border border-transparent">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider">{title}</h3>
        <span className="bg-background text-muted-foreground text-xs font-medium px-2 py-1 rounded-full border">
          {tickets.length}
        </span>
      </div>
      <div 
        ref={setNodeRef} 
        className={cn(
          "flex-1 kanban-column-scroll rounded-lg transition-colors p-1 -mx-1",
          isOver ? "bg-primary/5 border-primary/20 border border-dashed" : ""
        )}
      >
        {tickets.map(ticket => (
          <TicketCard key={ticket.id} ticket={ticket} onClick={onTicketClick} />
        ))}
      </div>
    </div>
  );
}

export default function KanbanHorizontal({ tickets, onTicketClick }) {
  return (
    <div className="flex-1 flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-280px)]">
      {columns.map(col => (
        <DroppableColumn 
          key={col} 
          id={col} 
          title={col} 
          tickets={tickets.filter(t => t.status === col)} 
          onTicketClick={onTicketClick}
        />
      ))}
    </div>
  );
}
