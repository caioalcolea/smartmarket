import React from 'react';
import { Users, Package } from 'lucide-react';

interface SyncCardProps {
  title: string;
  total: number;
  synced: number;
  lastSync: string;
  icon: 'users' | 'package';
}

export function SyncCard({ title, total, synced, lastSync, icon }: SyncCardProps) {
  const Icon = icon === 'users' ? Users : Package;
  const syncPercentage = total > 0 ? Math.round((synced / total) * 100) : 0;
  const lastSyncDate = new Date(lastSync).toLocaleString('pt-BR');

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progresso</span>
            <span>{syncPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${syncPercentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total de Itens</p>
            <p className="text-2xl font-semibold text-gray-900">{total}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Sincronizados</p>
            <p className="text-2xl font-semibold text-gray-900">{synced}</p>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600">Última Sincronização</p>
          <p className="text-sm text-gray-900">{lastSyncDate}</p>
        </div>
      </div>
    </div>
  );
}