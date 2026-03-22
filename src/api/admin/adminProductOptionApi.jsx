import apiClient from "../common/apiClient";

const prefix = "/api/admin/product";

// 상품 옵션 목록 조회
export const getAdminProductOptions = async (productNo) => {
  const response = await apiClient.get(`${prefix}/${productNo}/options`);
  return response.data;
};

// 상품 옵션 추가
export const postAdminProductOption = async (productNo, optionData) => {
  const response = await apiClient.post(
    `${prefix}/${productNo}/options`,
    optionData,
  );
  return response.data;
};

// 상품 옵션 수정
export const putAdminProductOption = async (
  productNo,
  productOptionNo,
  optionData,
) => {
  const response = await apiClient.put(
    `${prefix}/${productNo}/options/${productOptionNo}`,
    optionData,
  );
  return response.data;
};

// 상품 옵션 삭제
export const deleteAdminProductOption = async (productNo, productOptionNo) => {
  const response = await apiClient.delete(
    `${prefix}/${productNo}/options/${productOptionNo}`,
  );
  return response.data;
};
