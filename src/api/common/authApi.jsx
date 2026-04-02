import apiClient from "./apiClient";

//로그인, 회원가입 등을 처리하는 api

const prefix = "/api/auth";

//로그인 api 호출 함수
export const login = async (formData) => {
  const res = await apiClient.post(`${prefix}/login`, formData)
  return res.data;
}

//회원가입 처리 함수
export const register = async (formData) => {
  const res = await apiClient.post(`${prefix}/register`, formData)
  return res.data;
}

//권한을 받아오는 함수
export const getMe = async () => {
  const res = await apiClient.get(`${prefix}/me`);
  return res.data;
};

//로그아웃 api호출 함수
export const logout = async () => {
  const res = await apiClient.post(`${prefix}/logout`);
  return res.data;
};

//아이디 중복 체크 함수
export const checkMemberId = async (memberId) => {
  const res = await apiClient.post(`${prefix}/checkId?memberId=${memberId}`);
  return res.data;
};

export const CheckNickName = async (nickName) =>{
  const res = await apiClient.post(`${prefix}/checkNickName?nickName=${nickName}`)
  return res.data;
}


