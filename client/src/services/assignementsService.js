import axios from "axios";
import {base_url,getConfig} from "../config/axiosConfig"

const createAssignement = (data) => {
  return axios
    .post(base_url + "assignement/create", 
     data,
     getConfig()
    )
    .then((response) => {
      return response.data;
    })
};

const getEmployeeAssignement = (empId) => {
  return axios
    .get(base_url + `assignement/getEmployeeAssignement/${empId}`, 
     getConfig()
    )
    .then((response) => {
      return response.data;
    })
};



const AssignementService = {
    createAssignement,
    getEmployeeAssignement
   }
   
 
export default AssignementService;