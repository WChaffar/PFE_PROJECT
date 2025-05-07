// src/reducers/authReducer.js

const initialState = {
    activeProject:{},
    projects:[],
    error: null, // NEW: to store project-related errors
  };
  
  const projectReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'CREATE_PROJECT_SUCCESS':
        return {
          ...state,
          activeProject:{},
          projects:[...state.projects,action.payload.data],
          error: null, // NEW: to store project-related errors
        };
      case 'CREATE_PROJECT_FAILURE':
        return {
          ...state,
          activeProject:{},
          projects:[],
          error: action.payload, // store error message
        };
      case 'GET_PROJECTS_SUCCESS':
          return {
            ...state,
            activeProject:{},
            projects:action.payload.data,
            error: null, // NEW: to store project-related errors
          };
      case 'GET_PROJECTS_FAILURE':
            return {
              ...state,
              activeProject:{},
              projects:[],
              error: action.payload, // store error message
           };
        case 'RESET':
          return {
            ...state,
            activeProject:{},
            projects:[],
            error: null, // NEW: to store project-related errors
          };
      default:
        return state;
    }
  };
  
  export default projectReducer;
  