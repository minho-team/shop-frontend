import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import { getProductMainAndThumbImages } from "../api/productApi";

const API_BASE_URL = "http://localhost:8080";

const ProductDetailPage = () => {
  const { id } = useParams();
  const [imageData, setImageData] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const data = await getProductMainAndThumbImages(id);
        console.log("이미지 리스트 응답:", data);
        setImageData(data);
      } catch (error) {
        console.error("이미지 조회 실패:", error);
      }
    };

    fetchImages();
  }, [id]);

  return (
    <>
      <Header />
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px" }}>
        <h2>상품 상세 이미지 테스트</h2>

        {!imageData ? (
          <p>이미지를 불러오는 중입니다.</p>
        ) : (
          <>
            <p>상품번호: {imageData.productNo}</p>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {imageData.images.map((img) => (
                <div key={img.productImgNo}>
                  <p>{img.imageType}</p>
                  <img
                    src={`${API_BASE_URL}${img.imageUrl}`}
                    alt={img.imageType}
                    style={{ width: "1000px", border: "1px solid #ddd" }}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ProductDetailPage;
