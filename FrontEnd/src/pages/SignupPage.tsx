import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignupPage.css";

const INTEREST_OPTIONS = [
  "반도체", "2차전지", "바이오", "AI/플랫폼", "금융", "배당주", "미국주식", "암호화폐"
];

function SignupPage() {
  const navigate = useNavigate();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest) 
        : [...prev, interest]
    );
  };

  return (
    <div className="signup-container">
      {/* 좌측 비주얼 섹션 */}
      <section className="signup-visual-section">
        <h1>나만의<br /><span>투자 아이덴티티</span><br />설정하기</h1>
        <p>
          내일장은 당신의 투자 성향을 분석하여 맞춤형 인사이트를 제공합니다. 
          지금 바로 합류하여 AI 기반의 스마트한 투자를 경험하세요.
        </p>
      </section>

      {/* 우측 폼 섹션 */}
      <section className="signup-form-section">
        <div className="signup-card">
          <h2>회원가입</h2>
          <p className="subtitle">내일장과 함께 성공적인 투자 여정을 시작하세요.</p>

          <form onSubmit={(e) => e.preventDefault()}>
            <div className="signup-input-group">
              <label>이메일</label>
              <input type="email" placeholder="example@tomorrow.com" />
            </div>

            <div className="signup-input-group">
              <label>비밀번호</label>
              <input type="password" placeholder="8자 이상의 비밀번호" />
            </div>

            <div className="signup-input-group">
              <label>닉네임</label>
              <input type="text" placeholder="활동하실 이름을 입력하세요" />
            </div>

            <div className="interest-group">
              <span className="interest-label">관심 분야 (다중 선택 가능)</span>
              <div className="interest-tags">
                {INTEREST_OPTIONS.map(interest => (
                  <div 
                    key={interest}
                    className={`interest-tag ${selectedInterests.includes(interest) ? "active" : ""}`}
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="signup-submit-btn">내일장 시작하기</button>

            <div className="login-link-container">
              이미 계정이 있으신가요? 
              <span onClick={() => navigate("/login")}>로그인하러 가기</span>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

export default SignupPage;