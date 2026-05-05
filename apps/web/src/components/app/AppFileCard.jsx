import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Box, Archive, FileCode, File, ExternalLink, Trash2, Link } from 'lucide-react';
import { toast } from 'sonner';

const getFileIcon = (type) => {
  switch (type?.toUpperCase()) {
    case 'PDF': return <FileText className="h-8 w-8 text-red-500" />;
    case 'EXE': return <Box className="h-8 w-8 text-blue-500" />;
    case 'ZIP': return <Archive className="h-8 w-8 text-yellow-500" />;
    case 'DLL': return <FileCode className="h-8 w-8 text-purple-500" />;
    case 'DOC': return <FileText className="h-8 w-8 text-blue-600" />;
    case 'MSI': return <Box className="h-8 w-8 text-green-500" />;
    case 'ISO': return <Archive className="h-8 w-8 text-orange-500" />;
    default: return <File className="h-8 w-8 text-gray-500" />;
  }
};

const isMegaLink = (url) => url && url.includes('mega.nz');

export default function AppFileCard({ file, onDelete }) {
  const handleOpen = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!file.url || file.url === '#') {
      toast.error('Nenhum link disponível para este arquivo.');
      return;
    }
    window.open(file.url, '_blank', 'noopener,noreferrer');
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Tem certeza que deseja remover "${file.nome}"?`)) {
      onDelete(file.id);
    }
  };

  const dataFormatada = (() => {
    try {
      const d = file.data || file.data_upload;
      return d ? new Date(d).toLocaleDateString('pt-BR') : '—';
    } catch { return '—'; }
  })();

  const temLink = file.url && file.url !== '#';
  const ehMega = isMegaLink(file.url);

  return (
    <Card className="group transition-all duration-300 hover:shadow-md hover:-translate-y-1 border-border/50 hover:border-primary/30">
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-muted/50 rounded-xl shrink-0 group-hover:bg-primary/5 transition-colors">
            {getFileIcon(file.tipo)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate" title={file.nome}>{file.nome}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {file.versao && <Badge variant="secondary" className="text-[10px] font-normal">{file.versao}</Badge>}
              {file.tamanho && file.tamanho !== '—' && (
                <span className="text-xs text-muted-foreground">{file.tamanho}</span>
              )}
              {ehMega && (
                <span className="text-[10px] text-red-500 font-medium flex items-center gap-0.5">
                  <Link className="h-2.5 w-2.5" /> MEGA
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {file.descricao}
        </p>

        <div className="flex items-center justify-between pt-4 border-t mt-auto">
          <div className="flex flex-col">
            <span className="text-xs font-medium">{file.categoria}</span>
            <span className="text-[10px] text-muted-foreground">{dataFormatada}</span>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            {temLink && (
              <Button variant="secondary" size="sm" className="h-8 gap-1.5" onClick={handleOpen}>
                <ExternalLink className="h-4 w-4" />
                {ehMega ? 'Abrir MEGA' : 'Abrir'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}