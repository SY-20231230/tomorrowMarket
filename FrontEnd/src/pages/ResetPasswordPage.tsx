import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./ResetPasswordPage.css";
import api from "../api/axios";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setErrorMsg("유효하지 않은 접근입니다. 재설정 링크를 다시 확인해 주세요.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg("비밀번호가 일치하지 않습니다.");
      return;
    }
    
    setIsLoading(true);
    try {
      await api.put("/auth/password/reset", { token, newPassword: password });
      setIsSuccess(true);
      setErrorMsg("");
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "비밀번호 재설정에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      {/* 좌측 비주얼 섹션 */}
      <section className="reset-password-visual">
        <div className="security-icon">🔒</div>
        <h1>새로운 비밀번호를<br /><span>설정해 주세요</span></h1>
        <p>
          보안을 위해 영문, 숫자, 특수문자를 조합하여<br/> 
          안전한 비밀번호를 등록해 주세요.
        </p>
      </section>

      {/* 우측 폼 섹션 */}
      <section className="reset-password-form-section">
        <div className="reset-password-card">
          {!isSuccess ? (
            <>
              <h2>비밀번호 재설정</h2>
              <p className="instruction">
                새롭게 사용할 비밀번호를 입력해 주세요.
              </p>

              {errorMsg && (
                <div style={{ color: "#ef4444", marginBottom: "16px", fontSize: "14px", fontWeight: "bold" }}>
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label>새 비밀번호</label>
                  <input 
                    type="password" 
                    placeholder="영문, 숫자, 특수문자 조합 8자 이상" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={!token}
                  />
                </div>

                <div className="input-group">
                  <label>새 비밀번호 확인</label>
                  <input 
                    type="password" 
                    placeholder="비밀번호를 다시 입력해 주세요" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={!token}
                  />
                </div>

                <button type="submit" className="reset-submit-btn" disabled={!token || isLoading}>
                  {isLoading ? "변경 중..." : "비밀번호 변경하기"}
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
                ✅
              </div>
              <h2 style={{ marginBottom: "20px", fontSize: "32px", color: "#fff", fontWeight: 950 }}>변경 완료!</h2>
              <p style={{ color: "#cbd5e1", lineHeight: "1.7", marginBottom: "40px", fontSize: "16px" }}>
                비밀번호가 성공적으로 변경되었습니다.<br />
                새로운 비밀번호로 로그인해 주세요.
              </p>
              <button 
                type="button" 
                className="reset-submit-btn" 
                onClick={() => navigate("/login")}
              >
                로그인하러 가기
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default ResetPasswordPage;
