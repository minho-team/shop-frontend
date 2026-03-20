import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import {
  readMyCartItems,
  updateCartItem,
  deleteCartItem,
} from "../api/cartItemApi";
import "../css/CartPage.css";

const API_BASE_URL = "http://localhost:8080";

const CartPage = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingCartItemNo, setUpdatingCartItemNo] = useState(null);
  const [deletingCartItemNo, setDeletingCartItemNo] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [hasInitializedSelection, setHasInitializedSelection] = useState(false);

  const fetchCartItems = async () => {
    try {
      const res = await readMyCartItems();
      const items = Array.isArray(res) ? res : [];

      setCartItems(items);

      if (!hasInitializedSelection) {
        setSelectedItems(items.map((item) => item.cartItemNo));
        setHasInitializedSelection(true);
      } else {
        setSelectedItems((prev) =>
          prev.filter((cartItemNo) =>
            items.some((item) => item.cartItemNo === cartItemNo),
          ),
        );
      }
    } catch (error) {
      console.error("장바구니 조회 실패:", error);
      alert("장바구니 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
    window.scrollTo(0, 0);
  }, []);

  const getImageSrc = (imageUrl) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }
    if (imageUrl.startsWith(API_BASE_URL)) {
      return imageUrl;
    }
    return `${API_BASE_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
  };

  const formatPrice = (price) => Number(price ?? 0).toLocaleString();

  const handleChangeQuantity = async (item, nextQuantity) => {
    if (nextQuantity < 1) return;

    try {
      setUpdatingCartItemNo(item.cartItemNo);
      await updateCartItem(item.cartItemNo, nextQuantity);
      await fetchCartItems();
    } catch (error) {
      console.error("장바구니 수량 변경 실패:", error);
      alert("수량 변경에 실패했습니다.");
    } finally {
      setUpdatingCartItemNo(null);
    }
  };

  const handleDeleteCartItem = async (cartItemNo) => {
    const isDelete = window.confirm("이 상품을 장바구니에서 삭제할까요?");
    if (!isDelete) return;

    try {
      setDeletingCartItemNo(cartItemNo);
      await deleteCartItem(cartItemNo);
      await fetchCartItems();
    } catch (error) {
      console.error("장바구니 상품 삭제 실패:", error);
      alert("상품 삭제에 실패했습니다.");
    } finally {
      setDeletingCartItemNo(null);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) {
      alert("삭제할 상품을 선택해주세요.");
      return;
    }

    const isDelete = window.confirm("선택한 상품을 삭제할까요?");
    if (!isDelete) return;

    try {
      setBulkDeleting(true);
      await Promise.all(
        selectedItems.map((cartItemNo) => deleteCartItem(cartItemNo)),
      );
      await fetchCartItems();
    } catch (error) {
      console.error("선택 상품 삭제 실패:", error);
      alert("선택 상품 삭제에 실패했습니다.");
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleClearCart = async () => {
    if (cartItems.length === 0) return;

    const isDelete = window.confirm("장바구니를 비울까요?");
    if (!isDelete) return;

    try {
      setBulkDeleting(true);
      await Promise.all(
        cartItems.map((item) => deleteCartItem(item.cartItemNo)),
      );
      await fetchCartItems();
    } catch (error) {
      console.error("장바구니 비우기 실패:", error);
      alert("장바구니 비우기에 실패했습니다.");
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleToggleItem = (cartItemNo) => {
    setSelectedItems((prev) => {
      if (prev.includes(cartItemNo)) {
        return prev.filter((no) => no !== cartItemNo);
      }
      return [...prev, cartItemNo];
    });
  };

  const handleToggleAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.cartItemNo));
    }
  };

  const selectedCartItems = useMemo(() => {
    return cartItems.filter((item) => selectedItems.includes(item.cartItemNo));
  }, [cartItems, selectedItems]);

  const totalProductPrice = useMemo(() => {
    return selectedCartItems.reduce((sum, item) => {
      return sum + Number(item.price ?? 0) * Number(item.quantity ?? 0);
    }, 0);
  }, [selectedCartItems]);

  const totalDeliveryFee = 0;

  const finalPrice = totalProductPrice + totalDeliveryFee;

  const handleOrderItems = (items) => {
    if (!items || items.length === 0) {
      alert("주문할 상품을 선택해주세요.");
      return;
    }

    navigate("/order/write", {
      state: {
        cartItems: items,
      },
    });
  };

  const isAllSelected =
    cartItems.length > 0 && selectedItems.length === cartItems.length;

  if (loading) {
    return (
      <>
        <Header />
        <div className="cart-page">
          <div className="cart-container">
            <p className="cart-loading-text">장바구니를 불러오는 중입니다.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="cart-page">
        <div className="cart-container">
          <h1 className="cart-page-title">장바구니</h1>

          {cartItems.length === 0 ? (
            <div className="cart-empty-box">
              <p className="cart-empty-title">장바구니가 비어 있습니다.</p>
              <p className="cart-empty-desc">
                원하는 상품을 장바구니에 담아보세요.
              </p>
              <button
                type="button"
                className="cart-go-shop-button"
                onClick={() => navigate("/")}
              >
                쇼핑 계속하기
              </button>
            </div>
          ) : (
            <>
              <div className="cart-list-wrap">
                <div className="cart-list-header">
                  <div className="cart-col cart-col-check">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleToggleAll}
                    />
                  </div>
                  <div className="cart-col cart-col-image">이미지</div>
                  <div className="cart-col cart-col-info">상품정보</div>
                  <div className="cart-col cart-col-qty">수량</div>
                  <div className="cart-col cart-col-price">상품구매금액</div>
                  <div className="cart-col cart-col-delivery">배송구분</div>
                  <div className="cart-col cart-col-fee">배송비</div>
                  <div className="cart-col cart-col-action">선택</div>
                </div>

                {cartItems.map((item) => {
                  const itemTotalPrice =
                    Number(item.price ?? 0) * Number(item.quantity ?? 0);

                  const isUpdating = updatingCartItemNo === item.cartItemNo;
                  const isDeleting = deletingCartItemNo === item.cartItemNo;
                  const isDisabled = isUpdating || isDeleting || bulkDeleting;

                  return (
                    <article className="cart-list-item" key={item.cartItemNo}>
                      <div className="cart-col cart-col-check">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.cartItemNo)}
                          onChange={() => handleToggleItem(item.cartItemNo)}
                          disabled={isDisabled}
                        />
                      </div>

                      <div className="cart-col cart-col-image">
                        <div className="cart-item-image-wrap">
                          {item.imageUrl ? (
                            <img
                              src={`${API_BASE_URL}${item.imageUrl}`}
                              alt={item.productName}
                              className="cart-item-image"
                            />
                          ) : (
                            <div className="cart-item-no-image">NO IMAGE</div>
                          )}
                        </div>
                      </div>

                      <div className="cart-col cart-col-info">
                        <p className="cart-item-name">{item.productName}</p>
                        <p className="cart-item-option">
                          [옵션: {item.color || "-"} / {item.sizeName || "-"}]
                        </p>
                      </div>

                      <div className="cart-col cart-col-qty">
                        <div className="cart-qty-box">
                          <button
                            type="button"
                            className="cart-qty-button"
                            onClick={() =>
                              handleChangeQuantity(
                                item,
                                Number(item.quantity ?? 0) - 1,
                              )
                            }
                            disabled={
                              isDisabled || Number(item.quantity ?? 0) <= 1
                            }
                          >
                            -
                          </button>

                          <span className="cart-qty-value">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            className="cart-qty-button"
                            onClick={() =>
                              handleChangeQuantity(
                                item,
                                Number(item.quantity ?? 0) + 1,
                              )
                            }
                            disabled={isDisabled}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="cart-col cart-col-price">
                        <strong className="cart-item-total-price">
                          {formatPrice(itemTotalPrice)}원
                        </strong>
                      </div>

                      <div className="cart-col cart-col-delivery">기본배송</div>

                      <div className="cart-col cart-col-fee">무료</div>

                      <div className="cart-col cart-col-action">
                        <button
                          type="button"
                          className="cart-action-button cart-action-order"
                          onClick={() => handleOrderItems([item])}
                          disabled={isDisabled}
                        >
                          주문하기
                        </button>

                        <button
                          type="button"
                          className="cart-action-button cart-action-delete"
                          onClick={() => handleDeleteCartItem(item.cartItemNo)}
                          disabled={isDisabled}
                        >
                          {isDeleting ? "삭제중..." : "삭제"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="cart-bottom-action-row">
                <div className="cart-bottom-left">
                  <span className="cart-selected-count">
                    선택상품 ({selectedItems.length})
                  </span>

                  <button
                    type="button"
                    className="cart-sub-button"
                    onClick={handleDeleteSelected}
                    disabled={bulkDeleting}
                  >
                    선택삭제
                  </button>
                </div>

                <div className="cart-bottom-right">
                  <button
                    type="button"
                    className="cart-sub-button"
                    onClick={handleClearCart}
                    disabled={bulkDeleting}
                  >
                    장바구니비우기
                  </button>

                  <button
                    type="button"
                    className="cart-sub-button"
                    onClick={() => navigate("/")}
                  >
                    쇼핑계속하기
                  </button>
                </div>
              </div>

              <div className="cart-price-summary">
                <div className="cart-price-summary-head">
                  <div>총 상품금액</div>
                  <div>총 배송비</div>
                  <div>결제예정금액</div>
                </div>

                <div className="cart-price-summary-body">
                  <div className="cart-price-cell">
                    <strong>{formatPrice(totalProductPrice)}원</strong>
                  </div>
                  <div className="cart-price-cell">
                    <strong>+ {formatPrice(totalDeliveryFee)}원</strong>
                  </div>
                  <div className="cart-price-cell">
                    <strong>= {formatPrice(finalPrice)}원</strong>
                  </div>
                </div>
              </div>

              <div className="cart-order-button-row">
                <button
                  type="button"
                  className="cart-main-order-button active"
                  onClick={() => handleOrderItems(cartItems)}
                >
                  전체상품주문
                </button>

                <button
                  type="button"
                  className="cart-main-order-button"
                  onClick={() => handleOrderItems(selectedCartItems)}
                >
                  선택상품주문
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CartPage;
