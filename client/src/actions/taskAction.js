// src/actions/taskAction.js

import TaskService from '../services/taskService';
import { useNavigate } from "react-router-dom";



// create Task
export const createTask = (values) => async (dispatch) => {
    try {
      const data = await TaskService.createTask(values);
      dispatch({
        type: 'CREATE_TASK_SUCCESS',
        payload: { data },
      });
      return { success: true }; // ✅ return success
    } catch (error) {
      dispatch({
        type: 'CREATE_TASK_FAILURE',
        payload: error.response?.data?.message || 'Create task failed',
      });
      return { success: false }; // ✅ return failure
    }
  };


  // get Tasks by project id
export const getTasksByProjectId = (values) => async (dispatch) => {
  try {
    const data = await TaskService.getTaskByProjectID(values);
    dispatch({
      type: 'GET_TASKS_BYPROJECTID_SUCCESS',
      payload: { data },
    });
    return { success: true }; // ✅ return success
  } catch (error) {
    dispatch({
      type: 'GET_TASKS_BYPROJECTID_FAILURE',
      payload: error.response?.data?.message || 'Get tasks by project id failed',
    });
    return { success: false }; // ✅ return failure
  }
};