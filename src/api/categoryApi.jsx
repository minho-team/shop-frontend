import apiClient from "./apiClient";

const prefix = "/api/product";

// 카테고리 + 검색어로 상품 목록 조회
export const getProductList = async ({ categoryId, keyword }) => {
  const params = {};

  if (categoryId) {
    params.categoryId = categoryId;
  }

  if (keyword && keyword.trim()) {
    params.keyword = keyword.trim();
  }

  const response = await apiClient.get(`${prefix}/withcategory`, {
    params,
    withCredentials: true,
  });

  return response.data;
};