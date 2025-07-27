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

const getAllEmployeesAssignements = () => {
  return axios
    .get(base_url + `assignement/getEmployeeAssignements/all`, 
     getConfig()
    )
    .then((response) => {
      return response.data;
    })
};


const getMyAssignements = () => {
  return axios
    .get(base_url + `assignement/getAssignementsForEmployee/all`, 
     getConfig()
    )
    .then((response) => {
      return response.data;
    })
};

const updateAssignementTimeEntry = (assignementId,date,timeType) => {
  return axios
    .put(base_url + `assignement/updateAssignement/${assignementId}`,
      { date, durationInDays: 1, timeType }
    , 
     getConfig()
    )
    .then((response) => {
      return response.data;
    })
};



const AssignementService = {
    createAssignement,
    getEmployeeAssignement,
    getAllEmployeesAssignements,
    getMyAssignements,
    updateAssignementTimeEntry
   }
   
 
export default AssignementService;