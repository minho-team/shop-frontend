import apiClient from "../common/apiClient";

const prefix = "/api/admin/product";

// 상품 이미지 조회
export const getAdminProductImages = async (productNo) => {
  const response = await apiClient.get(`${prefix}/${productNo}/images`);
  return response.data;
};

// 썸네일 이미지 변경
export const putThumbnailImage = async (productNo, imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await apiClient.put(
    `${prefix}/${productNo}/images/thumbnail`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

// 메인 이미지 변경
export const putMainImage = async (productNo, imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await apiClient.put(
    `${prefix}/${productNo}/images/main`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

// 메인 이미지 삭제
export const deleteMainImage = async (productNo) => {
  const response = await apiClient.delete(`${prefix}/${productNo}/images/main`);
  return response.data;
};

// 갤러리 이미지 추가
export const postGalleryImage = async (productNo, imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await apiClient.post(
    `${prefix}/${productNo}/images/gallery`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

// 갤러리 이미지 변경
export const putGalleryImage = async (productNo, productImgNo, imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await apiClient.put(
    `${prefix}/${productNo}/images/gallery/${productImgNo}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

// 갤러리 이미지 삭제
export const deleteGalleryImage = async (productNo, productImgNo) => {
  const response = await apiClient.delete(
    `${prefix}/${productNo}/images/gallery/${productImgNo}`,
  );
  return response.data;
};

// 사이즈표 이미지 변경
export const putSizeChartImage = async (productNo, imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await apiClient.put(
    `${prefix}/${productNo}/images/size-chart`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

// 사이즈표 이미지 삭제
export const deleteSizeChartImage = async (productNo) => {
  const response = await apiClient.delete(
    `${prefix}/${productNo}/images/size-chart`,
  );
  return response.data;
};
