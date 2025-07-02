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
    case "EDIT_BUSINESS_UNIT_SUCCESS":
      return {
        ...state,
        businessUnit: state.businessUnit.map((b) => {
          if (b._id === action.payload.data.data._id) {
            return action.payload.data.data;
          } else {
            return b;
          }
        }),
        error: null, // NEW: to store project-related errors
      };
    case "EDIT_BUSINESS_UNIT_FAILURE":
      return {
        ...state,
        error: action.payload, // store error message
      };

    case "GET_BUSINESS_UNIT_BY_ID_SUCCESS":
      return {
        ...state,
        activeBusinessUnit: action.payload.data,
        error: null, // NEW: to store team-related errors
      };
    case "GET_BUSINESS_UNIT_BY_ID_FAILURE":
      return {
        ...state,
        error: action.payload, // store error message
      };
    case "DELETE_BUSINESS_UNIT_BY_ID_SUCCESS":
      return {
        ...state,
        businessUnit: state.businessUnit.filter((b) => b._id !== action.payload.data._id),
        error: null, // NEW: to store team-related errors
      };
    case "DELETE_BUSINESS_UNIT_BY_ID_FAILURE":
      return {
        ...state,
        error: action.payload, // store error message
      };

    default:
      return state;
  }
};

export default businessUnitReducer;
