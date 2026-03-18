import apiClient from "../apiClient";

const prefix = "/api/admin/category";

export const getAdminCategoryList = async () => {
  const res = await apiClient.get(prefix);
  return res.data;
};