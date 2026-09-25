import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Check,
  Copy,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Shield,
  Trash2,
} from 'lucide-react';
import {
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection,
  SUPABASE_SCHEMA_SQL,
  syncLocalTasksToSupabase,
} from '../lib/supabase';
import { ConnectionState, SupabaseConfig } from '../types/crm';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectionState: ConnectionState;
  onConnectionChange: () => void;
  localTasksCount: number;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  connectionState,
  onConnectionChange,
  localTasksCount,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    tableExists: boolean;
  } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const config = getStoredSupabaseConfig();
      if (config) {
        setUrl(config.url);
        setAnonKey(config.anonKey);
      } else {
        setUrl('');
        setAnonKey('');
      }
      setTestResult(null);
      setSyncResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!url.trim() || !anonKey.trim()) {
      setTestResult({
        success: false,
        message: 'Por favor, preencha a URL e a Chave Anon antes de testar.',
        tableExists: false,
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const result = await testSupabaseConnection({
      url: url.trim(),
      anonKey: anonKey.trim(),
    });

    setTestResult(result);
    setIsTesting(false);
  };

  const handleSave = () => {
    if (!url.trim() || !anonKey.trim()) {
      setTestResult({
        success: false,
        message: 'URL e Chave Anon são obrigatórias para conectar.',
        tableExists: false,
      });
      return;
    }

    saveSupabaseConfig({
      url: url.trim(),
      anonKey: anonKey.trim(),
    });

    onConnectionChange();
    onClose();
  };

  const handleDisconnect = () => {
    clearSupabaseConfig();
    setUrl('');
    setAnonKey('');
    setTestResult(null);
    onConnectionChange();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleSyncLocal = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    const result = await syncLocalTasksToSupabase();
    if (result.error) {
      setSyncResult(`Erro ao sincronizar: ${result.error}`);
    } else {
      setSyncResult(`${result.count} tarefa(s) sincronizada(s) com sucesso no Supabase!`);
      onConnectionChange();
    }
    setIsSyncing(false);
  };

  const isConfigured = Boolean(getStoredSupabaseConfig());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-slate-800" />
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Conectar ao Supabase
              </h3>
              <p className="text-xs text-slate-500">
                Guarde suas tarefas e leads em tempo real no seu banco de dados Supabase.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Status banner */}
          <div
            className={`p-3 rounded-lg border flex items-start gap-2.5 ${
              isConfigured && connectionState === 'connected'
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            {isConfigured && connectionState === 'connected' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Shield className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <span className="font-semibold block">
                {isConfigured && connectionState === 'connected'
                  ? 'Supabase Conectado'
                  : 'Modo de Armazenamento'}
              </span>
              <span className="text-[11px] leading-relaxed block mt-0.5">
                {isConfigured && connectionState === 'connected'
                  ? 'Todas as tarefas criadas ou modificadas são salvas diretamente no seu banco de dados Supabase.'
                  : 'Atualmente salvando tarefas no armazenamento local do navegador. Conecte sua conta do Supabase para persistir em nuvem.'}
              </span>
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project URL (Supabase)
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900 transition-colors"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Encontrado em: Supabase Dashboard &gt; Project Settings &gt; API &gt; Project URL
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project API Key (Anon / Public)
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900 transition-colors"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Encontrado em: Supabase Dashboard &gt; Project Settings &gt; API &gt; anon public key
              </span>
            </div>
          </div>

          {/* Test connection feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                testResult.success
                  ? testResult.tableExists
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <span className="font-semibold block">
                  {testResult.success ? 'Conexão OK' : 'Falha na Conexão'}
                </span>
                <span className="block mt-0.5 text-[11px]">{testResult.message}</span>
              </div>
            </div>
          )}

          {/* SQL Table Creation Script Helper */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-700 text-xs">
                Script SQL da Tabela CRM (`tasks`)
              </span>
              <button
                type="button"
                onClick={handleCopySql}
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-800 transition-colors"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Script SQL</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mb-2">
              Execute este comando no <strong>SQL Editor</strong> do seu Supabase para criar a
              tabela com segurança e suporte a permissões públicas anônimas:
            </p>
            <pre className="bg-slate-900 text-slate-200 p-3 rounded-lg text-[11px] font-mono overflow-x-auto max-h-36 leading-relaxed">
              {SUPABASE_SCHEMA_SQL}
            </pre>
          </div>

          {/* Sync local tasks if any */}
          {localTasksCount > 0 && isConfigured && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 block text-xs">
                  Sincronizar {localTasksCount} tarefa(s) locais
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Envie as tarefas já criadas neste navegador para o seu Supabase.
                </span>
              </div>
              <button
                type="button"
                onClick={handleSyncLocal}
                disabled={isSyncing}
                className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
              >
                {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
              </button>
            </div>
          )}

          {syncResult && (
            <p className="text-xs text-emerald-700 font-medium">{syncResult}</p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/50">
          <div>
            {isConfigured && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Desconectar Supabase</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors border border-slate-300 bg-white"
            >
              <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testando...' : 'Testar Conexão'}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              Salvar e Conectar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
