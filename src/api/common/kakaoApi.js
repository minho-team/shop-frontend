const REST_API_KEY = "d5130702ba4c3c0f55cc0ff03e5925f0";
// const REDIRECT_URI = "http://localhost:5173/member/kakao";
const REDIRECT_URI = "https://shop-frontend-topaz.vercel.app/member/kakao";

export const getKakaoLoginLink = () => {
  return `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;
};