// src/actions/authActions.js

import projectService from '../services/projectService';
import { useNavigate } from "react-router-dom";



// create Project
export const createProject = (values) => async (dispatch) => {
    try {
      const data = await projectService.createProject(values);
      dispatch({
        type: 'CREATE_PROJECT_SUCCESS',
        payload: { data },
      });
      return { success: true }; // ✅ return success
    } catch (error) {
      dispatch({
        type: 'CREATE_PROJECT_FAILURE',
        payload: error.response?.data?.message || 'Create project failed',
      });
      return { success: false }; // ✅ return failure
    }
  };
  