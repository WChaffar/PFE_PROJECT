import axios from "axios";
import { base_url, getConfig } from "../config/axiosConfig";

const createTeamMember = (data) => {
  return axios
    .post(base_url + "team/create", data, {
      ...getConfig(),
      headers: {
        // Let Axios set the correct multipart boundaries
        ...getConfig().headers,
        "Content-Type": "multipart/form-data",
      },
    })
    .then((response) => {
      console.log(response.data);
      return response.data;
    })
    .catch((e) => {
      console.log(e);
    });
};

const getTeamMembers = () => {
  return axios.get(base_url + "team/getAll", getConfig()).then((response) => {
    return response.data;
  });
};

const getTeamMembersForManager = () => {
  return axios.get(base_url + "team/getAll/forManager", getConfig()).then((response) => {
    return response.data;
  });
};

const getOneTeamMember = (id) => {
  return axios
    .get(base_url + `team/getOne/${id}`, getConfig())
    .then((response) => {
      return response.data;
    });
};

const deleteTeamMember = (id) => {
  return axios
    .delete(base_url + `team/deleteOne/${id}`, getConfig())
    .then((response) => {
      return response.data;
    });
};

const editTeamMember = (id, data) => {
  return axios
    .put(base_url + `team/editOne/${id}`, data, {
      ...getConfig(),
      headers: {
        // Let Axios set the correct multipart boundaries
        ...getConfig().headers,
        "Content-Type": "multipart/form-data",
      },
    })
    .then((response) => {
      return response.data;
    });
};

const editTeamMemberBU = (id, data) => {
  return axios
    .put(base_url + `team/editOne/BU/${id}`, data, getConfig())
    .then((response) => {
      return response.data;
    });
};

const editTeamMemberValidation = (id, data) => {
  return axios
    .put(base_url + `team/editOne/accountState/${id}`, data, getConfig())
    .then((response) => {
      return response.data;
    });
};

const editTeamMemberManager = (id, data) => {
  return axios
    .put(base_url + `team/editOne/manager/${id}`, data, getConfig())
    .then((response) => {
      return response.data;
    });
};


const TeamService = {
  createTeamMember,
  getTeamMembers,
  getOneTeamMember,
  deleteTeamMember,
  editTeamMember,
  editTeamMemberBU,
  editTeamMemberValidation,
  editTeamMemberManager,
  getTeamMembersForManager
};

export default TeamService;
