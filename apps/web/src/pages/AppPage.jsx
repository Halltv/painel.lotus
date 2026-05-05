import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppFileCard from '@/components/app/AppFileCard.jsx';
import AppUploadModal from '@/components/app/AppUploadModal.jsx';
import { toast } from 'sonner';

const STORAGE_KEY = 'lotus_app_files';

const defaultFiles = [
  { id: '1', nome: 'Instalador LotusNFCe v3.2.1', descricao: 'Versão mais recente do emissor NFC-e para PDVs.', categoria: 'Instalador', versao: '3.2.1', tamanho: '45 MB', data: new Date(Date.now() - 86400000 * 2).toISOString(), url: '#', tipo: 'exe' },
  { id: '2', nome: 'Manual de Configuração TEF', descricao: 'Guia completo para configuração de terminais TEF integrado.', categoria: 'Manual', versao: '2.0', tamanho: '3.2 MB', data: new Date(Date.now() - 86400000 * 5).toISOString(), url: '#', tipo: 'pdf' },
  { id: '3', nome: 'Driver Impressora Fiscal Daruma', descricao: 'Driver atualizado para impressoras Daruma DR700 e DR800.', categoria: 'Driver', versao: '1.5.3', tamanho: '12 MB', data: new Date(Date.now() - 86400000 * 10).toISOString(), url: '#', tipo: 'zip' },
  { id: '4', nome: 'Atualização Tabela IBPT 2024', descricao: 'Tabela de impostos atualizada para o exercício 2024.', categoria: 'Atualização', versao: '2024.1', tamanho: '2.1 MB', data: new Date(Date.now() - 86400000 * 1).toISOString(), url: '#', tipo: 'csv' },
];

function loadFiles() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultFiles;
  } catch {
    return defaultFiles;
  }
}

function saveFiles(files) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(files)); } catch {}
}

export default function AppPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [files, setFiles] = useState(loadFiles);

  useEffect(() => { saveFiles(files); }, [files]);

  const categories = ['Todos', ...new Set(files.map(f => f.categoria))];

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'Todos' || file.categoria === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUpload = (newFile) => {
    const updated = [{ ...newFile, id: Date.now().toString(), data: new Date().toISOString() }, ...files];
    setFiles(updated);
    setIsUploadModalOpen(false);
    toast.success('Arquivo enviado com sucesso!');
  };

  const handleDelete = (id) => {
    setFiles(files.filter(f => f.id !== id));
    toast.success('Arquivo removido com sucesso!');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lotus APP</h1>
          <p className="text-muted-foreground mt-1">Gerencie instaladores, manuais e atualizações do sistema.</p>
        </div>
        <Button onClick={() => setIsUploadModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Arquivo
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar arquivos..."
            className="pl-9"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {filteredFiles.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">Nenhum arquivo encontrado</p>
          <p className="text-sm mt-1">Tente outro filtro ou faça upload de um novo arquivo.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredFiles.map(file => (
            <AppFileCard key={file.id} file={file} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <AppUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />
    </motion.div>
  );
}
