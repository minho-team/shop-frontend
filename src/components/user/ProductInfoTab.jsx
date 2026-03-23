const ProductInfoTab = ({ product }) => {
  return (
    <div className="product-info-tab">
      <div className="info-main-image-wrap">
        <img
          src={product.detailImages?.[0]}
          alt={product.name}
          className="info-main-image"
        />
      </div>

      <div className="info-title-box">
        <h2 className="info-title">{product.name}</h2>
        <p className="info-subtitle">{product.description}</p>
      </div>

      <div className="info-point-box">
        {product.points?.map((point, index) => (
          <div key={index} className="info-point-item">
            {point}
          </div>
        ))}
      </div>

      <div className="info-detail-grid">
        {product.detailImages?.slice(1).map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`${product.name} 상세 이미지 ${index + 1}`}
            className="info-detail-image"
          />
        ))}
      </div>

      <div className="info-description-box">
        {product.detailTexts?.map((text, index) => (
          <p key={index}>{text}</p>
        ))}
      </div>

      <div className="info-spec-box">
        <div className="info-spec-row">
          <span className="label">컬러</span>
          <span>{product.colors?.join(" / ")}</span>
        </div>
        <div className="info-spec-row">
          <span className="label">소재</span>
          <span>{product.fabric}</span>
        </div>
        <div className="info-spec-row">
          <span className="label">두께감</span>
          <span>{product.fit?.thickness}</span>
        </div>
        <div className="info-spec-row">
          <span className="label">비침</span>
          <span>{product.fit?.seeThrough}</span>
        </div>
        <div className="info-spec-row">
          <span className="label">신축성</span>
          <span>{product.fit?.stretch}</span>
        </div>
        <div className="info-spec-row">
          <span className="label">안감</span>
          <span>{product.fit?.lining}</span>
        </div>
        <div className="info-spec-row">
          <span className="label">촉감</span>
          <span>{product.fit?.touch}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductInfoTab;
