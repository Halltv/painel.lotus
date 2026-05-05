
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WikiTicketCard from './WikiTicketCard.jsx';
import WikiArchiveCard from './WikiArchiveCard.jsx';
import { SearchX } from 'lucide-react';

export default function WikiSearchResults({ tickets, files, onTicketClick }) {
  const hasResults = tickets.length > 0 || files.length > 0;

  if (!hasResults) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-muted p-4 rounded-full mb-4">
          <SearchX className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Nenhum resultado encontrado</h3>
        <p className="text-muted-foreground max-w-md">
          Não encontramos chamados ou arquivos correspondentes à sua busca. Tente usar termos diferentes ou verifique a ortografia.
        </p>
      </div>
    );
  }

  return (
    <Tabs defaultValue={tickets.length > 0 ? "tickets" : "files"} className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="tickets" disabled={tickets.length === 0}>
          Chamados ({tickets.length})
        </TabsTrigger>
        <TabsTrigger value="files" disabled={files.length === 0}>
          Manuais & Arquivos ({files.length})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="tickets" className="mt-0">
        <div className="grid gap-4 md:grid-cols-2">
          {tickets.map(ticket => (
            <WikiTicketCard key={ticket.id} ticket={ticket} onClick={onTicketClick} />
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="files" className="mt-0">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {files.map(file => (
            <WikiArchiveCard key={file.id} file={file} />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
