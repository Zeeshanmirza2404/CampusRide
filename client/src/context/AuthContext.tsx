import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import API from "../services/api";

interface User {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  role: "rider" | "driver" | "both";
  college?: string;
}

interface AuthResult {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (userData: Record<string, string>) => Promise<AuthResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("campusride_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await API.post("/auth/login", { email, password });
      
      if (response.data.success) {
        const userData = response.data.user;
        const token = response.data.token;
        
        setUser(userData);
        localStorage.setItem("campusride_user", JSON.stringify(userData));
        localStorage.setItem("campusride_token", token);
        
        return { success: true, message: response.data.message };
      }
      
      return {
        success: false,
        message: response.data.message || "Login failed",
      };
    } catch (err: any) {
      console.error("[AuthContext Login Error]:", err);
      return {
        success: false,
        message: err.response?.data?.message || err.response?.data?.error || "Invalid email or password",
      };
    }
  };

  const signup = async (userData: Record<string, string>): Promise<AuthResult> => {
    try {
      const response = await API.post("/auth/signup", userData);
      
      if (response.data.success) {
        const userDataResponse = response.data.user;
        const token = response.data.token;
        
        setUser(userDataResponse);
        localStorage.setItem("campusride_user", JSON.stringify(userDataResponse));
        localStorage.setItem("campusride_token", token);
        
        return { success: true, message: response.data.message };
      }
      
      return {
        success: false,
        message: response.data.message || "Signup failed",
      };
    } catch (err: any) {
      console.error("[AuthContext Signup Error]:", err);
      return {
        success: false,
        message: err.response?.data?.message || err.response?.data?.error || "Signup failed",
      };
    }
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem("campusride_user");
    localStorage.removeItem("campusride_token");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated: !!user, login, signup, logout }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
