// src/actions/authActions.js

import projectService from "../services/projectService";
import { useNavigate } from "react-router-dom";

// create Project
export const createProject = (values) => async (dispatch) => {
  try {
    const data = await projectService.createProject(values);
    dispatch({
      type: "CREATE_PROJECT_SUCCESS",
      payload: { data },
    });
    return { success: true }; // ✅ return success
  } catch (error) {
    dispatch({
      type: "CREATE_PROJECT_FAILURE",
      payload: error.response?.data?.message || "Create project failed",
    });
    return { success: false, error: error.response.data.message }; // ✅ return failure
  }
};

// create Project
export const getAllProjects = () => async (dispatch) => {
  try {
    const data = await projectService.getProjects();
    dispatch({
      type: "GET_PROJECTS_SUCCESS",
      payload: { data },
    });
    return { success: true }; // ✅ return success
  } catch (error) {
    dispatch({
      type: "GET_PROJECTS_FAILURE",
      payload: error.response?.data?.message || "Get projects failed",
    });
    return { success: false, error: error.response.data.message }; // ✅ return failure
  }
};

// create Project
export const deleteProject = (id) => async (dispatch) => {
  try {
    const data = await projectService.deleteProject(id);
    dispatch({
      type: "DELETE_PROJECT_SUCCESS",
      payload: { data },
    });
    return { success: true }; // ✅ return success
  } catch (error) {
    dispatch({
      type: "DELETE_PROJECT_FAILURE",
      payload: error.response?.data?.message || "delete project failed",
    });
    return { success: false, error: error.response.data.message }; // ✅ return failure
  }
};

// create Project
export const getOneProject = (id) => async (dispatch) => {
  try {
    const data = await projectService.getOneProject(id);
    dispatch({
      type: "GET_ONE_PROJECT_SUCCESS",
      payload: { data },
    });
    return { success: true }; // ✅ return success
  } catch (error) {
    dispatch({
      type: "GET_ONE_PROJECT_FAILURE",
      payload: error.response?.data?.message || "get one project failed",
    });
    return { success: false, error: error.response.data.message }; // ✅ return failure
  }
};

// create Project
export const editProject = (id, values) => async (dispatch) => {
  try {
    const data = await projectService.editProject(id, values);
    dispatch({
      type: "EDIT_PROJECT_SUCCESS",
      payload: { data },
    });
    return { success: true }; // ✅ return success
  } catch (error) {
    dispatch({
      type: "EDIT_PROJECT_FAILURE",
      payload: error.response?.data?.message || "edit project failed",
    });
    return { success: false, error: error.response.data.message }; // ✅ return failure
  }
};
