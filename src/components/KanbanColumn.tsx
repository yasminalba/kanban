import React, { useState } from 'react';
import { CRMTask, TaskStatus } from '../types/crm';
import { TaskCard } from './TaskCard';
import { Plus, Circle, Clock, CheckCircle2 } from 'lucide-react';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: CRMTask[];
  onAddTask: (status: TaskStatus) => void;
  onEditTask: (task: CRMTask) => void;
  onDeleteTask: (id: string) => void;
  onMoveStatus: (id: string, newStatus: TaskStatus) => void;
  onSelectTask: (task: CRMTask) => void;
  onDropTask: (taskId: string, targetStatus: TaskStatus) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onMoveStatus,
  onSelectTask,
  onDropTask,
}) => {
  const [isOver, setIsOver] = useState(false);

  const getStatusIcon = () => {
    switch (status) {
      case 'Não iniciado':
        return <Circle className="w-3.5 h-3.5 text-slate-400" />;
      case 'Em Andamento':
        return <Clock className="w-3.5 h-3.5 text-amber-500" />;
      case 'Finalizado':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  const getStatusBorder = () => {
    switch (status) {
      case 'Não iniciado':
        return 'border-t-2 border-t-slate-400';
      case 'Em Andamento':
        return 'border-t-2 border-t-amber-500';
      case 'Finalizado':
        return 'border-t-2 border-t-emerald-600';
    }
  };

  const totalValue = tasks.reduce((sum, t) => sum + (t.value || 0), 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isOver) setIsOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onDropTask(taskId, status);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col bg-slate-100/70 rounded-xl p-3 border ${
        isOver
          ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20'
          : 'border-slate-200/90'
      } ${getStatusBorder()} transition-colors min-h-[580px] h-full`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 px-1">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <h3 className="font-semibold text-slate-800 text-sm">{status}</h3>
          <span className="font-mono text-xs text-slate-500 tabular-nums font-medium">
            ({tasks.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {totalValue > 0 && (
            <span className="font-mono text-xs font-semibold text-slate-600 tabular-nums">
              {formatCurrency(totalValue)}
            </span>
          )}
          <button
            onClick={() => onAddTask(status)}
            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-white rounded-md transition-colors"
            title={`Adicionar tarefa em ${status}`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Task List / Drop Zone */}
      <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-0.5">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onMoveStatus={onMoveStatus}
            onSelect={onSelectTask}
            onDragStart={handleDragStart}
          />
        ))}

        {tasks.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-200 rounded-lg bg-white/40">
            <p className="text-xs text-slate-400 font-medium">Nenhum card aqui</p>
            <button
              onClick={() => onAddTask(status)}
              className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              + Adicionar tarefa
            </button>
          </div>
        )}
      </div>

      {/* Quick Add Button Footer */}
      <button
        onClick={() => onAddTask(status)}
        className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white/60 hover:bg-white border border-dashed border-slate-300 rounded-lg transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Adicionar em {status}</span>
      </button>
    </div>
  );
};
