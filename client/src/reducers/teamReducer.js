// src/reducers/authReducer.js

const initialState = {
  activeTeamMember: {},
  team: [],
  error: null, // NEW: to store team-related errors
};

const teamReducer = (state = initialState, action) => {
  switch (action.type) {
    case "CREATE_TEAM_MEMBER_SUCCESS":
      return {
        ...state,
        activeTeamMember: {},
        error: null, // NEW: to store team-related errors
      };
    case "CREATE_TEAM_MEMBER_FAILURE":
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
        team: state.team.filter((e) => e._id !== action.payload.data._id),
        error: null, // NEW: to store project-related errors
      };
    case "DELETE_TEAM_MEMBER_FAILURE":
      return {
        ...state,
        error: action.payload, // store error message
      };
    case "EDIT_TEAM_MEMBER_SUCCESS":
      return {
        ...state,
        activeTeamMember: action.payload.data.data,
        error: null, // NEW: to store project-related errors
      };
    case "EDIT_TEAM_MEMBER_FAILURE":
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
    case "EDIT_TEAM_MEMBER_BU_SUCCESS":
      return {
        ...state,
        team: state.team.map((t) => {
          if (t._id === action.payload.data.data._id) {
            return action.payload.data.data;
          } else {
            return t;
          }
        }),
        error: null, // NEW: to store project-related errors
      };
    case "EDIT_TEAM_MEMBER_BU_FAILURE":
      return {
        ...state,
        error: action.payload, // store error message
      };

    case "EDIT_TEAM_MEMBER_VALIDATION_SUCCESS":
      return {
        ...state,
        team: state.team.map((t) => {
          if (t._id === action.payload.data.data._id) {
            return action.payload.data.data;
          } else {
            return t;
          }
        }),
        error: null, // NEW: to store project-related errors
      };
    case "EDIT_TEAM_MEMBER_VALIDATION_FAILURE":
      return {
        ...state,
        error: action.payload, // store error message
      };
    default:
      return state;
  }
};

export default teamReducer;
