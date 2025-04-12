// src/reducers/authReducer.js

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  error: null, // NEW: to store auth-related errors
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null, // clear error on success
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload, // store error message
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null, // clear error on logout
      };
      case 'RESET':
        return {
          ...state,
          isAuthenticated: false,
          user: null,
          token: null,
          error: null, // clear error on logout
        };
    default:
      return state;
  }
};

export default authReducer;
