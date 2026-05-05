import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import KanbanBoard from '@/components/tickets/KanbanBoard.jsx';
import { ticketsApi } from '@/lib/api.js';

export default function Tickets() {
  const location = useLocation();

  // Quando vem da Wiki com openTicketId no state, KanbanBoard já trata internamente
  // Passamos o ID via prop para o KanbanBoard abrir o modal automaticamente
  const openTicketId = location.state?.openTicketId || null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col"
    >
      <KanbanBoard initialOpenTicketId={openTicketId} />
    </motion.div>
  );
}
