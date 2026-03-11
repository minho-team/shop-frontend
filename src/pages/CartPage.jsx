import Header from "../components/Header";

const CartPage = () => {

    return (<>
        <Header />
        <h1>장바구니 페이지</h1>

        <p>장바구니가 비어있으면 비어있다고 출력</p>
        <p>장바구니에 아이템이 있으면 상품정보, -수량+,</p>
        <p>장바구니의 상품 이름 클릭 시, 상세페이지로 이동</p>
    </>)
}

export default CartPage;