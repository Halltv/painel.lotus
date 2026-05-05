import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Tag, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const urgencyColors = {
  'Crítica': 'bg-red-100 text-red-700 border-red-200',
  'Alta': 'bg-orange-100 text-orange-700 border-orange-200',
  'Média': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Baixa': 'bg-green-100 text-green-700 border-green-200',
};

export default function TicketReadModal({ isOpen, onClose, ticket }) {
  const navigate = useNavigate();

  if (!ticket) return null;

  // Abre o ticket no Kanban/Chamados com contexto
  // Como o Hub passa o ticket normalizado, usamos o ID real para navegar
  const handleAbrirChamado = () => {
    onClose();
    // Navega para /tickets e sinaliza qual ticket abrir via state
    navigate('/tickets', { state: { openTicketId: ticket.id } });
  };

  const dataCriacao = ticket.data_criacao || ticket.createdAt;
  const parecer = ticket.parecer_tecnico || ticket.parecerTecnico;
  const cliente = ticket.cliente || ticket.clientName;
  const tags = ticket.tags || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 gap-0">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b">
                <DialogHeader>
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <DialogTitle className="text-xl font-bold leading-tight">
                      {ticket.titulo}
                    </DialogTitle>
                    {ticket.urgencia && (
                      <Badge className={`${urgencyColors[ticket.urgencia]} border whitespace-nowrap shrink-0`}>
                        {ticket.urgencia}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
                    {cliente && (
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" /> {cliente}
                      </span>
                    )}
                    {dataCriacao && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(dataCriacao).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                    {ticket.categoria && (
                      <Badge variant="outline" className="font-normal">{ticket.categoria}</Badge>
                    )}
                    <Badge variant="secondary" className="font-normal">{ticket.status}</Badge>
                  </div>
                </DialogHeader>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                <section>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Problema Relatado
                  </h3>
                  <div className="bg-muted/50 p-4 rounded-lg text-sm leading-relaxed">
                    {ticket.descricao}
                  </div>
                </section>

                {parecer && (
                  <section>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">
                      ✅ Parecer Técnico / Solução
                    </h3>
                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg text-sm leading-relaxed whitespace-pre-wrap">
                      {parecer}
                    </div>
                  </section>
                )}

                {tags.length > 0 && (
                  <section className="flex items-center gap-2 flex-wrap">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    {tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs font-normal">
                        {tag}
                      </Badge>
                    ))}
                  </section>
                )}
              </div>

              {/* Footer */}
              <div className="p-5 border-t bg-muted/20">
                <DialogFooter className="flex sm:justify-between items-center w-full gap-3">
                  <Button variant="outline" onClick={onClose}>Fechar</Button>
                  <Button onClick={handleAbrirChamado} className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Abrir Chamado Completo
                  </Button>
                </DialogFooter>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
