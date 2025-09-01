// src/actions/taskAction.js
import { useNavigate } from "react-router-dom";
import RiskService from "../services/riskService";

// create Business Unit
export const detectOverchargeRisks = (values) => async (dispatch) => {
  try {
    const data = await RiskService.detectOverchargeRisks();
    console.log(data);
    return { success: true }; // ✅ return success
  } catch (error) {
    return { success: false }; // ✅ return failure
  }
};

// get NOTIF
export const getRisks = () => async (dispatch) => {
  try {
    const data = await RiskService.getAllRisks();
    dispatch({
      type: "GET_RISKS_SUCCESS",
      payload: { data },
    });
    return { success: true }; // ✅ return success
  } catch (error) {
    dispatch({
      type: "GET_RISKS_FAILURE",
      payload: error.response?.data?.message || "get Notifications failed",
    });
    return { success: false }; // ✅ return failure
  }
};
