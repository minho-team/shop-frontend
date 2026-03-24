import apiClient from "../common/apiClient";

const prefix = "/api/product";

export const getProductList = async () => {
  const res = await apiClient.get(`${prefix}`);
  return res.data;
};

export const getProductDetail = async (id) => {
  const res = await apiClient.get(`${prefix}/${id}`);
  return res.data;
};

export const getHomeMainData = async () => {
  const res = await apiClient.get(`${prefix}/home`);
  return res.data;
};

// 현재 보고 있는 상품과 같은 카테고리의 관련상품 조회
export const getRelatedProducts = async (id) => {
  const res = await apiClient.get(`${prefix}/${id}/related`);
  return res.data;
};
