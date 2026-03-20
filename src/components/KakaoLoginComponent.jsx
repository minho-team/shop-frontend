import { getKakaoLoginLink } from "../api/kakaoApi";

const KakaoLoginComponent = () => {
  const handleKakaoLogin = () => {
    window.location.href = getKakaoLoginLink();
  };

  return (
    <button
      type="button"
      onClick={handleKakaoLogin}
      style={{
        width: "100%",
        height: "40px",
        backgroundColor: "#FEE500",
        color: "rgba(0,0,0,0.85)",
        border: "none",
        borderRadius: "8px",
        fontSize: "16px",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px",
        cursor: "pointer",
      }}
      aria-label="카카오 로그인"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 3C6.477 3 2 6.507 2 10.833c0 2.76 1.824 5.184 4.576 6.562L5.5 21l4.192-2.3c.746.104 1.518.158 2.308.158 5.523 0 10-3.507 10-7.833S17.523 3 12 3Z"
          fill="#000000"
        />
      </svg>
      <span>카카오 로그인</span>
    </button>
  );
};

export default KakaoLoginComponent;