// src/reducers/authReducer.js

const initialState = {
  activeTeamMember: {},
  team: [],
  error: null, // NEW: to store team-related errors
};

const teamReducer = (state = initialState, action) => {
  switch (action.type) {
    case "CREATE_TASK_SUCCESS":
      return {
        ...state,
        activeTeamMember: {},
        error: null, // NEW: to store team-related errors
      };
    case "CREATE_TASK_FAILURE":
      return {
        ...state,
        error: action.payload, // store error message
      };

    case "GET_TEAM_MEMBERS_SUCCESS":
      return {
        ...state,
        activeTeamMember: {},
        team: action.payload.data,
        error: null, // NEW: to store team-related errors
      };
    case "GET_TEAM_MEMBERS_FAILURE":
      return {
        ...state,
        activeTeamMember: {},
        team: [],
        error: action.payload, // store error message
      };
    case "TEAM_RESET":
      return {
        ...state,
        activeTeamMember: {},
        team: [],
        error: null, // NEW: to store team-related errors
      };
    default:
      return state;
  }
};

export default teamReducer;
