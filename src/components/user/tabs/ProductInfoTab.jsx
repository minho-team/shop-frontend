import { API_SERVER_HOST } from "../../../api/common/apiClient";
import "../../../css/common/ProductInfoTab.css";

// 상품정보 탭 체크박스 속성 데이터
const PRODUCT_ATTRIBUTES = [
  {
    label: "두께감",
    key: "thickness",
    options: ["두꺼움", "보통", "얇음"],
  },
  {
    label: "비침",
    key: "transparency",
    options: ["있음", "약간있음", "없음"],
  },
  {
    label: "신축성",
    key: "elasticity",
    options: ["좋음", "약간있음", "없음"],
  },
  {
    label: "촉감",
    key: "texture",
    options: ["부드러움", "보통", "까슬함"],
  },
  {
    label: "사이즈",
    key: "sizeType",
    options: ["크게나옴", "정사이즈", "작게나옴"],
  },
  {
    label: "안감",
    key: "lining",
    options: ["전체", "부분", "없음"],
  },
  {
    label: "세탁방법",
    key: "washing",
    options: ["드라이클리닝", "손세탁"],
  },
];

// 계절 아이콘 SVG 컴포넌트
const SeasonIcon = ({ season }) => {
  const icons = {
    봄: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="28" r="6" stroke="currentColor" strokeWidth="1.5" />
        <line
          x1="20"
          y1="8"
          x2="20"
          y2="14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="20"
          y1="14"
          x2="16"
          y2="20"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="20"
          y1="14"
          x2="24"
          y2="20"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="20" cy="14" r="2" fill="currentColor" />
      </svg>
    ),
    여름: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="7" stroke="currentColor" strokeWidth="1.5" />
        <line
          x1="20"
          y1="4"
          x2="20"
          y2="9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="20"
          y1="31"
          x2="20"
          y2="36"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="4"
          y1="20"
          x2="9"
          y2="20"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="31"
          y1="20"
          x2="36"
          y2="20"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="8.686"
          y1="8.686"
          x2="12.222"
          y2="12.222"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="27.778"
          y1="27.778"
          x2="31.314"
          y2="31.314"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="31.314"
          y1="8.686"
          x2="27.778"
          y2="12.222"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="12.222"
          y1="27.778"
          x2="8.686"
          y2="31.314"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    가을: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M20 32 C14 28 10 22 12 14 C16 16 18 20 18 20 C18 14 22 8 28 8 C28 16 24 22 20 32Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <line
          x1="20"
          y1="32"
          x2="20"
          y2="36"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    겨울: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line
          x1="20"
          y1="6"
          x2="20"
          y2="34"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="6"
          y1="20"
          x2="34"
          y2="20"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="9.757"
          y1="9.757"
          x2="30.243"
          y2="30.243"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="30.243"
          y1="9.757"
          x2="9.757"
          y2="30.243"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="20" cy="20" r="3" fill="currentColor" />
      </svg>
    ),
  };
  return icons[season] || null;
};

export default function ProductInfoTab({ product, images = [] }) {
  const galleryImages = images.filter((img) => img.imageType === "GALLERY");
  const detailImages = galleryImages.length > 0 ? galleryImages : images;

  // product에 속성 필드가 없으면 더미 값 사용
  const getAttrValue = (key) => product?.[key] ?? null;

  const seasons = product?.seasons ?? ["봄", "여름", "가을", "겨울"];

  // 품질 정보
  const legalInfo = [
    ["소재", product?.material ?? "텐셀60%, 폴리40%"],
    ["색상", product?.colors ?? "아이보리, 그레이, 블랙"],
    ["제조사", product?.manufacturer ?? "블루라벨 제휴업체"],
    ["제조일", product?.madeDate ?? "최근 1개월 이내"],
    ["제조국", product?.madeIn ?? "중국 (OEM)"],
    [
      "품질보증기준",
      product?.qualityStandard ??
        "전자상거래 서비스자 보호법에 규정되어 있는 소비자청약철회 가능법위를 준수합니다.",
    ],
  ];

  return (
    <div className="pit-wrap">
      {/*  1. 상세 이미지 (갤러리) */}
      {detailImages.length > 0 && (
        <div className="pit-gallery">
          {detailImages.map((img) => (
            <img
              key={img.productImgNo}
              src={`${API_SERVER_HOST}${img.imageUrl}`}
              alt="상품 상세 이미지"
              className="pit-gallery-img"
            />
          ))}
        </div>
      )}

      {/* 2. PRODUCT INFO 체크박스 속성 표 */}
      <section className="pit-section pit-attr-section">
        <h2 className="pit-section-title">PRODUCT INFO</h2>
        <div className="pit-attr-table">
          {PRODUCT_ATTRIBUTES.map(({ label, key, options }) => {
            const selected = getAttrValue(key);
            return (
              <div key={key} className="pit-attr-row">
                <span className="pit-attr-label">{label}</span>
                <div className="pit-attr-options">
                  {options.map((opt) => {
                    const isChecked = selected === opt;
                    return (
                      <label
                        key={opt}
                        className={`pit-checkbox-item ${isChecked ? "pit-checkbox-item--checked" : ""}`}
                      >
                        <span
                          className={`pit-checkbox ${isChecked ? "pit-checkbox--on" : ""}`}
                        ></span>
                        <span className="pit-checkbox-text">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* 품질 정보 박스 */}
        <div className="pit-legal-box">
          {legalInfo.map(([k, v]) => (
            <div key={k} className="pit-legal-row">
              <span className="pit-legal-key">{k}</span>
              <span className="pit-legal-val">{v}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 입기 좋은 계절 */}
      <section className="pit-section pit-season-section">
        <h2 className="pit-section-title">착용 가능한 계절</h2>
        <div className="pit-season-grid">
          {["봄", "여름", "가을", "겨울"].map((s) => {
            const active = seasons.includes(s);
            return (
              <div
                key={s}
                className={`pit-season-card ${active ? "pit-season-card--on" : "pit-season-card--off"}`}
              >
                <div className="pit-season-icon">
                  <SeasonIcon season={s} />
                </div>
                <span className="pit-season-name">{s}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. 배송 & 교환/반품 안내 */}
      <section className="pit-section pit-delivery-section">
        <h2 className="pit-section-title">배송 &amp; 교환/반품 안내</h2>
        <div className="pit-info-grid">
          {[
            { icon: "🚚", title: "배송방법", desc: "일반 배송 (CJ대한통운)" },
            {
              icon: "📅",
              title: "배송기간",
              desc: "결제 완료 후 1~3 영업일 이내 출고",
            },
            {
              icon: "💰",
              title: "배송비",
              desc: "무료",
            },
            {
              icon: "⚡",
              title: "당일출고",
              desc:
                product?.sameDayDeliveryYn === "Y"
                  ? "오늘 출고 가능"
                  : "해당 없음",
            },
            {
              icon: "↩️",
              title: "교환/반품",
              desc: "수령 후 7일 이내 가능 (착용·세탁·훼손 시 불가)",
            },
            {
              icon: "📞",
              title: "고객센터",
              desc: "평일 10:00 ~ 17:00 (점심 12~13시 제외)",
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="pit-info-card">
              <span className="pit-info-icon">{icon}</span>
              <div className="pit-info-text">
                <strong>{title}</strong>
                <p>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
