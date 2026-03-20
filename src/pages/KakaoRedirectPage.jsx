import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "../api/apiClient";
import { useUser } from "../context/UserContext";


const KakaoRedirectPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchMe } = useUser();
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;
    const code = searchParams.get("code");

    if (!code) {
      console.error("인가코드가 없습니다.");
      return;
    }

    const kakaoLogin = async () => {
      try {
        // code를 백엔드로 전달
        await apiClient.post("/api/auth/kakao", { code });

        // 백엔드에서 access/refresh 쿠키 내려줬으니
        // 이후 사용자 정보 조회
        await fetchMe();

        // 여기서는 일단 간단히 홈으로 이동
        navigate("/", { replace: true });
      } catch (error) {
        console.error("카카오 로그인 실패", error);
      }
    };

    kakaoLogin();
  }, [searchParams, fetchMe, navigate]);

  return <div>카카오 로그인 처리중...</div>;
};

export default KakaoRedirectPage;