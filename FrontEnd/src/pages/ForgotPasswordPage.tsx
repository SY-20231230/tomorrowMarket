import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../contexts/ToastContext";
import "./ForgotPasswordPage.css";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    try {
      await api.post("/auth/password/reset-request", { email });
      setIsSent(true);
      showToast("비밀번호 재설정 링크가 발송되었습니다.", "success");
    } catch (error: any) {
      if (error.response?.status === 404) {
        showToast("가입되지 않은 이메일입니다.", "error");
      } else {
        showToast(error.response?.data?.message || "링크 발송 중 오류가 발생했습니다.", "error");
      }
    } finally {
      setIsLoading(false);
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
                이메일 주소를 입력하시면 비밀번호를 다시 설정할 수 있는 링크를 이메일로 보내드립니다.<br/>
                발송된 링크를 클릭하여 새로운 비밀번호를 설정해 주세요.
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

                <button type="submit" className="reset-submit-btn" disabled={isLoading}>
                  {isLoading ? "발송 중..." : "인증 링크 발송"}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ 
                fontSize: "64px", 
                marginBottom: "24px",
                display: "inline-block",
                background: "linear-gradient(135deg, rgba(34, 211, 238, 0.15), rgba(16, 185, 129, 0.15))",
                borderRadius: "50%",
                width: "120px",
                height: "120px",
                lineHeight: "120px",
                border: "2px solid rgba(34, 211, 238, 0.3)",
                boxShadow: "0 10px 30px rgba(34, 211, 238, 0.2)"
              }}>
                📨
              </div>
              <h2 style={{ marginBottom: "20px", fontSize: "32px", color: "#fff", fontWeight: 950 }}>이메일 발송 완료!</h2>
              <p style={{ color: "#cbd5e1", lineHeight: "1.7", marginBottom: "40px", fontSize: "16px" }}>
                <strong style={{ color: "var(--cyan)", fontWeight: 900 }}>{email}</strong> 주소로<br />
                비밀번호 재설정 링크를 발송했습니다.<br />
                메일함(또는 스팸함)을 확인하여 링크를 클릭해 주세요.
              </p>
              
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button 
                  type="button" 
                  className="reset-submit-btn" 
                  onClick={() => navigate("/login")}
                  style={{ flex: 1, margin: 0 }}
                >
                  로그인하러 가기
                </button>
                <button 
                  type="button" 
                  className="reset-submit-btn" 
                  onClick={() => setIsSent(false)}
                  style={{ 
                    flex: 1,
                    margin: 0,
                    background: "rgba(255, 255, 255, 0.08)", 
                    color: "#fff", 
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    boxShadow: "none"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                  }}
                >
                  다시 시도
                </button>
              </div>
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
