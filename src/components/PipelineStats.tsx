import React from 'react';
import { CRMTask } from '../types/crm';
import { Circle, Clock, CheckCircle2, TrendingUp, Layers } from 'lucide-react';

interface PipelineStatsProps {
  tasks: CRMTask[];
}

export const PipelineStats: React.FC<PipelineStatsProps> = ({ tasks }) => {
  const total = tasks.length;
  const naoIniciado = tasks.filter((t) => t.status === 'Não iniciado').length;
  const emAndamento = tasks.filter((t) => t.status === 'Em Andamento').length;
  const finalizado = tasks.filter((t) => t.status === 'Finalizado').length;

  const totalValue = tasks.reduce((acc, t) => acc + (t.value || 0), 0);
  const inProgressValue = tasks
    .filter((t) => t.status === 'Em Andamento')
    .reduce((acc, t) => acc + (t.value || 0), 0);

  const completionRate = total > 0 ? Math.round((finalizado / total) * 100) : 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 border-b border-slate-200/80 bg-white/70 backdrop-blur-xs px-6 py-3.5 text-xs text-slate-600">
      <div className="flex items-center gap-2.5">
        <Layers className="w-4 h-4 text-slate-400 shrink-0" />
        <div>
          <span className="block text-slate-400 font-medium">Total de Tarefas</span>
          <span className="text-slate-900 font-semibold text-sm tabular-nums font-mono">
            {total}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Circle className="w-4 h-4 text-slate-400 shrink-0" />
        <div>
          <span className="block text-slate-400 font-medium">Não Iniciadas</span>
          <span className="text-slate-900 font-semibold text-sm tabular-nums font-mono">
            {naoIniciado}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Clock className="w-4 h-4 text-amber-500 shrink-0" />
        <div>
          <span className="block text-slate-400 font-medium">Em Andamento</span>
          <span className="text-slate-900 font-semibold text-sm tabular-nums font-mono">
            {emAndamento}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <div>
          <span className="block text-slate-400 font-medium">Finalizadas ({completionRate}%)</span>
          <span className="text-emerald-700 font-semibold text-sm tabular-nums font-mono">
            {finalizado}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 col-span-2 md:col-span-1">
        <TrendingUp className="w-4 h-4 text-blue-600 shrink-0" />
        <div>
          <span className="block text-slate-400 font-medium">Pipeline Ativo</span>
          <span className="text-slate-900 font-semibold text-sm tabular-nums font-mono">
            {formatCurrency(inProgressValue > 0 ? inProgressValue : totalValue)}
          </span>
        </div>
      </div>
    </div>
  );
};
