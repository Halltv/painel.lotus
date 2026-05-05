import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, History, Search as SearchIcon, PlusCircle } from 'lucide-react';
import { useApi } from '@/hooks/useApi.js';
import { ticketsApi } from '@/lib/api.js';
import WikiSearchBar from '@/components/wiki/WikiSearchBar.jsx';
import WikiTicketCard from '@/components/wiki/WikiTicketCard.jsx';
import WikiSearchResults from '@/components/wiki/WikiSearchResults.jsx';
import TicketReadModal from '@/components/wiki/TicketReadModal.jsx';
import WikiProblemTab from '@/components/wiki/WikiProblemTab.jsx';

const ITEMS_PER_PAGE = 10;

export default function Hub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeTab, setActiveTab] = useState('history');

  const { data, loading } = useApi(() => ticketsApi.list({ status: 'Concluído' }));
  const allTickets = data?.tickets || [];

  // Normalize ticket shape for wiki components
  const tickets = useMemo(() => allTickets.map(t => ({
    ...t,
    cliente: t.clientName || '',
    atribuido_a: t.atribuidoA || '',
    parecer_tecnico: t.parecerTecnico || '',
    data_criacao: t.createdAt,
    data_atualizacao: t.updatedAt,
    tags: t.tags || [],
    activities: [],
  })), [allTickets]);

  const sortedTickets = useMemo(() =>
    [...tickets].sort((a, b) => new Date(b.data_criacao) - new Date(a.data_criacao)),
    [tickets]
  );

  const handleSearch = useCallback((query) => {
    if (!query) { setSearchQuery(''); return; }
    setSearchQuery(query);
    setIsSearching(true);
    setActiveTab('search');
    setTimeout(() => setIsSearching(false), 600);
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery) return { tickets: [], files: [] };
    const q = searchQuery.toLowerCase();
    return {
      tickets: sortedTickets.filter(t =>
        t.titulo?.toLowerCase().includes(q) ||
        t.descricao?.toLowerCase().includes(q) ||
        t.parecer_tecnico?.toLowerCase().includes(q) ||
        t.cliente?.toLowerCase().includes(q) ||
        t.tags?.some(tag => tag.toLowerCase().includes(q))
      ),
      files: [],
    };
  }, [searchQuery, sortedTickets]);

  const totalPages = Math.ceil(sortedTickets.length / ITEMS_PER_PAGE);
  const paginatedHistory = sortedTickets.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="text-center py-8 bg-gradient-to-b from-primary/10 to-transparent rounded-2xl">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Lotus Wiki</h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm">
          Base de conhecimento com histórico de chamados concluídos e soluções aplicadas.
        </p>
        <div className="pt-4">
          <WikiSearchBar onSearch={handleSearch} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="history" className="gap-2"><History className="h-4 w-4" /> Histórico</TabsTrigger>
            <TabsTrigger value="search" className="gap-2" disabled={!searchQuery}><SearchIcon className="h-4 w-4" /> Buscar</TabsTrigger>
            <TabsTrigger value="problem" className="gap-2"><PlusCircle className="h-4 w-4" /> Cadastrar</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="mt-0 outline-none">
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  {paginatedHistory.map(ticket => (
                    <WikiTicketCard key={ticket.id} ticket={ticket} onClick={setSelectedTicket} />
                  ))}
                </div>
                {paginatedHistory.length === 0 && (
                  <p className="text-center text-muted-foreground py-12">Nenhum chamado concluído encontrado.</p>
                )}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-8">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                      <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground">Página {currentPage} de {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                      Próxima <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="search" className="mt-0 outline-none">
            {isSearching ? (
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
              </div>
            ) : (
              <WikiSearchResults tickets={searchResults.tickets} files={searchResults.files} onTicketClick={setSelectedTicket} />
            )}
          </TabsContent>

          <TabsContent value="problem" className="mt-0 outline-none">
            <WikiProblemTab />
          </TabsContent>
        </Tabs>
      </div>

      <TicketReadModal isOpen={!!selectedTicket} onClose={() => setSelectedTicket(null)} ticket={selectedTicket} />
    </motion.div>
  );
}
