import axios from "axios";

//로그인, 회원가입 등을 처리하는 api

export const API_SERVER_HOST = 'http://localhost:8080'
const prefix = `${API_SERVER_HOST}/api/auth`;

const api = axios.create({
  baseURL: prefix,
  withCredentials: true,
});

//로그인 api 호출 함수
export const login = async(formData) =>{
    const res = await api.post(`${prefix}/login`,formData)
    return res.data;
}

//회원가입 처리 함수
export const register = async(formData) =>{
    const res = await api.post(`${prefix}/register`,formData)
    return res.data;
}

//권한을 받아오는 함수
export const getMe = async () => {
  const res = await api.get(`${prefix}/me`);
  return res.data;
};

//로그아웃 api호출 함수
export const logout = async () => {
  const res = await api.post(`${prefix}/logout`);
  return res.data;
};

//예시용 코드
// export const getOne = async(no)=>{
//     const res = await axios.get(`${prefix}/${no}`)
//     return res.data
// }

// export const getList = async (pageParam) =>{

//     const {page,size} = pageParam
//     const res = await axios.get(`${prefix}/list`,{params:{page:page,size:size}})
//     return res.data
// }

