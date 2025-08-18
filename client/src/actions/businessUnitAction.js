// src/actions/taskAction.js

import TaskService from "../services/taskService";
import { useNavigate } from "react-router-dom";
import BuService from "../services/BusinessUnitService";

// create Business Unit
export const createBU = (values) => async (dispatch) => {
  try {
    const data = await BuService.createBu(values);
    dispatch({
      type: "CREATE_BU_SUCCESS",
      payload: { data },
    });
    return { success: true }; // ✅ return success
  } catch (error) {
    dispatch({
      type: "CREATE_BU_FAILURE",
      payload: error.response?.data?.message || "Create Business Unit failed",
    });
    return { success: false }; // ✅ return failure
  }
};

// create Business Unit
export const BuResetState = (values) => async (dispatch) => {
  dispatch({
    type: "BUSINESS_UNIT_RESET_STATE",
  });
};

// get Business Unit
export const getBU = (values) => async (dispatch) => {
  try {
    const data = await BuService.getAllBu();
    dispatch({
      type: "GET_BU_SUCCESS",
      payload: { data },
    });
    return { success: true }; // ✅ return success
  } catch (error) {
    dispatch({
      type: "GET_BU_FAILURE",
      payload: error.response?.data?.message || "get Business Unit failed",
    });
    return { success: false }; // ✅ return failure
  }
};

// update Business Unit
export const updateBu = (id, values) => async (dispatch) => {
  try {
    const data = await BuService.updateBu(id, values);
    dispatch({
      type: "EDIT_BUSINESS_UNIT_SUCCESS",
      payload: { data },
    });
    return { success: true }; // ✅ return success
  } catch (error) {
    dispatch({
      type: "EDIT_BUSINESS_UNIT_FAILURE",
      payload: error.response?.data?.message || "edit Business Unit failed",
    });
    return { success: false }; // ✅ return failure
  }
};

// get Business Unit by id
export const getBuById = (id, values) => async (dispatch) => {
  try {
    const data = await BuService.getBuById(id);
    dispatch({
      type: "GET_BUSINESS_UNIT_BY_ID_SUCCESS",
      payload: { data },
    });
    return { success: true }; // ✅ return success
  } catch (error) {
    dispatch({
      type: "GET_BUSINESS_UNIT_BY_ID_FAILURE",
      payload:
        error.response?.data?.message || "get Business Unit by id failed",
    });
    return { success: false }; // ✅ return failure
  }
};

// get Business Unit by id
export const deleteBuById = (id, values) => async (dispatch) => {
  try {
    const data = await BuService.deleteBuById(id);
    dispatch({
      type: "DELETE_BUSINESS_UNIT_BY_ID_SUCCESS",
      payload: { data },
    });
    return { success: true }; // ✅ return success
  } catch (error) {
    dispatch({
      type: "DELETE_BUSINESS_UNIT_BY_ID_FAILURE",
      payload:
        error.response?.data?.message || "delete Business Unit by id failed",
    });
    return { success: false }; // ✅ return failure
  }
};
