import apiClient from "../common/apiClient";


const prefix = "/api/product";

export const getProductList = async ({
  categoryId,
  keyword,
  sort,
  discountOnly,
}) => {
  const params = {};

  if (categoryId) {
    params.categoryId = categoryId;
  }

  if (keyword && keyword.trim()) {
    params.keyword = keyword.trim();
  }

  if (sort) {
    params.sort = sort;
  }

  if (discountOnly) {
    params.discountOnly = discountOnly;
  }

  const response = await apiClient.get(`${prefix}/withcategory`, {
    params,
    withCredentials: true,
  });

  return response.data;
};