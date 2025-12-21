# Pizza Pulse - Frontend

O **Pizza Pulse** é uma aplicação web moderna para gestão de pedidos de pizzaria, desenvolvida para integrar o fluxo entre Clientes (Cardápio Digital), Garçons (Gestão de Pedidos) e Cozinha (Controle de Produção).

[Ver Ao Vivo](https://pizza-pulse-front.vercel.app)

Este é o Front-End que se conecta com a API [Pizza Pulse Backend](https://github.com/gustavo-marcialis/Pizza-Pulse-Backend)

A aplicação utiliza autenticação segura via **Microsoft Entra ID (Azure AD)** e segue as melhores práticas de segurança para Single Page Applications (SPA), alinhada com conceitos de governança e identidade (SC-900).

---

## Tecnologias Utilizadas

* **Framework:** [React](https://react.dev/) + [Vite](https://vitejs.dev/)
* **Linguagem:** TypeScript
* **Estilização:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
* **Autenticação:** [MSAL Browser](https://github.com/AzureAD/microsoft-authentication-library-for-js) (Microsoft Authentication Library)
* **HTTP Client:** Axios (com interceptors para injeção de tokens)
* **Deploy:** Vercel (CI/CD)

---

## Configuração de Segurança (Azure AD)

Este projeto utiliza o fluxo **OAuth 2.0 Authorization Code com PKCE**, ideal para SPAs. Não há "Client Secrets" ou credenciais sensíveis armazenadas no código frontend.

### Pré-requisitos no Microsoft Entra ID (Azure Portal)

1.  **Registrar Aplicativo:** Crie um novo registro de app (ex: "Pizza Pulse").
2.  **Plataforma:** Adicione uma plataforma "Single-page application" (SPA).
3.  **Redirect URIs (Essencial):**
    * `http://localhost:5173` (Para desenvolvimento local)
    * `https://seu-projeto.vercel.app` (URL de Produção)
    * `https://seu-projeto-git-develop-usuario.vercel.app` (URLs de Branch/Preview)
4.  **API Permissions:** Conceda permissão delegada para a API Backend (ex: `Pizza.Read`).

---

## Instalação e Execução Local

Siga estes passos para rodar o projeto na sua máquina:

### 1. Clonar o repositório
git clone https://github.com/seu-usuario/pizza-pulse-frontend.git
cd pizza-pulse-frontend

### 2. Instalar dependências
npm install
# ou
bun install

### 3. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto. Você pode usar o `.env.example` como base ou copiar o modelo abaixo:

# Identificação do Aplicativo (Azure AD)
VITE_AZURE_CLIENT_ID=seu-client-id-aqui
VITE_AZURE_TENANT_ID=seu-tenant-id-aqui

# Configuração da API Backend e Escopos
VITE_API_SCOPE=api://seu-client-id/Pizza.Read
VITE_API_BASE_URL=https://pizzaria-api-exemplo.azurewebsites.net

### 4. Rodar o projeto
npm run dev

O app estará disponível em `http://localhost:5173`.

---

## Deploy na Vercel

O projeto está otimizado para deploy contínuo na Vercel.

### Passo a Passo:
1.  Importe o projeto do GitHub para a Vercel.
2.  **Configuração de Build:**
    * Framework Preset: **Vite**
    * Build Command: `npm run build`
    * Output Directory: `dist`
3.  **Variáveis de Ambiente (Obrigatório):**
    Vá em **Settings > Environment Variables** no painel da Vercel e adicione as mesmas chaves do seu `.env` local:
    * `VITE_AZURE_CLIENT_ID`
    * `VITE_AZURE_TENANT_ID`
    * `VITE_API_SCOPE`
    * `VITE_API_BASE_URL`
4.  Faça o Deploy.

> **Importante:** Se você configurar as variáveis *após* o primeiro deploy falhar, é necessário ir em **Deployments**, clicar nos três pontos e selecionar **Redeploy** para que as variáveis sejam injetadas no novo build.

---

## Estrutura do Projeto

* **`src/config/authConfig.ts`**: Configuração central do MSAL. Gerencia a leitura segura de variáveis de ambiente e define os escopos de permissão. Possui fallback para evitar crash da aplicação se as variáveis faltarem.
* **`src/services/api.ts`**: Camada de serviço para comunicação HTTP.
    * **Interceptor de Segurança:** Verifica automaticamente se há uma conta ativa no MSAL.
    * **Aquisição de Token:** Obtém o token de acesso (Bearer) silenciosamente e o anexa ao cabeçalho `Authorization` para rotas protegidas.
    * **Tratamento de Dados:** Normaliza os dados vindos do backend (ex: converte status `Na fila` para `Recebido`).
* **`src/pages/Index.tsx`**: Interface do Cardápio Digital (Pública). Permite criar pedidos sem login.
* **`src/pages/Dashboard.tsx`**: Painel de Controle (Protegido). Exibe pedidos com permissões diferenciadas para **Garçom** (Edição) e **Cozinha/Pizzaiolo** (Status).
* **`src/components/ProtectedRoute.tsx`**: Wrapper de segurança que redireciona usuários não autenticados para o login do Microsoft Entra.

---

## Governança e Segurança (Conceitos SC-900)

Esta aplicação implementa princípios fundamentais de segurança:

1.  **Zero Trust (Confiança Zero):** Não confiamos implicitamente na sessão local. O token de acesso é validado e renovado a cada requisição importante através do interceptor do Axios.
2.  **Least Privilege (Menor Privilégio):** O Frontend solicita apenas os escopos estritamente necessários (`User.Read` para perfil, `Pizza.Read` para operação), garantindo que o token não tenha poderes excessivos.
3.  **Segurança de Credenciais:** Nenhuma senha, segredo de cliente (client secret) ou chave de API estática é armazenada no código fonte. As configurações de identidade são injetadas via variáveis de ambiente (`.env`) apenas no momento do build (CI/CD).

---
