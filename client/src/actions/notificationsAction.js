// src/actions/taskAction.js
import { useNavigate } from "react-router-dom";
import NotificationService from "../services/notificationsService";

// create Business Unit
export const createNotification = (values) => async (dispatch) => {
  try {
    const data = await NotificationService.createNotification(values);
    dispatch({
      type: "CREATE_NOTIF_SUCCESS",
      payload: { data },
    });
    return { success: true }; // ✅ return success
  } catch (error) {
    dispatch({
      type: "CREATE_NOTIF_FAILURE",
      payload: error.response?.data?.message || "Create Business Unit failed",
    });
    return { success: false }; // ✅ return failure
  }
};

// get NOTIF
export const getAllNotifications = (values) => async (dispatch) => {
  try {
    const data = await NotificationService.getAllNotifications();
    dispatch({
      type: "GET_NOTIF_SUCCESS",
      payload: { data },
    });
    return { success: true }; // ✅ return success
  } catch (error) {
    dispatch({
      type: "GET_NOTIF_FAILURE",
      payload: error.response?.data?.message || "get Notifications failed",
    });
    return { success: false }; // ✅ return failure
  }
};
