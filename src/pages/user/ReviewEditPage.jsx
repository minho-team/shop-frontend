import React, { useState, useEffect } from 'react';
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

  // 목록에서 넘겨준 리뷰 상세 데이터 (없을 경우 대비)
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
      <div className="mypage-wrapper" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        <h3 className="content-title">구매 후기 수정</h3>

        <div className="product-review-summary" style={{ padding: '20px', background: '#f9f9f9', marginBottom: '30px' }}>
          <h4 style={{ margin: '0 0 5px 0' }}>{initialData.itemName || '상품 리뷰 수정'}</h4>
          <p style={{ fontSize: '14px', color: '#666' }}>작성하신 리뷰 내용을 수정하실 수 있습니다.</p>
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
          <div className="form-row" style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
            <div style={{ flex: 1 }}>
              <label className="label-title">키 (cm)</label>
              <input type="number" name="userHeight" value={reviewData.userHeight} onChange={handleChange} className="custom-input" required />
            </div>
            <div style={{ flex: 1 }}>
              <label className="label-title">몸무게 (kg)</label>
              <input type="number" name="userWeight" value={reviewData.userWeight} onChange={handleChange} className="custom-input" required />
            </div>
          </div>

          {/* 제목 및 내용 */}
          <div className="form-section" style={{ marginTop: '30px' }}>
            <label className="label-title">리뷰 제목</label>
            <input type="text" name="title" value={reviewData.title} onChange={handleChange} className="custom-input" required />
          </div>
          <div className="form-section" style={{ marginTop: '20px' }}>
            <label className="label-title">상세 후기</label>
            <textarea name="content" value={reviewData.content} onChange={handleChange} rows="8" className="custom-textarea" required />
          </div>

          {/* 사진 변경 */}
          <div className="form-section" style={{ marginTop: '20px' }}>
            <label className="label-title">사진 변경 (선택)</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="file-input" />
            {previewUrl && <img src={previewUrl} alt="미리보기" style={{ width: '150px', marginTop: '10px', display: 'block' }} />}
          </div>

          <div className="form-actions" style={{ marginTop: '50px', display: 'flex', gap: '15px' }}>
            <button type="button" onClick={() => navigate(-1)} className="btn-cancel" style={{ flex: 1 }}>취소</button>
            <button type="submit" className="btn-submit" style={{ flex: 2, background: '#111', color: '#fff' }}>수정 완료</button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default ReviewEditPage;