import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clienteApi, protectedApi, Pedido, NovoPedido } from '@/services/api';
import { toast } from 'sonner';

// Hook for public order creation
export function useCriarPedido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pedido: NovoPedido) => clienteApi.criarPedido(pedido),
    onSuccess: (data) => {
      toast.success('Pedido realizado com sucesso!', {
        description: `Mesa ${data.mesa} - ${data.descricao}`,
      });
      queryClient.invalidateQueries({ queryKey: ['pedidos-mesa'] });
    },
    onError: (error: Error) => {
      toast.error('Erro ao realizar pedido', {
        description: error.message || 'Tente novamente mais tarde',
      });
    },
  });
}

// Hook for public order status lookup
export function usePedidosPorMesa(mesa: number | null) {
  return useQuery({
    queryKey: ['pedidos-mesa', mesa],
    queryFn: () => clienteApi.buscarPedidosPorMesa(mesa!),
    enabled: mesa !== null && mesa > 0,
    retry: 2,
    staleTime: 10000, // 10 seconds
  });
}

// Hook for protected order list (Dashboard)
export function usePedidosDashboard() {
  return useQuery({
    queryKey: ['pedidos-dashboard'],
    queryFn: () => protectedApi.listarPedidos(),
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    retry: 3,
    staleTime: 5000,
  });
}

// Hook for advancing order status (Pizzaiolo only)
export function useAvancarStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => protectedApi.alterarStatus(id),
    onSuccess: (data) => {
      const statusText = getStatusText(data.status);
      toast.success('Status atualizado!', {
        description: `Pedido #${data.id} agora está: ${statusText}`,
      });
      queryClient.invalidateQueries({ queryKey: ['pedidos-dashboard'] });
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar status', {
        description: error.message || 'Tente novamente',
      });
    },
  });
}

// Helper function for status text
export function getStatusText(status: Pedido['status']): string {
  const statusMap: Record<Pedido['status'], string> = {
    Recebido: 'Recebido',
    EmPreparo: 'Em Preparo',
    Pronto: 'Pronto',
  };
  return statusMap[status] || status;
}

// Helper function for status color class
export function getStatusColor(status: Pedido['status']): string {
  const colorMap: Record<Pedido['status'], string> = {
    Recebido: 'bg-status-received text-foreground',
    EmPreparo: 'bg-status-preparing text-secondary-foreground',
    Pronto: 'bg-status-ready text-primary-foreground',
  };
  return colorMap[status] || 'bg-muted text-muted-foreground';
}
