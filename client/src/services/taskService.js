import axios from "axios";
import {base_url,getConfig} from "../config/axiosConfig"

const createTask = (data) => {
    console.log(data)
  return axios
    .post(base_url + "task/create", 
     data,
     getConfig()
    )
    .then((response) => {
      return response.data;
    })
};


const getTaskByProjectID = (projectId) => {
  return axios
    .get(base_url + `task/getTaskByProjectID/${projectId}`, 
     getConfig()
    )
    .then((response) => {
      return response.data;
    })
};



const TaskService = {
    createTask,
    getTaskByProjectID
   }
   
 
   export default TaskService;