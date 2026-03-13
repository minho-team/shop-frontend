import axios from "axios";


export const API_SERVER_HOST = 'http://localhost:8080'
const prefix = `${API_SERVER_HOST}/api/order`;

const api = axios.create({
  baseURL: prefix,
  withCredentials: true,
});



