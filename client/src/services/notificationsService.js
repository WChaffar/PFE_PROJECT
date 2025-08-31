import axios from "axios";
import { base_url, getConfig } from "../config/axiosConfig";

const createNotification = (data) => {
  return axios
    .post(base_url + "Notifications/create", data, getConfig())
    .then((response) => {
      return response.data;
    });
};

const getAllNotifications = () => {
  return axios
    .get(base_url + "Notifications/getAll", getConfig())
    .then((response) => {
      return response.data;
    });
};


const NotificationService = {
  createNotification,
  getAllNotifications,

};

export default NotificationService;
