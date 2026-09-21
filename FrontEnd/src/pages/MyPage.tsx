import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SectionTitle from "../components/common/SectionTitle";
import Card from "../components/common/Card";
import api from "../api/axios";
import "./MyPage.css";

function MyPage() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [interests, setInterests] = useState<any[]>([]);
  const [watchlists, setWatchlists] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [recentViews, setRecentViews] = useState<any[]>([]);
  
  // Pagination States
  const [recentPage, setRecentPage] = useState(1);
  const [favoritePage, setFavoritePage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  // Modal States
  const [showSettings, setShowSettings] = useState(false);
  const [newNickname, setNewNickname] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [allSectors, setAllSectors] = useState<any[]>([]);
  const [selectedSectorId, setSelectedSectorId] = useState<number | "">("");

  const itemsPerSection = 5;
  const historyItemsPerPage = 5;

  const fetchMyData = () => {
    api.get("/users/me").then(res => setUserInfo(res.data.data)).catch(console.error);
    api.get("/interests").then(res => setInterests(res.data.data || [])).catch(console.error);
    api.get("/watchlists").then(res => setWatchlists(res.data.data || [])).catch(console.error);
    api.get("/users/me/predictions").then(res => setPredictions(res.data.data?.content || [])).catch(console.error);
  };

  useEffect(() => {
    fetchMyData();
    try {
      const stored = localStorage.getItem("recentViews");
      if (stored) setRecentViews(JSON.parse(stored));
    } catch (e) { console.error(e); }
  }, []);

  const handleUpdateInfo = async () => {
    if (!newNickname.trim()) return alert("닉네임을 입력하세요.");
    try {
      await api.put("/users/me", { nickname: newNickname });
      alert("닉네임이 변경되었습니다.");
      setNewNickname("");
      fetchMyData();
    } catch (e: any) {
      alert(e.response?.data?.message || "변경 실패");
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) return alert("비밀번호를 입력하세요.");
    try {
      await api.put("/users/me/password", { currentPassword: oldPassword, newPassword });
      alert("비밀번호가 변경되었습니다.");
      setOldPassword("");
      setNewPassword("");
    } catch (e: any) {
      alert(e.response?.data?.message || "변경 실패");
    }
  };

  const handleWithdraw = async () => {
    if (!window.confirm("정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    try {
      await api.delete("/users/me");
      alert("탈퇴 처리되었습니다.");
      localStorage.removeItem("isAuthenticated");
      sessionStorage.removeItem("isAuthenticated");
      window.dispatchEvent(new Event("authChange"));
      navigate("/");
    } catch (e: any) {
      alert(e.response?.data?.message || "탈퇴 실패");
    }
  };

  const openInterestModal = async () => {
    try {
      const res = await api.get("/sectors");
      setAllSectors(res.data.data || []);
      setShowInterestModal(true);
    } catch (e) {
      console.error(e);
      alert("산업군 목록을 불러오지 못했습니다.");
    }
  };

  const handleAddInterest = async () => {
    if (!selectedSectorId) return alert("산업군을 선택하세요.");
    try {
      await api.post("/interests", { sectorId: selectedSectorId, level: 3 }); // 기본 3단계
      alert("관심 분야가 추가되었습니다.");
      setShowInterestModal(false);
      setSelectedSectorId("");
      fetchMyData();
    } catch (e: any) {
      alert(e.response?.data?.message || "추가 실패");
    }
  };

  const handleRemoveInterest = async (interestId: number) => {
    if (!window.confirm("이 관심 분야를 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/interests/${interestId}`);
      alert("삭제되었습니다.");
      fetchMyData();
    } catch (e: any) {
      alert("삭제 실패");
    }
  };

  const getPaginatedData = (data: any[], page: number, size: number) => {
    const start = (page - 1) * size;
    return data.slice(start, start + size);
  };

  const Pagination = ({ totalItems, currentPage, size, setPage }: any) => {
    const totalPages = Math.ceil(totalItems / size);
    if (totalPages <= 1) return null;
    const pageLimit = 5;
    const startPage = Math.floor((currentPage - 1) / pageLimit) * pageLimit + 1;
    const endPage = Math.min(startPage + pageLimit - 1, totalPages);
    const pages = [];
    for (let i = startPage; i <= endPage; i++) { pages.push(i); }

    return (
      <div className="pagination-container">
        <button className="pg-arrow" onClick={() => setPage(Math.max(1, currentPage - 5))} disabled={currentPage === 1}>{"<<"}</button>
        <button className="pg-arrow" onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>{"<"}</button>
        {pages.map((num) => (
          <button key={num} onClick={() => setPage(num)} className={`pg-btn ${currentPage === num ? "active" : ""}`}>{num}</button>
        ))}
        <button className="pg-arrow" onClick={() => setPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>{">"}</button>
        <button className="pg-arrow" onClick={() => setPage(Math.min(totalPages, currentPage + 5))} disabled={currentPage === totalPages}>{">>"}</button>
      </div>
    );
  };

  return (
    <div className="my-page-container">
      <SectionTitle title="마이페이지" description="내 정보와 관심 종목, AI 분석 기록을 확인하세요." />

      {/* 1. Profile Summary Card */}
      <section className="section-group">
        <SectionTitle title="👤 내 정보" />
        <Card style={{ padding: "32px", marginTop: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <div className="profile-avatar" style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--cyan)", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: "950" }}>
              {userInfo?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 950, color: "#fff" }}>{userInfo?.name || "사용자"}</h2>
              <p style={{ margin: "8px 0 0 0", color: "#94a3b8", fontWeight: 800 }}>{userInfo?.email || "이메일 정보 없음"}</p>
              <div style={{ marginTop: "12px" }}>
                 <span className="interest-tag" style={{ border: "none", background: "rgba(34,211,238,0.15)", padding: "6px 12px" }}>
                   {userInfo?.role === "ROLE_PREMIUM" ? "💎 프리미엄 회원" : "일반 회원"}
                 </span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            style={{ padding: "10px 20px", background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
          >
            설정 ⚙️
          </button>
        </Card>
      </section>

      {/* 2. 관심 분야 설정 */}
      <section className="section-group">
        <SectionTitle title="🎯 관심 분야 설정" />
        <Card>
          <div className="interest-tag-container">
            {interests.length > 0 ? interests.map((item) => (
              <span key={item.interestId} className="interest-tag" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                [{item.sectorName}]
                <span style={{ cursor: "pointer", color: "#ef4444" }} onClick={() => handleRemoveInterest(item.interestId)}>✕</span>
              </span>
            )) : (
              <span style={{ color: "#64748b", padding: "10px" }}>등록된 관심 분야가 없습니다.</span>
            )}
            <button className="interest-tag" style={{ borderStyle: "dashed", opacity: 0.6, cursor: "pointer" }} onClick={openInterestModal}>+ 추가</button>
          </div>
        </Card>
      </section>

      {/* 3. 최근 조회 & 관심 종목 (1:1 병렬 배치) */}
      <div className="dashboard-dual-grid">
        <section>
          <SectionTitle title="🕒 최근 조회" />
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div className="history-list">
              {recentViews.length > 0 ? getPaginatedData(recentViews, recentPage, itemsPerSection).map((stock, idx) => (
                <div key={idx} className="history-item" onClick={() => window.location.href = `/stocks/${stock.stockId || stock.id}`}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ color: "var(--cyan)" }}>↺</span>
                    <h3 className="history-info-name" style={{ margin: 0 }}>{stock.name}</h3>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className="history-info-date">{new Date(stock.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    <span style={{ color: "#475569" }}>&gt;</span>
                  </div>
                </div>
              )) : (
                <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>최근 조회 기록이 없습니다.</div>
              )}
            </div>
            {recentViews.length > itemsPerSection && (
              <div style={{ padding: "15px", borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
                <Pagination totalItems={recentViews.length} currentPage={recentPage} size={itemsPerSection} setPage={setRecentPage} />
              </div>
            )}
          </Card>
        </section>

        <section>
          <SectionTitle title="⭐ 관심 종목" />
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div className="history-list">
              {watchlists.length > 0 ? getPaginatedData(watchlists, favoritePage, itemsPerSection).map((stock) => (
                <div key={stock.watchlistId} className="history-item" onClick={() => window.location.href = `/stocks/${stock.stockId}`}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ color: "#eab308" }}>★</span>
                    <h3 className="history-info-name" style={{ margin: 0 }}>{stock.stockName}</h3>
                    <span style={{ fontSize: "12px", color: "#64748b", marginLeft: "6px" }}>{stock.stockCode}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ color: "#475569" }}>&gt;</span>
                  </div>
                </div>
              )) : (
                <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>등록된 관심 종목이 없습니다.</div>
              )}
            </div>
            {watchlists.length > itemsPerSection && (
              <div style={{ padding: "15px", borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
                <Pagination totalItems={watchlists.length} currentPage={favoritePage} size={itemsPerSection} setPage={setFavoritePage} />
              </div>
            )}
          </Card>
        </section>
      </div>

      {/* 4. AI 예측 기록 조회 */}
      <section className="section-group" style={{ marginBottom: "60px" }}>
        <SectionTitle title="🤖 AI 예측 기록 조회" />
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div className="history-list">
            {predictions.length > 0 ? getPaginatedData(predictions, historyPage, historyItemsPerPage).map((history) => (
              <div key={history.predictionRequestId} className="history-item" onClick={() => window.location.href = `/stocks/${history.stockId}`}>
                <div>
                  <h4 className="history-info-name">{history.stockName}</h4>
                  <span className="history-info-date">조회 일시: {new Date(history.requestedAt).toLocaleString()}</span>
                </div>
                <div className={`history-badge ${history.requestStatus === "COMPLETED" ? "positive" : history.requestStatus === "FAILED" ? "negative" : ""}`} 
                     style={{ minWidth: "120px", background: history.requestStatus === "PENDING" ? "rgba(255,255,255,0.1)" : undefined }}>
                  {history.requestStatus === "COMPLETED" ? "분석 완료" : history.requestStatus === "PENDING" ? "분석 대기중" : "분석 실패"}
                </div>
              </div>
            )) : (
              <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>AI 분석 의뢰 기록이 없습니다.</div>
            )}
          </div>
          {predictions.length > historyItemsPerPage && (
            <div style={{ padding: "20px", borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
              <Pagination totalItems={predictions.length} currentPage={historyPage} size={historyItemsPerPage} setPage={setHistoryPage} />
            </div>
          )}
        </Card>
      </section>

      {/* Modals */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: "#1e293b", padding: "30px", borderRadius: "16px", width: "400px", maxWidth: "90%" }}>
            <h2 style={{ margin: "0 0 20px 0", color: "#fff" }}>⚙️ 회원 설정</h2>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", color: "#94a3b8", marginBottom: "8px" }}>닉네임 변경</label>
              <div style={{ display: "flex", gap: "10px" }}>
                <input type="text" value={newNickname} onChange={e => setNewNickname(e.target.value)} placeholder="새 닉네임" style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#0f172a", color: "#fff" }} />
                <button onClick={handleUpdateInfo} style={{ padding: "10px 16px", background: "var(--cyan)", color: "#000", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>변경</button>
              </div>
            </div>

            <div style={{ marginBottom: "30px" }}>
              <label style={{ display: "block", color: "#94a3b8", marginBottom: "8px" }}>비밀번호 변경</label>
              <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="현재 비밀번호" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#0f172a", color: "#fff", marginBottom: "10px" }} />
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="새 비밀번호" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#0f172a", color: "#fff", marginBottom: "10px" }} />
              <button onClick={handleChangePassword} style={{ width: "100%", padding: "10px", background: "var(--cyan)", color: "#000", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>비밀번호 변경</button>
            </div>

            <div style={{ borderTop: "1px solid #334155", paddingTop: "20px" }}>
              <button onClick={handleWithdraw} style={{ width: "100%", padding: "10px", background: "transparent", color: "#ef4444", border: "1px solid #ef4444", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>회원 탈퇴</button>
            </div>
            
            <button onClick={() => setShowSettings(false)} style={{ position: "absolute", top: "20px", right: "20px", background: "transparent", border: "none", color: "#94a3b8", fontSize: "20px", cursor: "pointer" }}>✕</button>
          </div>
        </div>
      )}

      {showInterestModal && (
        <div className="modal-overlay" onClick={() => setShowInterestModal(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: "#1e293b", padding: "30px", borderRadius: "16px", width: "400px", maxWidth: "90%" }}>
            <h2 style={{ margin: "0 0 20px 0", color: "#fff" }}>🎯 관심 분야 추가</h2>
            
            <select 
              value={selectedSectorId} 
              onChange={e => setSelectedSectorId(Number(e.target.value))}
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#0f172a", color: "#fff", marginBottom: "20px" }}
            >
              <option value="">-- 산업군 선택 --</option>
              {allSectors.map(s => (
                <option key={s.sectorsId || s.sectorId} value={s.sectorsId || s.sectorId}>{s.name || s.sectorName}</option>
              ))}
            </select>

            <button onClick={handleAddInterest} style={{ width: "100%", padding: "12px", background: "var(--cyan)", color: "#000", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>추가하기</button>
            <button onClick={() => setShowInterestModal(false)} style={{ position: "absolute", top: "20px", right: "20px", background: "transparent", border: "none", color: "#94a3b8", fontSize: "20px", cursor: "pointer" }}>✕</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default MyPage;