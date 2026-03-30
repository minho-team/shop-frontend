import React, { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import apiClient from "../../api/common/apiClient";
import "../../css/user/MyPageEditPage.css";

const MyPageEditPage = () => {
  const { user, fetchMe } = useUser();

  // 수정할 정보 state
  const [name, setName] = useState("");
  const [nickName, setNickName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [basicAddress, setBasicAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");

  // 비밀번호 변경 state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [activeTab, setActiveTab] = useState("basic");

  // 페이지 열릴 때 내 정보 불러오기
  useEffect(() => {
    const fetchMyInfo = async () => {
      try {
        const res = await apiClient.get("/api/member/me");
        const data = res.data;
        setName(data.name || "");
        setNickName(data.nickName || "");
        setEmail(data.email || "");
        setPhoneNumber(data.phoneNumber || "");
        setGender(data.gender || "");
        setBirthday(data.birthday ? data.birthday.substring(0, 10) : "");
        setZipCode(data.zipCode || "");
        setBasicAddress(data.basicAddress || "");
        setDetailAddress(data.detailAddress || "");
      } catch (err) {
        console.error("내 정보 불러오기 실패:", err);
      }
    };
    fetchMyInfo();
  }, []);

  // 카카오 우편번호 스크립트 불러오기 (OrderWritePage랑 동일)
  useEffect(() => {
    if (window.kakao?.Postcode) return;
    const script = document.createElement("script");
    script.src =
      "//t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // 주소 찾기 버튼
  const handleAddressSearch = () => {
    if (!window.kakao?.Postcode) {
      alert("주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    new window.kakao.Postcode({
      oncomplete: function (data) {
        let addr =
          data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;
        setZipCode(data.zonecode);
        setBasicAddress(addr);
        setDetailAddress("");
        setTimeout(() => {
          document.getElementById("detailAddress")?.focus();
        }, 0);
      },
    }).open();
  };

  const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  // 기본정보 저장
  const handleSaveBasic = async () => {
    if (!name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }
    if (!nickName.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    if (email && !emailRegex.test(email.trim())) {
      alert("이메일 형식에 맞게 입력해주세요.");
      return;
    }

    try {
      await apiClient.put("/api/member/me", {
        name,
        nickName,
        email,
        phoneNumber,
        gender,
        birthday: birthday || null,
      });
      alert("기본 정보가 수정되었습니다.");
      await fetchMe();
    } catch (err) {
      alert(err.response?.data || "저장에 실패했습니다.");
    }
  };

  // 주소 저장
  const handleSaveAddress = async () => {
    if (!zipCode || !basicAddress) {
      alert("주소를 검색해주세요.");
      return;
    }

    try {
      await apiClient.put("/api/member/me", {
        zipCode,
        basicAddress,
        detailAddress,
      });
      alert(
        "주소가 수정되었습니다.\n주문서 작성 시 새 주소가 기본값으로 적용됩니다.",
      );
      await fetchMe();
    } catch (err) {
      alert(err.response?.data || "저장에 실패했습니다.");
    }
  };

  // 비밀번호 변경 저장
  const handleSavePassword = async () => {
    if (!currentPassword) {
      alert("현재 비밀번호를 입력해주세요.");
      return;
    }
    if (!newPassword) {
      alert("새 비밀번호를 입력해주세요.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      await apiClient.put("/api/member/me", {
        currentPassword,
        newPassword,
      });
      alert("비밀번호가 변경되었습니다.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      alert(err.response?.data || "비밀번호 변경에 실패했습니다.");
    }
  };

  return (
    <div className="edit-wrapper">
      {/* 탭 버튼 */}
      <div className="edit-tab-bar">
        <button
          type="button"
          className={`edit-tab-btn ${activeTab === "basic" ? "active" : ""}`}
          onClick={() => setActiveTab("basic")}
        >
          기본 정보
        </button>
        <button
          type="button"
          className={`edit-tab-btn ${activeTab === "address" ? "active" : ""}`}
          onClick={() => setActiveTab("address")}
        >
          주소 정보
        </button>
        {user?.provider !== "KAKAO" && (
          <button
            type="button"
            className={`edit-tab-btn ${activeTab === "password" ? "active" : ""}`}
            onClick={() => setActiveTab("password")}
          >
            비밀번호 변경
          </button>
        )}
      </div>

      {/* 기본 정보 탭 */}
      {activeTab === "basic" && (
        <div className="edit-form">
          <p className="edit-desc">
            이름, 닉네임, 연락처, 이메일, 성별, 생년월일을 수정할 수 있습니다.
          </p>

          <div className="edit-row">
            <label>이름 *</label>
            <input
              type="text"
              placeholder="이름을 입력해주세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="edit-row">
            <label>닉네임 *</label>
            <input
              type="text"
              placeholder="닉네임을 입력해주세요"
              value={nickName}
              onChange={(e) => setNickName(e.target.value)}
            />
          </div>

          <div className="edit-row">
            <label>연락처</label>
            <input
              type="text"
              placeholder="'-' 없이 숫자만 입력해주세요"
              value={phoneNumber}
              onChange={(e) =>
                setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))
              }
              maxLength={11}
            />
          </div>

          <div className="edit-row">
            <label>이메일</label>
            <input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="edit-row">
            <label>성별</label>
            <div className="edit-radio-group">
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="M"
                  checked={gender === "M"}
                  onChange={() => setGender("M")}
                />
                남성
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="F"
                  checked={gender === "F"}
                  onChange={() => setGender("F")}
                />
                여성
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value=""
                  checked={gender === ""}
                  onChange={() => setGender("")}
                />
                선택 안 함
              </label>
            </div>
          </div>

          <div className="edit-row">
            <label>생년월일</label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
            />
          </div>

          <div className="edit-footer">
            <button
              type="button"
              className="edit-save-btn"
              onClick={handleSaveBasic}
            >
              저장하기
            </button>
          </div>
        </div>
      )}

      {/* 주소 정보 탭 */}
      {activeTab === "address" && (
        <div className="edit-form">
          <p className="edit-desc">
            주소를 변경하면 주문서 작성 시 기본 배송지로 자동 적용됩니다.
          </p>

          <div className="edit-row">
            <label>우편번호 *</label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                placeholder="우편번호"
                value={zipCode}
                readOnly
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="edit-addr-btn"
                onClick={handleAddressSearch}
              >
                주소 찾기
              </button>
            </div>
          </div>

          <div className="edit-row">
            <label>기본 주소</label>
            <input
              type="text"
              placeholder="주소 찾기를 눌러주세요"
              value={basicAddress}
              readOnly
            />
          </div>

          <div className="edit-row">
            <label>상세 주소</label>
            <input
              id="detailAddress"
              type="text"
              placeholder="상세 주소를 입력해주세요 (동/호수 등)"
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
            />
          </div>

          <div className="edit-footer">
            <button
              type="button"
              className="edit-save-btn"
              onClick={handleSaveAddress}
            >
              저장하기
            </button>
          </div>
        </div>
      )}

      {/* 비밀번호 변경 탭 */}
      {activeTab === "password" && (
        <div className="edit-form">
          <p className="edit-desc">
            현재 비밀번호를 확인 후 새 비밀번호로 변경합니다.
          </p>

          <div className="edit-row">
            <label>현재 비밀번호 *</label>
            <input
              type="password"
              placeholder="현재 비밀번호를 입력해주세요"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="edit-row">
            <label>새 비밀번호 *</label>
            <input
              type="password"
              placeholder="새 비밀번호를 입력해주세요"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="edit-row">
            <label>새 비밀번호 확인 *</label>
            <input
              type="password"
              placeholder="새 비밀번호를 한 번 더 입력해주세요"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="edit-footer">
            <button
              type="button"
              className="edit-save-btn"
              onClick={handleSavePassword}
            >
              변경하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPageEditPage;
