import axios from "axios";
import { base_url, getConfig } from "../config/axiosConfig";

const createTask = (data) => {
  return axios
    .post(base_url + "task/create", data, getConfig())
    .then((response) => {
      return response.data;
    });
};

const getTaskByProjectID = (projectId) => {
  return axios
    .get(base_url + `task/getTaskByProjectID/${projectId}`, getConfig())
    .then((response) => {
      return response.data;
    });
};

const getTaskByManagerID = () => {
  return axios
    .get(base_url + `task/getTaskByManagerID`, getConfig())
    .then((response) => {
      return response.data;
    });
};

const getTaskById = (taskId) => {
  return axios
    .get(base_url + `task/getOne/${taskId}`, getConfig())
    .then((response) => {
      return response.data;
    });
};

const deleteTaskById = (taskId) => {
  return axios
    .delete(base_url + `task/deleteOne/${taskId}`, getConfig())
    .then((response) => {
      return response.data;
    });
};

const editTask = (id, values) => {
  return axios
    .put(base_url + `task/editOne/${id}`, values, getConfig())
    .then((response) => {
      return response.data;
    });
};

const getBuTaskByProjectID = (projectId) => {
  return axios
    .get(base_url + `task/getBuTaskByProjectID/${projectId}`, getConfig())
    .then((response) => {
      return response.data;
    });
};

const TaskService = {
  createTask,
  getTaskByProjectID,
  getTaskById,
  deleteTaskById,
  editTask,
  getTaskByManagerID,
  getBuTaskByProjectID,
};

export default TaskService;
