export interface SyncStats {
  products: SyncInfo;
  clients: SyncInfo;
}

export interface SyncInfo {
  total: number;
  synced: number;
  lastSync: string;
}

export interface SyncLog {
  timestamp: string;
  type: 'client' | 'product' | 'system';
  status: 'success' | 'error' | 'info';
  message: string;
}