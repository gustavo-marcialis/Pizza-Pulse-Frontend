import { motion } from 'framer-motion';
import { Clock, UtensilsCrossed, ArrowRight, Trash2, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { Pedido } from '@/services/api';
import { useAvancarStatus } from '@/hooks/usePedidos';
import { EditPedidoDialog } from '@/components/EditPedidoDialog'; // Importa o modal de edição

interface PedidoCardProps {
  pedido: Pedido;
  canAdvanceStatus?: boolean;
  canEdit?: boolean; // Nova prop
  index?: number;
}

export function PedidoCard({ pedido, canAdvanceStatus = false, canEdit = false, index = 0 }: PedidoCardProps) {
  const { mutate: avancarStatus, isPending } = useAvancarStatus();

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  const getNextStatusText = () => {
    if (pedido.status === 'Recebido') return 'Iniciar Preparo';
    if (pedido.status === 'EmPreparo') return 'Marcar Pronto';
    if (pedido.status === 'Pronto') return 'Finalizar e Entregar';
    return 'Avançar';
  };

  const getButtonVariant = () => {
    if (pedido.status === 'Recebido') return 'secondary';
    if (pedido.status === 'Pronto') return 'destructive'; 
    return 'default';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Card className="overflow-hidden hover:shadow-warm transition-shadow duration-300 h-full flex flex-col">
        <CardHeader className="pb-3 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <UtensilsCrossed className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-display text-lg font-semibold">Mesa {pedido.mesa}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(pedido.dataCriacao)}
                </p>
              </div>
            </div>
            
            {/* Área de Ações do Topo */}
            <div className="flex items-center gap-2">
              {/* Botão de Editar (Só aparece se canEdit for true) */}
              {canEdit && <EditPedidoDialog pedido={pedido} />}
              <StatusBadge status={pedido.status} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-3 pt-4 flex-1 space-y-3">
          <div>
             <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Pedido #{pedido.id}</p>
             <p className="text-foreground font-medium text-base leading-snug">
               {pedido.descricao}
             </p>
          </div>

          {pedido.obs && pedido.obs.trim() !== "" && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                <div>
                  <span className="block text-xs font-bold text-yellow-700 uppercase">Observação:</span>
                  <p className="text-sm text-yellow-900 leading-tight">{pedido.obs}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        {/* Rodapé de Status (Só aparece se canAdvanceStatus for true - Pizzaiolo) */}
        {canAdvanceStatus && (
          <CardFooter className="pt-0 pb-4">
            <Button
              onClick={() => avancarStatus(pedido.id)}
              disabled={isPending}
              className="w-full gap-2 shadow-sm"
              variant={getButtonVariant()}
            >
              {isPending ? (
                'Processando...'
              ) : (
                <>
                  {getNextStatusText()}
                  {pedido.status === 'Pronto' ? (
                    <Trash2 className="h-4 w-4" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}
