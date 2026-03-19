import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { readMyCartItems } from "../api/cartItemApi";
import "../css/CartPage.css";

const API_BASE_URL = "http://localhost:8080";

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCartItems = async () => {
    try {
      const res = await readMyCartItems();
      console.log("장바구니 상품 응답:", res);
      setCartItems(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("장바구니 조회 실패:", error);
      alert("장바구니 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
    scrollTo(0, 0);
  }, []);

  const totalQuantity = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0);
  }, [cartItems]);

  const totalPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      return sum + Number(item.price ?? 0) * Number(item.quantity ?? 0);
    }, 0);
  }, [cartItems]);

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
          <p className="cart-breadcrumb">HOME &gt; CART</p>

          <div className="cart-title-row">
            <h1 className="cart-title">장바구니</h1>
            <p className="cart-sub-text">담아둔 상품을 확인해보세요.</p>
          </div>

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
            <div className="cart-content-grid">
              <section className="cart-list-section">
                {cartItems.map((item) => {
                  const itemTotalPrice =
                    Number(item.price ?? 0) * Number(item.quantity ?? 0);

                  return (
                    <article className="cart-item-card" key={item.cartItemNo}>
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

                      <div className="cart-item-info">
                        <div className="cart-item-top">
                          <p className="cart-item-name">{item.productName}</p>

                          <p className="cart-item-option">
                            옵션: {item.color} / {item.sizeName}
                          </p>

                          <p className="cart-item-quantity">
                            수량: {item.quantity}개
                          </p>
                        </div>

                        <div className="cart-item-bottom">
                          <span className="cart-item-unit-price">
                            상품금액 {Number(item.price ?? 0).toLocaleString()}
                            원
                          </span>
                          <strong className="cart-item-price">
                            {itemTotalPrice.toLocaleString()}원
                          </strong>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>

              <aside className="cart-summary-section">
                <div className="cart-summary-card">
                  <h2 className="cart-summary-title">주문 예상 금액</h2>

                  <div className="cart-summary-row">
                    <span>총 상품 수량</span>
                    <span>{totalQuantity}개</span>
                  </div>

                  <div className="cart-summary-row">
                    <span>총 상품 금액</span>
                    <span>{totalPrice.toLocaleString()}원</span>
                  </div>

                  <div className="cart-summary-total">
                    <span>총 결제예정금액</span>
                    <strong>{totalPrice.toLocaleString()}원</strong>
                  </div>

                  <button
                    type="button"
                    className="cart-order-button"
                    onClick={() => navigate("/order/write")}
                  >
                    주문하러 가기
                  </button>
                </div>
              </aside>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartPage;
