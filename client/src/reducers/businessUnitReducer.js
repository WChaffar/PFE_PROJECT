// src/reducers/businessUnitReducer

const initialState = {
  activeBusinessUnit: {},
  businessUnit: [],
  error: null, // NEW: to store team-related errors
};

const businessUnitReducer = (state = initialState, action) => {
  switch (action.type) {
    case "CREATE_BU_SUCCESS":
      return {
        ...state,
        activeBusinessUnit: {},
        error: null, // NEW: to store team-related errors
      };
    case "CREATE_BU_FAILURE":
      return {
        ...state,
        error: action.payload, // store error message
      };
    case "GET_BU_SUCCESS":
      return {
        ...state,
        activeBusinessUnit: {},
        businessUnit: action.payload.data,
        error: null, // NEW: to store team-related errors
      };
    case "GET_BU_FAILURE":
      return {
        ...state,
        activeBusinessUnit: {},
        businessUnit: [],
        error: action.payload, // store error messageP
      };
    default:
      return state;
  }
};

export default businessUnitReducer;
