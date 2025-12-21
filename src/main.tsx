import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { msalInstance } from './lib/msalClient'; 
import { MsalProvider } from '@azure/msal-react';

// Inicializa o MSAL
msalInstance.initialize().then(async () => {
  
  // === A CORREÇÃO ESTÁ AQUI ===
  // Processa a resposta do redirecionamento (Pega o Token que veio da Microsoft)
  const response = await msalInstance.handleRedirectPromise().catch(console.error);
  
  // Se veio token, define a conta ativa imediatamente
  if (response?.account) {
    msalInstance.setActiveAccount(response.account);
  } else {
    // Se não veio de redirect, tenta pegar a conta que já estava logada antes
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      msalInstance.setActiveAccount(accounts[0]);
    }
  }

  // Só carrega o App DEPOIS de processar tudo acima
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
    </React.StrictMode>,
  );
});
