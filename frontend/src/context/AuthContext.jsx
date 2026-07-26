// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLoggedIn();
  }, []);

  const checkLoggedIn = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(data);
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Direct User State Updater Function
  const updateUserState = (updatedUserData) => {
    setUser((prev) => ({ ...prev, ...updatedUserData }));
  };

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (data.token) {
        localStorage.setItem('token', data.token);
        setUser(data);
        toast.success(`Welcome back, ${data.name || 'User'}!`);
        return true;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        checkLoggedIn,
        updateUserState, // Expose updater to Dashboard
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;