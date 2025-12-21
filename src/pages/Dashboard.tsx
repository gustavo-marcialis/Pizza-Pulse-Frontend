import { motion } from 'framer-motion';
import { ChefHat, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { PedidoCard } from '@/components/PedidoCard';
import { DashboardSkeleton } from '@/components/Skeletons';
import { usePedidosDashboard } from '@/hooks/usePedidos';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Dashboard = () => {
  const { data: pedidos, isLoading, isError, refetch, isRefetching, dataUpdatedAt } = usePedidosDashboard();
  const { isPizzaiolo, isGarcom, role } = useAuth();

  // ✅ Definição de Permissões
  const canAdvanceStatus = isPizzaiolo;
  const canEdit = isGarcom;

  const lastUpdate = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '--:--:--';

  const pedidosPorStatus = {
    Recebido: pedidos?.filter((p) => p.status === 'Recebido') || [],
    EmPreparo: pedidos?.filter((p) => p.status === 'EmPreparo') || [],
    Pronto: pedidos?.filter((p) => p.status === 'Pronto') || [],
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ChefHat className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  Dashboard {isPizzaiolo ? 'da Cozinha' : 'de Pedidos'}
                </h1>
                <p className="text-muted-foreground text-sm flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Última atualização: {lastUpdate}
                  <span className="text-xs">(atualiza a cada 30s)</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm px-3 py-1 bg-muted rounded-full">
              {role === 'Pizzaiolo' && '👨‍🍳 Modo Pizzaiolo'}
              {role === 'Garcom' && '🍽️ Modo Garçom'}
            </span>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </motion.div>

        {/* ✅ Aviso Novo do Garçom */}
        {isGarcom && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Modo de Edição</AlertTitle>
            <AlertDescription className="text-blue-700">
              Você pode <strong>editar</strong> os detalhes do pedido clicando no ícone de lápis, mas a mudança de status é exclusiva da cozinha.
            </AlertDescription>
          </Alert>
        )}

        {isLoading && <DashboardSkeleton />}

        {isError && (
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">Erro ao carregar pedidos</h3>
              <p className="text-muted-foreground mb-4">A API pode estar iniciando. Tente novamente.</p>
              <Button onClick={() => refetch()} className="gap-2"><RefreshCw className="h-4 w-4" /> Tentar Novamente</Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && pedidos?.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">Nenhum pedido no momento</h3>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && pedidos && pedidos.length > 0 && (
          <div className="space-y-8">
            {['Recebido', 'EmPreparo', 'Pronto'].map((status, sectionIndex) => {
              const items = pedidosPorStatus[status as keyof typeof pedidosPorStatus];
              if (items.length === 0) return null;
              
              const colors = { Recebido: 'bg-muted-foreground', EmPreparo: 'bg-secondary animate-pulse', Pronto: 'bg-status-ready' };
              const labels = { Recebido: 'Recebidos', EmPreparo: 'Em Preparo', Pronto: 'Prontos para Servir' };
              
              return (
                <motion.section key={status} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: sectionIndex * 0.1 }}>
                  <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${colors[status as keyof typeof colors]}`} />
                    {labels[status as keyof typeof labels]} ({items.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((pedido, index) => (
                      <PedidoCard
                        key={pedido.id}
                        pedido={pedido}
                        canAdvanceStatus={canAdvanceStatus}
                        canEdit={canEdit} // ✅ Passando a permissão
                        index={index}
                      />
                    ))}
                  </div>
                </motion.section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
