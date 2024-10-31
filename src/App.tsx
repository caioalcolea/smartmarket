import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { SyncCard } from './components/SyncCard';
import { SyncLogs } from './components/SyncLogs';
import { fetchAndSyncData } from './services/api';
import type { SyncStats, SyncLog } from './types';

function App() {
  const [stats, setStats] = useState<SyncStats>({
    products: { total: 0, synced: 0, lastSync: new Date().toISOString() },
    clients: { total: 0, synced: 0, lastSync: new Date().toISOString() },
  });

  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const syncData = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      const result = await fetchAndSyncData();
      
      setStats({
        products: {
          total: result.products.total,
          synced: result.products.synced,
          lastSync: new Date().toISOString(),
        },
        clients: {
          total: result.clients.total,
          synced: result.clients.synced,
          lastSync: new Date().toISOString(),
        },
      });

      setLogs(prev => [{
        timestamp: new Date().toISOString(),
        type: 'system',
        status: 'success',
        message: `Sincronização concluída: ${result.clients.synced} clientes e ${result.products.synced} produtos`,
      }, ...prev.slice(0, 49)]);
    } catch (error) {
      setLogs(prev => [{
        timestamp: new Date().toISOString(),
        type: 'system',
        status: 'error',
        message: `Falha na sincronização: ${error.message}`,
      }, ...prev.slice(0, 49)]);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    // Sincronização inicial
    syncData();
    
    // Agenda sincronização diária
    const initialTimer = setTimeout(() => {
      syncData();
      // Inicia o intervalo diário após a primeira execução agendada
      setInterval(syncData, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);

    return () => {
      clearTimeout(initialTimer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Painel de Sincronização DataSystem-TalkHub
            </h1>
          </div>
          <button
            onClick={syncData}
            disabled={isSyncing}
            className={`px-4 py-2 rounded-lg font-medium ${
              isSyncing
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <SyncCard
            title="Sincronização de Clientes"
            total={stats.clients.total}
            synced={stats.clients.synced}
            lastSync={stats.clients.lastSync}
            icon="users"
          />
          <SyncCard
            title="Sincronização de Produtos"
            total={stats.products.total}
            synced={stats.products.synced}
            lastSync={stats.products.lastSync}
            icon="package"
          />
        </div>

        <SyncLogs logs={logs} />
      </div>
    </div>
  );
}

export default App;