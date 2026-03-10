import axios from "axios";


export const API_SERVER_HOST = 'http://localhost:8080'
const prefix = `${API_SERVER_HOST}/api`;


export const login = async(formData) =>{
    const res = await axios.post(`${prefix}/auth/login`,formData)
    return res.data;
}
export const register = async(formData) =>{
    const res = await axios.post(`${prefix}/auth/register`,formData)
    return res.data;
}

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

