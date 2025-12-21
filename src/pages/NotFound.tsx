import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Pizza, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative text-center max-w-md"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="inline-block mb-6"
        >
          <Pizza className="h-24 w-24 text-primary" />
        </motion.div>

        <h1 className="font-display text-6xl font-bold text-foreground mb-4">
          404
        </h1>
        <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
          Ops! Pizza não encontrada
        </h2>
        <p className="text-muted-foreground mb-8">
          Parece que esta página saiu do forno antes da hora. Que tal voltar para o cardápio?
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild size="lg" className="gap-2 w-full sm:w-auto">
            <Link to="/">
              <Home className="h-4 w-4" />
              Ir para o Cardápio
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="gap-2 w-full sm:w-auto"
          >
            <Link to="/status">
              <ArrowLeft className="h-4 w-4" />
              Acompanhar Pedido
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
