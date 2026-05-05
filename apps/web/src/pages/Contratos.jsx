import React, { useEffect, useRef } from 'react';

/**
 * Contratos — carrega o sistema de contratos (vanilla JS) diretamente
 * no DOM sem iframe, evitando o loop de SPA.
 *
 * Estratégia: busca o HTML via fetch (arquivo estático em /Contratos/index.html),
 * injeta o <style> e o <body> num container isolado, e executa os scripts inline.
 */
export default function Contratos() {
  const containerRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const container = containerRef.current;
    if (!container) return;

    fetch('/Contratos/index.html')
      .then(r => r.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // 1. Injetar estilos do contrato (isolados no container)
        const style = document.createElement('style');
        style.textContent = Array.from(doc.querySelectorAll('style'))
          .map(s => s.textContent)
          .join('\n');
        container.appendChild(style);

        // 2. Injetar o corpo HTML
        container.innerHTML += doc.body.innerHTML;

        // 3. Carregar scripts CDN externos primeiro, depois executar inline
        const cdnScripts = Array.from(doc.querySelectorAll('script[src]'));
        const inlineScript = Array.from(doc.querySelectorAll('script:not([src])')).pop();

        function loadScript(src) {
          return new Promise((resolve, reject) => {
            // reutiliza se já estiver na página
            if (document.querySelector(`script[src="${src}"]`)) return resolve();
            const s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
          });
        }

        Promise.all(cdnScripts.map(s => loadScript(s.getAttribute('src'))))
          .then(() => {
            if (inlineScript?.textContent) {
              const s = document.createElement('script');
              s.textContent = inlineScript.textContent;
              container.appendChild(s);
            }
          })
          .catch(console.error);
      })
      .catch(err => {
        container.innerHTML = `
          <div style="padding:2rem;text-align:center;color:#ef4444">
            <p style="font-size:1.1rem;font-weight:600">Erro ao carregar o módulo de Contratos</p>
            <p style="font-size:.85rem;margin-top:.5rem;opacity:.7">${err.message}</p>
          </div>`;
      });
  }, []);

  return (
    // Ocupa todo o espaço disponível, sem padding extra do layout
    <div
      ref={containerRef}
      className="-m-4"
      style={{ minHeight: 'calc(100vh - 56px)', position: 'relative' }}
    />
  );
}
