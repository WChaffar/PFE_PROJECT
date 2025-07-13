// src/reducers/authReducer.js

const initialState = {
  activeAssignement: {},
  assignements: [],
  error: null, // NEW: to store project-related errors
};

const assignementReducer = (state = initialState, action) => {
  switch (action.type) {
    case "CREATE_ASSIGNEMENT_SUCCESS":
      return {
        ...state,
        activeAssignement: {},
        assignements: [...state.assignements, action.payload.data],
        error: null, // NEW: to store assignement-related errors
      };
    case "CREATE_ASSIGNEMENT_FAILURE":
      return {
        ...state,
        error: action.payload, // store error message
      };
    case "GET_EMP_ASSIGNEMENT_SUCCESS":
      return {
        ...state,
        activeAssignement: {},
        assignements: action.payload.data,
        error: null, // NEW: to store project-related errors
      };
    case "GET_EMP_ASSIGNEMENT_FAILURE":
      return {
        ...state,
        activeAssignement: {},
        assignements: [],
        error: action.payload, // store error message
      };
    case "GET_ALL_EMP_ASSIGNEMENTS_SUCCESS":
      return {
        ...state,
        activeAssignement: {},
        assignements: action.payload.data,
        error: null, // NEW: to store project-related errors
      };
    case "GET_ALL_EMP_ASSIGNEMENTS_FAILURE":
      return {
        ...state,
        activeAssignement: {},
        assignements: [],
        error: action.payload, // store error message
      };
    case "RESET_ASSIGNEMENT":
      return {
        ...state,
        activeAssignement: {},
        assignements: [],
        error: null, // NEW: to store project-related errors
      };
    case "RESET_ASSIGNEMENT_ERROR":
      return {
        ...state,
        error: null, // NEW: to store project-related errors
      };
    default:
      return state;
  }
};

export default assignementReducer;
