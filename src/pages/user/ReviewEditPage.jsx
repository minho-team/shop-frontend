import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/user/Header';
import Footer from '../../components/user/Footer';
import apiClient from '../../api/common/apiClient';
import { useUser } from '../../context/UserContext';
import '../../css/user/ReviewWritePage.css';

const ReviewEditPage = () => {
  const { reviewNo } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();

  const initialData = location.state || {};

  const [reviewData, setReviewData] = useState({
    title: initialData.title || '',
    content: initialData.content || '',
    rating: initialData.rating || 5,
    userHeight: initialData.userHeight || '',
    userWeight: initialData.userWeight || '',
    sizeRating: initialData.sizeRating || 'NORMAL'
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialData.imageUrl ? `/upload/${initialData.imageUrl}` : null);

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
    const formData = new FormData();

    const reviewDto = {
      title: reviewData.title,
      content: reviewData.content,
      rating: reviewData.rating,
      userHeight: reviewData.userHeight,
      userWeight: reviewData.userWeight,
      sizeRating: reviewData.sizeRating,
      imageUrl: initialData.imageUrl
    };

    formData.append(
      "dto",
      new Blob([JSON.stringify(reviewDto)], { type: "application/json" })
    );

    if (imageFile) {
      formData.append("uploadFile", imageFile);
    }

    try {
      await apiClient.put(`/api/reviews/${reviewNo}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("리뷰가 수정되었습니다.");
      navigate('/mypage');
    } catch (err) {
      console.error("수정 실패 상세 로그:", err.response?.data || err.message);
      alert("수정 실패: " + (err.response?.data?.message || "서버 오류"));
    }
  };

  return (
    <div className="mypage-container">
      <Header />
      <div className="mypage-wrapper review-wrapper">
        <h3 className="content-title">구매 후기 수정</h3>

        <div className="product-review-summary">
          <h4>{initialData.itemName || '상품 리뷰 수정'}</h4>
          <p>작성하신 리뷰 내용을 수정하실 수 있습니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="review-write-form">
          {/* 별점 */}
          <div className="form-section">
            <label className="label-title">별점 수정</label>
            <select name="rating" value={reviewData.rating} onChange={handleChange} className="custom-select">
              {[5, 4, 3, 2, 1].map(num => <option key={num} value={num}>{'⭐'.repeat(num)} ({num}점)</option>)}
            </select>
          </div>

          {/* 신체 정보 */}
          <div className="form-section mt-20">
            <div className="label-header">
              <label className="label-title">신체 정보</label>
              <span className="info-text">
                * 키, 몸무게는 필수 입력란입니다. 공개를 원치 않으시면 1로 표기해주십시오.
              </span>
            </div>

            <div className="form-row">
              <div className="form-col">
                <label className="label-title">키 (cm)</label>
                <input type="number" name="userHeight" value={reviewData.userHeight} onChange={handleChange} placeholder="예: 178" className="custom-input" required />
              </div>
              <div className="form-col">
                <label className="label-title">몸무게 (kg)</label>
                <input type="number" name="userWeight" value={reviewData.userWeight} onChange={handleChange} placeholder="예: 72" className="custom-input" required />
              </div>
            </div>
          </div>

          {/* 사이즈 체감 */}
          <div className="form-section mt-20">
            <label className="label-title">사이즈 체감</label>
            <div className="radio-group">
              {['SMALL', 'NORMAL', 'LARGE'].map(val => (
                <label key={val} className="radio-label">
                  <input type="radio" name="sizeRating" value={val} checked={reviewData.sizeRating === val} onChange={handleChange} />
                  {val === 'SMALL' ? ' 작아요' : val === 'NORMAL' ? ' 정사이즈에요' : ' 커요'}
                </label>
              ))}
            </div>
          </div>

          {/* 제목 및 내용 */}
          <div className="form-section mt-30">
            <label className="label-title">리뷰 제목 (필수)</label>
            <input type="text" name="title" value={reviewData.title} onChange={handleChange} placeholder="제목을 입력해주세요" className="custom-input" required />
          </div>
          <div className="form-section mt-20">
            <label className="label-title">상세 후기 (필수)</label>
            <textarea name="content" value={reviewData.content} onChange={handleChange} rows="8" placeholder="다른 구매자들에게 도움이 될 수 있도록 솔직한 후기를 남겨주세요." className="custom-textarea" required />
          </div>

          {/* 사진 변경 */}
          <div className="form-section mt-20">
            <label className="label-title">사진 변경 (선택)</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="file-input" />
            {previewUrl && <img src={previewUrl} alt="미리보기" className="image-preview" />}
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate(-1)} className="btn-cancel">취소</button>
            <button type="submit" className="btn-submit">수정 완료</button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default ReviewEditPage;