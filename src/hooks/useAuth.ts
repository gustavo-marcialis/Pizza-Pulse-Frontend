import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { loginRequest } from '@/config/authConfig';
import { AccountInfo } from '@azure/msal-browser';

export type UserRole = 'Pizzaiolo' | 'Garcom' | 'Guest';

interface AuthState {
  isAuthenticated: boolean;
  user: AccountInfo | null;
  role: UserRole;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isPizzaiolo: boolean;
  isGarcom: boolean;
}

export function useAuth(): AuthState {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const user = accounts[0] || null;

  const getRoleFromClaims = (): UserRole => {
    if (!user) return 'Guest';
    
    const claims = user.idTokenClaims as Record<string, unknown> | undefined;
    const roles = claims?.roles as string[] | undefined;
    
    if (roles?.includes('Pizzaiolo')) return 'Pizzaiolo';
    if (roles?.includes('Garcom')) return 'Garcom';
    
    return isAuthenticated ? 'Pizzaiolo' : 'Guest';
  };

  const role = getRoleFromClaims();

  const login = async () => {
    try {
      await instance.loginPopup(loginRequest);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await instance.logoutPopup({
        postLogoutRedirectUri: window.location.origin,
      });
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  return {
    isAuthenticated,
    user,
    role,
    login,
    logout,
    isPizzaiolo: role === 'Pizzaiolo',
    isGarcom: role === 'Garcom',
  };
}