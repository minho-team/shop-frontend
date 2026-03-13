import axios from "axios";

export const API_SERVER_HOST = "http://localhost:8080";
const prefix = `${API_SERVER_HOST}/api/product`;

const api = axios.create({
  baseURL: prefix,
  withCredentials: true,
});

export const getProductList = async () => {
  const res = await api.get("");
  return res.data;
};

export const getProductDetail = async (id) => {
  const res = await api.get(`/${id}`);
  return res.data;
};

export const getProductMainAndThumbImages = async (productNo) => {
  const res = await api.get(`/${productNo}/images`);
  return res.data;
};
// export const register = async(formData) =>{
//     const res = await api.post(`${prefix}/register`,formData)
//     return res.data;
// }

// export const getMe = async () => {
//   const res = await api.get(`${prefix}/me`);
//   return res.data;
// };

// export const logout = async () => {
//   const res = await api.post(`${prefix}/logout`);
//   return res.data;
// };

//예시용 코드
// export const getOne = async(no)=>{
//     const res = await axios.get(`${prefix}/${no}`)
//     return res.data
// }

// export const getList = async (pageParam) =>{

//     const {page,size} = pageParam
//     const res = await axios.get(`${prefix}/list`,{params:{page:page,size:size}})
//     return res.data
// }
