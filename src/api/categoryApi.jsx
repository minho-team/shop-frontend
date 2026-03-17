
import apiClient from "./apiClient";

const prefix = "/api/product";

// 카테고리를 눌렀을 때 그에 맞는 상품 가져오는 함수
export const getProductList = async (categoryId) => {
  const response = await apiClient.get(`${prefix}/withcategory`, {
    params: categoryId ? { categoryId } : {},
    withCredentials: true,
  });

  return response.data;
};