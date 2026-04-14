import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("campusride_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
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
    } catch (err) {
      console.error("[AuthContext Login Error]:", err);
      return {
        success: false,
        message: err.response?.data?.message || err.response?.data?.error || "Invalid email or password",
      };
    }
  };

  const signup = async (userData) => {
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
    } catch (err) {
      console.error("[AuthContext Signup Error]:", err);
      return {
        success: false,
        message: err.response?.data?.message || err.response?.data?.error || "Signup failed",
      };
    }
  };

  const logout = () => {
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
