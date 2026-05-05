
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';

export default function TicketFilters({ filters, setFilters, onClear }) {
  return (
    <div className="flex flex-col md:flex-row gap-3 mb-6 bg-card p-4 rounded-xl border shadow-sm">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar por título ou cliente..." 
          className="pl-9"
          value={filters.busca}
          onChange={(e) => setFilters({ ...filters, busca: e.target.value })}
        />
      </div>
      
      <Select value={filters.status} onValueChange={(val) => setFilters({ ...filters, status: val })}>
        <SelectTrigger className="w-full md:w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os Status</SelectItem>
          <SelectItem value="A Fazer">A Fazer</SelectItem>
          <SelectItem value="Em Andamento">Em Andamento</SelectItem>
          <SelectItem value="Pendente Cliente">Pendente Cliente</SelectItem>
          <SelectItem value="Concluído">Concluído</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.urgencia} onValueChange={(val) => setFilters({ ...filters, urgencia: val })}>
        <SelectTrigger className="w-full md:w-[160px]">
          <SelectValue placeholder="Urgência" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todas">Todas as Urgências</SelectItem>
          <SelectItem value="Crítica">Crítica</SelectItem>
          <SelectItem value="Alta">Alta</SelectItem>
          <SelectItem value="Média">Média</SelectItem>
          <SelectItem value="Baixa">Baixa</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={onClear} className="shrink-0">
        <X className="h-4 w-4 mr-2" /> Limpar
      </Button>
    </div>
  );
}
