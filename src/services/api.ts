import axios from 'axios';
import { msalInstance } from '../lib/msalClient'; 
import { tokenRequest, apiConfig } from '../config/authConfig'; // Importe o apiConfig

// URL da API vindo da configuração centralizada
const API_URL = apiConfig.baseUrl;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ... (Resto do código do interceptor e funções continua igual)
// ...
