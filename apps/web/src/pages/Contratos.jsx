import React, { useRef, useState } from 'react';
import { RefreshCw, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// O index.html dos contratos fica em apps/web/public/Contratos/
// ATENÇÃO: o nome da pasta é "Contratos" com C maiúsculo (Linux é case-sensitive)
const CONTRATOS_PATH = '/Contratos/index.html';

export default function Contratos() {
  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const handleLoad = () => setLoading(false);

  const handleReload = () => {
    setLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = CONTRATOS_PATH;
    }
  };

  return (
    <div className="flex flex-col -m-6" style={{ height: 'calc(100vh - 64px)' }}>

      {/* Barra superior */}
      <div className="flex items-center justify-between px-4 py-2 bg-card border-b shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">🌸 Lotus TEF — Contratos</span>
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handleReload} className="h-7 px-2 text-xs gap-1">
            <RefreshCw className="w-3.5 h-3.5" />
            Recarregar
          </Button>
          <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs gap-1">
            <a href={CONTRATOS_PATH} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3.5 h-3.5" />
              Nova aba
            </a>
          </Button>
        </div>
      </div>

      {/* Iframe */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/40 z-10 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Carregando Contratos...</p>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={CONTRATOS_PATH}
          title="Lotus TEF Contratos"
          className="w-full h-full border-0"
          onLoad={handleLoad}
        />
      </div>
    </div>
  );
}