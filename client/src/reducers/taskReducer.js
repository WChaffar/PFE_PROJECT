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

    case "GET_TASKS_BYMANAGERID_SUCCESS":
      return {
        ...state,
        activeTask: {},
        tasks: action.payload.data,
        error: null, // NEW: to store task-related errors
      };
    case "GET_TASKS_BYMANAGERID_FAILURE":
      return {
        ...state,
        error: action.payload, // store error message
      };
    case "GET_TASK_By_ID_SUCCESS":
      return {
        ...state,
        activeTask: action.payload.data,
        error: null, // NEW: to store task-related errors
      };
    case "GET_TASK_By_ID__FAILURE":
      return {
        ...state,
        error: action.payload, // store error message
      };
    case "DELETE_TASK_By_ID_SUCCESS":
      return {
        ...state,
        tasks: state.tasks.filter((t) => t._id !== action.payload.data._id),
        error: null, // NEW: to store task-related errors
      };
    case "DELETE_TASK_By_ID__FAILURE":
      return {
        ...state,
        error: action.payload, // store error message
      };
    case "EDIT_TASK_SUCCESS":
      return {
        ...state,
        activeTask: action.payload.data.data,
        error: null, // NEW: to store task-related errors
      };
    case "EDIT_TASK_FAILURE":
      return {
        ...state,
        error: action.payload, // store error message
      };

    case "RESET_TASKS_STATE":
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
