import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { clientSchema } from '@/lib/validationSchemas.js';
import { Loader2, AlertCircle, Search, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const maskCNPJ = (v) => v.replace(/\D/g,'').replace(/^(\d{2})(\d)/,'$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/,'$1.$2.$3').replace(/\.(\d{3})(\d)/,'.$1/$2').replace(/(\d{4})(\d)/,'$1-$2').slice(0,18);
const maskWhatsApp = (v) => v.replace(/\D/g,'').replace(/^(\d{2})(\d)/g,'($1) $2').replace(/(\d{5})(\d)/,'$1-$2').slice(0,15);

async function buscarCNPJ(cnpj) {
  const raw = cnpj.replace(/\D/g, '');
  if (raw.length !== 14) throw new Error('CNPJ incompleto');
  const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${raw}`);
  if (!res.ok) throw new Error('CNPJ não encontrado na Receita Federal');
  return res.json();
}

export default function ClientForm({ onSubmit, initialData, isLoading, onCancel }) {
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cnpjFound, setCnpjFound] = useState(false);

  const form = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData || {
      nome: '', cnpj: '', email: '', whatsapp: '', tipoTef: '', valorTef: '', custo: '',
    },
  });

  const handleCnpjLookup = useCallback(async () => {
    const cnpj = form.getValues('cnpj');
    const raw = cnpj.replace(/\D/g, '');
    if (raw.length < 14) { toast.error('Digite o CNPJ completo (14 dígitos).'); return; }
    setCnpjLoading(true);
    setCnpjFound(false);
    try {
      const data = await buscarCNPJ(cnpj);
      if (data.razao_social) form.setValue('nome', data.razao_social, { shouldValidate: true });
      if (data.email)        form.setValue('email', data.email.toLowerCase(), { shouldValidate: true });
      if (data.ddd_telefone_1) {
        form.setValue('whatsapp', maskWhatsApp(data.ddd_telefone_1.replace(/\D/g,'')), { shouldValidate: true });
      }
      setCnpjFound(true);
      toast.success(`Empresa: ${data.razao_social}`);
    } catch (err) {
      toast.error(err.message || 'Erro ao buscar CNPJ');
    } finally {
      setCnpjLoading(false);
    }
  }, [form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">

        {/* CNPJ com botão de busca */}
        <FormField
          control={form.control}
          name="cnpj"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CNPJ</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      placeholder="00.000.000/0001-00"
                      {...field}
                      onChange={(e) => {
                        const masked = maskCNPJ(e.target.value);
                        field.onChange(masked);
                        setCnpjFound(false);
                        // Busca automática quando completa
                        if (masked.replace(/\D/g,'').length === 14) {
                          setTimeout(() => handleCnpjLookup(), 300);
                        }
                      }}
                      className={cnpjFound ? 'border-green-500 pr-8' : ''}
                    />
                    {cnpjFound && (
                      <CheckCircle2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCnpjLookup}
                    disabled={cnpjLoading}
                    title="Buscar dados do CNPJ"
                  >
                    {cnpjLoading
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Search className="h-4 w-4" />
                    }
                  </Button>
                </div>
              </FormControl>
              {cnpjFound && (
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="h-3 w-3" /> Dados preenchidos automaticamente pela Receita Federal
                </p>
              )}
              <FormMessage className="text-destructive flex items-center gap-1">
                {form.formState.errors.cnpj && <AlertCircle className="h-3 w-3" />}
              </FormMessage>
            </FormItem>
          )}
        />

        {/* Nome / Razão Social */}
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome / Razão Social</FormLabel>
              <FormControl>
                <Input placeholder="Preenchido automaticamente pelo CNPJ..." {...field} />
              </FormControl>
              <FormMessage className="text-destructive flex items-center gap-1">
                {form.formState.errors.nome && <AlertCircle className="h-3 w-3" />}
              </FormMessage>
            </FormItem>
          )}
        />

        {/* Tipo TEF */}
        <FormField
          control={form.control}
          name="tipoTef"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Solução</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Selecione a solução" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="tef_integrado">TEF Integrado</SelectItem>
                  <SelectItem value="tef_maquininha_wireless">TEF Maquininha Wireless</SelectItem>
                  <SelectItem value="automacao_pdv">Automação PDV</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-destructive flex items-center gap-1">
                {form.formState.errors.tipoTef && <AlertCircle className="h-3 w-3" />}
              </FormMessage>
            </FormItem>
          )}
        />

        {/* Email + WhatsApp */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="contato@empresa.com" {...field} />
                </FormControl>
                <FormMessage className="text-destructive flex items-center gap-1">
                  {form.formState.errors.email && <AlertCircle className="h-3 w-3" />}
                </FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp</FormLabel>
                <FormControl>
                  <Input
                    placeholder="(00) 00000-0000"
                    {...field}
                    onChange={(e) => field.onChange(maskWhatsApp(e.target.value))}
                  />
                </FormControl>
                <FormMessage className="text-destructive flex items-center gap-1">
                  {form.formState.errors.whatsapp && <AlertCircle className="h-3 w-3" />}
                </FormMessage>
              </FormItem>
            )}
          />
        </div>

        {/* Valor + Custo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="valorTef"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Mensalidade (R$)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage className="text-destructive flex items-center gap-1">
                  {form.formState.errors.valorTef && <AlertCircle className="h-3 w-3" />}
                </FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="custo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custo (R$)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage className="text-destructive flex items-center gap-1">
                  {form.formState.errors.custo && <AlertCircle className="h-3 w-3" />}
                </FormMessage>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancelar</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Cliente
          </Button>
        </div>
      </form>
    </Form>
  );
}
