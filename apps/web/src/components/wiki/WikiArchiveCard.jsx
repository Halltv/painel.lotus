
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Box, Archive, FileCode, File, Download } from 'lucide-react';
import { toast } from 'sonner';

const getFileIcon = (type) => {
  switch (type) {
    case 'PDF': return <FileText className="h-8 w-8 text-red-500" />;
    case 'EXE': return <Box className="h-8 w-8 text-blue-500" />;
    case 'ZIP': return <Archive className="h-8 w-8 text-yellow-500" />;
    case 'DLL': return <FileCode className="h-8 w-8 text-purple-500" />;
    case 'DOC': return <FileText className="h-8 w-8 text-blue-600" />;
    default: return <File className="h-8 w-8 text-gray-500" />;
  }
};

export default function WikiArchiveCard({ file }) {
  const handleDownload = (e) => {
    e.stopPropagation();
    toast.success(`Download iniciado: ${file.nome}`);
  };

  return (
    <Card className="wiki-card-hover group">
      <CardContent className="p-5 flex items-start gap-4">
        <div className="p-3 bg-muted rounded-xl shrink-0">
          {getFileIcon(file.tipo)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2 mb-1">
            <h3 className="font-semibold text-base truncate" title={file.nome}>{file.nome}</h3>
            <Badge variant="secondary" className="shrink-0">{file.versao}</Badge>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 min-h-[40px]">
            {file.descricao}
          </p>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span>{file.categoria}</span>
              <span>•</span>
              <span>{file.tamanho}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-1" /> Baixar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
