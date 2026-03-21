import apiClient from "../common/apiClient";

const prefix = "/api/admin/orders/item";

// 관리자 order_item목록 조회
export const getAdminOrderItemList = async (orderNo) => {
  const response = await apiClient.get(`${prefix}/${orderNo}`);

  console.log("getAdminOrderItemList 응답:", response.data);

  return response.data;
};


// 관리자 order_item 상태 변경
export const updateAdminOrderItemStatus = async (orderItemNo, orderItemStatus) => {
  const response = await apiClient.patch(`${prefix}/${orderItemNo}/status`, {
    orderItemStatus,
  });

  console.log("updateAdminOrderItemStatus 응답:", response.data);

  return response.data;
};