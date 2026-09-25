import React from 'react';
import { CRMTask, TaskStatus } from '../types/crm';
import {
  Calendar,
  DollarSign,
  User,
  ArrowRight,
  ArrowLeft,
  MoreVertical,
  Edit2,
  Trash2,
  Phone,
  Mail,
} from 'lucide-react';

interface TaskCardProps {
  task: CRMTask;
  onEdit: (task: CRMTask) => void;
  onDelete: (id: string) => void;
  onMoveStatus: (id: string, newStatus: TaskStatus) => void;
  onSelect: (task: CRMTask) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onMoveStatus,
  onSelect,
  onDragStart,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgente':
        return 'text-rose-600 font-medium';
      case 'Alta':
        return 'text-amber-600 font-medium';
      case 'Média':
        return 'text-blue-600 font-medium';
      default:
        return 'text-slate-500';
    }
  };

  const formatCurrency = (val?: number) => {
    if (!val || val === 0) return null;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const [year, month, day] = dateStr.split('-');
      if (year && month && day) {
        return `${day}/${month}/${year}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={() => onSelect(task)}
      className="group relative bg-white border border-slate-200 hover:border-slate-300 rounded-lg p-3.5 shadow-2xs hover:shadow-xs transition-all cursor-grab active:cursor-grabbing select-none"
    >
      {/* Header: Title and quick menu */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug line-clamp-2">
          {task.title}
        </h4>

        <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
            title="Mais opções"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg z-40 py-1 text-xs">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(task);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Edit2 className="w-3 h-3 text-slate-400" />
                  Editar
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(task.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-3 h-3 text-rose-500" />
                  Excluir
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Description preview */}
      {task.description && (
        <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Client information (unboxed metadata) */}
      {(task.client_name || task.client_phone || task.client_email) && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
          <User className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="font-medium text-slate-800 truncate">
            {task.client_name || 'Cliente'}
          </span>
          {task.client_phone && (
            <>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <span className="text-slate-500 truncate">{task.client_phone}</span>
            </>
          )}
        </div>
      )}

      {/* Metadata strip (zero-pill discipline: unboxed text with typographic separators) */}
      <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500">
          <span className={getPriorityColor(task.priority)}>{task.priority}</span>
          {task.due_date && (
            <>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <span className="tabular-nums font-mono text-slate-500">
                {formatDate(task.due_date)}
              </span>
            </>
          )}
        </div>

        {task.value && task.value > 0 ? (
          <span className="font-mono tabular-nums text-xs font-semibold text-slate-800">
            {formatCurrency(task.value)}
          </span>
        ) : null}
      </div>

      {/* Quick Move Status Arrows */}
      <div
        className="mt-3 pt-2 border-t border-dashed border-slate-100 flex items-center justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {task.status === 'Não iniciado' && (
          <div className="ml-auto">
            <button
              onClick={() => onMoveStatus(task.id, 'Em Andamento')}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-blue-700 hover:underline transition-colors"
            >
              <span>Iniciar tarefa</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {task.status === 'Em Andamento' && (
          <>
            <button
              onClick={() => onMoveStatus(task.id, 'Não iniciado')}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:underline transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Voltar</span>
            </button>
            <button
              onClick={() => onMoveStatus(task.id, 'Finalizado')}
              className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:text-emerald-800 hover:underline transition-colors"
            >
              <span>Finalizar</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </>
        )}

        {task.status === 'Finalizado' && (
          <div>
            <button
              onClick={() => onMoveStatus(task.id, 'Em Andamento')}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:underline transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Reabrir</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
