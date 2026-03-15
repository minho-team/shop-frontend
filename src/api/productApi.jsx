import apiClient from "./apiClient";

const prefix = "/api/product";


// 모든 상품을 가져오는 api
export const getProductList = async () => {

  const res = await apiClient.get(`${prefix}`);
  return res.data;
};


// 상품 상세 페이지를 위한 api
export const getProductDetail = async (id) => {
  const res = await apiClient.get(`${prefix}/${id}`);
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
