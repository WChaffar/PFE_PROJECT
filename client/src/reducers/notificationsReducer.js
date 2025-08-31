// src/reducers/businessUnitReducer

const initialState = {
  notifications: [],
  error: null, // NEW: to store team-related errors
};

const notificationsReducer = (state = initialState, action) => {
  switch (action.type) {
    case "CREATE_NOTIF_SUCCESS":
      return {
        ...state,
        notifications: {},
        error: null, // NEW: to store team-related errors
      };
    case "CREATE_NOTIF_FAILURE":
      return {
        ...state,
        error: action.payload, // store error message
      };
    case "GET_NOTIF_SUCCESS":
      return {
        ...state,
        notifications: action.payload.data,
        error: null, // NEW: to store team-related errors
      };
    case "GET_NOTIF_FAILURE":
      return {
        ...state,
        notificationss: [],
        error: action.payload, // store error messageP
      };

    default:
      return state;
  }
};

export default notificationsReducer;
