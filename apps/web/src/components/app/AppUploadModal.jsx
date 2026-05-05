import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { fileUploadSchema } from '@/lib/validationSchemas.js';
import { Link, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';

function validateMegaLink(url) {
  if (!url) return null;
  // Aceita links mega.nz/#! , mega.nz/file/ , mega.nz/#F! , mega.nz/folder/
  if (/mega\.nz\/(#!|file\/|#F!|folder\/)/.test(url)) return 'ok';
  return 'invalid';
}

export default function AppUploadModal({ isOpen, onClose, onUpload }) {
  const [megaLink, setMegaLink] = useState('');
  const [megaStatus, setMegaStatus] = useState(null); // null | 'ok' | 'invalid'

  const form = useForm({
    resolver: zodResolver(fileUploadSchema),
    defaultValues: { nome: '', tipo: '', categoria: '', versao: '', descricao: '' },
  });

  const handleMegaChange = (e) => {
    const val = e.target.value.trim();
    setMegaLink(val);
    setMegaStatus(val ? validateMegaLink(val) : null);
  };

  const handleSubmit = (data) => {
    if (!megaLink) {
      form.setError('root', { message: 'Cole o link do MEGA para continuar.' });
      return;
    }
    if (megaStatus !== 'ok') {
      form.setError('root', { message: 'Link do MEGA inválido. Use um link mega.nz válido.' });
      return;
    }

    const newFile = {
      id: `F-${Date.now()}`,
      ...data,
      url: megaLink,
      tamanho: data.tamanho || '—',
      data: new Date().toISOString(),
      fonte: 'mega',
    };

    onUpload(newFile);
    form.reset();
    setMegaLink('');
    setMegaStatus(null);
  };

  const handleClose = () => {
    form.reset();
    setMegaLink('');
    setMegaStatus(null);
    onClose(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Adicionar Arquivo via MEGA</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-2">

            {/* MEGA link input */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Link do MEGA <span className="text-destructive">*</span></label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="https://mega.nz/file/XXXXXXXX#YYYYYYYY"
                  className={`pl-9 pr-9 ${megaStatus === 'invalid' ? 'border-destructive' : megaStatus === 'ok' ? 'border-green-500' : ''}`}
                  value={megaLink}
                  onChange={handleMegaChange}
                />
                {megaStatus === 'ok' && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
                {megaStatus === 'invalid' && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />}
              </div>
              {megaStatus === 'invalid' && (
                <p className="text-xs text-destructive">Link inválido. Deve ser um link mega.nz/file/ ou mega.nz/folder/</p>
              )}
              {megaStatus === 'ok' && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Link MEGA válido detectado
                </p>
              )}
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
                Cole o link compartilhável do MEGA. O arquivo ficará hospedado na sua conta MEGA.
              </p>
            </div>

            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Arquivo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Instalador_Lotus_v3.exe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {['EXE','PDF','DLL','ZIP','DOC','MSI','ISO','CSV'].map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {['Instalador','Manual','Driver','Atualização','Sistema','Ferramenta','Biblioteca'].map(c => (
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
                name="versao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Versão</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 1.0.0" {...field} />
                    </FormControl>
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
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Breve descrição do conteúdo do arquivo..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> {form.formState.errors.root.message}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
              <Button type="submit" disabled={megaStatus !== 'ok'}>
                <Link className="h-4 w-4 mr-2" /> Salvar Arquivo
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}