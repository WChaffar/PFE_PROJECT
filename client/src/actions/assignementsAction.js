// src/actions/taskAction.js

import AssignementService from "../services/assignementsService";
import { useNavigate } from "react-router-dom";

// create Assignement
export const createAssignement = (values) => async (dispatch) => {
  try {
    const data = await AssignementService.createAssignement(values);
    dispatch({
      type: "CREATE_ASSIGNEMENT_SUCCESS",
      payload: { data },
    });
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
export const getEmployeeAssignement = (empId,values) => async (dispatch) => {
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
      payload: error.response?.data?.message || "Get employee assignement failed",
    });
    return { success: false }; // ✅ return failure
  }
};

// get Employee Assignement
export const getAllEmployeeAssignements = () => async (dispatch) => {
  try {
    const data = await AssignementService.getAllEmployeesAssignements();
    dispatch({
      type: "GET_ALL_EMP_ASSIGNEMENTS_SUCCESS",
      payload: { data },
    });
    return { success: true }; // ✅ return success
  } catch (error) {
    dispatch({
      type: "GET_ALL_EMP_ASSIGNEMENTS_FAILURE",
      payload: error.response?.data?.message || "Get employee assignements failed",
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
      payload: error.response?.data?.message || "Get employee assignement failed",
    });
    return { success: false }; // ✅ return failure
  }
};

// get Employee Assignement
export const updateAssignementTimeEntry = (assignementId,date,timeType) => async (dispatch) => {
  try {
    const data = await AssignementService.updateAssignementTimeEntry(assignementId,date,timeType);
    dispatch({
      type: "UPDATE_ASSIGNEMENT_ENTRY_SUCCESS",
      payload: { data },
    });
    return { success: true }; // ✅ return success
  } catch (error) {
    dispatch({
      type: "UPDATE_ASSIGNEMENT_ENTRY_FAILURE",
      payload: error.response?.data?.message || "Update assignement entry failed",
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




