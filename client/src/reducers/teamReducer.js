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
    case "GET_ONE_TEAM_MEMBER_SUCCESS":
      return {
        ...state,
        activeTeamMember: action.payload.data,
        error: null, // NEW: to store team-related errors
      };
    case "GET_ONE_TEAM_MEMBER_FAILURE":
      return {
        ...state,
        activeTeamMember: {},
        error: action.payload, // store error message
      };
    case "DELETE_TEAM_MEMBER_SUCCESS":
      return {
        ...state,
        activeTeamMember: {},
        team: state.team.filter(
          (e) => e._id !== action.payload.data._id
        ),
        error: null, // NEW: to store project-related errors
      };
    case "DELETE_TEAM_MEMBER_FAILURE":
      return {
        ...state,
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
