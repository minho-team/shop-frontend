import axios from "axios";

export const getProductList = async (categoryId) => {
  const response = await axios.get("http://localhost:8080/api/product/withcategory", {
    params: categoryId ? { categoryId } : {},
    withCredentials: true,
  });

  return response.data;
};