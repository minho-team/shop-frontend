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

// 상품 기본정보 상세 조회
export const getAdminProductDetail = async (productNo) => {
  const response = await apiClient.get(`${prefix}/${productNo}`);
  return response.data;
};

// 상품 기본정보 수정
export const putAdminProductBasic = async (productNo, basicData) => {
  const response = await apiClient.put(
    `${prefix}/${productNo}/basic`,
    basicData,
  );
  return response.data;
};

// 상품 삭제
export const deleteAdminProduct = async (productNo) => {
  const response = await apiClient.delete(`${prefix}/${productNo}`);
  return response.data;
};

// 관리자 상품 추가
export const postAdminProductAdd = async (formData) => {
  const response = await apiClient.post(prefix, formData);

  console.log("postAdminProductAdd 응답:", response.data);

  return response.data;
};
