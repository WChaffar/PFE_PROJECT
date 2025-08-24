// src/reducers/authReducer.js

const initialState = {
  activeAssignement: {},
  assignements: [],
  assignementRecommendation: {},
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
    case "UPDATE_ASSIGNEMENT_TIME_ENTRY_SUCCESS":
      return {
        ...state,
      };
    case "UPDATE_ASSIGNEMENT_TIME_ENTRY_FAILURE":
      return {
        ...state,
        error: action.payload, // store error message
      };
    case "UPDATE_ASSIGNEMENT_TIME_ENTRIES_SUCCESS":
      return {
        ...state,
      };
    case "UPDATE_ASSIGNEMENT_TIME_ENTRIES_FAILURE":
      return {
        ...state,
        error: action.payload, // store error message
      };
    case "RESET_ASSIGNEMENT":
      return {
        ...state,
        activeAssignement: {},
        assignements: [],
        assignementRecommendation: {},
        error: null, // NEW: to store project-related errors
      };
    case "RESET_ASSIGNEMENT_ERROR":
      return {
        ...state,
        error: null, // NEW: to store project-related errors
      };
    case "UPDATE_ASSIGNEMENT_SUCCESS":
      return {
        ...state,
        activeAssignement: {},
        assignements: [
          ...state.assignements.filter(
            (a) => a._id !== action.payload.data._id
          ),
          action.payload.data,
        ],
        error: null, // NEW: to store assignement-related errors
      };
    case "UPDATE_ASSIGNEMENT_FAILURE":
      return {
        ...state,
        error: action.payload, // store error message
      };
    case "DELETE_ASSIGNEMENT_SUCCESS":
      return {
        ...state,
        activeAssignement: {},
        assignements: state.assignements.filter(
          (a) => a._id !== action.payload.data._id
        ),
        error: null, // NEW: to store assignement-related errors
      };
    case "DELETE_ASSIGNEMENT_FAILURE":
      return {
        ...state,
        error: action.payload, // store error message
      };
    case "GET_ASSIGNEMENT_RECOMMENDATION_SUCCESS":
      return {
        ...state,
        assignementRecommendation: action.payload,
        error: null, // NEW: to store assignement-related errors
      };
    case "GET_ASSIGNEMENT_RECOMMENDATION_FAILURE":
      return {
        ...state,
        error: action.payload, // store error message
      };
    default:
      return state;
  }
};

export default assignementReducer;
