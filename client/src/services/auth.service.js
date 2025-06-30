import axios from "axios";
import {base_url} from "../config/axiosConfig"

const register = (data) => {
  console.log(data)
  return axios.post(base_url + "user/register", data ).then((response) => {
    if (response.data.firstname) {
      localStorage.setItem("user", JSON.stringify(response.data));
    }
    console.log(response);
    return response.data;
  });
};

const login = (email, password) => {
  return axios
    .post(base_url + "user/login", {
      email,
      password,
    })
    .then((response) => {
      if (response.data.firstname) {
        localStorage.setItem("user", JSON.stringify(response.data));
      }
      return response.data;
    });
};

const logout = () => {
  localStorage.removeItem("user");
  return axios.post(base_url + "signout").then((response) => {
    return response.data;
  });
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

const AuthService = {
  register,
  login,
  logout,
  getCurrentUser,
}

export default AuthService;
