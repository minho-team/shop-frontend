import { useState, useEffect } from "react";
import apiClient from "../../api/common/apiClient";

const PRIZES = [
  { label: "꽝", color: "#111" },
  { label: "500", color: "#888" },
  { label: "1,000", color: "#d4d4d4" },
  { label: "3,000", color: "#111" },
  { label: "5,000", color: "#888" },
  { label: "10,000", color: "#d4d4d4" },
];

const TOTAL = PRIZES.length;
const SLICE_DEG = 360 / TOTAL;

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
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [alreadySpun, setAlreadySpun] = useState(false);

  useEffect(() => {
    const lastSpun = localStorage.getItem("roulette_last_spun");
    const today = new Date().toISOString().slice(0, 10);
    if (lastSpun === today) setAlreadySpun(true);
  }, []);

  const handleSpin = async () => {
    if (spinning || alreadySpun) return;
    setResult(null);
    setError("");
    setSpinning(true);

    try {
      const res = await apiClient.post("/api/roulette/spin");
      const { prizeIndex, prizeName, hasCoupon } = res.data;

      const targetDeg = 360 - (prizeIndex * SLICE_DEG + SLICE_DEG / 2);
      const newRotation = rotation + 1800 + (targetDeg - (rotation % 360) + 360) % 360;
      setRotation(newRotation);

      setTimeout(() => {
        setResult({ prizeName, hasCoupon });
        setSpinning(false);
        const today = new Date().toISOString().slice(0, 10);
        localStorage.setItem("roulette_last_spun", today);
        setAlreadySpun(true);
      }, 4200);

    } catch (e) {
      setError(e.response?.data || "오류가 발생했습니다.");
      setSpinning(false);
      if (e.response?.data?.includes("이미")) setAlreadySpun(true);
    }
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div style={{
        background: "#fff",
        width: "360px",
        padding: "40px 32px 32px",
        position: "relative",
        fontFamily: "'Jost', sans-serif",
      }}>
        {/* 닫기 */}
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

        {/* 룰렛 휠 */}
        <div style={{ position: "relative", width: "260px", height: "260px", margin: "0 auto 24px" }}>

          {/* 화살표 */}
          <div style={{
            position: "absolute", top: "-12px", left: "50%",
            transform: "translateX(-50%)",
            width: 0, height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderTop: "18px solid #111",
            zIndex: 10,
          }} />

          {/* 회전 휠 */}
          <div style={{
            width: "260px", height: "260px", borderRadius: "50%",
            position: "relative", overflow: "hidden",
            border: "1.5px solid #111",
            transform: `rotate(${rotation}deg)`,
            transition: spinning
              ? "transform 4s cubic-bezier(0.17,0.67,0.12,0.99)"
              : "none",
          }}>
            {PRIZES.map((prize, i) => {
              const startAngle = i * SLICE_DEG;
              const midAngle = startAngle + SLICE_DEG / 2;
              const rad = (midAngle - 90) * (Math.PI / 180);
              const tx = 130 + 88 * Math.cos(rad);
              const ty = 130 + 88 * Math.sin(rad);
              const textColor = prize.color === "#111" ? "#fff" : "#111";
              return (
                <div key={i} style={{ position: "absolute", width: "100%", height: "100%", top: 0, left: 0 }}>
                  <svg width="260" height="260" style={{ position: "absolute", top: 0, left: 0 }}>
                    <path
                      d={describeArc(130, 130, 128, startAngle, startAngle + SLICE_DEG)}
                      fill={prize.color}
                      stroke="#fff"
                      strokeWidth="1.5"
                    />
                  </svg>
                  <div style={{
                    position: "absolute",
                    left: tx, top: ty,
                    transform: `translate(-50%,-50%) rotate(${midAngle}deg)`,
                    fontSize: "11px",
                    fontWeight: "500",
                    letterSpacing: "1px",
                    color: textColor,
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                  }}>
                    {prize.label === "꽝" ? "꽝" : `${prize.label}₩`}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 중앙 원 */}
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

        {/* 구분선 */}
        <div style={{ borderTop: "0.5px solid #e0e0e0", paddingTop: "20px" }}>

          {/* 이미 돌린 경우 */}
          {alreadySpun && !result && (
            <p style={{ fontSize: "13px", color: "#888", textAlign: "center", letterSpacing: "1px", margin: "0 0 16px" }}>
              내일 다시 도전하세요
            </p>
          )}

          {/* 결과 */}
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

          {/* 에러 */}
          {error && (
            <p style={{ fontSize: "12px", color: "#c00", textAlign: "center", marginBottom: "12px" }}>
              {error}
            </p>
          )}

          {/* 돌리기 버튼 */}
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

          {/* 닫기 버튼 (결과 후) */}
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