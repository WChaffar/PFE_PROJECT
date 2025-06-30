// src/actions/taskAction.js

import TaskService from '../services/taskService';
import { useNavigate } from "react-router-dom";
import BuService from "../services/BusinessUnitService"

// create Business Unit
export const createBU = (values) => async (dispatch) => {
    try {
      const data = await BuService.createBu(values);
      dispatch({
        type: 'CREATE_BU_SUCCESS',
        payload: { data },
      });
      return { success: true }; // ✅ return success
    } catch (error) {
      dispatch({
        type: 'CREATE_BU_FAILURE',
        payload: error.response?.data?.message || 'Create Business Unit failed',
      });
      return { success: false }; // ✅ return failure
    }
  };




  // get Business Unit
export const getBU = (values) => async (dispatch) => {
    try {
      const data = await BuService.getAllBu();
      dispatch({
        type: 'GET_BU_SUCCESS',
        payload: { data },
      });
      return { success: true }; // ✅ return success
    } catch (error) {
      dispatch({
        type: 'GET_BU_FAILURE',
        payload: error.response?.data?.message || 'get Business Unit failed',
      });
      return { success: false }; // ✅ return failure
    }
  };