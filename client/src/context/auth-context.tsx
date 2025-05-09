import { createContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check for token in localStorage
    const storedToken = localStorage.getItem("auth_token");
    
    if (storedToken) {
      setToken(storedToken);
      // Fetch user data with the token
      fetchUserData(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);
  
  const fetchUserData = async (authToken: string) => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        credentials: "include",
      });
      
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        // If token is invalid, clear it
        logout();
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };
  
  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("auth_token", authToken);
  };
  
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
    // Clear any user-related queries from cache
    queryClient.invalidateQueries({
      predicate: (query) => 
        query.queryKey[0] === "/api/auth/me" || 
        query.queryKey[0] === "/api/cart" ||
        query.queryKey[0] === "/api/orders"
    });
  };
  
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };
  
  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";
  
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
