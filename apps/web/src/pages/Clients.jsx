import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Edit, Trash2, RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/lib/utils.js';
import { toast } from 'sonner';
import ClientFormModal from '@/components/clients/ClientFormModal.jsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useClients } from '@/hooks/useClients.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

const statusConfig = {
  ativo: { label: 'Ativo', variant: 'default' },
  implantacao: { label: 'Implantação', variant: 'secondary' },
  bloqueado: { label: 'Bloqueado', variant: 'destructive' },
  inativo: { label: 'Inativo', variant: 'outline' },
};

const tipoTefLabels = {
  tef_integrado: 'TEF Integrado',
  tef_maquininha_wireless: 'Maquininha',
  automacao_pdv: 'Automação PDV',
};

export default function Clients() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  const { clients, loading, error, refetch, createClient, updateClient, deleteClient, creating, updating, deleting } = useClients(debouncedSearch);

  const canEdit = user?.role === 'ADMIN' || user?.role === 'GERENTE';
  const canDelete = user?.role === 'ADMIN';

  // Debounce search
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const handleOpenModal = (client = null) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
  };

  const handleSaveClient = async (data) => {
    try {
      if (selectedClient) {
        await updateClient(selectedClient.id, data);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await createClient(data);
        toast.success('Cliente cadastrado com sucesso!');
      }
      refetch();
      handleCloseModal();
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar cliente');
    }
  };

  const handleDeleteClick = (client) => {
    setClientToDelete(client);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    try {
      await deleteClient(clientToDelete.id);
      toast.success('Cliente removido com sucesso!');
      refetch();
    } catch (err) {
      toast.error(err.message || 'Erro ao remover cliente');
    } finally {
      setIsDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Lotus Client</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={refetch} title="Atualizar">
            <RefreshCw className="h-4 w-4" />
          </Button>
          {canEdit && (
            <Button onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4 mr-2" /> Novo Cliente
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou CNPJ..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error ? (
            <div className="p-8 text-center text-destructive">
              <p>{error}</p>
              <Button variant="outline" onClick={refetch} className="mt-4">Tentar novamente</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">CNPJ</TableHead>
                  <TableHead className="hidden lg:table-cell">Solução TEF</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell text-right">Valor TEF</TableHead>
                  <TableHead className="hidden lg:table-cell text-right">Custo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : clients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      {debouncedSearch ? 'Nenhum cliente encontrado para esta busca.' : 'Nenhum cliente cadastrado.'}
                    </TableCell>
                  </TableRow>
                ) : clients.map((client) => {
                  const sc = statusConfig[client.status] || { label: client.status, variant: 'secondary' };
                  return (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">
                        <div>{client.nome}</div>
                        <div className="text-xs text-muted-foreground">{client.email}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{client.cnpj}</TableCell>
                      <TableCell className="hidden lg:table-cell">{tipoTefLabels[client.tipoTef] || client.tipoTef}</TableCell>
                      <TableCell>
                        <Badge variant={sc.variant}>{sc.label}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-right">{formatCurrency(client.valorTef)}</TableCell>
                      <TableCell className="hidden lg:table-cell text-right">{formatCurrency(client.custo)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {canEdit && (
                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal(client)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(client)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ClientFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSaveClient}
        initialData={selectedClient}
        isLoading={creating || updating}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{clientToDelete?.nome}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
