import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ticketDetailsSchema } from '@/lib/validationSchemas.js';
import { Calendar, Clock } from 'lucide-react';
import { useApi } from '@/hooks/useApi.js';
import { clientsApi, usersApi } from '@/lib/api.js';

export default function TicketDetailsTab({ ticket, onSave, onCancel, onDelete }) {
  const isEditing = !!ticket?.id;

  // Load clients and users from API
  const { data: clientsData, loading: clientsLoading } = useApi(() => clientsApi.list());
  const { data: usersData, loading: usersLoading } = useApi(() => usersApi.list().catch(() => ({ users: [] })));

  const clients = clientsData?.clients || [];
  const users = usersData?.users || [];

  const form = useForm({
    resolver: zodResolver(ticketDetailsSchema),
    defaultValues: ticket ? {
      titulo: ticket.titulo || '',
      descricao: ticket.descricao || '',
      cliente: ticket.cliente || ticket.clientName || '',
      categoria: ticket.categoria || '',
      urgencia: ticket.urgencia || '',
      status: ticket.status || 'A Fazer',
      atribuido_a: ticket.atribuido_a || ticket.atribuidoA || '',
      parecer_tecnico: ticket.parecer_tecnico || ticket.parecerTecnico || '',
    } : {
      titulo: '',
      descricao: '',
      cliente: '',
      categoria: '',
      urgencia: '',
      status: 'A Fazer',
      atribuido_a: '',
      parecer_tecnico: '',
    },
  });

  const statusValue = form.watch('status');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6 py-2">
        {isEditing && (
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Criado em: {new Date(ticket.data_criacao || ticket.createdAt).toLocaleString('pt-BR')}</span>
            </div>
            {(ticket.data_atualizacao || ticket.updatedAt) && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>Atualizado em: {new Date(ticket.data_atualizacao || ticket.updatedAt).toLocaleString('pt-BR')}</span>
              </div>
            )}
          </div>
        )}

        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título do Chamado</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Sistema não está imprimindo comprovante" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="cliente"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                {clientsLoading ? <Skeleton className="h-10 w-full" /> : (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.nome}>{client.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {['Suporte', 'Implantação', 'Comercial', 'Cobrança'].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="urgencia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Urgência</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Selecione a urgência" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {['Baixa', 'Média', 'Alta', 'Crítica'].map(u => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {['A Fazer', 'Em Andamento', 'Pendente Cliente', 'Concluído'].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="atribuido_a"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Atribuído a</FormLabel>
                {usersLoading ? <Skeleton className="h-10 w-full" /> : (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecione o responsável" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Não Atribuído">Não Atribuído</SelectItem>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição Detalhada</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva o problema ou solicitação..."
                  className="min-h-[120px] resize-y"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parecer_tecnico"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Parecer Técnico / Solução
                {statusValue === 'Concluído' && (
                  <span className="text-destructive text-xs font-normal">(Obrigatório para concluir)</span>
                )}
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva a solução aplicada ou o parecer técnico..."
                  className="min-h-[100px] resize-y bg-primary/5 border-primary/20 focus-visible:ring-primary"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-6 border-t mt-8">
          {isEditing ? (
            <Button type="button" variant="destructive" onClick={() => onDelete(ticket.id)}>
              Deletar Chamado
            </Button>
          ) : <div />}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button type="submit">{isEditing ? 'Salvar Alterações' : 'Criar Chamado'}</Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
