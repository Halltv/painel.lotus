
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { clientSchema } from '@/lib/validationSchemas.js';
import { Loader2, AlertCircle } from 'lucide-react';

const maskCNPJ = (value) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18);
};

const maskWhatsApp = (value) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15);
};

export default function ClientForm({ onSubmit, initialData, isLoading, onCancel }) {
  const form = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData || {
      nome: '',
      cnpj: '',
      email: '',
      whatsapp: '',
      tipoTef: '',
      valorTef: '',
      custo: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome / Razão Social</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Supermercado Silva" {...field} />
              </FormControl>
              <FormMessage className="text-destructive flex items-center gap-1">
                {form.formState.errors.nome && <AlertCircle className="h-3 w-3" />}
              </FormMessage>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cnpj"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CNPJ</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="00.000.000/0000-00" 
                    {...field} 
                    onChange={(e) => field.onChange(maskCNPJ(e.target.value))}
                  />
                </FormControl>
                <FormMessage className="text-destructive flex items-center gap-1">
                  {form.formState.errors.cnpj && <AlertCircle className="h-3 w-3" />}
                </FormMessage>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tipoTef"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Solução</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a solução" />
                    </SelectTrigger>
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
        </div>

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
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Cliente
          </Button>
        </div>
      </form>
    </Form>
  );
}
