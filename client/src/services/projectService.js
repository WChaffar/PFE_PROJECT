import axios from "axios";
import {base_url,getConfig} from "../config/axiosConfig"

const createProject = (data) => {
  return axios
    .post(base_url + "project/create", 
     data,
     getConfig()
    )
    .then((response) => {
      return response.data;
    })
};


const getProjects = () => {
return axios
  .get(base_url + "project/getAll", 
   getConfig()
  )
  .then((response) => {
    return response.data;
  })
};


const ProjectService = {
   createProject,
   getProjects
  }
  

  export default ProjectService;