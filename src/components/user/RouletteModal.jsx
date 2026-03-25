import { useState, useEffect } from "react";
import apiClient from "../../api/common/apiClient";
import { useUser } from "../../context/UserContext"; // 계정별 localStorage 키 생성용

// ── 룰렛 칸 설정 ──
// 배열 순서(index) = 백엔드 PRIZE_NAMES / COUPON_NOS 순서와 반드시 일치
const PRIZES = [
  { label: "꽝", color: "#FFE4EC", icon: "😢", textColor: "#d63384" },
  { label: "1,000원", color: "#fff", icon: "🎟️", textColor: "#d63384" },
  { label: "3,000원", color: "#FFE4EC", icon: "🎁", textColor: "#d63384" },
  { label: "5,000원", color: "#fff", icon: "💝", textColor: "#d63384" },
  { label: "10,000원", color: "#FFE4EC", icon: "👑", textColor: "#d63384" },
];

const TOTAL = PRIZES.length;   // 칸 수 (5)
const SLICE_DEG = 360 / TOTAL;     // 한 칸 각도 (72도)

// SVG 부채꼴 경로 계산 (cx,cy=원 중심, r=반지름, 12시 방향 기준)
function describeArc(cx, cy, r, startAngle, endAngle) {
  const toRad = (deg) => (deg - 90) * (Math.PI / 180);
  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(endAngle));
  const y2 = cy + r * Math.sin(toRad(endAngle));
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
}

// 바깥 링 장식 도트 위치 계산
function getDotPosition(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

const RouletteModal = ({ onClose }) => {
  const { user } = useUser(); // 현재 로그인한 유저 (계정별 키 생성에 사용)

  const [spinning, setSpinning] = useState(false); // 회전 중 여부
  const [rotation, setRotation] = useState(0);     // 누적 회전 각도
  const [result, setResult] = useState(null);  // 당첨 결과 { prizeName, hasCoupon }
  const [error, setError] = useState("");    // 에러 메시지
  const [alreadySpun, setAlreadySpun] = useState(false); // 오늘 이미 돌렸는지 여부
  const [dotAnim, setDotAnim] = useState(false); // 바깥 도트 깜빡임 토글

  // 계정별 고유 localStorage 키 반환
  // → "roulette_last_spun_일도123" 형태로 계정마다 독립 관리
  const getStorageKey = () =>
    user?.memberId ? `roulette_last_spun_${user.memberId}` : null;

  // 모달 열릴 때 & 계정 전환 시: 오늘 이미 돌렸는지 확인
  useEffect(() => {
    const key = getStorageKey();
    if (!key) return; // user 로드 전에는 스킵
    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    if (localStorage.getItem(key) === today) setAlreadySpun(true);
  }, [user]); // user 바뀔 때(로그인/계정전환)마다 재확인

  // 바깥 도트 깜빡임 인터벌 (600ms마다 홀짝 토글)
  useEffect(() => {
    const interval = setInterval(() => setDotAnim((v) => !v), 600);
    return () => clearInterval(interval); // 언마운트 시 인터벌 정리
  }, []);

  // 룰렛 돌리기 핸들러
  const handleSpin = async () => {
    if (spinning || alreadySpun) return; // 회전 중이거나 이미 돌린 경우 차단
    setResult(null);
    setError("");
    setSpinning(true);

    try {
      // 서버에서 당첨 결과 수신 (확률 계산은 반드시 서버에서)
      const res = await apiClient.post("/api/roulette/spin");
      const { prizeIndex, prizeName, hasCoupon } = res.data;

      // 당첨 칸 중앙 각도 계산 (12시 방향 기준)
      const targetDeg = 360 - (prizeIndex * SLICE_DEG + SLICE_DEG / 2);
      // 5바퀴(1800도) + 목표 각도 → CSS transition이 감속 회전 애니메이션 처리
      const newRotation = rotation + 1800 + (targetDeg - (rotation % 360) + 360) % 360;
      setRotation(newRotation);

      // 애니메이션 종료(4.2초) 후 결과 처리
      setTimeout(() => {
        setResult({ prizeName, hasCoupon });
        setSpinning(false);
        // 오늘 날짜를 계정별 키로 저장 → 다른 계정엔 영향 없음
        const key = getStorageKey();
        if (key) localStorage.setItem(key, new Date().toISOString().slice(0, 10));
        setAlreadySpun(true);
      }, 4200);

    } catch (e) {
      // 서버에서 "이미 돌렸다" 응답 시 localStorage에도 기록 → 팝업 재표시 방지
      setError(e.response?.data || "오류가 발생했습니다.");
      setSpinning(false);
      if (e.response?.data?.includes("이미")) {
        setAlreadySpun(true);
        const key = getStorageKey();
        if (key) localStorage.setItem(key, new Date().toISOString().slice(0, 10));
      }
    }
  };

  // 바깥 링 장식 도트 12개 위치 미리 계산
  const dotCount = 12;
  const dotRadius = 148;
  const dots = Array.from({ length: dotCount }, (_, i) =>
    getDotPosition(155, 155, dotRadius, (360 / dotCount) * i)
  );

  return (
    /* 모달 배경 - 배경 클릭 시 닫기 */
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(3px)",
      }}
    >
      {/* 모달 본체 */}
      <div style={{
        width: "380px",
        background: "linear-gradient(160deg, #fff0f5 0%, #ffe4ec 60%, #ffd6e7 100%)",
        borderRadius: "24px",
        padding: "28px 24px 24px",
        position: "relative",
        boxShadow: "0 20px 60px rgba(214,51,132,0.25)",
        border: "2px solid #ffb3cc",
        fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif",
      }}>

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "14px", right: "16px",
            width: "28px", height: "28px", borderRadius: "50%",
            border: "1.5px solid #ffb3cc", background: "#fff",
            fontSize: "13px", cursor: "pointer", color: "#d63384",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >✕</button>

        {/* 상단 배지 */}
        <div style={{ textAlign: "center", marginBottom: "6px" }}>
          <span style={{
            background: "#fff", border: "1.5px solid #ffb3cc",
            borderRadius: "20px", padding: "3px 14px",
            fontSize: "10px", fontWeight: "600",
            color: "#d63384", letterSpacing: "3px",
          }}>
            DAILY EVENT
          </span>
        </div>

        {/* 제목 */}
        <div style={{ textAlign: "center", marginBottom: "4px" }}>
          <h2 style={{
            margin: 0, fontSize: "26px", fontWeight: "800",
            color: "#d63384", letterSpacing: "2px",
            textShadow: "0 2px 8px rgba(214,51,132,0.2)",
          }}>
            🎡 ROULETTE
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#e07bab", letterSpacing: "1px" }}>
            하루 한 번 · 매일 새로운 행운
          </p>
        </div>

        {/* ── 룰렛 휠 영역 ── */}
        <div style={{ position: "relative", width: "310px", height: "310px", margin: "12px auto 16px" }}>

          {/* 바깥 링 + 깜빡이는 장식 도트 */}
          <svg width="310" height="310"
            style={{ position: "absolute", top: 0, left: 0, zIndex: 2 }}>
            {/* 핑크 이중 링 */}
            <circle cx="155" cy="155" r="150" fill="none" stroke="#f9b8cc" strokeWidth="10" />
            <circle cx="155" cy="155" r="150" fill="none" stroke="#ffd6e7" strokeWidth="6" />
            {/* 홀짝 인덱스 교대로 깜빡이는 도트 */}
            {dots.map((dot, i) => (
              <circle
                key={i} cx={dot.x} cy={dot.y} r="5"
                fill={(i % 2 === 0) === dotAnim ? "#d63384" : "#ffb3cc"}
                style={{ transition: "fill 0.3s" }}
              />
            ))}
          </svg>

          {/* 위쪽 삼각형 화살표 (당첨 기준선) */}
          <div style={{
            position: "absolute", top: "-2px", left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            filter: "drop-shadow(0 2px 4px rgba(214,51,132,0.4))",
          }}>
            <svg width="24" height="28" viewBox="0 0 24 28">
              <polygon points="12,26 2,4 22,4" fill="#d63384" /> {/* 외곽 */}
              <polygon points="12,22 5,7 19,7" fill="#ff6eb0" /> {/* 하이라이트 */}
            </svg>
          </div>

          {/* 회전 휠 */}
          <div style={{
            position: "absolute", top: "18px", left: "18px",
            width: "274px", height: "274px", borderRadius: "50%",
            overflow: "hidden",
            border: "4px solid #f9b8cc",
            boxShadow: "0 4px 20px rgba(214,51,132,0.3), inset 0 0 20px rgba(255,255,255,0.4)",
            transform: `rotate(${rotation}deg)`,
            transition: spinning
              ? "transform 4s cubic-bezier(0.17,0.67,0.12,0.99)" // 감속 회전
              : "none",
            zIndex: 3,
          }}>
            {/* 각 칸 렌더링 */}
            {PRIZES.map((prize, i) => {
              const startAngle = i * SLICE_DEG;
              const midAngle = startAngle + SLICE_DEG / 2;
              const rad = (midAngle - 90) * (Math.PI / 180);
              const ix = 137 + 80 * Math.cos(rad); // 아이콘 위치 (반지름 80)
              const iy = 137 + 80 * Math.sin(rad);
              const tx = 137 + 98 * Math.cos(rad); // 텍스트 위치 (반지름 98)
              const ty = 137 + 98 * Math.sin(rad);

              return (
                <div key={i} style={{ position: "absolute", width: "100%", height: "100%", top: 0, left: 0 }}>
                  {/* 칸 배경 SVG 부채꼴 */}
                  <svg width="274" height="274" style={{ position: "absolute", top: 0, left: 0 }}>
                    <path
                      d={describeArc(137, 137, 134, startAngle, startAngle + SLICE_DEG)}
                      fill={prize.color}
                      stroke="#f9b8cc"
                      strokeWidth="2"
                    />
                  </svg>
                  {/* 이모지 아이콘 */}
                  <div style={{
                    position: "absolute", left: ix, top: iy,
                    transform: `translate(-50%, -50%) rotate(${midAngle}deg)`,
                    fontSize: "18px", pointerEvents: "none",
                    filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))",
                  }}>
                    {prize.icon}
                  </div>
                  {/* 금액 텍스트 */}
                  <div style={{
                    position: "absolute", left: tx, top: ty,
                    transform: `translate(-50%, -50%) rotate(${midAngle}deg)`,
                    fontSize: prize.label === "10,000원" ? "9px" : "10px",
                    fontWeight: "700", color: prize.textColor,
                    whiteSpace: "nowrap", pointerEvents: "none",
                    letterSpacing: "0.5px",
                    textShadow: "0 1px 2px rgba(255,255,255,0.8)",
                  }}>
                    {prize.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 중앙 START 버튼 (클릭으로도 돌릴 수 있음) */}
          <div
            onClick={!spinning && !alreadySpun ? handleSpin : undefined}
            style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: "64px", height: "64px", borderRadius: "50%",
              background: spinning
                ? "linear-gradient(145deg, #e0a0b8, #c07090)"  // 회전 중
                : alreadySpun
                  ? "linear-gradient(145deg, #ccc, #aaa)"         // 이미 돌림
                  : "linear-gradient(145deg, #ff6eb0, #d63384)",  // 클릭 가능
              border: "4px solid #fff",
              boxShadow: spinning || alreadySpun
                ? "0 2px 10px rgba(0,0,0,0.2)"
                : "0 4px 16px rgba(214,51,132,0.5), inset 0 1px 0 rgba(255,255,255,0.4)",
              zIndex: 5,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: spinning || alreadySpun ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              animation: !spinning && !alreadySpun ? "roulettePulse 1.5s infinite" : "none",
            }}
          >
            <span style={{
              fontSize: "10px", fontWeight: "800",
              color: "#fff", letterSpacing: "0.5px",
              textAlign: "center", lineHeight: 1.2, userSelect: "none",
            }}>
              {spinning ? "⏳" : alreadySpun ? "✓" : "START!"}
            </span>
          </div>
        </div>
        {/* ── /룰렛 휠 영역 ── */}

        {/* 구분선 아래 결과/버튼 영역 */}
        <div style={{ borderTop: "1px dashed #ffb3cc", paddingTop: "16px" }}>

          {/* 오늘 이미 돌린 경우 안내 */}
          {alreadySpun && !result && (
            <div style={{
              textAlign: "center", padding: "12px",
              background: "#fff", borderRadius: "12px",
              border: "1.5px solid #ffb3cc", marginBottom: "12px",
            }}>
              <p style={{ margin: 0, fontSize: "13px", color: "#e07bab", fontWeight: "600" }}>
                🌙 내일 또 도전하세요!
              </p>
              <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#ccc" }}>
                매일 0시에 초기화됩니다
              </p>
            </div>
          )}

          {/* 당첨 결과 카드 */}
          {result && (
            <div style={{
              textAlign: "center", padding: "16px",
              background: result.hasCoupon
                ? "linear-gradient(135deg, #fff0f5, #ffe4ec)"
                : "#f9f9f9",
              borderRadius: "16px",
              border: `2px solid ${result.hasCoupon ? "#ffb3cc" : "#eee"}`,
              marginBottom: "12px",
              animation: "rouletteFadeIn 0.4s ease",
            }}>
              <div style={{ fontSize: "32px", marginBottom: "6px" }}>
                {result.hasCoupon ? "🎉" : "😢"}
              </div>
              <p style={{
                margin: "0 0 4px", fontSize: "11px",
                letterSpacing: "2px", fontWeight: "600",
                color: result.hasCoupon ? "#d63384" : "#aaa",
              }}>
                {result.hasCoupon ? "CONGRATULATIONS!" : "BETTER LUCK NEXT TIME"}
              </p>
              <p style={{
                margin: "0 0 4px", fontSize: "22px",
                fontWeight: "800",
                color: result.hasCoupon ? "#d63384" : "#888",
              }}>
                {result.prizeName}
              </p>
              {result.hasCoupon && (
                <p style={{ margin: 0, fontSize: "11px", color: "#e07bab" }}>
                  🎫 마이페이지 쿠폰함에서 확인하세요
                </p>
              )}
            </div>
          )}

          {/* 서버 에러 메시지 */}
          {error && (
            <p style={{
              fontSize: "12px", color: "#d63384",
              textAlign: "center", marginBottom: "10px",
              padding: "8px", background: "#fff0f5",
              borderRadius: "8px", border: "1px solid #ffb3cc",
            }}>
              {error}
            </p>
          )}

          {/* 닫기 버튼 (결과 후 또는 이미 돌린 경우) */}
          {(result || alreadySpun) && (
            <button onClick={onClose} style={{
              width: "100%", padding: "13px",
              background: "linear-gradient(135deg, #ff6eb0, #d63384)",
              color: "#fff", border: "none", borderRadius: "12px",
              fontSize: "13px", fontWeight: "700", letterSpacing: "2px",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(214,51,132,0.4)",
            }}>
              CLOSE
            </button>
          )}
        </div>
      </div>

      {/* CSS 키프레임 애니메이션 */}
      <style>{`
        /* START 버튼 맥박 효과 */
        @keyframes roulettePulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            box-shadow: 0 4px 16px rgba(214,51,132,0.5);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.08);
            box-shadow: 0 6px 24px rgba(214,51,132,0.7);
          }
        }
        /* 결과 카드 등장 효과 */
        @keyframes rouletteFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default RouletteModal;