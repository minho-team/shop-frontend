import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/user/Header';
import Footer from '../../components/user/Footer';
import apiClient from '../../api/common/apiClient';
import { useUser } from '../../context/UserContext';
import '../../css/user/ReviewWritePage.css';

const ReviewWritePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();

  const { productNo, orderItemNo, itemName, itemColor, itemSize, imageUrl } = location.state || {};

  const [reviewData, setReviewData] = useState({
    title: '',
    content: '',
    rating: 5,
    userHeight: '',
    userWeight: '',
    sizeRating: 'NORMAL'
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const getImageUrl = (url) => {
    if (!url) return '/default-product.png';
    if (url.startsWith('http')) return url;
    return `/upload/${url}`;
  };

  useEffect(() => {
    if (!orderItemNo || !productNo) {
      alert("잘못된 접근입니다.");
      navigate(-1);
    }
  }, [orderItemNo, productNo, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReviewData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.memberNo) {
      alert("로그인 정보가 없습니다.");
      return;
    }
    const formData = new FormData();
    formData.append("productNo", productNo);
    formData.append("orderItemNo", orderItemNo);
    formData.append("memberNo", user.memberNo);
    formData.append("title", reviewData.title);
    formData.append("content", reviewData.content);
    formData.append("rating", reviewData.rating);
    formData.append("userHeight", reviewData.userHeight);
    formData.append("userWeight", reviewData.userWeight);
    formData.append("sizeRating", reviewData.sizeRating);

    if (imageFile) {
      formData.append("uploadFile", imageFile);
    }

    try {
      const response = await apiClient.post("/api/reviews/register", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.status === 200) {
        alert("리뷰가 소중하게 등록되었습니다!");
        navigate(`/product/detail/${productNo}`);
      }
    } catch (err) {
      console.error("리뷰 등록 중 오류 발생:", err);
      alert("리뷰 등록에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="mypage-container">
      <Header />
      <div className="mypage-wrapper" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        <h3 className="content-title">구매 후기 작성</h3>

        {/* 상품 요약 정보 */}
        <div className="product-review-summary" style={{ display: 'flex', gap: '20px', padding: '20px', background: '#f9f9f9', marginBottom: '30px' }}>

          <div>
            <h4 style={{ margin: '0 0 5px 0' }}>{itemName}</h4>
            <p style={{ fontSize: '14px', color: '#666' }}>선택 옵션: {itemColor} / {itemSize}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="review-write-form">
          <div className="form-section">
            <label className="label-title">상품은 만족하셨나요? (별점)</label>
            <select name="rating" value={reviewData.rating} onChange={handleChange} className="custom-select">
              {[5, 4, 3, 2, 1].map(num => <option key={num} value={num}>{'⭐'.repeat(num)} ({num}점)</option>)}
            </select>
          </div>

          <div className="form-row" style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
            <div style={{ flex: 1 }}>
              <label className="label-title">키 (cm)</label>
              <input type="number" name="userHeight" value={reviewData.userHeight} onChange={handleChange} placeholder="예: 178" className="custom-input" required />
            </div>
            <div style={{ flex: 1 }}>
              <label className="label-title">몸무게 (kg)</label>
              <input type="number" name="userWeight" value={reviewData.userWeight} onChange={handleChange} placeholder="예: 72" className="custom-input" required />
            </div>
          </div>

          <div className="form-section" style={{ marginTop: '20px' }}>
            <label className="label-title">사이즈 체감</label>
            <div className="radio-group" style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
              {['SMALL', 'NORMAL', 'LARGE'].map(val => (
                <label key={val} style={{ fontSize: '14px', cursor: 'pointer' }}>
                  <input type="radio" name="sizeRating" value={val} checked={reviewData.sizeRating === val} onChange={handleChange} />
                  {val === 'SMALL' ? ' 작아요' : val === 'NORMAL' ? ' 정사이즈에요' : ' 커요'}
                </label>
              ))}
            </div>
          </div>

          <div className="form-section" style={{ marginTop: '30px' }}>
            <label className="label-title">리뷰 제목</label>
            <input type="text" name="title" value={reviewData.title} onChange={handleChange} placeholder="제목을 입력해주세요" className="custom-input" required />
          </div>

          <div className="form-section" style={{ marginTop: '20px' }}>
            <label className="label-title">상세 후기</label>
            <textarea name="content" value={reviewData.content} onChange={handleChange} rows="8" placeholder="다른 구매자들에게 도움이 될 수 있도록 솔직한 후기를 남겨주세요." className="custom-textarea" required />
          </div>

          <div className="form-section" style={{ marginTop: '20px' }}>
            <label className="label-title">사진 첨부 (선택)</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="file-input" />
            {previewUrl && <img src={previewUrl} alt="미리보기" style={{ width: '150px', marginTop: '10px', display: 'block' }} />}
          </div>

          <div className="form-actions" style={{ marginTop: '50px', display: 'flex', gap: '15px' }}>
            <button type="button" onClick={() => navigate(-1)} className="btn-cancel" style={{ flex: 1, padding: '15px', background: '#fff', border: '1px solid #ddd', cursor: 'pointer' }}>취소</button>
            <button type="submit" className="btn-submit" style={{ flex: 2, padding: '15px', background: '#111', color: '#fff', border: 'none', cursor: 'pointer' }}>리뷰 등록하기</button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default ReviewWritePage;