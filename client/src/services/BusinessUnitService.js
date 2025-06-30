import axios from "axios";
import {base_url,getConfig} from "../config/axiosConfig"

const createBu = (data) => {
  return axios
    .post(base_url + "BusinessUnit/create", 
     data,
     getConfig()
    )
    .then((response) => {
      return response.data;
    })
};


const getAllBu = (data) => {
  return axios
    .get(base_url + "BusinessUnit/getAllBu",
     getConfig()
    )
    .then((response) => {
      return response.data;
    })
};

const BuService = {
    createBu,
    getAllBu
  }
  

  export default BuService;