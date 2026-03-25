import { API_SERVER_HOST } from "../../../api/common/apiClient";
import "../../../css/common/ProductSizeTab.css";

export default function ProductSizeTab({ images = [] }) {
  const sizeImage =
    images.find(
      (img) => String(img.imageType || "").toUpperCase() === "SIZE",
    ) ?? null;

  const sizeGuideImageUrl = sizeImage?.imageUrl ?? null;

  return (
    <div className="pst-wrap">
      <h2 className="pst-title">실측 사이즈 안내</h2>
      <hr className="pst-divider" />

      {sizeGuideImageUrl ? (
        <div className="pst-image-wrap">
          <img
            src={`${API_SERVER_HOST}${sizeGuideImageUrl}`}
            alt="사이즈 가이드"
            className="pst-size-image"
          />
        </div>
      ) : (
        <div className="pst-empty">사이즈 안내 이미지가 없습니다.</div>
      )}
    </div>
  );
}
