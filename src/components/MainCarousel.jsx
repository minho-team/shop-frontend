import { Carousel } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../css/MainCarousel.css";

const carouselItems = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80",
    title: "2026 SPRING COLLECTION",
    desc: "가볍고 세련된 봄 신상 컬렉션을 만나보세요",
    link: "/new",
    buttonText: "신상품 보기",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=80",
    title: "BEST SELLER",
    desc: "지금 가장 인기 있는 베스트 아이템",
    link: "/best",
    buttonText: "베스트 보기",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80",
    title: "SPECIAL EVENT",
    desc: "회원 한정 할인 혜택을 지금 바로 확인하세요",
    link: "/event",
    buttonText: "이벤트 보기",
  },
];

const MainCarousel = () => {
  return (
    <section className="main-carousel-section">
      <Carousel fade interval={3000} pause={false} indicators controls>
        {carouselItems.map((item) => (
          <Carousel.Item key={item.id}>
            <div className="carousel-image-wrap">
              <img
                className="carousel-image"
                src={item.image}
                alt={item.title}
              />
              <div className="carousel-overlay" />
            </div>

            <Carousel.Caption className="carousel-caption-custom">
              <span className="carousel-subtitle">ERDIN SELECT SHOP</span>
              <h2>{item.title}</h2>
              <p>{item.desc}</p>
              <Link to={item.link} className="carousel-btn">
                {item.buttonText}
              </Link>
            </Carousel.Caption>
          </Carousel.Item>
        ))}
      </Carousel>
    </section>
  );
};

export default MainCarousel;