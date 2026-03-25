import { useState, useEffect } from "react";
import apiClient from "../../api/common/apiClient";
import { useUser } from "../../context/UserContext"; // ✅ 계정 정보 가져오기

// 룰렛 칸 설정 (prizeIndex 순서와 백엔드 일치)
const PRIZES = [
  { label: "꽝", color: "#111" },
  { label: "500", color: "#888" },
  { label: "1,000", color: "#d4d4d4" },
  { label: "3,000", color: "#111" },
  { label: "5,000", color: "#888" },
  { label: "10,000", color: "#d4d4d4" },
];

const TOTAL = PRIZES.length;      // 칸 수 (6)
const SLICE_DEG = 360 / TOTAL;        // 한 칸 각도 (60도)

// SVG 부채꼴 경로 계산 함수
function describeArc(cx, cy, r, startAngle, endAngle) {
  const toRad = (deg) => (deg - 90) * (Math.PI / 180);
  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(endAngle));
  const y2 = cy + r * Math.sin(toRad(endAngle));
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

const RouletteModal = ({ onClose }) => {
  const { user } = useUser(); // 현재 로그인한 유저 정보

  const [spinning, setSpinning] = useState(false); // 룰렛 회전 중 여부
  const [rotation, setRotation] = useState(0);     // 누적 회전 각도
  const [result, setResult] = useState(null);  // 최종 결과 { prizeName, hasCoupon }
  const [error, setError] = useState("");    // 에러 메시지
  const [alreadySpun, setAlreadySpun] = useState(false); // 오늘 이미 돌렸는지 여부

  // ✅ 계정별 localStorage 키 생성
  //    → "roulette_last_spun_일도123" 형태로 계정마다 다른 키 사용
  //    → user가 아직 로드되지 않았으면 null 반환
  const getStorageKey = () =>
    user?.memberId ? `roulette_last_spun_${user.memberId}` : null;

  // 모달 열릴 때 & 계정 전환 시: 오늘 이미 돌렸는지 확인
  useEffect(() => {
    const key = getStorageKey();
    if (!key) return; // user 로드 전에는 스킵

    const lastSpun = localStorage.getItem(key);
    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    if (lastSpun === today) setAlreadySpun(true);
  }, [user]); // user 변경(로그인/전환) 시 재확인

  // 룰렛 돌리기 버튼 핸들러
  const handleSpin = async () => {
    if (spinning || alreadySpun) return; // 회전 중이거나 이미 돌린 경우 차단
    setResult(null);
    setError("");
    setSpinning(true);

    try {
      // 백엔드에서 당첨 결과 수신
      const res = await apiClient.post("/api/roulette/spin");
      const { prizeIndex, prizeName, hasCoupon } = res.data;

      // 당첨 칸 중앙 각도 계산 (위쪽 12시 방향 = 0도 기준)
      const targetDeg = 360 - (prizeIndex * SLICE_DEG + SLICE_DEG / 2);
      // 5바퀴(1800도) + 목표 각도로 최종 회전값 계산
      const newRotation = rotation + 1800 + (targetDeg - (rotation % 360) + 360) % 360;
      setRotation(newRotation);

      // 애니메이션(4.2초) 종료 후 결과 처리
      setTimeout(() => {
        setResult({ prizeName, hasCoupon });
        setSpinning(false);

        // ✅ 오늘 날짜를 계정별 키로 저장 → 다른 계정엔 영향 없음
        const key = getStorageKey();
        if (key) {
          const today = new Date().toISOString().slice(0, 10);
          localStorage.setItem(key, today);
        }
        setAlreadySpun(true);
      }, 4200);

    } catch (e) {
      // 서버에서 "이미 오늘 돌렸습니다" 등 에러 응답 처리
      setError(e.response?.data || "오류가 발생했습니다.");
      setSpinning(false);
      // 서버에서 "이미 돌렸다" 응답 시 localStorage에도 저장 → 다음 페이지 로드 때 팝업 안 뜨게
      if (e.response?.data?.includes("이미")) {
        setAlreadySpun(true);
        const key = getStorageKey();
        if (key) {
          const today = new Date().toISOString().slice(0, 10);
          localStorage.setItem(key, today);
        }
      }
    }
  };

  return (
    /* 모달 배경 - 배경 클릭 시 닫기 */
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {/* 모달 본체 */}
      <div style={{
        background: "#fff",
        width: "360px",
        padding: "40px 32px 32px",
        position: "relative",
        fontFamily: "'Jost', sans-serif",
      }}>

        {/* 우측 상단 닫기 버튼 */}
        <button onClick={onClose} style={{
          position: "absolute", top: "16px", right: "20px",
          border: "none", background: "none",
          fontSize: "16px", cursor: "pointer", color: "#aaa",
        }}>✕</button>

        {/* 타이틀 */}
        <p style={{ fontSize: "10px", letterSpacing: "4px", color: "#aaa", margin: "0 0 4px" }}>
          DAILY
        </p>
        <h2 style={{ fontSize: "20px", fontWeight: "500", color: "#111", margin: "0 0 28px", letterSpacing: "2px" }}>
          LUCKY WHEEL
        </h2>

        {/* ── 룰렛 휠 영역 ── */}
        <div style={{ position: "relative", width: "260px", height: "260px", margin: "0 auto 24px" }}>

          {/* 위쪽 삼각형 화살표 (당첨 기준선) */}
          <div style={{
            position: "absolute", top: "-12px", left: "50%",
            transform: "translateX(-50%)",
            width: 0, height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderTop: "18px solid #111",
            zIndex: 10,
          }} />

          {/* 회전 휠 (CSS transform으로 회전) */}
          <div style={{
            width: "260px", height: "260px", borderRadius: "50%",
            position: "relative", overflow: "hidden",
            border: "1.5px solid #111",
            transform: `rotate(${rotation}deg)`,
            transition: spinning
              ? "transform 4s cubic-bezier(0.17,0.67,0.12,0.99)" // 감속 회전
              : "none",
          }}>
            {/* 각 칸 렌더링 */}
            {PRIZES.map((prize, i) => {
              const startAngle = i * SLICE_DEG;
              const midAngle = startAngle + SLICE_DEG / 2;
              const rad = (midAngle - 90) * (Math.PI / 180);
              // 텍스트 위치: 반지름 88px 지점
              const tx = 130 + 88 * Math.cos(rad);
              const ty = 130 + 88 * Math.sin(rad);
              // 어두운 칸은 흰 글씨, 밝은 칸은 검정 글씨
              const textColor = prize.color === "#111" ? "#fff" : "#111";
              return (
                <div key={i} style={{ position: "absolute", width: "100%", height: "100%", top: 0, left: 0 }}>
                  {/* 칸 배경 (SVG 부채꼴) */}
                  <svg width="260" height="260" style={{ position: "absolute", top: 0, left: 0 }}>
                    <path
                      d={describeArc(130, 130, 128, startAngle, startAngle + SLICE_DEG)}
                      fill={prize.color}
                      stroke="#fff"
                      strokeWidth="1.5"
                    />
                  </svg>
                  {/* 칸 텍스트 */}
                  <div style={{
                    position: "absolute",
                    left: tx, top: ty,
                    transform: `translate(-50%,-50%) rotate(${midAngle}deg)`,
                    fontSize: "11px", fontWeight: "500",
                    letterSpacing: "1px", color: textColor,
                    whiteSpace: "nowrap", pointerEvents: "none",
                  }}>
                    {prize.label === "꽝" ? "꽝" : `${prize.label}₩`}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 중앙 원 (SPIN 텍스트) */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            width: "48px", height: "48px", borderRadius: "50%",
            background: "#fff", border: "1.5px solid #111",
            zIndex: 5, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: "9px", letterSpacing: "1px", color: "#111" }}>SPIN</span>
          </div>
        </div>
        {/* ── /룰렛 휠 영역 ── */}

        {/* 구분선 아래 컨트롤 영역 */}
        <div style={{ borderTop: "0.5px solid #e0e0e0", paddingTop: "20px" }}>

          {/* 오늘 이미 돌린 경우 안내 문구 */}
          {alreadySpun && !result && (
            <p style={{ fontSize: "13px", color: "#888", textAlign: "center", letterSpacing: "1px", margin: "0 0 16px" }}>
              내일 다시 도전하세요
            </p>
          )}

          {/* 당첨 결과 표시 */}
          {result && (
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <p style={{ fontSize: "10px", letterSpacing: "3px", color: "#aaa", margin: "0 0 4px" }}>
                {result.hasCoupon ? "CONGRATULATIONS" : "BETTER LUCK NEXT TIME"}
              </p>
              <p style={{ fontSize: "20px", fontWeight: "500", color: "#111", margin: "0 0 4px", letterSpacing: "1px" }}>
                {result.prizeName}
              </p>
              {result.hasCoupon && (
                <p style={{ fontSize: "12px", color: "#888", margin: 0 }}>
                  마이페이지 쿠폰함에서 확인하세요
                </p>
              )}
            </div>
          )}

          {/* 서버 에러 메시지 */}
          {error && (
            <p style={{ fontSize: "12px", color: "#c00", textAlign: "center", marginBottom: "12px" }}>
              {error}
            </p>
          )}

          {/* 룰렛 돌리기 버튼 (아직 안 돌린 경우만 표시) */}
          {!alreadySpun && (
            <button onClick={handleSpin} disabled={spinning} style={{
              width: "100%", padding: "14px",
              background: spinning ? "#888" : "#111",
              color: "#fff", border: "none",
              fontSize: "12px", letterSpacing: "4px",
              cursor: spinning ? "not-allowed" : "pointer",
              fontFamily: "'Jost', sans-serif",
              transition: "background 0.2s",
            }}>
              {spinning ? "SPINNING..." : "SPIN"}
            </button>
          )}

          {/* 닫기 버튼 (결과 확인 후 또는 이미 돌린 경우 표시) */}
          {(result || alreadySpun) && (
            <button onClick={onClose} style={{
              width: "100%", padding: "12px", marginTop: "10px",
              background: "#fff", color: "#111",
              border: "0.5px solid #ddd",
              fontSize: "12px", letterSpacing: "3px",
              cursor: "pointer",
              fontFamily: "'Jost', sans-serif",
            }}>
              CLOSE
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouletteModal;