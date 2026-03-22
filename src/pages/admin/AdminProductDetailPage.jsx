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

const AdminProductDetailPage = () => {
  // 화면이 랜더링될때 가장 위쪽 스크롤로 이동
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
  const [options, setOptions] = useState([]);

  // 옵션 추가용 임시 상태
  const [newOption, setNewOption] = useState({
    color: "",
    size: "",
    stock: 0,
    useYn: "Y",
  });

  // 로딩 상태
  const [loading, setLoading] = useState(true);

  // =========================
  // 4. 파일 input ref
  // 버튼 누르면 숨겨진 파일 input 클릭
  // =========================
  const thumbnailInputRef = useRef(null);
  const mainImageInputRef = useRef(null);
  const galleryAddInputRef = useRef(null);
  const sizeChartInputRef = useRef(null);

  // 갤러리 이미지 "변경"용 ref를 여러 개 관리
  const galleryReplaceInputRefs = useRef({});

  // =========================
  // 5. 판매가 자동 계산
  // 100원 단위 절삭
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
        productNo: data.productNo || "",
        categoryName: data.categoryName || "",
        productName: data.productName || "",
        price: data.price || 0,
        discountRate: data.discountRate || 0,
        saleStatus: data.saleStatus || "Y",
        sameDayDelivery: data.sameDayDelivery || "N",
        viewCount: data.viewCount || 0,
        createdAt: data.createdAt || "",
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
        thumbnailImage: data.thumbnailImage || null,
        mainImage: data.mainImage || null,
        galleryImages: data.galleryImages || [],
        sizeChartImage: data.sizeChartImage || null,
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

      const optionList = (data || []).map((option) => ({
        ...option,
        isEditing: false,
      }));

      setOptions(optionList);
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
        saleStatus: basicInfo.saleStatus,
        sameDayDelivery: basicInfo.sameDayDelivery,
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
    setOptions((prev) =>
      prev.map((option) =>
        option.productOptionNo === productOptionNo
          ? { ...option, isEditing: true }
          : option,
      ),
    );
  };

  // =========================
  // 13. 옵션 변경
  // =========================
  const handleOptionChange = (productOptionNo, field, value) => {
    setOptions((prev) =>
      prev.map((option) =>
        option.productOptionNo === productOptionNo
          ? {
              ...option,
              [field]: field === "stock" ? Number(value) : value,
            }
          : option,
      ),
    );
  };

  // =========================
  // 14. 옵션 저장
  // =========================
  const handleOptionSave = async (productOptionNo) => {
    try {
      const targetOption = options.find(
        (option) => option.productOptionNo === productOptionNo,
      );

      if (!targetOption) {
        alert("저장할 옵션을 찾지 못했습니다.");
        return;
      }

      const requestData = {
        color: targetOption.color,
        size: targetOption.size,
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
  // 수정 중 데이터 원복을 위해 재조회
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
        size: newOption.size,
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
  // 19. 썸네일 이미지 변경
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
  // 20. 메인 이미지 변경 / 삭제
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
  // 21. 갤러리 이미지 추가
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
  // 22. 갤러리 이미지 변경
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
  // 23. 갤러리 이미지 삭제
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
  // 24. 사이즈표 이미지 변경 / 삭제
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
  // 25. 상품 삭제 / 이동
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
        <div>
          <h2>상품 상세 조회 / 수정</h2>
          <p>상품 번호: {productNo}</p>

          <button type="button" onClick={handleMoveToList}>
            목록으로
          </button>

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
            options={options}
            newOption={newOption}
            handleOptionEdit={handleOptionEdit}
            handleOptionChange={handleOptionChange}
            handleOptionSave={handleOptionSave}
            handleOptionCancel={handleOptionCancel}
            handleOptionDelete={handleOptionDelete}
            handleNewOptionChange={handleNewOptionChange}
            handleAddOption={handleAddOption}
          />

          <div>
            <button type="button" onClick={handleMoveToAddPage}>
              새상품 등록
            </button>
            <button type="button" onClick={handleDeleteProduct}>
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
    <section>
      <h3>기본정보</h3>

      <div>
        <label>상품번호 </label>
        <input type="text" value={basicInfo.productNo} readOnly />
      </div>

      <div>
        <label>카테고리 </label>
        <input type="text" value={basicInfo.categoryName} readOnly />
      </div>

      <div>
        <label>상품명 </label>
        <input
          type="text"
          name="productName"
          value={basicInfo.productName}
          onChange={handleBasicInfoChange}
        />
      </div>

      <div>
        <label>정가 </label>
        <input
          type="number"
          name="price"
          value={basicInfo.price}
          onChange={handleBasicInfoChange}
        />
      </div>

      <div>
        <label>할인율 </label>
        <input
          type="number"
          name="discountRate"
          value={basicInfo.discountRate}
          onChange={handleBasicInfoChange}
        />
      </div>

      <div>
        <label>판매가 </label>
        <input type="number" value={salePrice} readOnly />
      </div>

      <div>
        <label>판매여부 </label>
        <select
          name="saleStatus"
          value={basicInfo.saleStatus}
          onChange={handleBasicInfoChange}
        >
          <option value="Y">Y</option>
          <option value="N">N</option>
        </select>
      </div>

      <div>
        <label>당일배송 </label>
        <select
          name="sameDayDelivery"
          value={basicInfo.sameDayDelivery}
          onChange={handleBasicInfoChange}
        >
          <option value="Y">Y</option>
          <option value="N">N</option>
        </select>
      </div>

      <div>
        <label>조회수 </label>
        <input type="number" value={basicInfo.viewCount} readOnly />
      </div>

      <div>
        <label>등록일 </label>
        <input type="text" value={basicInfo.createdAt} readOnly />
      </div>

      <button type="button" onClick={handleBasicInfoSave}>
        기본정보 저장
      </button>
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
  return (
    <section>
      <h3>이미지</h3>

      {/* 썸네일 */}
      <div>
        <h4>썸네일 이미지</h4>

        {imageInfo.thumbnailImage ? (
          <div>
            <p>{imageInfo.thumbnailImage.fileName}</p>
            <button type="button" onClick={handleThumbnailButtonClick}>
              변경
            </button>
          </div>
        ) : (
          <div>
            <p>등록된 썸네일 이미지가 없습니다.</p>
            <button type="button" onClick={handleThumbnailButtonClick}>
              등록
            </button>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          ref={thumbnailInputRef}
          style={{ display: "none" }}
          onChange={handleThumbnailFileChange}
        />
      </div>

      {/* 메인 이미지 */}
      <div>
        <h4>메인 이미지</h4>

        {imageInfo.mainImage ? (
          <div>
            <p>{imageInfo.mainImage.fileName}</p>
            <button type="button" onClick={handleMainImageButtonClick}>
              변경
            </button>
            <button type="button" onClick={handleMainImageDelete}>
              삭제
            </button>
          </div>
        ) : (
          <div>
            <p>등록된 메인 이미지가 없습니다.</p>
            <button type="button" onClick={handleMainImageButtonClick}>
              등록
            </button>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          ref={mainImageInputRef}
          style={{ display: "none" }}
          onChange={handleMainImageFileChange}
        />
      </div>

      {/* 갤러리 이미지 */}
      <div>
        <h4>갤러리 이미지</h4>

        {imageInfo.galleryImages.length > 0 ? (
          imageInfo.galleryImages.map((img) => (
            <div key={img.productImgNo}>
              <p>{img.fileName}</p>

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
                onClick={() => handleGalleryDelete(img.productImgNo)}
              >
                삭제
              </button>

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
          ))
        ) : (
          <p>등록된 갤러리 이미지가 없습니다.</p>
        )}

        <button type="button" onClick={handleGalleryAddButtonClick}>
          갤러리 이미지 추가
        </button>

        <input
          type="file"
          accept="image/*"
          ref={galleryAddInputRef}
          style={{ display: "none" }}
          onChange={handleGalleryAddFileChange}
        />
      </div>

      {/* 사이즈표 이미지 */}
      <div>
        <h4>사이즈표 이미지</h4>

        {imageInfo.sizeChartImage ? (
          <div>
            <p>{imageInfo.sizeChartImage.fileName}</p>
            <button type="button" onClick={handleSizeChartButtonClick}>
              변경
            </button>
            <button type="button" onClick={handleSizeChartDelete}>
              삭제
            </button>
          </div>
        ) : (
          <div>
            <p>등록된 사이즈표 이미지가 없습니다.</p>
            <button type="button" onClick={handleSizeChartButtonClick}>
              등록
            </button>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          ref={sizeChartInputRef}
          style={{ display: "none" }}
          onChange={handleSizeChartFileChange}
        />
      </div>
    </section>
  );
};

// ======================================================
// 옵션 섹션
// ======================================================
const ProductOptionSection = ({
  options,
  newOption,
  handleOptionEdit,
  handleOptionChange,
  handleOptionSave,
  handleOptionCancel,
  handleOptionDelete,
  handleNewOptionChange,
  handleAddOption,
}) => {
  return (
    <section>
      <h3>옵션 및 재고</h3>

      <table border="1">
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
                      value={option.size}
                      onChange={(e) =>
                        handleOptionChange(
                          option.productOptionNo,
                          "size",
                          e.target.value,
                        )
                      }
                    />
                  ) : (
                    option.size
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
                  {option.isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOptionSave(option.productOptionNo)}
                      >
                        저장
                      </button>
                      <button type="button" onClick={handleOptionCancel}>
                        취소
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOptionEdit(option.productOptionNo)}
                      >
                        편집
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleOptionDelete(option.productOptionNo)
                        }
                      >
                        삭제
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <h4>옵션 추가</h4>

      <div>
        <label>색상 </label>
        <input
          type="text"
          name="color"
          value={newOption.color}
          onChange={handleNewOptionChange}
        />
      </div>

      <div>
        <label>사이즈 </label>
        <input
          type="text"
          name="size"
          value={newOption.size}
          onChange={handleNewOptionChange}
        />
      </div>

      <div>
        <label>재고 </label>
        <input
          type="number"
          name="stock"
          value={newOption.stock}
          onChange={handleNewOptionChange}
        />
      </div>

      <div>
        <label>사용여부 </label>
        <select
          name="useYn"
          value={newOption.useYn}
          onChange={handleNewOptionChange}
        >
          <option value="Y">Y</option>
          <option value="N">N</option>
        </select>
      </div>

      <button type="button" onClick={handleAddOption}>
        옵션 추가
      </button>
    </section>
  );
};
