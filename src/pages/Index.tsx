import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, Search, ShoppingCart, Trash2, ArrowRight, Loader2, Plus, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { clienteApi } from '@/services/api';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

const MENU_ITEMS = [
  { id: 1, name: 'Pizza Calabresa', category: 'Pizzas Salgadas', description: 'Molho, mussarela, calabresa e cebola', price: 45.00 },
  { id: 2, name: 'Pizza Mussarela', category: 'Pizzas Salgadas', description: 'Molho, mussarela e orégano', price: 40.00 },
  { id: 3, name: 'Pizza Portuguesa', category: 'Pizzas Salgadas', description: 'Molho, presunto, ovos, cebola e ervilha', price: 48.00 },
  { id: 4, name: 'Pizza 4 Queijos', category: 'Pizzas Salgadas', description: 'Mussarela, provolone, parmesão e gorgonzola', price: 50.00 },
  { id: 5, name: 'Pizza Chocolate', category: 'Pizzas Doces', description: 'Chocolate ao leite e granulado', price: 45.00 },
  { id: 6, name: 'Pizza Banana', category: 'Pizzas Doces', description: 'Banana, canela e leite condensado', price: 42.00 },
  { id: 7, name: 'Coca-Cola 2L', category: 'Bebidas', description: 'Refrigerante 2 Litros', price: 12.00 },
  { id: 8, name: 'Guaraná 2L', category: 'Bebidas', description: 'Refrigerante 2 Litros', price: 10.00 },
];

const CATEGORIES = ['Todas', 'Pizzas Salgadas', 'Pizzas Doces', 'Bebidas'];

const Index = () => {
  const navigate = useNavigate();
  const [mesa, setMesa] = useState('');
  const [isMesaConfirmed, setIsMesaConfirmed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [carrinho, setCarrinho] = useState<typeof MENU_ITEMS>([]);
  const [observacao, setObservacao] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const { toast } = useToast();

  const handleConfirmMesa = (e: React.FormEvent) => {
    e.preventDefault();
    if (mesa.length > 0) {
      setIsMesaConfirmed(true);
      toast({ title: "Bem-vindo!", description: `Cardápio liberado para a mesa ${mesa}.` });
    }
  };

  const filteredItems = MENU_ITEMS.filter(item => {
    const matchesCategory = selectedCategory === 'Todas' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (item: typeof MENU_ITEMS[0]) => {
    setCarrinho(prev => [...prev, item]);
    toast({ title: "Adicionado!", description: `${item.name} no carrinho.`, duration: 1000 });
  };

  const removeFromCart = (indexToRemove: number) => {
    setCarrinho(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleFinalizarPedido = async () => {
    if (carrinho.length === 0) {
        return;
    }
    setIsSending(true);

    try {
      const listaDeItensString = carrinho.map(item => `1x ${item.name}`).join(' + ');

      await clienteApi.criarPedido({
        mesa: mesa, 
        descricao: listaDeItensString,
        obs: observacao
      });

      toast({
        title: "Pedido Enviado!",
        description: "A cozinha já recebeu seu pedido completo.",
        className: "bg-green-600 text-white"
      });

      setCarrinho([]);
      setObservacao('');
      setIsCartOpen(false);
      navigate(`/status?mesa=${mesa}`);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao enviar o pedido. Tente novamente.",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!isMesaConfirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pizza-pattern bg-cover p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <Card className="w-full max-w-md relative z-10 border-none shadow-2xl bg-white/95">
          <CardContent className="pt-6 pb-8 px-8 text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <UtensilsCrossed className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold text-gray-900">Pizza Pulse</h1>
            <p className="text-gray-500">Digite o número da sua mesa para começar</p>
            <form onSubmit={handleConfirmMesa} className="space-y-4">
              <Input
                type="number"
                placeholder="Número da Mesa"
                className="text-center text-2xl h-14"
                value={mesa}
                onChange={(e) => setMesa(e.target.value)}
                autoFocus
              />
              <Button type="submit" className="w-full h-12 text-lg font-semibold" disabled={!mesa}>
                Ver Cardápio
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24"> 
      <header className="sticky top-0 z-10 bg-white shadow-sm px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="font-display text-xl font-bold text-gray-900">Cardápio</h2>
            <p className="text-sm text-primary font-medium">Mesa {mesa}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsMesaConfirmed(false)}>
            Sair
          </Button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Buscar sabores..." className="pl-9 bg-gray-50 border-gray-200" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </header>

      <main className="p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileTap={{ scale: 0.98 }}>
            <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-0 flex h-32">
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <span className="font-bold text-primary">R$ {item.price.toFixed(2)}</span>
                    <Button size="sm" className="h-8 w-8 rounded-full p-0" onClick={() => addToCart(item)}>
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <div className="w-32 bg-muted flex items-center justify-center bg-gray-100">
                   <UtensilsCrossed className="text-gray-300 h-8 w-8" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </main>

      <AnimatePresence>
        {carrinho.length > 0 && (
          <div className="fixed bottom-6 left-0 right-0 px-4 z-50 flex justify-center">
             
             <div className="w-full max-w-md cursor-pointer" onClick={() => setIsCartOpen(true)}>
                <Button className="w-full h-14 rounded-full shadow-xl text-lg flex justify-between items-center px-6 pointer-events-none">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    <span>Ver Carrinho</span>
                  </div>
                  <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white">
                    {carrinho.length} itens
                  </Badge>
                </Button>
             </div>

             <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
               <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl flex flex-col">
                  <SheetHeader className="mb-4">
                    <SheetTitle className="flex items-center gap-2 text-2xl">
                        <ShoppingCart className="h-6 w-6 text-primary" /> 
                        Seu Pedido
                    </SheetTitle>
                    <SheetDescription>
                        Mesa {mesa}
                    </SheetDescription>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto px-1 space-y-4">
                    {carrinho.map((item, index) => (
                      <div key={`${item.id}-${index}`} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">R$ {item.price.toFixed(2)}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => removeFromCart(index)}>
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <SheetFooter className="mt-4 pb-4">
                    <div className="w-full space-y-6">
                      <div className="space-y-2">
                         <Label htmlFor="obs" className="flex items-center gap-2 text-gray-600">
                            <MessageSquare className="h-4 w-4" /> Observações do Pedido
                         </Label>
                         <Textarea 
                            id="obs" 
                            placeholder="Ex: Tira a cebola..." 
                            className="resize-none" 
                            rows={3} 
                            value={observacao} 
                            onChange={(e) => setObservacao(e.target.value)} 
                         />
                      </div>
                      <div className="flex justify-between items-center text-lg font-bold border-t pt-4">
                        <span>Total</span>
                        <span>R$ {carrinho.reduce((acc, item) => acc + item.price, 0).toFixed(2)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <SheetClose asChild><Button variant="outline" className="h-12">Adicionar Mais</Button></SheetClose>
                         <Button className="h-12 bg-green-600 hover:bg-green-700" onClick={handleFinalizarPedido} disabled={isSending}>
                            {isSending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</> : <>Enviar Pedido <ArrowRight className="ml-2 h-4 w-4" /></>}
                         </Button>
                      </div>
                    </div>
                  </SheetFooter>
               </SheetContent>
             </Sheet>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
