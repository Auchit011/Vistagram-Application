import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios,{ AxiosStatic }  from 'axios';
axios.defaults.baseURL=import.meta.env.VITE_BASE_URL;
interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  profilePic?: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
  isPrivate: boolean;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isLoading: boolean;
  axios: AxiosStatic;
  backendURL:string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const backendURL = import.meta.env.VITE_BASE_URL ;

  useEffect(() => {
    // Check for existing token on app load
    const savedToken = localStorage.getItem('vistagram_token');
    const savedUser = localStorage.getItem('vistagram_user');
    console.log(savedUser)
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    
    setIsLoading(false);
  }, []);

  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('vistagram_token', newToken);
    localStorage.setItem('vistagram_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('vistagram_token');
    localStorage.removeItem('vistagram_user');
  };

  const value = {
    user,
    token,
    login,
    logout,
    isLoading,
    axios,
    backendURL
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};