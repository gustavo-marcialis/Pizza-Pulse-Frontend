import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, Clock, CheckCircle2, ChefHat, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { clienteApi, Pedido } from '@/services/api';
import { Badge } from '@/components/ui/badge';

const Status = () => {
  const [searchParams] = useSearchParams();
  const mesaParam = searchParams.get('mesa');
  
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPedidos = async () => {
    if (!mesaParam) {
        return;
    }
    setLoading(true);
    try {
      const dados = await clienteApi.buscarPedidosPorMesa(mesaParam);
      setPedidos(Array.isArray(dados) ? dados : []);
    } catch (error) {
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
    const interval = setInterval(fetchPedidos, 15000);
    return () => clearInterval(interval);
  }, [mesaParam]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'Recebido': return { color: 'bg-yellow-500', icon: Clock, label: 'Aguardando' };
      case 'EmPreparo': return { color: 'bg-blue-500', icon: ChefHat, label: 'Preparando' };
      case 'Pronto': return { color: 'bg-green-500', icon: CheckCircle2, label: 'Pronto!' };
      default: return { color: 'bg-gray-500', icon: Utensils, label: status };
    }
  };

  if (!mesaParam) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Mesa não identificada</CardTitle>
          </CardHeader>
          <CardContent>
            <Link to="/">
              <Button>Voltar ao Cardápio</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <header className="flex items-center justify-between mb-6">
        <Link to={`/?mesa=${mesaParam}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-6 w-6" /></Button>
        </Link>
        <h1 className="text-xl font-bold">Mesa {mesaParam}</h1>
        <Button variant="ghost" size="icon" onClick={fetchPedidos} disabled={loading}>
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </header>

      <main className="space-y-4">
        {pedidos.length === 0 && !loading && (
          <div className="text-center text-gray-500 mt-10">
            <p>Nenhum pedido encontrado para esta mesa.</p>
            <p className="text-sm">Faça seu pedido no cardápio!</p>
          </div>
        )}

        {pedidos.map((pedido) => {
          const { color, icon: Icon, label } = getStatusInfo(pedido.status);
          return (
            <motion.div key={pedido.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="overflow-hidden border-none shadow-md">
                <div className={`h-2 w-full ${color}`} />
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-xs">#{pedido.id}</Badge>
                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full text-white ${color}`}>
                      <Icon className="h-3 w-3" /> {label}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">{pedido.descricao}</h3>
                  {pedido.obs && (
                    <p className="text-sm text-gray-500 mt-1 bg-yellow-50 p-2 rounded border border-yellow-100">
                      Obs: {pedido.obs}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </main>
    </div>
  );
};

export default Status;
