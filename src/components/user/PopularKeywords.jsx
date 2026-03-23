import { useNavigate } from "react-router-dom";
import "../../css/common/PopularKeywords.css";

const PopularKeywords = ({ keywords = [] }) => {
  const nav = useNavigate();

  if (!keywords || keywords.length === 0) return null;

  return (
    <section className="popular-keywords-section">
      <div className="popular-keywords-inner">
        <span className="popular-keywords-label">실시간 인기 검색어</span>
        <div className="popular-keywords-list">
          {keywords.map((item, index) => (
            <button
              key={index}
              className={`popular-keyword-chip${index < 3 ? " top3" : ""}`}
              onClick={() => nav(`/?keyword=${encodeURIComponent(item.name)}`)}
            >
              <span className="keyword-rank">{index + 1}</span>
              <span className="keyword-name">{item.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularKeywords;