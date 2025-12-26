import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { msalInstance } from './lib/msalClient'; 
import { MsalProvider } from '@azure/msal-react';

msalInstance.initialize().then(async () => {
  
  const response = await msalInstance.handleRedirectPromise().catch(console.error);
  
  if (response?.account) {
    msalInstance.setActiveAccount(response.account);
  } else {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      msalInstance.setActiveAccount(accounts[0]);
    }
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
    </React.StrictMode>,
  );
});