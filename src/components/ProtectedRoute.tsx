import { useEffect } from "react";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { loginRequest } from "@/config/authConfig";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { instance, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    // REGRA DE OURO: Só redirecionar se o MSAL terminou de trabalhar (None)
    // e o usuário realmente não estiver logado.
    if (inProgress === InteractionStatus.None && !isAuthenticated) {
      instance.loginRedirect(loginRequest);
    }
  }, [inProgress, isAuthenticated, instance]);

  // Enquanto o MSAL estiver carregando (Startup, HandleRedirect, etc),
  // mostramos um Loading em vez de redirecionar ou renderizar a tela.
  if (inProgress !== InteractionStatus.None) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Validando credenciais...</p>
        </div>
      </div>
    );
  }

  // Se terminou de carregar e está autenticado, libera o acesso.
  // Se não estiver autenticado, o useEffect lá em cima já disparou o redirect.
  return isAuthenticated ? children : null;
};
