import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/common/apiClient";
import Header from "../../components/user/Header";

// 룰렛 칸 설정 (prizeIndex 순서와 일치)
const PRIZES = [
  { label: "꽝", color: "#bdbdbd" },
  { label: "500원", color: "#90caf9" },
  { label: "1,000원", color: "#a5d6a7" },
  { label: "3,000원", color: "#ffcc80" },
  { label: "5,000원", color: "#f48fb1" },
  { label: "10,000원", color: "#ce93d8" },
];

const TOTAL = PRIZES.length;
const SLICE_DEG = 360 / TOTAL;

const RoulettePage = () => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSpin = async () => {
    if (spinning) return;
    setResult(null);
    setError("");
    setSpinning(true);

    try {
      const res = await apiClient.post("/api/roulette/spin");
      const { prizeIndex, prizeName, hasCoupon } = res.data;

      // 해당 칸 중앙 각도 계산 (위쪽이 0도 기준)
      const targetDeg = 360 - (prizeIndex * SLICE_DEG + SLICE_DEG / 2);
      // 5바퀴 + 목표 각도
      const newRotation = rotation + 1800 + (targetDeg - (rotation % 360) + 360) % 360;

      setRotation(newRotation);

      setTimeout(() => {
        setResult({ prizeName, hasCoupon });
        setSpinning(false);
      }, 4500);

    } catch (e) {
      setError(e.response?.data || "오류가 발생했습니다.");
      setSpinning(false);
    }
  };

  return (
    <>
      <Header />
      <div style={{ maxWidth: "480px", margin: "60px auto", textAlign: "center", padding: "0 20px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>매일 룰렛 🎰</h2>
        <p style={{ color: "#888", fontSize: "14px", marginBottom: "40px" }}>
          매일 로그인 후 한 번 돌릴 수 있어요!
        </p>

        {/* 룰렛 휠 */}
        <div style={{ position: "relative", width: "320px", height: "320px", margin: "0 auto 16px" }}>

          {/* 화살표 */}
          <div style={{
            position: "absolute", top: "-18px", left: "50%",
            transform: "translateX(-50%)",
            width: 0, height: 0,
            borderLeft: "12px solid transparent",
            borderRight: "12px solid transparent",
            borderTop: "28px solid #222",
            zIndex: 10,
          }} />

          {/* 회전 휠 */}
          <div style={{
            width: "320px", height: "320px", borderRadius: "50%",
            position: "relative", overflow: "hidden",
            border: "4px solid #222",
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? "transform 4s cubic-bezier(0.17,0.67,0.12,0.99)" : "none",
          }}>
            {PRIZES.map((prize, i) => {
              const startAngle = i * SLICE_DEG;
              const midAngle = startAngle + SLICE_DEG / 2;
              const rad = (midAngle - 90) * (Math.PI / 180);
              const textR = 110;
              const tx = 160 + textR * Math.cos(rad);
              const ty = 160 + textR * Math.sin(rad);
              return (
                <div key={i} style={{ position: "absolute", width: "100%", height: "100%", top: 0, left: 0 }}>
                  {/* 칸 배경 */}
                  <svg width="320" height="320" style={{ position: "absolute", top: 0, left: 0 }}>
                    <path
                      d={describeArc(160, 160, 156, startAngle, startAngle + SLICE_DEG)}
                      fill={prize.color}
                      stroke="#fff"
                      strokeWidth="2"
                    />
                  </svg>
                  {/* 텍스트 */}
                  <div style={{
                    position: "absolute",
                    left: tx, top: ty,
                    transform: `translate(-50%, -50%) rotate(${midAngle}deg)`,
                    fontSize: "12px", fontWeight: "bold", color: "#333",
                    whiteSpace: "nowrap", pointerEvents: "none",
                  }}>
                    {prize.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 중앙 원 */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: "50px", height: "50px", borderRadius: "50%",
            background: "#222", zIndex: 5,
          }} />
        </div>

        {/* 확률 안내 */}
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
          {[
            { label: "꽝", prob: "50%", color: "#bdbdbd" },
            { label: "500원", prob: "25%", color: "#90caf9" },
            { label: "1,000원", prob: "15%", color: "#a5d6a7" },
            { label: "3,000원", prob: "7%", color: "#ffcc80" },
            { label: "5,000원", prob: "2.5%", color: "#f48fb1" },
            { label: "10,000원", prob: "0.5%", color: "#ce93d8" },
          ].map(p => (
            <span key={p.label} style={{
              padding: "4px 10px", borderRadius: "12px",
              background: p.color, fontSize: "12px", color: "#333"
            }}>
              {p.label} {p.prob}
            </span>
          ))}
        </div>

        {/* 돌리기 버튼 */}
        <button onClick={handleSpin} disabled={spinning}
          style={{
            padding: "14px 48px", fontSize: "16px", fontWeight: "bold",
            background: spinning ? "#aaa" : "#222", color: "#fff",
            border: "none", borderRadius: "8px", cursor: spinning ? "not-allowed" : "pointer",
          }}>
          {spinning ? "돌리는 중..." : "🎰 룰렛 돌리기"}
        </button>

        {/* 결과 */}
        {result && (
          <div style={{
            marginTop: "32px", padding: "24px",
            background: result.hasCoupon ? "#e8f5e9" : "#f5f5f5",
            borderRadius: "12px", border: `2px solid ${result.hasCoupon ? "#4caf50" : "#ddd"}`
          }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>
              {result.hasCoupon ? "🎉" : "😢"}
            </div>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: result.hasCoupon ? "#2e7d32" : "#888" }}>
              {result.prizeName}
            </div>
            {result.hasCoupon && (
              <p style={{ fontSize: "13px", color: "#555", marginTop: "8px" }}>
                쿠폰이 발급되었습니다! 마이페이지에서 확인하세요.
              </p>
            )}
          </div>
        )}

        {/* 에러 */}
        {error && (
          <div style={{ marginTop: "24px", padding: "16px", background: "#fce4ec", borderRadius: "8px", color: "#c62828", fontSize: "14px" }}>
            {error}
          </div>
        )}
      </div>
    </>
  );
};

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

export default RoulettePage;