// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import { thunk } from 'redux-thunk';
import authReducer from './reducers/authReducer';
import projectReducer from './reducers/projectReducer';

function saveToLocalStorage(state) {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('reduxState', serializedState);
  } catch (e) {
    console.warn('Could not save state', e);
  }
}

function loadFromLocalStorage() {
  try {
    const serializedState = localStorage.getItem('reduxState');
    const convertedState =  JSON.parse(serializedState);
    if (serializedState === null ) return undefined;
    if(convertedState.auth.isAuthenticated === false) return undefined;
    return convertedState
  } catch (e) {
    console.warn('Could not load state', e);
    return undefined;
  }
}

const persistedState = loadFromLocalStorage();

const store = configureStore({
  reducer: {
    auth: authReducer,  
    projects:projectReducer
  
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
  devTools: process.env.NODE_ENV !== 'production',
  preloadedState: persistedState, // ✅ Correct placement
});

store.subscribe(() => saveToLocalStorage(store.getState()));

export default store;
