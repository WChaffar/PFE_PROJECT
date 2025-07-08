// src/actions/absenceAction.js

import { useNavigate } from "react-router-dom";
import AbsenceService from "../services/absenceService";

// create Absence
export const createAbsence = (values) => async (dispatch) => {
  try {
    const data = await AbsenceService.createAbsence(values);
    dispatch({
      type: "CREATE_ABSENCE_SUCCESS",
      payload: { data },
    });
    return { success: true }; // ✅ return success
  } catch (error) {
    dispatch({
      type: "CREATE_ABSENCE_FAILURE",
      payload: error.response?.data?.message || "Create Absence failed",
    });
    return { success: false }; // ✅ return failure
  }
};



// get Absences
export const getMyAbsences = () => async (dispatch) => {
  try {
    const data = await AbsenceService.getMyAbsences();
    dispatch({
      type: "GET_My_ABSENCES_SUCCESS",
      payload: { data },
    });
    return { success: true }; // ✅ return success
  } catch (error) {
    dispatch({
      type: "GET_My_ABSENCES_FAILURE",
      payload: error.response?.data?.message || "Get Absences failed",
    });
    return { success: false }; // ✅ return failure
  }
};

// create Absence
export const getAbsenceByID = (absenceId) => async (dispatch) => {
  try {
    const data = await AbsenceService.getAbsenceByID(absenceId);
    dispatch({
      type: "GET_ABSENCE_BY_ID_SUCCESS",
      payload: { data },
    });
    return { success: true }; // ✅ return success
  } catch (error) {
    dispatch({
      type: "GET_ABSENCE_BY_ID_FAILURE",
      payload: error.response?.data?.message || "Get Absence by id failed",
    });
    return { success: false }; // ✅ return failure
  }
};

// create Absence
export const updateAbsenceByID = (absenceId,values) => async (dispatch) => {
  try {
    const data = await AbsenceService.updateAbsenceByID(absenceId,values);
    dispatch({
      type: "UPDATE_ABSENCE_BY_ID_SUCCESS",
      payload: { data },
    });
    return { success: true }; // ✅ return success
  } catch (error) {
    dispatch({
      type: "UPDATE_ABSENCE_BY_ID_FAILURE",
      payload: error.response?.data?.message || "Update Absence by id failed",
    });
    return { success: false }; // ✅ return failure
  }
};

// create Absence
export const deleteAbsenceByID = (absenceId) => async (dispatch) => {
  try {
    const data = await AbsenceService.deleteAbsenceByID(absenceId);
    dispatch({
      type: "DELETE_ABSENCE_BY_ID_SUCCESS",
      payload: { data },
    });
    return { success: true }; // ✅ return success
  } catch (error) {
    dispatch({
      type: "DELETE_ABSENCE_BY_ID_FAILURE",
      payload: error.response?.data?.message || "Delete Absence by id failed",
    });
    return { success: false }; // ✅ return failure
  }
};


// Reset
export const resetAbsenceState = (values) => async (dispatch) => {
  dispatch({
    type: "RESET_ABSENCE_STATE",
  });
};
