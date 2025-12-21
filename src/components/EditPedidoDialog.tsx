import { useState } from "react";
import { Pencil, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { protectedApi, Pedido } from "@/services/api";
import { useQueryClient } from "@tanstack/react-query";

interface EditPedidoDialogProps {
  pedido: Pedido;
}

export function EditPedidoDialog({ pedido }: EditPedidoDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [mesa, setMesa] = useState(String(pedido.mesa));
  const [descricao, setDescricao] = useState(pedido.descricao);
  const [obs, setObs] = useState(pedido.obs || "");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await protectedApi.editarPedido(pedido.id, {
        mesa,
        descricao,
        obs,
        status: pedido.status
      });

      toast({
        title: "Pedido Atualizado!",
        description: "As alterações foram salvas.",
        className: "bg-green-600 text-white"
      });

      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      setOpen(false);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao editar",
        description: "Não foi possível salvar as alterações.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8" title="Editar Pedido">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Pedido #{pedido.id}</DialogTitle>
          <DialogDescription>
            Faça alterações na mesa, itens ou observações. O status não será alterado.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="mesa" className="text-right">
              Mesa
            </Label>
            <Input
              id="mesa"
              type="number"
              value={mesa}
              onChange={(e) => setMesa(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="itens" className="text-right">
              Itens
            </Label>
            <Textarea
              id="itens"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="col-span-3 min-h-[100px]"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="obs" className="text-right">
              Obs
            </Label>
            <Textarea
              id="obs"
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Ex: Sem cebola..."
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
