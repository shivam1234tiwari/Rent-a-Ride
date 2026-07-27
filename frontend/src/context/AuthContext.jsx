import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const RAW_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_URL = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL.replace(/\/+$/, '')}/api`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const { data } = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(data);
      }
    } catch (error) {
      console.error('Error verifying session:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      setUser(data.user || data);
      toast.success('Logged in successfully!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const register = async (formData) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/register`, formData);
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      setUser(data.user || data);
      toast.success('Account created successfully!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully!');
  };

  const updateUserState = (updatedUserData) => {
    setUser((prev) => ({
      ...prev,
      ...updatedUserData
    }));
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        login, 
        register, 
        signup: register, // Alias mapped for maximum safety
        logout, 
        updateUserState 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      loading: false,
      login: async () => false,
      register: async () => false,
      signup: async () => false,
      logout: () => {},
      updateUserState: () => {},
    };
  }
  return context;
};

export default AuthContext;