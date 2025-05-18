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


  const getOneTeamMember = (id) => {
    return axios
      .get(base_url + `team/getOne/${id}`, 
       getConfig()
      )
      .then((response) => {
        return response.data;
      })
    };


const TeamService = {
  createTeamMember,
  getTeamMembers,
  getOneTeamMember,
};

export default TeamService;
