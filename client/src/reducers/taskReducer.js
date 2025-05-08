// src/reducers/authReducer.js

const initialState = {
    activeTask: {},
    tasks: [],
    error: null, // NEW: to store task-related errors
  };
  
  const taskReducer = (state = initialState, action) => {
    switch (action.type) {
      case "CREATE_TASK_SUCCESS":
        return {
          ...state,
          activeTask: {},
          error: null, // NEW: to store task-related errors
        };
      case "CREATE_TASK_FAILURE":
        return {
          ...state,
          error: action.payload, // store error message
        };
        case "GET_TASKS_BYPROJECTID_SUCCESS":
          return {
            ...state,
            activeTask: {},
            tasks: action.payload.data,
            error: null, // NEW: to store task-related errors
          };
        case "GET_TASKS_BYPROJECTID_FAILURE":
          return {
            ...state,
            error: action.payload, // store error message
          };
      case "RESET":
        return {
          ...state,
          activeTask: {},
          tasks: [],
          error: null, // NEW: to store task-related errors
        };
      default:
        return state;
    }
  };
  
  export default taskReducer;
  