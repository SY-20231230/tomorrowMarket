import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgotPasswordPage.css";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // 실제로는 여기서 API 호출을 하겠죠?
      setIsSent(true);
    }
  };

  return (
    <div className="forgot-password-container">
      {/* 좌측 비주얼 섹션 */}
      <section className="forgot-password-visual">
        <div className="security-icon">🛡️</div>
        <h1>계정을 안전하게<br /><span>복구해 드립니다</span></h1>
        <p>
          가입하신 이메일 주소를 입력해 주세요. 
          비밀번호 재설정을 위한 안전한 인증 링크를 보내드립니다.
        </p>
      </section>

      {/* 우측 폼 섹션 */}
      <section className="forgot-password-form-section">
        <div className="forgot-password-card">
          {!isSent ? (
            <>
              <h2>비밀번호 찾기</h2>
              <p className="instruction">
                이메일 주소를 입력하시면 비밀번호를 다시 설정할 수 있는 링크를 이메일로 보내드립니다.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label>이메일 주소</label>
                  <input 
                    type="email" 
                    placeholder="example@tomorrow.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="reset-submit-btn">인증 링크 발송</button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>📧</div>
              <h2 style={{ marginBottom: "16px" }}>이메일 발송 완료!</h2>
              <p style={{ color: "#94a3b8", lineHeight: "1.6", marginBottom: "32px" }}>
                <strong>{email}</strong> 주소로 인증 링크를 보냈습니다.<br />
                메일함(또는 스팸함)을 확인해 주세요.
              </p>
              <button 
                type="button" 
                className="reset-submit-btn" 
                onClick={() => setIsSent(false)}
                style={{ background: "rgba(255, 255, 255, 0.1)", color: "#fff" }}
              >
                다른 이메일로 시도
              </button>
            </div>
          )}

          <div className="back-to-login">
            <span onClick={() => navigate("/login")}>
              ← 로그인 페이지로 돌아가기
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ForgotPasswordPage;
