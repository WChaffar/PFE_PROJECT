// src/reducers/businessUnitReducer

const initialState = {
  activeAbsence: {},
  absences: [],
  error: null, // NEW: to store team-related errors
};

const absenceReducer = (state = initialState, action) => {
  switch (action.type) {
    case "CREATE_ABSENCE_SUCCESS":
      return {
        ...state,
        activeAbsence: {},
        error: null, // NEW: to store team-related errors
      };
    case "CREATE_ABSENCE_FAILURE":
      return {
        ...state,
        error: action.payload, // store error message
      };
    case "GET_My_ABSENCES_SUCCESS":
      return {
        ...state,
        activeAbsence: {},
        absences: action.payload.data,
        error: null, // NEW: to store team-related errors
      };
    case "GET_My_ABSENCES_FAILURE":
      return {
        ...state,
        activeAbsence: {},
        absences: [],
        error: action.payload, // store error messageP
      };
    case "GET_ABSENCE_BY_ID_SUCCESS":
      return {
        ...state,
        activeAbsence: action.payload.data,
        error: null, // NEW: to store team-related errors
      };
    case "GET_ABSENCE_BY_ID_FAILURE":
      return {
        ...state,
        activeAbsence: {},
        absences: [],
        error: action.payload, // store error messageP
      };
    case "UPDATE_ABSENCE_BY_ID_SUCCESS":
      return {
        ...state,
        activeAbsence: action.payload.data.data,
        error: null, // NEW: to store project-related errors
      };
    case "UPDATE_ABSENCE_BY_ID_FAILURE":
      return {
        ...state,
        error: action.payload, // store error message
      };
    case "DELETE_ABSENCE_BY_ID_SUCCESS":
      return {
        ...state,
        absences: state.absences.filter(
          (a) => a._id !== action.payload.data._id
        ),
        error: null, // NEW: to store task-related errors
      };
    case "DELETE_ABSENCE_BY_ID_FAILURE":
      return {
        ...state,
        error: action.payload, // store error message
      };
    case "GET_EMPLOYEE_ABSENCES_BYID_SUCCESS":
      return {
        ...state,
        activeAbsence: {},
        absences: action.payload.data,
        error: null, // NEW: to store team-related errors
      };
    case "GET_EMPLOYEE_ABSENCES_BYID_FAILURE":
      return {
        ...state,
        activeAbsence: {},
        absences: [],
        error: action.payload, // store error messageP
      };
    case "GET_EMPLOYEE_ABSENCES_FOR_MANAGER_SUCCESS":
      return {
        ...state,
        activeAbsence: {},
        absences: action.payload.data,
        error: null, // NEW: to store team-related errors
      };
    case "GET_EMPLOYEE_ABSENCES_FOR_MANAGER_FAILURE":
      return {
        ...state,
        activeAbsence: {},
        absences: [],
        error: action.payload, // store error messageP
      };
    case "RESET_ABSENCE_STATE":
      return {
        ...state,
        activeAbsence: {},
        absences: [],
        error: null, // store error messageP
      };
    default:
      return state;
  }
};

export default absenceReducer;
