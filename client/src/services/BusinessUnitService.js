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


const getAllBu = () => {
  return axios
    .get(base_url + "BusinessUnit/getAllBu",
     getConfig()
    )
    .then((response) => {
      return response.data;
    })
};


const updateBu = (id, data) => {
  return axios
    .put(base_url + `BusinessUnit/updateBusinessUnit/${id}`,data,
     getConfig()
    )
    .then((response) => {
      return response.data;
    })
};

const getBuById = (id) => {
  return axios
    .get(base_url + `BusinessUnit/getBuById/${id}`,getConfig())
    .then((response) => {
      return response.data;
    })
};
const deleteBuById = (id) => {
  return axios
    .delete(base_url + `BusinessUnit/deleteBuById/${id}`,getConfig())
    .then((response) => {
      return response.data;
    })
};

const BuService = {
    createBu,
    getAllBu,
    updateBu,
    getBuById,
    deleteBuById
  }
  

  export default BuService;