import axios from "axios";
import {base_url,getConfig} from "../config/axiosConfig"

const createProject = (data) => {
    console.log(getConfig())
  return axios
    .post(base_url + "project/create", 
     data,
     getConfig()
    )
    .then((response) => {
      console.log(response.data)
      return response.data;
    })
};


const ProjectService = {
   createProject
  }
  

  export default ProjectService;