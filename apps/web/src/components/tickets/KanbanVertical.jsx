
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import TicketCard from './TicketCard.jsx';
import { cn } from '@/lib/utils.js';

const columns = ['A Fazer', 'Em Andamento', 'Pendente Cliente', 'Concluído'];

function DroppableAccordionContent({ id, tickets, onTicketClick }) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div 
      ref={setNodeRef} 
      className={cn(
        "p-4 min-h-[100px] transition-colors rounded-b-lg",
        isOver ? "bg-primary/5 border-primary/20 border border-dashed" : "bg-muted/20"
      )}
    >
      {tickets.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Nenhum ticket nesta coluna</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tickets.map(ticket => (
            <TicketCard key={ticket.id} ticket={ticket} onClick={onTicketClick} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function KanbanVertical({ tickets, onTicketClick }) {
  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <Accordion type="multiple" defaultValue={['A Fazer', 'Em Andamento']} className="space-y-4">
        {columns.map(col => {
          const colTickets = tickets.filter(t => t.status === col);
          return (
            <AccordionItem key={col} value={col} className="border rounded-xl bg-card overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-sm uppercase tracking-wider">{col}</h3>
                  <span className="bg-muted text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                    {colTickets.length}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-0 pb-0">
                <DroppableAccordionContent id={col} tickets={colTickets} onTicketClick={onTicketClick} />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
