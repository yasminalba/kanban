import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CRMTask, ConnectionState, TaskPriority, TaskStatus } from './types/crm';
import { Navbar } from './components/Navbar';
import { PipelineStats } from './components/PipelineStats';
import { KanbanBoard } from './components/KanbanBoard';
import { TaskModal } from './components/TaskModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { SupabaseModal } from './components/SupabaseModal';
import {
  fetchTasksFromDB,
  insertTaskToDB,
  updateTaskInDB,
  deleteTaskFromDB,
  getStoredSupabaseConfig,
  testSupabaseConnection,
} from './lib/supabase';
import { Filter, Check, AlertCircle } from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState<CRMTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'Todas' | TaskPriority>('Todas');

  // Supabase connection state
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false);

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<CRMTask | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('Não iniciado');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<CRMTask | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(
    null
  );

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  }, []);

  // Check Supabase connection and fetch tasks
  const refreshData = useCallback(async () => {
    const config = getStoredSupabaseConfig();
    const hasConfig = Boolean(config?.url && config?.anonKey);
    setIsSupabaseConfigured(hasConfig);

    if (hasConfig) {
      setConnectionState('connecting');
      const test = await testSupabaseConnection();
      if (test.success) {
        setConnectionState('connected');
      } else {
        setConnectionState('error');
      }
    } else {
      setConnectionState('disconnected');
    }

    const result = await fetchTasksFromDB();
    setTasks(result.tasks);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Create or Update task
  const handleSaveTask = async (
    taskData: Omit<CRMTask, 'id' | 'created_at' | 'updated_at'> & { id?: string }
  ) => {
    if (taskData.id) {
      // Edit existing
      const existingId = taskData.id;
      const updates = {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        client_name: taskData.client_name,
        client_phone: taskData.client_phone,
        client_email: taskData.client_email,
        value: taskData.value,
        due_date: taskData.due_date,
        tags: taskData.tags,
      };

      // Optimistic state
      setTasks((prev) =>
        prev.map((t) =>
          t.id === existingId
            ? { ...t, ...updates, updated_at: new Date().toISOString() }
            : t
        )
      );

      if (selectedTask?.id === existingId) {
        setSelectedTask((prev) =>
          prev ? { ...prev, ...updates, updated_at: new Date().toISOString() } : null
        );
      }

      const res = await updateTaskInDB(existingId, updates);
      if (res.error) {
        showToast('Atualizado localmente (erro no Supabase)', 'info');
      } else {
        showToast('Tarefa atualizada com sucesso!', 'success');
      }
    } else {
      // Create new
      const newTask: CRMTask = {
        id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        client_name: taskData.client_name,
        client_phone: taskData.client_phone,
        client_email: taskData.client_email,
        value: taskData.value,
        due_date: taskData.due_date,
        tags: taskData.tags || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Optimistic state
      setTasks((prev) => [newTask, ...prev]);

      const res = await insertTaskToDB(newTask);
      if (res.error) {
        showToast('Tarefa salva localmente (erro no Supabase)', 'info');
      } else {
        showToast('Nova tarefa criada com sucesso!', 'success');
      }
    }
  };

  // Change task status (Kanban move)
  const handleMoveStatus = async (id: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus, updated_at: new Date().toISOString() } : t))
    );

    if (selectedTask?.id === id) {
      setSelectedTask((prev) =>
        prev ? { ...prev, status: newStatus, updated_at: new Date().toISOString() } : null
      );
    }

    const res = await updateTaskInDB(id, { status: newStatus });
    if (!res.error) {
      showToast(`Status alterado para "${newStatus}"`, 'success');
    }
  };

  // Delete task
  const handleDeleteTask = async (id: string) => {
    const confirmDelete = window.confirm('Tem certeza de que deseja excluir esta tarefa?');
    if (!confirmDelete) return;

    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (selectedTask?.id === id) {
      setSelectedTask(null);
      setIsDetailModalOpen(false);
    }

    const res = await deleteTaskFromDB(id);
    if (!res.error) {
      showToast('Tarefa excluída com sucesso.', 'info');
    }
  };

  // Drag and Drop handler
  const handleDropTask = (taskId: string, targetStatus: TaskStatus) => {
    const current = tasks.find((t) => t.id === taskId);
    if (current && current.status !== targetStatus) {
      handleMoveStatus(taskId, targetStatus);
    }
  };

  // Open modal handlers
  const handleOpenNewTask = (status: TaskStatus = 'Não iniciado') => {
    setEditingTask(null);
    setDefaultStatus(status);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: CRMTask) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSelectTask = (task: CRMTask) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchSearch =
        searchTerm.trim() === '' ||
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (task.client_name && task.client_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (task.client_phone && task.client_phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (task.client_email && task.client_email.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchPriority = priorityFilter === 'Todas' || task.priority === priorityFilter;

      return matchSearch && matchPriority;
    });
  }, [tasks, searchTerm, priorityFilter]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Navbar adhering to Top Bar Contract */}
      <Navbar
        onOpenNewTaskModal={() => handleOpenNewTask('Não iniciado')}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        connectionState={connectionState}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isSupabaseConfigured={isSupabaseConfigured}
      />

      {/* Pipeline Summary Bar */}
      <PipelineStats tasks={tasks} />

      {/* Control bar: Priority filters and search indicator */}
      <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Interactive filter tabs (functional buttons adhering to Zero-Pill rule) */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Prioridade:
          </span>
          {(['Todas', 'Baixa', 'Média', 'Alta', 'Urgente'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                priorityFilter === p
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Sync feedback indicator */}
        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          {isSupabaseConfigured ? (
            connectionState === 'connected' ? (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Sincronização em nuvem ativa
              </span>
            ) : (
              <span className="text-amber-700 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Tentando reconectar ao Supabase...
              </span>
            )
          ) : (
            <span className="text-slate-500">
              Salvando localmente · Clique em Supabase para persistir em nuvem
            </span>
          )}
        </div>
      </div>

      {/* Main Kanban Content */}
      <main className="flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="text-center space-y-2">
              <div className="w-6 h-6 border-2 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Carregando quadro Kanban...</p>
            </div>
          </div>
        ) : (
          <KanbanBoard
            tasks={filteredTasks}
            onAddTask={handleOpenNewTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onMoveStatus={handleMoveStatus}
            onSelectTask={handleSelectTask}
            onDropTask={handleDropTask}
          />
        )}
      </main>

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        initialTask={editingTask}
        defaultStatus={defaultStatus}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        onStatusChange={handleMoveStatus}
      />

      {/* Supabase Connection & Configuration Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        connectionState={connectionState}
        onConnectionChange={refreshData}
        localTasksCount={tasks.length}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium bg-slate-900 text-white shadow-lg animate-in slide-in-from-bottom-2 duration-150">
          {toast.type === 'success' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
          {toast.type === 'error' && <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
