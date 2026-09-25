import React from 'react';
import { CRMTask, TaskStatus } from '../types/crm';
import { KanbanColumn } from './KanbanColumn';
import { Plus, LayoutList } from 'lucide-react';

interface KanbanBoardProps {
  tasks: CRMTask[];
  onAddTask: (status?: TaskStatus) => void;
  onEditTask: (task: CRMTask) => void;
  onDeleteTask: (id: string) => void;
  onMoveStatus: (id: string, newStatus: TaskStatus) => void;
  onSelectTask: (task: CRMTask) => void;
  onDropTask: (taskId: string, targetStatus: TaskStatus) => void;
}

const COLUMNS: TaskStatus[] = ['Não iniciado', 'Em Andamento', 'Finalizado'];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onMoveStatus,
  onSelectTask,
  onDropTask,
}) => {
  return (
    <div className="flex-1 p-6 overflow-x-auto">
      {/* If 0 tasks exist in total, display an initial guidance banner without mocking any task */}
      {tasks.length === 0 && (
        <div className="mb-6 p-6 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-900">
              Quadro Kanban vazio — Pronto para novas tarefas
            </h2>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Nenhuma informação modelo foi carregada conforme solicitado. Crie manualmente suas
              tarefas e leads de clientes para organizá-los entre as etapas{' '}
              <strong className="text-slate-700">Não iniciado</strong>,{' '}
              <strong className="text-slate-700">Em Andamento</strong> e{' '}
              <strong className="text-slate-700">Finalizado</strong>.
            </p>
          </div>
          <button
            onClick={() => onAddTask('Não iniciado')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Criar Primeira Tarefa</span>
          </button>
        </div>
      )}

      {/* 3 Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 min-w-[850px] items-start">
        {COLUMNS.map((status) => {
          const columnTasks = tasks.filter((t) => t.status === status);
          return (
            <KanbanColumn
              key={status}
              status={status}
              tasks={columnTasks}
              onAddTask={() => onAddTask(status)}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onMoveStatus={onMoveStatus}
              onSelectTask={onSelectTask}
              onDropTask={onDropTask}
            />
          );
        })}
      </div>
    </div>
  );
};
