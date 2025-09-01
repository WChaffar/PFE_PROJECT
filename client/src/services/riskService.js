import axios from "axios";
import { base_url, getConfig } from "../config/axiosConfig";

const detectOverchargeRisks = () => {
  return axios
    .get(base_url + "Risks/detectChargeRisks", getConfig())
    .then((response) => {
      return response.data;
    });
};

const getAllRisks = () => {
  return axios.get(base_url + "Risks/getAll", getConfig()).then((response) => {
    return response.data;
  });
};

const RiskService = {
  detectOverchargeRisks,
  getAllRisks,
};

export default RiskService;
