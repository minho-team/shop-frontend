import axios from "axios";


export const API_SERVER_HOST = 'http://localhost:8080'
const prefix = `${API_SERVER_HOST}/api/order`;

const api = axios.create({
  baseURL: prefix,
  withCredentials: true,
});

/**
 * [수정] 로그인한 유저의 주문 내역을 가져오는 함수
 * @param {number} memberNo - 유저 고유 번호
 */
export const getMyOrders = async (memberNo) => {
  // 1. prefix가 이미 baseURL로 잡혀있으므로 상대 경로만 작성합니다.
  // 2. 주문 조회이므로 GET 방식을 사용합니다.
  const res = await api.get(`/my/${memberNo}`);
  return res.data;
};
/**
 * [참고] 기존 getOneOrder 함수 수정 (필요 시)
 * 주문 상세 정보를 하나만 가져올 때 사용합니다.
 */
export const getOneOrder = async (orderNo) => {
  const res = await api.get(`/${orderNo}`);
  return res.data;
};