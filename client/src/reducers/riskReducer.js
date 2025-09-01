// src/reducers/businessUnitReducer

const initialState = {
  risks: [],
  error: null, // NEW: to store team-related errors
};

const risksReducer = (state = initialState, action) => {
  switch (action.type) {
    case "GET_RISKS_SUCCESS":
      return {
        ...state,
        risks: action.payload.data,
        error: null, // NEW: to store team-related errors
      };
    case "GET_RISKS_FAILURE":
      return {
        ...state,
        risks: [],
        error: action.payload, // store error messageP
      };
    default:
      return state;
  }
};

export default risksReducer;
