import React, { useState, useEffect, useCallback } from 'react';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Columns, Rows, Plus, RefreshCw } from 'lucide-react';
import { useTickets } from '@/hooks/useTickets.js';
import { ticketsApi } from '@/lib/api.js';
import TicketFilters from './TicketFilters.jsx';
import TicketModal from './TicketModal.jsx';
import KanbanHorizontal from './KanbanHorizontal.jsx';
import KanbanVertical from './KanbanVertical.jsx';
import KanbanSwimlanes from './KanbanSwimlanes.jsx';
import { toast } from 'sonner';

export default function KanbanBoard({ initialOpenTicketId }) {
  const [viewType, setViewType] = useState(() => localStorage.getItem('kanbanView') || 'horizontal');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [filters, setFilters] = useState({ busca: '', status: 'todos', urgencia: 'todas' });

  const apiFilters = { search: filters.busca, status: filters.status, urgencia: filters.urgencia };
  const { tickets, loading, error, refetch, createTicket, updateTicket, updateStatus, deleteTicket } = useTickets(apiFilters);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => { localStorage.setItem('kanbanView', viewType); }, [viewType]);

  // Abre automaticamente o ticket vindo da Wiki
  useEffect(() => {
    if (!initialOpenTicketId || loading || tickets.length === 0) return;
    const found = tickets.find(t => t.id === initialOpenTicketId);
    if (found) {
      handleOpenModal(normalizeTicket(found));
    } else {
      // Busca direto pela API se não estiver na lista atual (filtros podem excluir)
      ticketsApi.get(initialOpenTicketId)
        .then(t => handleOpenModal(normalizeTicket(t)))
        .catch(() => toast.error('Chamado não encontrado'));
    }
  }, [initialOpenTicketId, loading, tickets.length]);

  const normalizeTicket = (t) => ({
    ...t,
    cliente: t.clientName || t.cliente || '',
    atribuido_a: t.atribuidoA || t.atribuido_a || 'Não Atribuído',
    parecer_tecnico: t.parecerTecnico || t.parecer_tecnico || '',
    tempo_gasto: t.tempoGasto || 0,
    mensagens_nao_lidas: t.mensagensNaoLidas || 0,
    data_criacao: t.createdAt || t.data_criacao,
    data_atualizacao: t.updatedAt || t.data_atualizacao,
    tags: t.tags || [],
    activities: t.activities || [],
  });

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const ticketId = active.id;
    const overId = over.id;

    let newStatus, newUrgencia;
    if (overId.includes('|')) {
      [newStatus, newUrgencia] = overId.split('|');
    } else {
      newStatus = overId;
    }

    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket || (ticket.status === newStatus && (!newUrgencia || ticket.urgencia === newUrgencia))) return;

    try {
      await updateStatus(ticketId, newStatus, newUrgencia);
      refetch();
    } catch (err) {
      toast.error('Erro ao mover chamado: ' + err.message);
    }
  };

  const handleOpenModal = (ticket = null) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
  };

  const handleSaveTicket = async (data) => {
    try {
      if (selectedTicket?.id) {
        await updateTicket(selectedTicket.id, {
          titulo: data.titulo,
          descricao: data.descricao,
          clientName: data.cliente,
          urgencia: data.urgencia,
          status: data.status,
          categoria: data.categoria,
          atribuidoA: data.atribuido_a,
          parecerTecnico: data.parecer_tecnico,
        });
        toast.success('Chamado atualizado com sucesso!');
      } else {
        await createTicket({
          titulo: data.titulo,
          descricao: data.descricao,
          clientName: data.cliente,
          urgencia: data.urgencia,
          status: data.status,
          categoria: data.categoria,
          atribuidoA: data.atribuido_a,
        });
        toast.success('Chamado criado com sucesso!');
      }
      refetch();
      handleCloseModal();
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar chamado');
    }
  };

  const handleDeleteTicket = async (id) => {
    try {
      await deleteTicket(id);
      toast.success('Chamado deletado!');
      refetch();
      handleCloseModal();
    } catch (err) {
      toast.error(err.message || 'Erro ao deletar chamado');
    }
  };

  const normalizedTickets = tickets.map(normalizeTicket);

  const viewProps = { tickets: normalizedTickets, onTicketClick: handleOpenModal, loading };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Lotus Chamados</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={refetch} title="Atualizar">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <div className="flex border rounded-lg overflow-hidden">
            {[['horizontal', <Columns className="h-4 w-4" />], ['vertical', <LayoutGrid className="h-4 w-4" />], ['swimlanes', <Rows className="h-4 w-4" />]].map(([type, icon]) => (
              <button
                key={type}
                className={`p-2 transition-colors ${viewType === type ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                onClick={() => setViewType(type)}
                title={type}
              >
                {icon}
              </button>
            ))}
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4 mr-2" /> Novo Chamado
          </Button>
        </div>
      </div>

      <TicketFilters filters={filters} onFiltersChange={setFilters} />

      {error ? (
        <div className="flex-1 flex items-center justify-center text-destructive">
          <div className="text-center">
            <p className="mb-4">{error}</p>
            <Button variant="outline" onClick={refetch}>Tentar novamente</Button>
          </div>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          <div className="flex-1 overflow-hidden">
            {viewType === 'horizontal' && <KanbanHorizontal {...viewProps} />}
            {viewType === 'vertical' && <KanbanVertical {...viewProps} />}
            {viewType === 'swimlanes' && <KanbanSwimlanes {...viewProps} />}
          </div>
        </DndContext>
      )}

      <TicketModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        ticket={selectedTicket}
        onSave={handleSaveTicket}
        onDelete={handleDeleteTicket}
      />
    </div>
  );
}
