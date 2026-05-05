import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { problemSchema } from '@/lib/validationSchemas.js';
import { toast } from 'sonner';
import { ticketsApi } from '@/lib/api.js';
import { Save, UploadCloud } from 'lucide-react';

export default function WikiProblemTab() {
  const form = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      titulo: '',
      descricao: '',
      categoria: '',
      tags: '',
      solucao: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      await ticketsApi.create({
        titulo: data.titulo,
        descricao: data.descricao,
        categoria: data.categoria,
        parecerTecnico: data.solucao,
        status: 'Concluído',
        urgencia: 'Baixa',
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      });
      toast.success('Problema e solução cadastrados com sucesso!');
      form.reset();
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar na base de conhecimento');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Cadastrar Solução</h2>
        <p className="text-muted-foreground mt-1">
          Registre um problema conhecido e sua solução técnica para enriquecer a base de conhecimento.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-xl border shadow-sm">
          <FormField
            control={form.control}
            name="titulo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título do Problema</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Erro de timeout na comunicação com SEFAZ" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: sefaz, timeout, nfce (separadas por vírgula)" {...field} />
                  </FormControl>
                  <FormDescription>Palavras-chave para facilitar a busca.</FormDescription>
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
                <FormLabel>Descrição do Problema</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva o cenário em que o problema ocorre..."
                    className="min-h-[100px] resize-y"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="solucao"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-primary font-semibold">Solução / Parecer Técnico</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva o passo a passo para resolver o problema..."
                    className="min-h-[150px] resize-y bg-primary/5 border-primary/20 focus-visible:ring-primary"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-4 border-t flex justify-end">
            <Button type="submit" className="gap-2" disabled={form.formState.isSubmitting}>
              <Save className="h-4 w-4" />
              {form.formState.isSubmitting ? 'Salvando...' : 'Salvar na Base'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
