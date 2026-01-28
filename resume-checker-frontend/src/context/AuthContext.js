// src/context/AuthContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import Cookies from 'js-cookie';
import { authService } from '../services/authServices';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
    error: null
  });

  useEffect(() => {
    const token = Cookies.get('authToken');
    if (token) {
      authService.getProfile()
        .then(user => {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, token }
          });
        })
        .catch(() => {
          Cookies.remove('authToken');
          dispatch({ type: 'AUTH_ERROR', payload: 'Invalid token' });
        });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // Clear any existing token before attempting login
      Cookies.remove('authToken');
      
      const response = await authService.login(credentials);
      const user = await authService.getProfile();
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token: response.token }
      });
      return { success: true };
    } catch (error) {
      console.log('AuthContext login error:', error);
      console.log('Error response:', error.response);
      console.log('Error data:', error.response?.data);
      
      // Clear any token that might have been set
      Cookies.remove('authToken');
      
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      const errorField = error.response?.data?.field || null;
      
      dispatch({ type: 'SET_LOADING', payload: false });
      
      return { 
        success: false, 
        error: errorMessage,
        field: errorField
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log('Registering user with data:', userData);
      const response = await authService.register(userData);
      console.log('Registration successful:', response);
      return { success: true };
    } catch (error) {
      console.log('Registration error:', error);
      console.log('Error response:', error.response);
      console.log('Error data:', error.response?.data);
      
      // Format error message for display
      let errorMessage = 'Registration failed. Please try again.';
      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (typeof data === 'object') {
          // Handle Django REST framework validation errors
          const errors = [];
          for (const [key, value] of Object.entries(data)) {
            if (Array.isArray(value)) {
              errors.push(`${key}: ${value.join(', ')}`);
            } else {
              errors.push(`${key}: ${value}`);
            }
          }
          errorMessage = errors.join('\n');
        }
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};