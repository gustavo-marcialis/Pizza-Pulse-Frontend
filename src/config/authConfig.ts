import { Configuration, PopupRequest } from "@azure/msal-browser";

const clientId = import.meta.env.VITE_AZURE_CLIENT_ID;
const tenantId = import.meta.env.VITE_AZURE_TENANT_ID;
const apiScope = import.meta.env.VITE_API_SCOPE;
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const msalConfig: Configuration = {
    auth: {
        clientId: clientId,
        authority: `https://login.microsoftonline.com/${tenantId}`,
        redirectUri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: false,
    }
};

export const loginRequest: PopupRequest = {
    scopes: ["User.Read"]
};

export const tokenRequest = {
    scopes: [apiScope]
};

export const apiConfig = {
    baseUrl: apiBaseUrl
};