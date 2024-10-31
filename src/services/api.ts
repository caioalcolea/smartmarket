import axios from 'axios';
import moment from 'moment-timezone';

const API_BASE_URL = 'https://integracaodatasystem.useserver.com.br/api/v1';
const WEBHOOK_CLIENTS_URL = 'https://chat.talkhub.me/api/iwh/58b74b7bd7dd3ec59abc30680d2510e5';
const WEBHOOK_PRODUCTS_URL = 'https://chat.talkhub.me/api/iwh/4e5c6aae5e14762cfd0febabdb4895ca';

interface DateRange {
  start: string;
  end: string;
}

interface SyncResult {
  total: number;
  synced: number;
}

export async function authenticate(): Promise<string> {
  try {
    const response = await axios.post(`${API_BASE_URL}/autenticar`, {
      cnpj: '03.016.420/0001-54',
      hash: '3854ac7c9e5c3b3134283fe5d2eb301fe819829c',
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const token = response.data?.token;
    if (!token) {
      throw new Error('Token não encontrado na resposta de autenticação.');
    }

    return token;
  } catch (error: any) {
    console.error('Falha na autenticação:', error.response?.data || error.message);
    throw new Error(`Falha ao autenticar com a API: ${error.response?.data?.message || error.message}`);
  }
}

export async function fetchAndSyncData() {
  try {
    const token = await authenticate();

    const timezone = 'America/Sao_Paulo';

    const today = moment().tz(timezone).startOf('day');
    const yesterday = moment().tz(timezone).subtract(1, 'day').startOf('day');

    const dateRange = {
      start: yesterday.format('YYYY-MM-DD'),
      end: today.format('YYYY-MM-DD'),
    };

    console.log('Intervalo de datas:', dateRange);

    const [clientsResult, productsResult] = await Promise.all([
      syncClients(token, dateRange),
      syncProducts(token, dateRange),
    ]);

    return {
      clients: clientsResult,
      products: productsResult,
    };
  } catch (error: any) {
    console.error('Erro na sincronização:', error.response?.data || error.message);
    throw new Error(`Falha na sincronização: ${error.response?.data?.message || error.message}`);
  }
}

async function syncClients(token: string, dateRange: DateRange): Promise<SyncResult> {
  let page = 1;
  let totalSynced = 0;
  let totalPages = 1;
  let totalItems = 0;

  try {
    do {
      const response = await axios.get(`${API_BASE_URL}/clientes`, {
        params: {
          dataCadInicio: dateRange.start,
          dataCadFim: dateRange.end,
          campoOrdem: 'ultCompra',
          ordem: 'DESC',
          itensPorPagina: 100,
          pagina: page,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(`Resposta da API de clientes (Página ${page}):`, response.data);

      const clients = response.data.dados || [];
      totalItems = response.data.totalRegistros || 0;
      totalPages = response.data.totalPaginas || Math.ceil(totalItems / 100) || 1;

      for (const client of clients) {
        try {
          const formattedClient = {
            id: client.id,
            nome: client.nome,
            dataCadastro: client.dataCadastro,
            ultimaCompra: client.ultimaCompra,
            email: client.email,
            telefone: client.telefone,
            sync_date: new Date().toISOString(),
          };

          await axios.post(WEBHOOK_CLIENTS_URL, formattedClient, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
          totalSynced++;
        } catch (error: any) {
          console.error(`Falha ao sincronizar cliente ${client.id}:`, error.response?.data || error.message);
        }
      }

      page++;
    } while (page <= totalPages);

    return { total: totalItems, synced: totalSynced };
  } catch (error: any) {
    console.error('Falha ao buscar clientes:', error.response?.data || error.message);
    throw new Error(`Falha ao sincronizar clientes: ${error.response?.data?.message || error.message}`);
  }
}

async function syncProducts(token: string, dateRange: DateRange): Promise<SyncResult> {
  let page = 1;
  let totalSynced = 0;
  let totalPages = 1;
  let totalItems = 0;

  try {
    do {
      const response = await axios.get(`${API_BASE_URL}/produtos`, {
        params: {
          dataUltimaCompraInicio: dateRange.start,
          dataUltimaCompraFim: dateRange.end,
          campoOrdem: 'PRODUTODES',
          ordem: 'ASC',
          itensPorPagina: 100,
          pagina: page,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(`Resposta da API de produtos (Página ${page}):`, response.data);

      const products = response.data.dados || [];
      totalItems = response.data.totalRegistros || 0;
      totalPages = response.data.totalPaginas || Math.ceil(totalItems / 100) || 1;

      for (const product of products) {
        try {
          const formattedProduct = {
            id: product.id,
            codigo: product.codigo,
            descricao: product.descricao,
            preco: product.preco,
            estoque: product.estoque,
            ultima_compra: product.dataUltimaCompra,
            sync_date: new Date().toISOString(),
          };

          await axios.post(WEBHOOK_PRODUCTS_URL, formattedProduct, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
          totalSynced++;
        } catch (error: any) {
          console.error(`Falha ao sincronizar produto ${product.id}:`, error.response?.data || error.message);
        }
      }

      page++;
    } while (page <= totalPages);

    return { total: totalItems, synced: totalSynced };
  } catch (error: any) {
    console.error('Falha ao buscar produtos:', error.response?.data || error.message);
    throw new Error(`Falha ao sincronizar produtos: ${error.response?.data?.message || error.message}`);
  }
}
