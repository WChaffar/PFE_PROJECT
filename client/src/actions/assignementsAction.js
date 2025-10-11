// src/actions/taskAction.js

import AssignementService from "../services/assignementsService";
import { useNavigate } from "react-router-dom";
import { detectOverchargeRisks } from "./riskActions";

// create Assignement
export const createAssignement = (values) => async (dispatch) => {
  try {
    const data = await AssignementService.createAssignement(values);
    dispatch({
      type: "CREATE_ASSIGNEMENT_SUCCESS",
      payload: { data },
    });
    dispatch(detectOverchargeRisks());
    return { success: true }; // ✅ return success
  } catch (error) {
    dispatch({
      type: "CREATE_ASSIGNEMENT_FAILURE",
      payload: error.response?.data?.message || "Create assignement failed",
    });
    return { success: false }; // ✅ return failure
  }
};

// get Employee Assignement
export const getEmployeeAssignement = (empId, values) => async (dispatch) => {
  try {
    const data = await AssignementService.getEmployeeAssignement(empId);
    dispatch({
      type: "GET_EMP_ASSIGNEMENT_SUCCESS",
      payload: { data },
    });
    return { success: true }; // ✅ return success
  } catch (error) {
    dispatch({
      type: "GET_EMP_ASSIGNEMENT_FAILURE",
      payload:
        error.response?.data?.message || "Get employee assignement failed",
    });
    return { success: false }; // ✅ return failure
  }
};

// get Employee Assignement
export const getAllEmployeeAssignements = () => async (dispatch) => {
  try {
    console.log("🔥 Calling getAllEmployeesAssignements API...");
    const data = await AssignementService.getAllEmployeesAssignements();
    console.log("📦 API Response:", data);
    dispatch({
      type: "GET_ALL_EMP_ASSIGNEMENTS_SUCCESS",
      payload: { data },
    });
    return { success: true }; // ✅ return success
  } catch (error) {
    console.error("❌ API Error:", error);
    dispatch({
      type: "GET_ALL_EMP_ASSIGNEMENTS_FAILURE",
      payload:
        error.response?.data?.message || "Get employee assignements failed",
    });
    return { success: false }; // ✅ return failure
  }
};

// get Employee Assignement
export const getMyAssignements = () => async (dispatch) => {
  try {
    const data = await AssignementService.getMyAssignements();
    dispatch({
      type: "GET_EMP_ASSIGNEMENT_SUCCESS",
      payload: { data },
    });
    return { success: true }; // ✅ return success
  } catch (error) {
    dispatch({
      type: "GET_EMP_ASSIGNEMENT_FAILURE",
      payload:
        error.response?.data?.message || "Get employee assignement failed",
    });
    return { success: false }; // ✅ return failure
  }
};

// get Employee Assignement
export const updateAssignementTimeEntry =
  (assignementId, date, timeType) => async (dispatch) => {
    try {
      const data = await AssignementService.updateAssignementTimeEntry(
        assignementId,
        date,
        timeType
      );
      dispatch({
        type: "UPDATE_ASSIGNEMENT_TIME_ENTRY_SUCCESS",
        payload: { data },
      });
      return { success: true }; // ✅ return success
    } catch (error) {
      dispatch({
        type: "UPDATE_ASSIGNEMENT_TIME_ENTRY_FAILURE",
        payload:
          error.response?.data?.message || "Update assignement entry failed",
      });
      return { success: false }; // ✅ return failure
    }
  };

// get Employee Assignement
export const updateAssignementTimeEntries =
  (assignementId, entries) => async (dispatch) => {
    try {
      const data = await AssignementService.updateAssignementTimeEntries(
        assignementId,
        entries
      );
      dispatch({
        type: "UPDATE_ASSIGNEMENT_TIME_ENTRIES_SUCCESS",
        payload: { data },
      });
      return { success: true }; // ✅ return success
    } catch (error) {
      dispatch({
        type: "UPDATE_ASSIGNEMENT_TIME_ENTRIES_FAILURE",
        payload:
          error.response?.data?.message || "Update assignement entry failed",
      });
      return { success: false }; // ✅ return failure
    }
  };

// create Assignement
export const updateAssignement = (id, values) => async (dispatch) => {
  try {
    const data = await AssignementService.updateAssignement(id, values);
    dispatch({
      type: "UPDATE_ASSIGNEMENT_SUCCESS",
      payload: { data },
    });
    dispatch(detectOverchargeRisks());
    return { success: true }; // ✅ return success
  } catch (error) {
    dispatch({
      type: "UPDATE_ASSIGNEMENT_FAILURE",
      payload: error.response?.data?.message || "Update assignement failed",
    });
    return { success: false }; // ✅ return failure
  }
};

// create Assignement
export const resetAssignementErros = () => async (dispatch) => {
  dispatch({
    type: "RESET_ASSIGNEMENT_ERROR",
  });
};

// create Assignement
export const resetAssignementState = () => async (dispatch) => {
  dispatch({
    type: "RESET_ASSIGNEMENT",
  });
};

// delete Assignement
export const deleteAssignement = (assignementId) => async (dispatch) => {
  try {
    const data = await AssignementService.deleteAssignement(assignementId);
    dispatch({
      type: "DELETE_ASSIGNEMENT_SUCCESS",
      payload: { data },
    });
    return { success: true }; // ✅ return success
  } catch (error) {
    dispatch({
      type: "DELETE_ASSIGNEMENT_FAILURE",
      payload: error.response?.data?.message || "Delete assignement failed",
    });
    return { success: false }; // ✅ return failure
  }
};

// get Assignement recommendation
export const getAssignementRecommendation = (empId, managerProjectIds = []) => async (dispatch) => {
  try {
    const data = await AssignementService.getAssignementRecommendation(empId, managerProjectIds);
    dispatch({
      type: "GET_ASSIGNEMENT_RECOMMENDATION_SUCCESS",
      payload: data,
    });
    return { success: true, data }; // ✅ return success
  } catch (error) {
    dispatch({
      type: "GET_ASSIGNEMENT_RECOMMENDATION_FAILURE",
      payload:
        error.response?.data?.message ||
        "Get assignement recommendation failed",
    });
    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Get assignement recommendation failed",
    }; // ✅ return failure
  }
};
