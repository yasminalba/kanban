import React from 'react';
import { CRMTask, TaskStatus } from '../types/crm';
import {
  X,
  User,
  Phone,
  Mail,
  DollarSign,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  CheckCircle2,
  Circle,
  ExternalLink,
} from 'lucide-react';

interface TaskDetailModalProps {
  task: CRMTask | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: CRMTask) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: TaskStatus) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  if (!isOpen || !task) return null;

  const formatCurrency = (val?: number) => {
    if (!val || val === 0) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Sem prazo definido';
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

  const formatTimestamp = (iso?: string) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Detalhes da Tarefa
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Title */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-snug">{task.title}</h2>
          </div>

          {/* Interactive Status Changer */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Status Atual no Kanban
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Não iniciado', 'Em Andamento', 'Finalizado'] as TaskStatus[]).map((st) => {
                const isCurrent = task.status === st;
                return (
                  <button
                    key={st}
                    onClick={() => onStatusChange(task.id, st)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors border text-center ${
                      isCurrent
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="block text-slate-400 mb-1">Prioridade</span>
              <span className="font-semibold text-slate-800">{task.priority}</span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="block text-slate-400 mb-1">Valor Estimado</span>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                {formatCurrency(task.value)}
              </span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="block text-slate-400 mb-1">Data Limite</span>
              <span className="font-mono tabular-nums text-slate-800">
                {formatDate(task.due_date)}
              </span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="block text-slate-400 mb-1">Criada em</span>
              <span className="font-mono tabular-nums text-slate-500">
                {formatTimestamp(task.created_at)}
              </span>
            </div>
          </div>

          {/* Client Information */}
          {(task.client_name || task.client_phone || task.client_email) && (
            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50 space-y-2.5">
              <h4 className="text-xs font-semibold text-slate-700">Informações de Contato</h4>

              {task.client_name && (
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium">{task.client_name}</span>
                </div>
              )}

              {task.client_phone && (
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{task.client_phone}</span>
                  </div>
                  <a
                    href={`https://wa.me/${task.client_phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 font-medium"
                  >
                    WhatsApp <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {task.client_email && (
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{task.client_email}</span>
                  </div>
                  <a
                    href={`mailto:${task.client_email}`}
                    className="text-[11px] text-blue-700 hover:underline flex items-center gap-1 font-medium"
                  >
                    Enviar e-mail <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {task.description && (
            <div>
              <h4 className="text-xs font-semibold text-slate-700 mb-1.5">Descrição / Observações</h4>
              <p className="text-xs text-slate-600 bg-white p-3.5 border border-slate-200 rounded-lg whitespace-pre-wrap leading-relaxed">
                {task.description}
              </p>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={() => {
              onClose();
              onDelete(task.id);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Excluir Tarefa</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(task);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
