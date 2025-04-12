// src/actions/authActions.js

import authService from '../services/auth.service';

// LOGIN
export const login = ({email, password}) => async (dispatch) => {
  try {
    const data = await authService.login(email, password);
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: { user: data, token: data.token },
    });
    // Optionnel : stocker dans localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
  } catch (error) {
    dispatch({
      type: 'LOGIN_FAILURE',
      payload: error.response?.data?.message || 'Erreur de connexion',
    });
  }
};

// LOGOUT
export const logout = () => (dispatch) => {
  authService.logout();
  dispatch({ type: 'LOGOUT' });
};

// RESET
export const resetState = () => (dispatch) => {
  dispatch({ type: 'RESET' });
};

// REGISTER
export const register = (userData) => async (dispatch) => {
  try {
    const data = await authService.register(userData);
    // Tu peux connecter automatiquement après inscription si tu veux
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: { user: data.user, token: data.token },
    });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  } catch (error) {
    dispatch({
      type: 'LOGIN_FAILURE',
      payload: error.response?.data?.message || "Erreur d'inscription",
    });
  }
};
