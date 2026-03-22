import { useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminHeader from "../../components/admin/AdminHeader";
import { postAdminProductAdd } from "../../api/admin/adminProductApi";

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
  // 1. 기본정보 state
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

  // 2. 이미지 state
  const [imageData, setImageData] = useState({
    thumbImage: null,
    mainImage: null,
    sizeImage: null,
    galleryImages: [null],
  });

  // 3. 옵션 관련 state
  const [isNoOptionProduct, setIsNoOptionProduct] = useState(false);
  const [baseStock, setBaseStock] = useState("");
  const [options, setOptions] = useState([createEmptyOption()]);

  // 판매가 자동 계산
  const salePrice = useMemo(() => {
    const price = Number(productData.price);
    const discountRate = Number(productData.discountRate);

    if (isNaN(price) || isNaN(discountRate)) return 0;

    const calculated = price - (price * discountRate) / 100;
    return Math.floor(calculated);
  }, [productData.price, productData.discountRate]);

  // 성별에 따른 대분류 목록
  const mainCategoryOptions = productData.genderCategory
    ? Object.keys(categoryMap[productData.genderCategory] || {})
    : [];

  // 성별 + 대분류에 따른 소분류 목록
  const subCategoryOptions =
    productData.genderCategory && productData.mainCategory
      ? categoryMap[productData.genderCategory]?.[productData.mainCategory] ||
        []
      : [];

  // 기본정보 변경
  const handleChangeProductData = (e) => {
    const { name, value } = e.target;

    setProductData((prev) => {
      // 성별 변경 시 대분류, 소분류 초기화
      if (name === "genderCategory") {
        return {
          ...prev,
          genderCategory: value,
          mainCategory: "",
          categoryId: "",
        };
      }

      // 대분류 변경 시 소분류 초기화
      if (name === "mainCategory") {
        return {
          ...prev,
          mainCategory: value,
          categoryId: "",
        };
      }

      // 할인율 0 ~ 100 제한
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

      // 가격 음수 방지
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

  // 단일 이미지 변경
  const handleSingleImageChange = (e) => {
    const { name, files } = e.target;
    const selectedFile = files?.[0] || null;

    setImageData((prev) => ({
      ...prev,
      [name]: selectedFile,
    }));
  };

  // 단일 이미지 삭제
  const handleRemoveSingleImage = (imageFieldName) => {
    setImageData((prev) => ({
      ...prev,
      [imageFieldName]: null,
    }));
  };

  // 갤러리 이미지 변경
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

      return {
        ...prev,
        galleryImages: newGalleryImages,
      };
    });
  };

  // 갤러리 이미지 삭제
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
  };

  // 옵션 행 추가
  const handleAddOptionRow = () => {
    setOptions((prev) => [...prev, createEmptyOption()]);
  };

  // 옵션 행 삭제
  const handleRemoveOptionRow = (index) => {
    setOptions((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length === 0 ? [createEmptyOption()] : next;
    });
  };

  // 옵션 값 변경
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

  // 옵션 없는 상품 체크 변경
  const handleChangeNoOptionProduct = (e) => {
    const checked = e.target.checked;
    setIsNoOptionProduct(checked);

    if (checked) {
      setOptions([]);
    } else {
      setOptions([createEmptyOption()]);
    }
  };

  // 유효성 검사
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

  // FormData 생성
  const buildProductFormData = () => {
    const formData = new FormData();

    formData.append("name", productData.name);
    formData.append("categoryId", productData.categoryId);
    formData.append("price", productData.price);
    formData.append("discountRate", productData.discountRate || 0);
    formData.append("description", productData.description);
    formData.append("useYn", productData.useYn);
    formData.append("sameDayDeliveryYn", productData.sameDayDeliveryYn);

    // 이미지
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

    // 옵션 없는 상품도 옵션 1개로 변환
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

  // 목록 이동
  const handleMoveToList = () => {
    const isConfirmed = window.confirm(
      "작성 중인 내용이 있을 수 있습니다. 목록으로 이동하시겠습니까?",
    );

    if (!isConfirmed) return;

    // TODO: 실제 라우터 이동 처리
    console.log("목록 페이지로 이동");
  };

  // 등록 처리
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
    } catch (error) {
      console.error("상품 등록 실패:", error);
      alert("상품 등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      <AdminHeader />

      <AdminLayout>
        <div className="admin-product-add-page">
          <h1>상품 등록</h1>

          <form onSubmit={handleSubmit}>
            <section className="admin-section">
              <h2>기본정보</h2>

              <div>
                <label>상품번호</label>
                <input
                  type="text"
                  value="등록 후 자동생성"
                  readOnly
                  placeholder="등록 후 자동 생성됩니다."
                />
              </div>

              <div>
                <label>성별 카테고리</label>
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

              <div>
                <label>대분류</label>
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

              <div>
                <label>소분류</label>
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

              <div>
                <label>상품명</label>
                <input
                  type="text"
                  name="name"
                  value={productData.name}
                  onChange={handleChangeProductData}
                  placeholder="상품명을 입력하세요"
                />
              </div>

              <div>
                <label>정가</label>
                <input
                  type="number"
                  name="price"
                  value={productData.price}
                  onChange={handleChangeProductData}
                  placeholder="정가를 입력하세요"
                  min="0"
                />
              </div>

              <div>
                <label>할인율(%)</label>
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

              <div>
                <label>판매가</label>
                <input
                  type="text"
                  value={salePrice}
                  readOnly
                  placeholder="정가와 할인율 입력 시 자동 계산됩니다."
                />
              </div>

              <div>
                <label>판매여부</label>
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

              <div>
                <label>당일배송</label>
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

              <div>
                <label>조회수</label>
                <input
                  type="text"
                  value="0"
                  readOnly
                  placeholder="신규 등록 시 0으로 시작합니다."
                />
              </div>

              <div>
                <label>등록일</label>
                <input
                  type="text"
                  value="등록 후 자동생성"
                  readOnly
                  placeholder="등록 후 자동 생성됩니다."
                />
              </div>

              <div>
                <label>설명</label>
                <textarea
                  name="description"
                  value={productData.description}
                  onChange={handleChangeProductData}
                  placeholder="상품 설명을 입력하세요"
                />
              </div>
            </section>

            <section className="admin-section">
              <h2>이미지</h2>

              <div>
                <label>썸네일 이미지 (필수)</label>
                <input
                  type="file"
                  name="thumbImage"
                  accept="image/*"
                  onChange={handleSingleImageChange}
                />
                {imageData.thumbImage && (
                  <>
                    <span>{imageData.thumbImage.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSingleImage("thumbImage")}
                    >
                      삭제
                    </button>
                  </>
                )}
              </div>

              <div>
                <label>메인 이미지</label>
                <input
                  type="file"
                  name="mainImage"
                  accept="image/*"
                  onChange={handleSingleImageChange}
                />
                {imageData.mainImage && (
                  <>
                    <span>{imageData.mainImage.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSingleImage("mainImage")}
                    >
                      삭제
                    </button>
                  </>
                )}
              </div>

              <div>
                <label>갤러리 이미지 (최대 20장)</label>
                {imageData.galleryImages.map((file, index) => (
                  <div key={index}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleGalleryImageChange(
                          index,
                          e.target.files?.[0] || null,
                        )
                      }
                    />

                    {file && (
                      <>
                        <span>{file.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(index)}
                        >
                          삭제
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label>사이즈표 이미지</label>
                <input
                  type="file"
                  name="sizeImage"
                  accept="image/*"
                  onChange={handleSingleImageChange}
                />
                {imageData.sizeImage && (
                  <>
                    <span>{imageData.sizeImage.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSingleImage("sizeImage")}
                    >
                      삭제
                    </button>
                  </>
                )}
              </div>
            </section>

            <section className="admin-section">
              <h2>옵션 및 재고</h2>

              <div>
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
                <div>
                  <label>기본 재고</label>
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
              ) : (
                <>
                  <table border="1" cellPadding="8">
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
                            <button
                              type="button"
                              onClick={() => handleRemoveOptionRow(index)}
                            >
                              삭제
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <button type="button" onClick={handleAddOptionRow}>
                    옵션 추가
                  </button>
                </>
              )}
            </section>

            <section className="admin-section">
              <button type="submit">상품 등록</button>
              <button type="button" onClick={handleMoveToList}>
                목록
              </button>
            </section>
          </form>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminProductAddPage;
