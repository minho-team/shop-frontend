import apiClient from "../common/apiClient";

const prefix = "/api/admin/product";

// 관리자 상품 목록 조회
export const getAdminProductList = async (searchParams) => {
  const response = await apiClient.get(prefix, {
    params: searchParams,
  });

  console.log("getAdminProductList 요청 params:", searchParams);
  console.log("getAdminProductList 응답:", response.data);

  return response.data;
};

// 관리자 상품 추가
export const postAdminProductAdd = async (formData) => {
  const response = await apiClient.post(prefix, formData);

  console.log("postAdminProductAdd 응답:", response.data);

  return response.data;
};
