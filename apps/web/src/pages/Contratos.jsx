import React from 'react';

/**
 * Contratos — carrega o sistema de contratos via iframe isolado.
 * O iframe aponta para /Contratos/index.html servido como arquivo estático pelo Vite.
 * Isso garante que os scripts do sistema de contratos (jsPDF, docx, etc.)
 * rodem em contexto isolado sem conflito com o React/Vite do painel.
 */
export default function Contratos() {
  return (
    <div
      className="-m-4"
      style={{ height: 'calc(100vh - 56px)', position: 'relative', overflow: 'hidden' }}
    >
      <iframe
        src="/Contratos/index.html"
        title="Sistema de Contratos Lotus TEF"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
          background: 'transparent',
        }}
      />
    </div>
  );
}
