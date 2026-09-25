import React from 'react';
import { Database, Plus, Search, CheckCircle, AlertTriangle } from 'lucide-react';
import { ConnectionState } from '../types/crm';

interface NavbarProps {
  onOpenNewTaskModal: () => void;
  onOpenSupabaseModal: () => void;
  connectionState: ConnectionState;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isSupabaseConfigured: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewTaskModal,
  onOpenSupabaseModal,
  connectionState,
  searchTerm,
  onSearchChange,
  isSupabaseConfigured,
}) => {
  return (
    <header className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-white sticky top-0 z-20">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <a href="/" className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
          Kanban CRM
        </a>
      </div>

      {/* Zone 2: Search input and quick view filters */}
      <div className="flex-1 max-w-md mx-6 hidden sm:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por título, cliente ou detalhes..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900 transition-colors"
          />
        </div>
      </div>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenSupabaseModal}
          type="button"
          title="Configurações do Supabase"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors border border-slate-200/80 whitespace-nowrap"
        >
          <Database className="w-3.5 h-3.5 text-slate-500" />
          <span>Supabase</span>
          {isSupabaseConfigured ? (
            connectionState === 'connected' ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Conectado ao Supabase" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Verificando conexão" />
            )
          ) : (
            <span className="w-2 h-2 rounded-full bg-slate-400" title="Modo local (Não configurado)" />
          )}
        </button>

        <button
          onClick={onOpenNewTaskModal}
          type="button"
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-lg transition-colors shadow-xs whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Nova Tarefa</span>
        </button>
      </div>
    </header>
  );
};
