import axios from "axios";
import { useParams } from "react-router-dom";

export const API_SERVER_HOST = "http://localhost:8080";
const prefix = `${API_SERVER_HOST}/api/order`;

export const getOrders = async () => {
  
    const res = await axios.get(`${prefix}`)
    return res.data
}