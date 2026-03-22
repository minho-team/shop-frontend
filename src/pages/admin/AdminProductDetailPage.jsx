import AdminLayout from "../../components/admin/AdminLayout";
import AdminHeader from "../../components/admin/AdminHeader";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  getAdminProductDetail,
  putAdminProductBasic,
  deleteAdminProduct,
} from "../../api/admin/adminProductApi";

import {
  getAdminProductImages,
  putThumbnailImage,
  putMainImage,
  deleteMainImage,
  postGalleryImage,
  putGalleryImage,
  deleteGalleryImage,
  putSizeChartImage,
  deleteSizeChartImage,
} from "../../api/admin/adminProductImageApi";

import {
  getAdminProductOptions,
  postAdminProductOption,
  putAdminProductOption,
  deleteAdminProductOption,
} from "../../api/admin/adminProductOptionApi";

import { API_SERVER_HOST } from "../../api/common/apiClient";
import "../../css/admin/AdminProductDetail.css";

const AdminProductDetailPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { productNo } = useParams();
  const navigate = useNavigate();

  // =========================
  // 1. 기본정보 상태
  // =========================
  const [basicInfo, setBasicInfo] = useState({
    productNo: "",
    categoryName: "",
    productName: "",
    price: 0,
    discountRate: 0,
    saleStatus: "Y",
    sameDayDelivery: "N",
    viewCount: 0,
    createdAt: "",
  });

  // =========================
  // 2. 이미지 상태
  // =========================
  const [imageInfo, setImageInfo] = useState({
    thumbnailImage: null,
    mainImage: null,
    galleryImages: [],
    sizeChartImage: null,
  });

  // =========================
  // 3. 옵션 상태
  // =========================
  const [optionInfo, setOptionInfo] = useState({
    isNoOptionProduct: false,
    baseStock: 0,
    options: [],
  });

  const [newOption, setNewOption] = useState({
    color: "",
    size: "",
    stock: 0,
    useYn: "Y",
  });

  const [loading, setLoading] = useState(true);

  // =========================
  // 4. 파일 input ref
  // =========================
  const thumbnailInputRef = useRef(null);
  const mainImageInputRef = useRef(null);
  const galleryAddInputRef = useRef(null);
  const sizeChartInputRef = useRef(null);
  const galleryReplaceInputRefs = useRef({});

  // =========================
  // 5. 판매가 자동 계산
  // =========================
  const salePrice = useMemo(() => {
    const price = Number(basicInfo.price) || 0;
    const discountRate = Number(basicInfo.discountRate) || 0;

    const discountedPrice = price * (1 - discountRate / 100);

    return Math.floor(discountedPrice / 100) * 100;
  }, [basicInfo.price, basicInfo.discountRate]);

  // =========================
  // 6. 기본정보 조회
  // =========================
  const fetchBasicInfo = async () => {
    try {
      const data = await getAdminProductDetail(productNo);

      setBasicInfo({
        productNo: data?.productNo || "",
        categoryName: data?.categoryId || "",
        productName: data?.name || "",
        price: data?.price || 0,
        discountRate: data?.discountRate || 0,
        saleStatus: data?.useYn || "Y",
        sameDayDelivery: data?.sameDayDeliveryYn || "N",
        viewCount: data?.viewCount || 0,
        createdAt: data?.createdAt || "",
      });
    } catch (error) {
      console.error("기본정보 조회 실패:", error);
      alert("기본정보를 불러오지 못했습니다.");
    }
  };

  // =========================
  // 7. 이미지 조회
  // =========================
  const fetchImages = async () => {
    try {
      const data = await getAdminProductImages(productNo);

      setImageInfo({
        thumbnailImage: data?.thumbnailImage || null,
        mainImage: data?.mainImage || null,
        galleryImages: data?.galleryImages || [],
        sizeChartImage: data?.sizeChartImage || null,
      });
    } catch (error) {
      console.error("이미지 조회 실패:", error);
      alert("이미지 정보를 불러오지 못했습니다.");
    }
  };

  // =========================
  // 8. 옵션 조회
  // =========================
  const fetchOptions = async () => {
    try {
      const data = await getAdminProductOptions(productNo);

      if (Array.isArray(data)) {
        const optionList = data.map((option) => ({
          ...option,
          isEditing: false,
        }));

        setOptionInfo({
          isNoOptionProduct: false,
          baseStock: 0,
          options: optionList,
        });

        return;
      }

      const optionList = (data?.options || []).map((option) => ({
        ...option,
        isEditing: false,
      }));

      setOptionInfo({
        isNoOptionProduct: data?.isNoOptionProduct ?? false,
        baseStock: data?.baseStock ?? 0,
        options: optionList,
      });
    } catch (error) {
      console.error("옵션 조회 실패:", error);
      alert("옵션 정보를 불러오지 못했습니다.");
    }
  };

  // =========================
  // 9. 전체 상세 조회
  // =========================
  const fetchAllDetail = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchBasicInfo(), fetchImages(), fetchOptions()]);
    } catch (error) {
      console.error("상세 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!productNo) return;
    fetchAllDetail();
  }, [productNo]);

  // =========================
  // 10. 기본정보 input 변경
  // =========================
  const handleBasicInfoChange = (e) => {
    const { name, value } = e.target;

    setBasicInfo((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "discountRate" || name === "viewCount"
          ? Number(value)
          : value,
    }));
  };

  // =========================
  // 11. 기본정보 저장
  // =========================
  const handleBasicInfoSave = async () => {
    try {
      const requestData = {
        productName: basicInfo.productName,
        price: basicInfo.price,
        discountRate: basicInfo.discountRate,
        useYn: basicInfo.saleStatus,
        sameDayDeliveryYn: basicInfo.sameDayDelivery,
      };

      await putAdminProductBasic(productNo, requestData);

      alert("기본정보가 저장되었습니다.");
      await fetchBasicInfo();
    } catch (error) {
      console.error("기본정보 저장 실패:", error);
      alert("기본정보 저장에 실패했습니다.");
    }
  };

  // =========================
  // 12. 옵션 편집 시작
  // =========================
  const handleOptionEdit = (productOptionNo) => {
    setOptionInfo((prev) => ({
      ...prev,
      options: prev.options.map((option) =>
        option.productOptionNo === productOptionNo
          ? { ...option, isEditing: true }
          : option,
      ),
    }));
  };

  // =========================
  // 13. 옵션 변경
  // =========================
  const handleOptionChange = (productOptionNo, field, value) => {
    setOptionInfo((prev) => ({
      ...prev,
      options: prev.options.map((option) =>
        option.productOptionNo === productOptionNo
          ? {
              ...option,
              [field]: field === "stock" ? Number(value) : value,
            }
          : option,
      ),
    }));
  };

  // =========================
  // 14. 옵션 저장
  // =========================
  const handleOptionSave = async (productOptionNo) => {
    try {
      const targetOption = optionInfo.options.find(
        (option) => option.productOptionNo === productOptionNo,
      );

      if (!targetOption) {
        alert("저장할 옵션을 찾지 못했습니다.");
        return;
      }

      const requestData = {
        color: targetOption.color,
        optionSize: targetOption.optionSize,
        stock: targetOption.stock,
        useYn: targetOption.useYn,
      };

      await putAdminProductOption(productNo, productOptionNo, requestData);

      alert("옵션이 저장되었습니다.");
      await fetchOptions();
    } catch (error) {
      console.error("옵션 저장 실패:", error);
      alert("옵션 저장에 실패했습니다.");
    }
  };

  // =========================
  // 15. 옵션 취소
  // =========================
  const handleOptionCancel = async () => {
    await fetchOptions();
  };

  // =========================
  // 16. 옵션 삭제
  // =========================
  const handleOptionDelete = async (productOptionNo) => {
    const isConfirm = window.confirm("해당 옵션을 삭제하시겠습니까?");
    if (!isConfirm) return;

    try {
      await deleteAdminProductOption(productNo, productOptionNo);

      alert("옵션이 삭제되었습니다.");
      await fetchOptions();
    } catch (error) {
      console.error("옵션 삭제 실패:", error);
      alert("옵션 삭제에 실패했습니다.");
    }
  };

  // =========================
  // 17. 새 옵션 입력값 변경
  // =========================
  const handleNewOptionChange = (e) => {
    const { name, value } = e.target;

    setNewOption((prev) => ({
      ...prev,
      [name]: name === "stock" ? Number(value) : value,
    }));
  };

  // =========================
  // 18. 옵션 추가
  // =========================
  const handleAddOption = async () => {
    try {
      const requestData = {
        color: newOption.color,
        optionSize: newOption.size,
        stock: newOption.stock,
        useYn: newOption.useYn,
      };

      await postAdminProductOption(productNo, requestData);

      alert("옵션이 추가되었습니다.");

      setNewOption({
        color: "",
        size: "",
        stock: 0,
        useYn: "Y",
      });

      await fetchOptions();
    } catch (error) {
      console.error("옵션 추가 실패:", error);
      alert("옵션 추가에 실패했습니다.");
    }
  };

  // =========================
  // 19. 무옵션 상품 기본재고 변경
  // =========================
  const handleBaseStockChange = (e) => {
    const { value } = e.target;

    setOptionInfo((prev) => ({
      ...prev,
      baseStock: Number(value),
    }));
  };

  // =========================
  // 20. 썸네일 이미지 변경
  // =========================
  const handleThumbnailButtonClick = () => {
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.click();
    }
  };

  const handleThumbnailFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await putThumbnailImage(productNo, file);

      alert("썸네일 이미지가 변경되었습니다.");
      await fetchImages();
    } catch (error) {
      console.error("썸네일 이미지 변경 실패:", error);
      alert("썸네일 이미지 변경에 실패했습니다.");
    } finally {
      e.target.value = "";
    }
  };

  // =========================
  // 21. 메인 이미지 변경 / 삭제
  // =========================
  const handleMainImageButtonClick = () => {
    if (mainImageInputRef.current) {
      mainImageInputRef.current.click();
    }
  };

  const handleMainImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await putMainImage(productNo, file);

      alert("메인 이미지가 변경되었습니다.");
      await fetchImages();
    } catch (error) {
      console.error("메인 이미지 변경 실패:", error);
      alert("메인 이미지 변경에 실패했습니다.");
    } finally {
      e.target.value = "";
    }
  };

  const handleMainImageDelete = async () => {
    const isConfirm = window.confirm("메인 이미지를 삭제하시겠습니까?");
    if (!isConfirm) return;

    try {
      await deleteMainImage(productNo);

      alert("메인 이미지가 삭제되었습니다.");
      await fetchImages();
    } catch (error) {
      console.error("메인 이미지 삭제 실패:", error);
      alert("메인 이미지 삭제에 실패했습니다.");
    }
  };

  // =========================
  // 22. 갤러리 이미지 추가
  // =========================
  const handleGalleryAddButtonClick = () => {
    if (galleryAddInputRef.current) {
      galleryAddInputRef.current.click();
    }
  };

  const handleGalleryAddFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await postGalleryImage(productNo, file);

      alert("갤러리 이미지가 추가되었습니다.");
      await fetchImages();
    } catch (error) {
      console.error("갤러리 이미지 추가 실패:", error);
      alert("갤러리 이미지 추가에 실패했습니다.");
    } finally {
      e.target.value = "";
    }
  };

  // =========================
  // 23. 갤러리 이미지 변경
  // =========================
  const handleGalleryReplaceButtonClick = (productImgNo) => {
    if (galleryReplaceInputRefs.current[productImgNo]) {
      galleryReplaceInputRefs.current[productImgNo].click();
    }
  };

  const handleGalleryReplaceFileChange = async (productImgNo, e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await putGalleryImage(productNo, productImgNo, file);

      alert("갤러리 이미지가 변경되었습니다.");
      await fetchImages();
    } catch (error) {
      console.error("갤러리 이미지 변경 실패:", error);
      alert("갤러리 이미지 변경에 실패했습니다.");
    } finally {
      e.target.value = "";
    }
  };

  // =========================
  // 24. 갤러리 이미지 삭제
  // =========================
  const handleGalleryDelete = async (productImgNo) => {
    const isConfirm = window.confirm("갤러리 이미지를 삭제하시겠습니까?");
    if (!isConfirm) return;

    try {
      await deleteGalleryImage(productNo, productImgNo);

      alert("갤러리 이미지가 삭제되었습니다.");
      await fetchImages();
    } catch (error) {
      console.error("갤러리 이미지 삭제 실패:", error);
      alert("갤러리 이미지 삭제에 실패했습니다.");
    }
  };

  // =========================
  // 25. 사이즈표 이미지 변경 / 삭제
  // =========================
  const handleSizeChartButtonClick = () => {
    if (sizeChartInputRef.current) {
      sizeChartInputRef.current.click();
    }
  };

  const handleSizeChartFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await putSizeChartImage(productNo, file);

      alert("사이즈표 이미지가 변경되었습니다.");
      await fetchImages();
    } catch (error) {
      console.error("사이즈표 이미지 변경 실패:", error);
      alert("사이즈표 이미지 변경에 실패했습니다.");
    } finally {
      e.target.value = "";
    }
  };

  const handleSizeChartDelete = async () => {
    const isConfirm = window.confirm("사이즈표 이미지를 삭제하시겠습니까?");
    if (!isConfirm) return;

    try {
      await deleteSizeChartImage(productNo);

      alert("사이즈표 이미지가 삭제되었습니다.");
      await fetchImages();
    } catch (error) {
      console.error("사이즈표 이미지 삭제 실패:", error);
      alert("사이즈표 이미지 삭제에 실패했습니다.");
    }
  };

  // =========================
  // 26. 상품 삭제 / 이동
  // =========================
  const handleDeleteProduct = async () => {
    const isConfirm = window.confirm("현재 상품을 삭제하시겠습니까?");
    if (!isConfirm) return;

    try {
      await deleteAdminProduct(productNo);

      alert("상품이 삭제되었습니다.");
      navigate("/admin/product");
    } catch (error) {
      console.error("상품 삭제 실패:", error);
      alert("상품 삭제에 실패했습니다.");
    }
  };

  const handleMoveToList = () => {
    navigate("/admin/product");
  };

  const handleMoveToAddPage = () => {
    navigate("/admin/product/add");
  };

  if (loading) {
    return (
      <>
        <AdminHeader />
        <AdminLayout>
          <p>상품 정보를 불러오는 중입니다...</p>
        </AdminLayout>
      </>
    );
  }

  return (
    <>
      <AdminHeader />
      <AdminLayout>
        <div className="admin-product-detail-page">
          <div className="admin-detail-top">
            <div>
              <h2 className="admin-detail-title">상품 상세 조회 / 수정</h2>
              <p className="admin-detail-subtitle">상품 번호: {productNo}</p>
            </div>

            <button
              type="button"
              className="admin-detail-top-button"
              onClick={handleMoveToList}
            >
              목록으로
            </button>
          </div>

          <ProductBasicSection
            basicInfo={basicInfo}
            salePrice={salePrice}
            handleBasicInfoChange={handleBasicInfoChange}
            handleBasicInfoSave={handleBasicInfoSave}
          />

          <ProductImageSection
            imageInfo={imageInfo}
            thumbnailInputRef={thumbnailInputRef}
            mainImageInputRef={mainImageInputRef}
            galleryAddInputRef={galleryAddInputRef}
            sizeChartInputRef={sizeChartInputRef}
            galleryReplaceInputRefs={galleryReplaceInputRefs}
            handleThumbnailButtonClick={handleThumbnailButtonClick}
            handleThumbnailFileChange={handleThumbnailFileChange}
            handleMainImageButtonClick={handleMainImageButtonClick}
            handleMainImageFileChange={handleMainImageFileChange}
            handleMainImageDelete={handleMainImageDelete}
            handleGalleryAddButtonClick={handleGalleryAddButtonClick}
            handleGalleryAddFileChange={handleGalleryAddFileChange}
            handleGalleryReplaceButtonClick={handleGalleryReplaceButtonClick}
            handleGalleryReplaceFileChange={handleGalleryReplaceFileChange}
            handleGalleryDelete={handleGalleryDelete}
            handleSizeChartButtonClick={handleSizeChartButtonClick}
            handleSizeChartFileChange={handleSizeChartFileChange}
            handleSizeChartDelete={handleSizeChartDelete}
          />

          <ProductOptionSection
            optionInfo={optionInfo}
            newOption={newOption}
            handleOptionEdit={handleOptionEdit}
            handleOptionChange={handleOptionChange}
            handleOptionSave={handleOptionSave}
            handleOptionCancel={handleOptionCancel}
            handleOptionDelete={handleOptionDelete}
            handleNewOptionChange={handleNewOptionChange}
            handleAddOption={handleAddOption}
            handleBaseStockChange={handleBaseStockChange}
          />

          <div className="admin-detail-bottom-buttons">
            <button type="button" onClick={handleMoveToAddPage}>
              새상품 등록
            </button>
            <button
              type="button"
              className="danger"
              onClick={handleDeleteProduct}
            >
              상품 삭제
            </button>
            <button type="button" onClick={handleMoveToList}>
              목록
            </button>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminProductDetailPage;

// ======================================================
// 기본정보 섹션
// ======================================================
const ProductBasicSection = ({
  basicInfo,
  salePrice,
  handleBasicInfoChange,
  handleBasicInfoSave,
}) => {
  return (
    <section className="admin-detail-section">
      <h3 className="admin-detail-section-title">기본정보</h3>

      <div className="admin-detail-form-grid">
        <div className="admin-detail-form-row">
          <label>상품번호</label>
          <input type="text" value={basicInfo.productNo} readOnly />
        </div>

        <div className="admin-detail-form-row">
          <label>카테고리</label>
          <input type="text" value={basicInfo.categoryName} readOnly />
        </div>

        <div className="admin-detail-form-row admin-detail-form-row-wide">
          <label>상품명</label>
          <input
            type="text"
            name="productName"
            value={basicInfo.productName}
            onChange={handleBasicInfoChange}
          />
        </div>

        <div className="admin-detail-form-row">
          <label>정가</label>
          <input
            type="number"
            name="price"
            value={basicInfo.price}
            onChange={handleBasicInfoChange}
          />
        </div>

        <div className="admin-detail-form-row">
          <label>할인율</label>
          <input
            type="number"
            name="discountRate"
            value={basicInfo.discountRate}
            onChange={handleBasicInfoChange}
          />
        </div>

        <div className="admin-detail-form-row">
          <label>판매가</label>
          <input type="number" value={salePrice} readOnly />
        </div>

        <div className="admin-detail-form-row">
          <label>판매여부</label>
          <select
            name="saleStatus"
            value={basicInfo.saleStatus}
            onChange={handleBasicInfoChange}
          >
            <option value="Y">Y</option>
            <option value="N">N</option>
          </select>
        </div>

        <div className="admin-detail-form-row">
          <label>당일배송</label>
          <select
            name="sameDayDelivery"
            value={basicInfo.sameDayDelivery}
            onChange={handleBasicInfoChange}
          >
            <option value="Y">Y</option>
            <option value="N">N</option>
          </select>
        </div>

        <div className="admin-detail-form-row">
          <label>조회수</label>
          <input type="number" value={basicInfo.viewCount} readOnly />
        </div>

        <div className="admin-detail-form-row">
          <label>등록일</label>
          <input type="text" value={basicInfo.createdAt} readOnly />
        </div>
      </div>

      <div className="admin-detail-section-actions">
        <button type="button" onClick={handleBasicInfoSave}>
          기본정보 저장
        </button>
      </div>
    </section>
  );
};

// ======================================================
// 이미지 섹션
// ======================================================
const ProductImageSection = ({
  imageInfo,
  thumbnailInputRef,
  mainImageInputRef,
  galleryAddInputRef,
  sizeChartInputRef,
  galleryReplaceInputRefs,
  handleThumbnailButtonClick,
  handleThumbnailFileChange,
  handleMainImageButtonClick,
  handleMainImageFileChange,
  handleMainImageDelete,
  handleGalleryAddButtonClick,
  handleGalleryAddFileChange,
  handleGalleryReplaceButtonClick,
  handleGalleryReplaceFileChange,
  handleGalleryDelete,
  handleSizeChartButtonClick,
  handleSizeChartFileChange,
  handleSizeChartDelete,
}) => {
  const getImageSrc = (imageUrl) => {
    if (!imageUrl) return "";
    return `${API_SERVER_HOST}/view?fileName=${encodeURIComponent(imageUrl)}`;
  };

  return (
    <section className="admin-detail-section">
      <h3 className="admin-detail-section-title">이미지</h3>

      <div className="admin-detail-image-grid">
        <div className="admin-image-card">
          <h4>썸네일 이미지</h4>

          {imageInfo.thumbnailImage ? (
            <>
              <img
                src={getImageSrc(imageInfo.thumbnailImage.imageUrl)}
                alt="썸네일 이미지"
                className="admin-detail-preview-image thumb"
              />
              <div className="admin-image-card-buttons">
                <button type="button" onClick={handleThumbnailButtonClick}>
                  변경
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="admin-image-empty">
                등록된 썸네일 이미지가 없습니다.
              </div>
              <div className="admin-image-card-buttons">
                <button type="button" onClick={handleThumbnailButtonClick}>
                  등록
                </button>
              </div>
            </>
          )}

          <input
            type="file"
            accept="image/*"
            ref={thumbnailInputRef}
            style={{ display: "none" }}
            onChange={handleThumbnailFileChange}
          />
        </div>

        <div className="admin-image-card">
          <h4>메인 이미지</h4>

          {imageInfo.mainImage ? (
            <>
              <img
                src={getImageSrc(imageInfo.mainImage.imageUrl)}
                alt="메인 이미지"
                className="admin-detail-preview-image main"
              />
              <div className="admin-image-card-buttons">
                <button type="button" onClick={handleMainImageButtonClick}>
                  변경
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={handleMainImageDelete}
                >
                  삭제
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="admin-image-empty">
                등록된 메인 이미지가 없습니다.
              </div>
              <div className="admin-image-card-buttons">
                <button type="button" onClick={handleMainImageButtonClick}>
                  등록
                </button>
              </div>
            </>
          )}

          <input
            type="file"
            accept="image/*"
            ref={mainImageInputRef}
            style={{ display: "none" }}
            onChange={handleMainImageFileChange}
          />
        </div>

        <div className="admin-image-card">
          <h4>사이즈표 이미지</h4>

          {imageInfo.sizeChartImage ? (
            <>
              <img
                src={getImageSrc(imageInfo.sizeChartImage.imageUrl)}
                alt="사이즈표 이미지"
                className="admin-detail-preview-image main"
              />
              <div className="admin-image-card-buttons">
                <button type="button" onClick={handleSizeChartButtonClick}>
                  변경
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={handleSizeChartDelete}
                >
                  삭제
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="admin-image-empty">
                등록된 사이즈표 이미지가 없습니다.
              </div>
              <div className="admin-image-card-buttons">
                <button type="button" onClick={handleSizeChartButtonClick}>
                  등록
                </button>
              </div>
            </>
          )}

          <input
            type="file"
            accept="image/*"
            ref={sizeChartInputRef}
            style={{ display: "none" }}
            onChange={handleSizeChartFileChange}
          />
        </div>
      </div>

      <div className="admin-gallery-section">
        <div className="admin-gallery-header">
          <h4>갤러리 이미지</h4>
          <button type="button" onClick={handleGalleryAddButtonClick}>
            갤러리 이미지 추가
          </button>
        </div>

        {imageInfo.galleryImages.length > 0 ? (
          <div className="admin-gallery-grid">
            {imageInfo.galleryImages.map((img) => (
              <div key={img.productImgNo} className="admin-gallery-card">
                <img
                  src={getImageSrc(img.imageUrl)}
                  alt="갤러리 이미지"
                  className="admin-detail-preview-image gallery"
                />

                <div className="admin-image-card-buttons">
                  <button
                    type="button"
                    onClick={() =>
                      handleGalleryReplaceButtonClick(img.productImgNo)
                    }
                  >
                    변경
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => handleGalleryDelete(img.productImgNo)}
                  >
                    삭제
                  </button>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  ref={(element) => {
                    galleryReplaceInputRefs.current[img.productImgNo] = element;
                  }}
                  style={{ display: "none" }}
                  onChange={(e) =>
                    handleGalleryReplaceFileChange(img.productImgNo, e)
                  }
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="admin-image-empty">
            등록된 갤러리 이미지가 없습니다.
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          ref={galleryAddInputRef}
          style={{ display: "none" }}
          onChange={handleGalleryAddFileChange}
        />
      </div>
    </section>
  );
};

// ======================================================
// 옵션 섹션
// ======================================================
const ProductOptionSection = ({
  optionInfo,
  newOption,
  handleOptionEdit,
  handleOptionChange,
  handleOptionSave,
  handleOptionCancel,
  handleOptionDelete,
  handleNewOptionChange,
  handleAddOption,
  handleBaseStockChange,
}) => {
  const { isNoOptionProduct, baseStock, options } = optionInfo;

  return (
    <section className="admin-detail-section">
      <h3 className="admin-detail-section-title">옵션 및 재고</h3>

      {isNoOptionProduct ? (
        <div className="admin-detail-form-grid">
          <div className="admin-detail-form-row">
            <label>상품 유형</label>
            <input type="text" value="옵션 없는 상품" readOnly />
          </div>

          <div className="admin-detail-form-row">
            <label>기본 재고</label>
            <input
              type="number"
              value={baseStock}
              onChange={handleBaseStockChange}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="admin-detail-form-row admin-option-type-row">
            <label>상품 유형</label>
            <input type="text" value="옵션형 상품" readOnly />
          </div>

          <div className="admin-option-table-wrap">
            <table className="admin-option-table">
              <thead>
                <tr>
                  <th>색상</th>
                  <th>사이즈</th>
                  <th>재고</th>
                  <th>사용여부</th>
                  <th>관리</th>
                </tr>
              </thead>

              <tbody>
                {options.length === 0 ? (
                  <tr>
                    <td colSpan="5">등록된 옵션이 없습니다.</td>
                  </tr>
                ) : (
                  options.map((option) => (
                    <tr key={option.productOptionNo}>
                      <td>
                        {option.isEditing ? (
                          <input
                            type="text"
                            value={option.color}
                            onChange={(e) =>
                              handleOptionChange(
                                option.productOptionNo,
                                "color",
                                e.target.value,
                              )
                            }
                          />
                        ) : (
                          option.color
                        )}
                      </td>

                      <td>
                        {option.isEditing ? (
                          <input
                            type="text"
                            value={option.optionSize}
                            onChange={(e) =>
                              handleOptionChange(
                                option.productOptionNo,
                                "optionSize",
                                e.target.value,
                              )
                            }
                          />
                        ) : (
                          option.optionSize
                        )}
                      </td>

                      <td>
                        {option.isEditing ? (
                          <input
                            type="number"
                            value={option.stock}
                            onChange={(e) =>
                              handleOptionChange(
                                option.productOptionNo,
                                "stock",
                                e.target.value,
                              )
                            }
                          />
                        ) : (
                          option.stock
                        )}
                      </td>

                      <td>
                        {option.isEditing ? (
                          <select
                            value={option.useYn}
                            onChange={(e) =>
                              handleOptionChange(
                                option.productOptionNo,
                                "useYn",
                                e.target.value,
                              )
                            }
                          >
                            <option value="Y">Y</option>
                            <option value="N">N</option>
                          </select>
                        ) : (
                          option.useYn
                        )}
                      </td>

                      <td>
                        <div className="admin-option-action-buttons">
                          {option.isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  handleOptionSave(option.productOptionNo)
                                }
                              >
                                저장
                              </button>
                              <button
                                type="button"
                                onClick={handleOptionCancel}
                              >
                                취소
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  handleOptionEdit(option.productOptionNo)
                                }
                              >
                                편집
                              </button>
                              <button
                                type="button"
                                className="danger"
                                onClick={() =>
                                  handleOptionDelete(option.productOptionNo)
                                }
                              >
                                삭제
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-option-add-box">
            <h4>옵션 추가</h4>

            <div className="admin-detail-form-grid">
              <div className="admin-detail-form-row">
                <label>색상</label>
                <input
                  type="text"
                  name="color"
                  value={newOption.color}
                  onChange={handleNewOptionChange}
                />
              </div>

              <div className="admin-detail-form-row">
                <label>사이즈</label>
                <input
                  type="text"
                  name="size"
                  value={newOption.size}
                  onChange={handleNewOptionChange}
                />
              </div>

              <div className="admin-detail-form-row">
                <label>재고</label>
                <input
                  type="number"
                  name="stock"
                  value={newOption.stock}
                  onChange={handleNewOptionChange}
                />
              </div>

              <div className="admin-detail-form-row">
                <label>사용여부</label>
                <select
                  name="useYn"
                  value={newOption.useYn}
                  onChange={handleNewOptionChange}
                >
                  <option value="Y">Y</option>
                  <option value="N">N</option>
                </select>
              </div>
            </div>

            <div className="admin-detail-section-actions">
              <button type="button" onClick={handleAddOption}>
                옵션 추가
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
};
