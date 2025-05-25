// src/actions/taskAction.js

import AssignementService from '../services/assignementsService';
import { useNavigate } from "react-router-dom";



// create Assignement
export const createAssignement = (data) => async (dispatch) => {
    try {
      const data = await AssignementService.createAssignement(data);
      dispatch({
        type: 'CREATE_ASSIGNEMENT_SUCCESS',
        payload: { data },
      });
      return { success: true }; // ✅ return success
    } catch (error) {
      dispatch({
        type: 'CREATE_ASSIGNEMENT_FAILURE',
        payload: error.response?.data?.message || 'Create assignement failed',
      });
      return { success: false }; // ✅ return failure
    }
  };