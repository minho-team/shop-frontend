import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { postAdminProductAdd } from "../../api/admin/adminProductApi";
import AdminLayout from "../../components/admin/AdminLayout";
import "../../css/admin/AdminProductAddPage.css";

const categoryMap = {
  MEN: {
    OUTER: [
      { id: 111, label: "코트" },
      { id: 112, label: "파카" },
      { id: 113, label: "자켓" },
      { id: 114, label: "가디건" },
    ],
    TOP: [
      { id: 121, label: "니트" },
      { id: 122, label: "셔츠" },
      { id: 123, label: "스웨트 셔츠" },
      { id: 124, label: "긴팔" },
      { id: 125, label: "반팔" },
    ],
    BOTTOM: [
      { id: 131, label: "긴바지" },
      { id: 132, label: "반바지" },
      { id: 133, label: "데님" },
    ],
    ACC: [
      { id: 141, label: "가방" },
      { id: 142, label: "슈즈" },
      { id: 143, label: "주얼리" },
      { id: 144, label: "잡화" },
    ],
  },
  WOMEN: {
    OUTER: [
      { id: 211, label: "코트" },
      { id: 212, label: "파카" },
      { id: 213, label: "자켓" },
      { id: 214, label: "가디건" },
    ],
    TOP: [
      { id: 221, label: "니트" },
      { id: 222, label: "셔츠" },
      { id: 223, label: "스웨트 셔츠" },
      { id: 224, label: "긴팔" },
      { id: 225, label: "반팔" },
    ],
    BOTTOM: [
      { id: 231, label: "긴바지" },
      { id: 232, label: "반바지" },
      { id: 233, label: "데님" },
    ],
    ACC: [
      { id: 241, label: "가방" },
      { id: 242, label: "슈즈" },
      { id: 243, label: "주얼리" },
      { id: 244, label: "잡화" },
    ],
  },
};

const mainCategoryLabelMap = {
  OUTER: "아우터",
  TOP: "상의",
  BOTTOM: "하의",
  ACC: "악세사리",
};

const createEmptyOption = () => ({
  color: "",
  optionSize: "",
  stock: "",
  useYn: "Y",
});

const AdminProductAddPage = () => {
  const thumbImageInputRef = useRef(null);
  const mainImageInputRef = useRef(null);
  const sizeImageInputRef = useRef(null);
  const galleryImageInputRefs = useRef([]);
  const navigate = useNavigate();

  const [productData, setProductData] = useState({
    genderCategory: "",
    mainCategory: "",
    categoryId: "",
    name: "",
    price: "",
    discountRate: "",
    useYn: "Y",
    sameDayDeliveryYn: "N",
    description: "",
  });

  const [imageData, setImageData] = useState({
    thumbImage: null,
    mainImage: null,
    sizeImage: null,
    galleryImages: [null],
  });

  // 이미지 미리보기 관리를 위한 상태
  const [previews, setPreviews] = useState({
    thumbImage: null,
    mainImage: null,
    sizeImage: null,
    galleryImages: [],
  });

  const [isNoOptionProduct, setIsNoOptionProduct] = useState(false);
  const [baseStock, setBaseStock] = useState("");
  const [options, setOptions] = useState([createEmptyOption()]);

  const salePrice = useMemo(() => {
    const price = Number(productData.price);
    const discountRate = Number(productData.discountRate);

    if (isNaN(price) || isNaN(discountRate)) return 0;

    const calculated = price - (price * discountRate) / 100;
    return Math.floor(calculated / 100) * 100;
  }, [productData.price, productData.discountRate]);

  const mainCategoryOptions = productData.genderCategory
    ? Object.keys(categoryMap[productData.genderCategory] || {})
    : [];

  const subCategoryOptions =
    productData.genderCategory && productData.mainCategory
      ? categoryMap[productData.genderCategory]?.[productData.mainCategory] ||
        []
      : [];

  const handleChangeProductData = (e) => {
    const { name, value } = e.target;

    setProductData((prev) => {
      if (name === "genderCategory") {
        return {
          ...prev,
          genderCategory: value,
          mainCategory: "",
          categoryId: "",
        };
      }

      if (name === "mainCategory") {
        return {
          ...prev,
          mainCategory: value,
          categoryId: "",
        };
      }

      if (name === "discountRate") {
        if (value === "") {
          return {
            ...prev,
            discountRate: "",
          };
        }

        const numericValue = Number(value);
        const clampedValue = Math.min(100, Math.max(0, numericValue));

        return {
          ...prev,
          discountRate: clampedValue,
        };
      }

      if (name === "price") {
        if (value === "") {
          return {
            ...prev,
            price: "",
          };
        }

        const numericValue = Number(value);

        return {
          ...prev,
          price: Math.max(0, numericValue),
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleSingleImageChange = (e) => {
    const { name, files } = e.target;
    const file = files?.[0];

    if (file) {
      const previewUrl = URL.createObjectURL(file);

      setImageData((prev) => ({ ...prev, [name]: file }));
      setPreviews((prev) => ({ ...prev, [name]: previewUrl }));
    }
  };

  const handleClickSingleImageButton = (imageFieldName) => {
    if (imageFieldName === "thumbImage") {
      thumbImageInputRef.current?.click();
    }

    if (imageFieldName === "mainImage") {
      mainImageInputRef.current?.click();
    }

    if (imageFieldName === "sizeImage") {
      sizeImageInputRef.current?.click();
    }
  };

  const handleClickGalleryImageButton = (index) => {
    galleryImageInputRefs.current[index]?.click();
  };

  const handleRemoveSingleImage = (imageFieldName) => {
    setImageData((prev) => ({
      ...prev,
      [imageFieldName]: null,
    }));

    setPreviews((prev) => {
      if (prev[imageFieldName]) {
        URL.revokeObjectURL(prev[imageFieldName]);
      }

      return {
        ...prev,
        [imageFieldName]: null,
      };
    });

    if (imageFieldName === "thumbImage" && thumbImageInputRef.current) {
      thumbImageInputRef.current.value = "";
    }

    if (imageFieldName === "mainImage" && mainImageInputRef.current) {
      mainImageInputRef.current.value = "";
    }

    if (imageFieldName === "sizeImage" && sizeImageInputRef.current) {
      sizeImageInputRef.current.value = "";
    }
  };

  const handleGalleryImageChange = (index, file) => {
    setImageData((prev) => {
      const newGalleryImages = [...prev.galleryImages];
      newGalleryImages[index] = file;

      const filledImagesCount = newGalleryImages.filter(
        (item) => item !== null,
      ).length;

      if (filledImagesCount > 20) {
        alert("갤러리 이미지는 최대 20장까지 등록할 수 있습니다.");
        return prev;
      }

      const isLastIndex = index === newGalleryImages.length - 1;

      if (isLastIndex && file !== null && filledImagesCount < 20) {
        newGalleryImages.push(null);
      }
      // 이미지 미리보기 업데이트
      setPreviews((prevP) => {
        const newPreviews = [...prevP.galleryImages];
        newPreviews[index] = URL.createObjectURL(file);
        return { ...prevP, galleryImages: newPreviews };
      });

      return {
        ...prev,
        galleryImages: newGalleryImages,
      };
    });
  };

  const handleRemoveGalleryImage = (index) => {
    setImageData((prev) => {
      const newGalleryImages = [...prev.galleryImages];
      newGalleryImages.splice(index, 1);

      if (newGalleryImages.length === 0) {
        newGalleryImages.push(null);
      }

      const hasEmptySlot = newGalleryImages.some((item) => item === null);

      if (
        !hasEmptySlot &&
        newGalleryImages.filter((item) => item !== null).length < 20
      ) {
        newGalleryImages.push(null);
      }

      return {
        ...prev,
        galleryImages: newGalleryImages,
      };
    });

    setPreviews((prev) => {
      const newPreviews = [...prev.galleryImages];

      if (newPreviews[index]) {
        URL.revokeObjectURL(newPreviews[index]);
      }

      newPreviews.splice(index, 1);

      return {
        ...prev,
        galleryImages: newPreviews,
      };
    });

    if (galleryImageInputRefs.current[index]) {
      galleryImageInputRefs.current[index].value = "";
    }
  };

  const handleAddOptionRow = () => {
    setOptions((prev) => [...prev, createEmptyOption()]);
  };

  const handleRemoveOptionRow = (index) => {
    setOptions((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length === 0 ? [createEmptyOption()] : next;
    });
  };

  const handleChangeOption = (index, field, value) => {
    setOptions((prev) =>
      prev.map((option, i) => {
        if (i !== index) return option;

        if (field === "stock") {
          return {
            ...option,
            stock: value === "" ? "" : Math.max(0, Number(value)),
          };
        }

        return {
          ...option,
          [field]: value,
        };
      }),
    );
  };

  const handleChangeNoOptionProduct = (e) => {
    const checked = e.target.checked;
    setIsNoOptionProduct(checked);

    if (checked) {
      setOptions([]);
    } else {
      setOptions([createEmptyOption()]);
    }
  };

  const validateForm = () => {
    if (!productData.genderCategory) {
      alert("성별 카테고리를 선택해주세요.");
      return false;
    }

    if (!productData.mainCategory) {
      alert("대분류를 선택해주세요.");
      return false;
    }

    if (!productData.categoryId) {
      alert("소분류를 선택해주세요.");
      return false;
    }

    if (!productData.name.trim()) {
      alert("상품명을 입력해주세요.");
      return false;
    }

    if (productData.price === "" || Number(productData.price) < 0) {
      alert("정가를 올바르게 입력해주세요.");
      return false;
    }

    if (
      productData.discountRate === "" ||
      Number(productData.discountRate) < 0
    ) {
      alert("할인율을 올바르게 입력해주세요.");
      return false;
    }

    if (!imageData.thumbImage) {
      alert("썸네일 이미지는 필수입니다.");
      return false;
    }

    if (isNoOptionProduct) {
      if (baseStock === "" || Number(baseStock) < 0) {
        alert("기본 재고를 입력해주세요.");
        return false;
      }
    } else {
      const hasInvalidOption = options.some(
        (option) =>
          !option.color.trim() ||
          !option.optionSize.trim() ||
          option.stock === "" ||
          Number(option.stock) < 0,
      );

      if (hasInvalidOption) {
        alert("옵션의 색상, 사이즈, 재고를 모두 올바르게 입력해주세요.");
        return false;
      }
    }

    return true;
  };

  const buildProductFormData = () => {
    const formData = new FormData();

    formData.append("name", productData.name);
    formData.append("categoryId", productData.categoryId);
    formData.append("price", productData.price);
    formData.append("discountRate", productData.discountRate || 0);
    formData.append("description", productData.description);
    formData.append("useYn", productData.useYn);
    formData.append("sameDayDeliveryYn", productData.sameDayDeliveryYn);

    if (imageData.thumbImage) {
      formData.append("thumbImage", imageData.thumbImage);
    }

    if (imageData.mainImage) {
      formData.append("mainImage", imageData.mainImage);
    }

    if (imageData.sizeImage) {
      formData.append("sizeImage", imageData.sizeImage);
    }

    imageData.galleryImages
      .filter((file) => file !== null)
      .forEach((file) => {
        formData.append("galleryImages", file);
      });

    const finalOptions = isNoOptionProduct
      ? [
          {
            color: "단일",
            optionSize: "FREE",
            stock: Number(baseStock),
            useYn: "Y",
          },
        ]
      : options.map((option) => ({
          color: option.color,
          optionSize: option.optionSize,
          stock: Number(option.stock),
          useYn: option.useYn,
        }));

    finalOptions.forEach((option, index) => {
      formData.append(`options[${index}].color`, option.color);
      formData.append(`options[${index}].optionSize`, option.optionSize);
      formData.append(`options[${index}].stock`, option.stock);
      formData.append(`options[${index}].useYn`, option.useYn);
    });

    return formData;
  };

  const handleMoveToList = () => {
    const isConfirmed = window.confirm(
      "작성 중인 내용이 있을 수 있습니다. 목록으로 이동하시겠습니까?",
    );

    if (!isConfirmed) return;

    navigate("/admin/products");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const formData = buildProductFormData();

      console.log("전송 categoryId:", productData.categoryId);

      for (const [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const result = await postAdminProductAdd(formData);
      console.log("상품 등록 결과:", result);

      alert("상품이 등록되었습니다.");
      navigate("/admin/products");
    } catch (error) {
      console.error("상품 등록 실패:", error);
      alert("상품 등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      <AdminLayout pageTitle="상품 등록">
        <div className="admin-product-add-page">
          <h1>상품 등록</h1>

          <form onSubmit={handleSubmit} className="admin-product-add-form">
            <section className="admin-product-section">
              <h2>기본정보</h2>

              <div className="admin-form-row">
                <label className="admin-form-label">성별 카테고리</label>
                <div className="admin-form-control">
                  <select
                    name="genderCategory"
                    value={productData.genderCategory}
                    onChange={handleChangeProductData}
                  >
                    <option value="">성별 카테고리를 선택하세요</option>
                    <option value="WOMEN">여성</option>
                    <option value="MEN">남성</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-row">
                <label className="admin-form-label">대분류</label>
                <div className="admin-form-control">
                  <select
                    name="mainCategory"
                    value={productData.mainCategory}
                    onChange={handleChangeProductData}
                    disabled={!productData.genderCategory}
                  >
                    <option value="">대분류를 선택하세요</option>
                    {mainCategoryOptions.map((categoryKey) => (
                      <option key={categoryKey} value={categoryKey}>
                        {mainCategoryLabelMap[categoryKey] || categoryKey}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-form-row">
                <label className="admin-form-label">소분류</label>
                <div className="admin-form-control">
                  <select
                    name="categoryId"
                    value={productData.categoryId}
                    onChange={handleChangeProductData}
                    disabled={!productData.mainCategory}
                  >
                    <option value="">소분류를 선택하세요</option>
                    {subCategoryOptions.map((subCategory) => (
                      <option key={subCategory.id} value={subCategory.id}>
                        {subCategory.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-form-row">
                <label className="admin-form-label">상품명</label>
                <div className="admin-form-control">
                  <input
                    type="text"
                    name="name"
                    value={productData.name}
                    onChange={handleChangeProductData}
                    placeholder="상품명을 입력하세요"
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <label className="admin-form-label">정가</label>
                <div className="admin-form-control">
                  <input
                    type="number"
                    name="price"
                    value={productData.price}
                    onChange={handleChangeProductData}
                    placeholder="정가를 입력하세요"
                    min="0"
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <label className="admin-form-label">할인율(%)</label>
                <div className="admin-form-control">
                  <input
                    type="number"
                    name="discountRate"
                    value={productData.discountRate}
                    onChange={handleChangeProductData}
                    placeholder="0 ~ 100 사이 할인율을 입력하세요"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <label className="admin-form-label">판매가</label>
                <div className="admin-form-control">
                  <div className="admin-sale-price">{salePrice}</div>
                </div>
              </div>

              <div className="admin-form-row">
                <label className="admin-form-label">판매여부</label>
                <div className="admin-form-control admin-inline-options">
                  <label>
                    <input
                      type="radio"
                      name="useYn"
                      value="Y"
                      checked={productData.useYn === "Y"}
                      onChange={handleChangeProductData}
                    />
                    판매
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="useYn"
                      value="N"
                      checked={productData.useYn === "N"}
                      onChange={handleChangeProductData}
                    />
                    판매중지
                  </label>
                </div>
              </div>

              <div className="admin-form-row">
                <label className="admin-form-label">당일배송</label>
                <div className="admin-form-control admin-inline-options">
                  <label>
                    <input
                      type="radio"
                      name="sameDayDeliveryYn"
                      value="Y"
                      checked={productData.sameDayDeliveryYn === "Y"}
                      onChange={handleChangeProductData}
                    />
                    가능
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="sameDayDeliveryYn"
                      value="N"
                      checked={productData.sameDayDeliveryYn === "N"}
                      onChange={handleChangeProductData}
                    />
                    불가
                  </label>
                </div>
              </div>

              <div className="admin-form-row admin-form-row-full">
                <label className="admin-form-label">설명</label>
                <div className="admin-form-control">
                  <textarea
                    name="description"
                    value={productData.description}
                    onChange={handleChangeProductData}
                    placeholder="상품 설명을 입력하세요"
                  />
                </div>
              </div>
            </section>

            <section className="admin-product-section">
              <h2>이미지</h2>

              <div className="admin-form-row">
                <label className="admin-form-label">썸네일 이미지 (필수)</label>
                <div className="admin-form-control admin-file-row">
                  {previews.thumbImage && (
                    <div className="admin-preview-container">
                      <img
                        src={previews.thumbImage}
                        alt="thumbnail"
                        className="admin-preview-img"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    name="thumbImage"
                    accept="image/*"
                    ref={thumbImageInputRef}
                    onChange={handleSingleImageChange}
                    style={{ display: "none" }}
                  />

                  <span className="admin-file-name">
                    {imageData.thumbImage
                      ? imageData.thumbImage.name
                      : "선택된 파일 없음"}
                  </span>

                  <button
                    type="button"
                    className="admin-btn"
                    onClick={() => handleClickSingleImageButton("thumbImage")}
                  >
                    파일 선택
                  </button>

                  {imageData.thumbImage && (
                    <button
                      type="button"
                      className="admin-btn admin-btn-danger"
                      onClick={() => handleRemoveSingleImage("thumbImage")}
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>

              <div className="admin-form-row">
                <label className="admin-form-label">메인 이미지</label>
                <div className="admin-form-control admin-file-row">
                  {previews.mainImage && (
                    <div className="admin-preview-container">
                      <img
                        src={previews.mainImage}
                        alt="main"
                        className="admin-preview-img"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    name="mainImage"
                    accept="image/*"
                    ref={mainImageInputRef}
                    onChange={handleSingleImageChange}
                    style={{ display: "none" }}
                  />

                  <span className="admin-file-name">
                    {imageData.mainImage
                      ? imageData.mainImage.name
                      : "선택된 파일 없음"}
                  </span>

                  <button
                    type="button"
                    className="admin-btn"
                    onClick={() => handleClickSingleImageButton("mainImage")}
                  >
                    파일 선택
                  </button>

                  {imageData.mainImage && (
                    <button
                      type="button"
                      className="admin-btn admin-btn-danger"
                      onClick={() => handleRemoveSingleImage("mainImage")}
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>

              <div className="admin-form-row">
                <label className="admin-form-label">
                  갤러리 이미지 (최대 20장)
                </label>
                <div className="admin-form-control">
                  {imageData.galleryImages.map((file, index) => (
                    <div key={index} className="admin-file-row">
                      {previews.galleryImages[index] && (
                        <div className="admin-preview-container">
                          <img
                            src={previews.galleryImages[index]}
                            alt={`gallery-${index}`}
                            className="admin-preview-img"
                          />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        ref={(element) => {
                          galleryImageInputRefs.current[index] = element;
                        }}
                        onChange={(e) =>
                          handleGalleryImageChange(
                            index,
                            e.target.files?.[0] || null,
                          )
                        }
                        style={{ display: "none" }}
                      />

                      <span className="admin-file-name">
                        {file ? file.name : "선택된 파일 없음"}
                      </span>

                      <button
                        type="button"
                        className="admin-btn"
                        onClick={() => handleClickGalleryImageButton(index)}
                      >
                        파일 선택
                      </button>

                      {file && (
                        <button
                          type="button"
                          className="admin-btn admin-btn-danger"
                          onClick={() => handleRemoveGalleryImage(index)}
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-form-row">
                <label className="admin-form-label">사이즈표 이미지</label>
                <div className="admin-form-control admin-file-row">
                  {previews.sizeImage && (
                    <div className="admin-preview-container">
                      <img
                        src={previews.sizeImage}
                        alt="size"
                        className="admin-preview-img"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    name="sizeImage"
                    accept="image/*"
                    ref={sizeImageInputRef}
                    onChange={handleSingleImageChange}
                    style={{ display: "none" }}
                  />

                  <span className="admin-file-name">
                    {imageData.sizeImage
                      ? imageData.sizeImage.name
                      : "선택된 파일 없음"}
                  </span>

                  <button
                    type="button"
                    className="admin-btn"
                    onClick={() => handleClickSingleImageButton("sizeImage")}
                  >
                    파일 선택
                  </button>

                  {imageData.sizeImage && (
                    <button
                      type="button"
                      className="admin-btn admin-btn-danger"
                      onClick={() => handleRemoveSingleImage("sizeImage")}
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
            </section>

            <section className="admin-product-section">
              <h2>옵션 및 재고</h2>

              <div className="admin-option-toggle">
                <label>
                  <input
                    type="checkbox"
                    checked={isNoOptionProduct}
                    onChange={handleChangeNoOptionProduct}
                  />
                  옵션 없는 상품
                </label>
              </div>

              {isNoOptionProduct ? (
                <div className="admin-form-row">
                  <label className="admin-form-label">기본 재고</label>
                  <div className="admin-form-control">
                    <input
                      type="number"
                      value={baseStock}
                      onChange={(e) =>
                        setBaseStock(
                          e.target.value === ""
                            ? ""
                            : Math.max(0, Number(e.target.value)),
                        )
                      }
                      placeholder="기본 재고 수량을 입력하세요"
                      min="0"
                    />
                  </div>
                </div>
              ) : (
                <>
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
                      {options.map((option, index) => (
                        <tr key={index}>
                          <td>
                            <input
                              type="text"
                              value={option.color}
                              onChange={(e) =>
                                handleChangeOption(
                                  index,
                                  "color",
                                  e.target.value,
                                )
                              }
                              placeholder="예: 블랙"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={option.optionSize}
                              onChange={(e) =>
                                handleChangeOption(
                                  index,
                                  "optionSize",
                                  e.target.value,
                                )
                              }
                              placeholder="예: FREE / M / 270"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={option.stock}
                              onChange={(e) =>
                                handleChangeOption(
                                  index,
                                  "stock",
                                  e.target.value,
                                )
                              }
                              placeholder="재고 수량"
                              min="0"
                            />
                          </td>
                          <td>
                            <select
                              value={option.useYn}
                              onChange={(e) =>
                                handleChangeOption(
                                  index,
                                  "useYn",
                                  e.target.value,
                                )
                              }
                            >
                              <option value="Y">사용</option>
                              <option value="N">미사용</option>
                            </select>
                          </td>
                          <td>
                            <div className="admin-option-actions">
                              <button
                                type="button"
                                className="admin-btn admin-btn-danger"
                                onClick={() => handleRemoveOptionRow(index)}
                              >
                                삭제
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="admin-option-add">
                    <button
                      type="button"
                      className="admin-btn"
                      onClick={handleAddOptionRow}
                    >
                      옵션 추가
                    </button>
                  </div>
                </>
              )}
            </section>

            <section className="admin-product-section">
              <div className="admin-bottom-actions">
                <button type="submit" className="admin-btn admin-btn-dark">
                  상품 등록
                </button>
                <button
                  type="button"
                  className="admin-btn"
                  onClick={handleMoveToList}
                >
                  목록
                </button>
              </div>
            </section>
          </form>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminProductAddPage;
