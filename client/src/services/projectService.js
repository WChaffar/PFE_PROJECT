import axios from "axios";
import { base_url, getConfig } from "../config/axiosConfig";

const createProject = (data) => {
  return axios
    .post(base_url + "project/create", data, getConfig())
    .then((response) => {
      return response.data;
    });
};

const getProjects = () => {
  return axios
    .get(base_url + "project/getAll", getConfig())
    .then((response) => {
      return response.data;
    });
};

const deleteProject = (id) => {
  return axios
    .delete(base_url + `project/deleteOne/${id}`, getConfig())
    .then((response) => {
      return response.data;
    });
};

const getOneProject = (id) => {
  return axios
    .get(base_url + `project/getOne/${id}`, getConfig())
    .then((response) => {
      return response.data;
    });
};

const editProject = (id, values) => {
  return axios
    .put(base_url + `project/editOne/${id}`, values, getConfig())
    .then((response) => {
      return response.data;
    });
};

const getAllBuProjects = (businessUnitId) => {
  return axios
    .get(base_url + `project/getBuAllProjects/${businessUnitId}`, getConfig())
    .then((response) => {
      return response.data;
    });
};

const changeProjectManager = (oldManagerId, newManagerId) => {
  return axios
    .put(
      base_url +
        `project/changeProjectManager/${oldManagerId}/${newManagerId}`,
      null,
      getConfig()
    )
    .then((response) => {
      return response.data;
    });
};

const ProjectService = {
  createProject,
  getProjects,
  deleteProject,
  getOneProject,
  editProject,
  getAllBuProjects,
  changeProjectManager
};

export default ProjectService;
