import apiClient from "../apiClient";

const prefix = "/api/admin/product";

export const getAdminProductList = async (searchParams) => {
  const response = await apiClient.get(prefix, {
    params: searchParams,
  });

  console.log("getAdminProductList 요청 params:", searchParams);
  console.log("getAdminProductList 응답:", response.data);

  return response.data;
};
