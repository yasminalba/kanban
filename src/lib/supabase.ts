import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CRMTask, SupabaseConfig } from '../types/crm';

const CONFIG_STORAGE_KEY = 'crm_supabase_config_v1';
const TASKS_LOCAL_STORAGE_KEY = 'crm_local_tasks_v1';

export const SUPABASE_SCHEMA_SQL = `-- 1. Criação da tabela de tarefas do CRM
create table if not exists tasks (
  id text primary key,
  title text not null,
  description text default '',
  status text not null check (status in ('Não iniciado', 'Em Andamento', 'Finalizado')),
  priority text default 'Média',
  client_name text default '',
  client_email text default '',
  client_phone text default '',
  value numeric default 0,
  due_date text default '',
  tags jsonb default '[]'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2. Habilitação de Row Level Security (RLS)
alter table tasks enable row level security;

-- 3. Políticas de acesso para a chave pública anon
drop policy if exists "Permitir leitura para anon" on tasks;
create policy "Permitir leitura para anon" on tasks for select using (true);

drop policy if exists "Permitir insercao para anon" on tasks;
create policy "Permitir insercao para anon" on tasks for insert with check (true);

drop policy if exists "Permitir atualizacao para anon" on tasks;
create policy "Permitir atualizacao para anon" on tasks for update using (true);

drop policy if exists "Permitir exclusao para anon" on tasks;
create policy "Permitir exclusao para anon" on tasks for delete using (true);`;

export function getStoredSupabaseConfig(): SupabaseConfig | null {
  try {
    const envUrl = import.meta.env.VITE_SUPABASE_URL;
    const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (envUrl && envKey && envUrl !== 'https://your-project-id.supabase.co') {
      return { url: envUrl, anonKey: envKey };
    }

    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Erro ao ler configuração do Supabase:', err);
  }
  return null;
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  clientInstance = null; // Reset client
}

export function clearSupabaseConfig(): void {
  localStorage.removeItem(CONFIG_STORAGE_KEY);
  clientInstance = null;
}

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (clientInstance) return clientInstance;
  const config = getStoredSupabaseConfig();
  if (!config?.url || !config?.anonKey) return null;

  try {
    clientInstance = createClient(config.url, config.anonKey, {
      auth: { persistSession: false },
    });
    return clientInstance;
  } catch (err) {
    console.error('Falha ao inicializar cliente Supabase:', err);
    return null;
  }
}

export async function testSupabaseConnection(config?: SupabaseConfig): Promise<{
  success: boolean;
  message: string;
  tableExists: boolean;
}> {
  try {
    const targetConfig = config || getStoredSupabaseConfig();
    if (!targetConfig?.url || !targetConfig?.anonKey) {
      return {
        success: false,
        message: 'URL e Chave Anon do Supabase são obrigatórias.',
        tableExists: false,
      };
    }

    const testClient = createClient(targetConfig.url, targetConfig.anonKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await testClient
      .from('tasks')
      .select('id')
      .limit(1);

    if (error) {
      // Check if table missing (PGRST204 or 42P01)
      if (
        error.code === '42P01' ||
        error.message?.toLowerCase().includes('does not exist') ||
        error.message?.toLowerCase().includes('relation "tasks"')
      ) {
        return {
          success: true,
          tableExists: false,
          message:
            'Conexão com o Supabase bem-sucedida! Porém, a tabela "tasks" ainda não foi criada. Use o script SQL fornecido abaixo.',
        };
      }
      return {
        success: false,
        tableExists: false,
        message: `Erro do Supabase: ${error.message}`,
      };
    }

    return {
      success: true,
      tableExists: true,
      message: 'Conectado com sucesso ao Supabase e tabela "tasks" pronta!',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      tableExists: false,
      message: `Falha na conexão: ${msg}`,
    };
  }
}

// Local storage storage functions (clean empty default)
export function getLocalTasks(): CRMTask[] {
  try {
    const raw = localStorage.getItem(TASKS_LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLocalTasks(tasks: CRMTask[]): void {
  try {
    localStorage.setItem(TASKS_LOCAL_STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Erro ao salvar tarefas localmente:', err);
  }
}

// Database sync operations
export async function fetchTasksFromDB(): Promise<{
  tasks: CRMTask[];
  isSupabase: boolean;
  error?: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { tasks: getLocalTasks(), isSupabase: false };
  }

  try {
    const { data, error } = await client
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Erro ao carregar do Supabase, usando backup local:', error.message);
      return { tasks: getLocalTasks(), isSupabase: false, error: error.message };
    }

    const tasks: CRMTask[] = (data || []).map((row: any) => ({
      id: row.id,
      title: row.title || '',
      description: row.description || '',
      status: row.status,
      priority: row.priority || 'Média',
      client_name: row.client_name || '',
      client_email: row.client_email || '',
      client_phone: row.client_phone || '',
      value: typeof row.value === 'number' ? row.value : parseFloat(row.value) || 0,
      due_date: row.due_date || '',
      tags: Array.isArray(row.tags) ? row.tags : [],
      created_at: row.created_at || new Date().toISOString(),
      updated_at: row.updated_at || new Date().toISOString(),
    }));

    // Update local cache
    saveLocalTasks(tasks);
    return { tasks, isSupabase: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { tasks: getLocalTasks(), isSupabase: false, error: msg };
  }
}

export async function insertTaskToDB(task: CRMTask): Promise<{ success: boolean; error?: string }> {
  // Always update local storage first
  const current = getLocalTasks();
  saveLocalTasks([task, ...current]);

  const client = getSupabaseClient();
  if (!client) return { success: true };

  try {
    const { error } = await client.from('tasks').insert([
      {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        client_name: task.client_name || null,
        client_email: task.client_email || null,
        client_phone: task.client_phone || null,
        value: task.value || 0,
        due_date: task.due_date || null,
        tags: task.tags || [],
        created_at: task.created_at,
        updated_at: task.updated_at,
      },
    ]);

    if (error) {
      console.warn('Erro ao inserir no Supabase:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

export async function updateTaskInDB(
  id: string,
  updates: Partial<CRMTask>
): Promise<{ success: boolean; error?: string }> {
  // Update local storage
  const current = getLocalTasks();
  const next = current.map((t) => (t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t));
  saveLocalTasks(next);

  const client = getSupabaseClient();
  if (!client) return { success: true };

  try {
    const payload: any = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { error } = await client.from('tasks').update(payload).eq('id', id);
    if (error) {
      console.warn('Erro ao atualizar no Supabase:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

export async function deleteTaskFromDB(id: string): Promise<{ success: boolean; error?: string }> {
  // Update local storage
  const current = getLocalTasks();
  saveLocalTasks(current.filter((t) => t.id !== id));

  const client = getSupabaseClient();
  if (!client) return { success: true };

  try {
    const { error } = await client.from('tasks').delete().eq('id', id);
    if (error) {
      console.warn('Erro ao deletar no Supabase:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

export async function syncLocalTasksToSupabase(): Promise<{ count: number; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { count: 0, error: 'Supabase não conectado' };

  const local = getLocalTasks();
  if (local.length === 0) return { count: 0 };

  try {
    const rows = local.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      client_name: t.client_name || null,
      client_email: t.client_email || null,
      client_phone: t.client_phone || null,
      value: t.value || 0,
      due_date: t.due_date || null,
      tags: t.tags || [],
      created_at: t.created_at,
      updated_at: t.updated_at,
    }));

    const { error } = await client.from('tasks').upsert(rows, { onConflict: 'id' });
    if (error) {
      return { count: 0, error: error.message };
    }
    return { count: rows.length };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { count: 0, error: msg };
  }
}
