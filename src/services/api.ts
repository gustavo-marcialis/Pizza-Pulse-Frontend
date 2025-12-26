import axios from 'axios';
import { msalInstance } from '../lib/msalClient'; 
import { tokenRequest, apiConfig } from '../config/authConfig';

const API_URL = apiConfig.baseUrl;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  if (config.url?.includes('/Cliente/')) {
    return config;
  }

  const account = msalInstance.getActiveAccount() || msalInstance.getAllAccounts()[0];

  if (account) {
    try {
      const response = await msalInstance.acquireTokenSilent({
        ...tokenRequest,
        account: account
      });

      if (response.accessToken) {
        config.headers.Authorization = `Bearer ${response.accessToken}`;
      }
    } catch (error) {
      console.warn("⚠️ [Auth] Token silencioso falhou (normal se for cliente não logado).");
    }
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export interface Pedido {
  id: number;
  mesa: string;
  descricao: string;
  obs?: string;
  status: 'Recebido' | 'EmPreparo' | 'Pronto' | 'Entregue';
  dataCriacao: string;
}

const mapPedidoBackendToFrontend = (p: any): Pedido => {
  let statusVindoDoBanco = p.status ?? p.Status ?? 'Recebido';
  
  if (statusVindoDoBanco === 'Na fila') {
    statusVindoDoBanco = 'Recebido';
  }

  return {
    id: p.id ?? p.Id ?? 0,
    mesa: String(p.mesa ?? p.Mesa ?? "0"),
    descricao: p.sabores ?? p.Sabores ?? p.descricao ?? "Sem descrição",
    obs: p.obs ?? p.Obs ?? "",
    status: statusVindoDoBanco,
    dataCriacao: p.dataCriacao ?? p.DataCriacao ?? new Date().toISOString()
  };
};

const getNextStatus = (current: string): string => {
  if (current === 'Recebido') return 'EmPreparo';
  if (current === 'EmPreparo') return 'Pronto';
  if (current === 'Pronto') return 'Entregue';
  return 'Recebido';
};

export const clienteApi = {
  criarPedido: async (dados: { mesa: number | string; descricao: string; obs: string }) => {
    console.log("🚀 Criando pedido...", dados);
    const payload = {
      id: 0,
      mesa: String(dados.mesa),
      sabores: dados.descricao,
      obs: dados.obs,
      status: 'Recebido'
    };
    
    const response = await api.post('/api/Cliente/pedidosCliente', payload);
    return response.data;
  },

  buscarPedidosPorMesa: async (mesa: string | number): Promise<Pedido[]> => {
    try {
      const response = await api.get(`/api/Cliente/pedidosCliente/${mesa}`);
      
      let lista: any[] = [];
      if (Array.isArray(response.data)) {
        lista = response.data;
      } else if (response.data && Array.isArray(response.data.value)) {
        lista = response.data.value;
      } else if (response.data && typeof response.data === 'object') {
        lista = [response.data];
      }

      return lista.map(mapPedidoBackendToFrontend);
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
      return [];
    }
  }
};

export const protectedApi = {
  listarPedidos: async (): Promise<Pedido[]> => {
    const response = await api.get('/api/API/pedidos');
    if (!response.data) return [];
    
    let lista = [];
    if (Array.isArray(response.data)) lista = response.data;
    else if (response.data.value) lista = response.data.value;
    else if (response.data.id) lista = [response.data];
    
    return lista.map(mapPedidoBackendToFrontend);
  },

  alterarStatus: async (id: number): Promise<Pedido> => {
    const listaResponse = await api.get('/api/API/pedidos');
    let lista = Array.isArray(listaResponse.data) ? listaResponse.data : (listaResponse.data.value || []);
    const pedidoAtual = lista.find((p: any) => p.id === id || p.Id === id);

    if (!pedidoAtual) throw new Error("Pedido não encontrado");

    const pedidoMapeado = mapPedidoBackendToFrontend(pedidoAtual);
    const novoStatus = getNextStatus(pedidoMapeado.status);
    
    if (novoStatus === 'Entregue') {
      await api.delete(`/api/API/pedidos/${id}`);
      return { ...pedidoMapeado, status: 'Entregue' };
    }

    const payload = {
      id: pedidoAtual.id ?? pedidoAtual.Id,
      mesa: String(pedidoAtual.mesa ?? pedidoAtual.Mesa),
      sabores: pedidoAtual.sabores ?? pedidoAtual.Sabores ?? pedidoAtual.descricao,
      obs: pedidoAtual.obs ?? pedidoAtual.Obs ?? "",
      status: novoStatus
    };

    const response = await api.put(`/api/API/pedidos/${id}`, payload);
    return mapPedidoBackendToFrontend(response.data || payload);
  },

  editarPedido: async (id: number, dados: { mesa: string, descricao: string, obs: string, status: string }): Promise<Pedido> => {
    const payload = {
      id: id,
      mesa: String(dados.mesa),
      sabores: dados.descricao,
      obs: dados.obs,
      status: dados.status
    };

    const response = await api.put(`/api/API/pedidos/${id}`, payload);
    return mapPedidoBackendToFrontend(response.data || payload);
  },
};

export default api;