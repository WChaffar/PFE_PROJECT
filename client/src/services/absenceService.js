import axios from "axios";
import { base_url, getConfig } from "../config/axiosConfig";

const createAbsence = (data) => {
  return axios
    .post(base_url + "Absence/create", data, getConfig())
    .then((response) => {
      return response.data;
    });
};

const getMyAbsences = () => {
  return axios
    .get(base_url + "Absence/getMyAbsences", getConfig())
    .then((response) => {
      return response.data;
    });
};

const getAbsenceByID = (absenceId) => {
  return axios
    .get(base_url + `Absence/getMyAbsenceByID/${absenceId}`, getConfig())
    .then((response) => {
      return response.data;
    });
};

const updateAbsenceByID = (absenceId, data) => {
  return axios
    .put(base_url + `Absence/updateAbsenceByID/${absenceId}`, data, getConfig())
    .then((response) => {
      return response.data;
    });
};

const deleteAbsenceByID = (absenceId) => {
  return axios
    .delete(base_url + `Absence/deleteAbsenceByID/${absenceId}`, getConfig())
    .then((response) => {
      return response.data;
    });
};

const AbsenceService = {
  createAbsence,
  getMyAbsences,
  getAbsenceByID,
  updateAbsenceByID,
  deleteAbsenceByID
};

export default AbsenceService;
