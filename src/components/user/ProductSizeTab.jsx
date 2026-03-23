const ProductSizeTab = ({ product }) => {
  return (
    <div className="product-size-tab">
      <div className="size-title-box">
        <h2>SIZE INFO</h2>
        <p>아래 상세 사이즈를 참고하여 보다 편안한 쇼핑이 되시길 바랍니다.</p>
      </div>

      <table className="size-table">
        <thead>
          <tr>
            {product.sizeTable?.headers?.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {product.sizeTable?.rows?.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="model-info-box">
        <h3>MODEL SIZE</h3>
        <p>착용컬러 : {product.modelInfo?.color}</p>
        <p>착용사이즈 : {product.modelInfo?.wearingSize}</p>
        <p>
          키 {product.modelInfo?.height}cm / 하의 {product.modelInfo?.bottom} /
          슈즈 {product.modelInfo?.shoes}mm
        </p>
      </div>

      <div className="size-guide-box">
        <h3>사이즈 측정 방법</h3>
        <p>어깨 : 어깨 끝선부터 끝선까지 일자로 측정</p>
        <p>가슴 : 겨드랑이 아래 단면 기준 측정</p>
        <p>암홀 : 소매 연결 부분 기준 측정</p>
        <p>소매길이 : 어깨선부터 소매 끝까지 측정</p>
        <p>총장 : 넥라인 시작점부터 밑단까지 측정</p>
      </div>

      <div className="size-notice-box">
        <p>※ 측정 방법에 따라 1~3cm 정도 오차가 발생할 수 있습니다.</p>
        <p>※ 모니터 해상도 및 촬영 환경에 따라 색상 차이가 있을 수 있습니다.</p>
      </div>
    </div>
  );
};

export default ProductSizeTab;
