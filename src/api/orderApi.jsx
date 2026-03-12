import axios from "axios";


export const API_SERVER_HOST = 'http://localhost:8080'
const prefix = `${API_SERVER_HOST}/api/order`;

const api = axios.create({
  baseURL: prefix,
  withCredentials: true,
});

export const asd = async (formData) => {
  const res = await api.post(`${prefix}/asd`, formData)
  return res.data;
}


