import apiClient from "../common/apiClient";


const prefix = "/api/product/image";


export const getProductMainAndThumbImages = async (productNo) => {
  const res = await apiClient.get(`${prefix}/${productNo}`);
  return res.data;
};

