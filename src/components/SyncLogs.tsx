import React from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';
import type { SyncLog } from '../types';

interface SyncLogsProps {
  logs: SyncLog[];
}

export function SyncLogs({ logs }: SyncLogsProps) {
  const getIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000);
    
    if (seconds < 60) return `há ${seconds} segundos`;
    if (seconds < 3600) return `há ${Math.floor(seconds / 60)} minutos`;
    if (seconds < 86400) return `há ${Math.floor(seconds / 3600)} horas`;
    return `há ${Math.floor(seconds / 86400)} dias`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Registros de Sincronização</h2>
      <div className="space-y-4">
        {logs.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nenhum registro de sincronização disponível</p>
        ) : (
          logs.map((log, index) => (
            <div 
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
            >
              {getIcon(log.status)}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{log.message}</p>
                <p className="text-xs text-gray-500">{getTimeAgo(log.timestamp)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}