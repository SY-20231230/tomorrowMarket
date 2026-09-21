import React, { useState, useEffect } from "react";
import SectionTitle from "../components/common/SectionTitle";
import api from "../api/axios";
import "./AdminPage.css";

function AdminPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "stocks">("dashboard");

  // Dashboard States
  const [dashboardStats, setDashboardStats] = useState<any>({ totalActiveUsers: 0, totalPredictions: 0, todayAccessCount: 0 });
  const [modelInfo, setModelInfo] = useState<any>({ modelName: "None", modelVersion: "v0.0.0" });
  const [failedLogs, setFailedLogs] = useState<any[]>([]);

  // Users States
  const [users, setUsers] = useState<any[]>([]);
  const [usersPage, setUsersPage] = useState(0);
  const [usersTotalPages, setUsersTotalPages] = useState(1);

  // Stocks States
  const [stocks, setStocks] = useState<any[]>([]);
  const [stocksPage, setStocksPage] = useState(0);
  const [stocksTotalPages, setStocksTotalPages] = useState(1);

  // --- Dashboard Data Fetch ---
  useEffect(() => {
    if (activeTab === "dashboard") {
      api.get("/admin/dashboard").then(res => setDashboardStats(res.data?.data || {})).catch(console.error);
      api.get("/admin/models").then(res => {
        const models = res.data?.data;
        if (models && models.length > 0) {
          setModelInfo(models[0]);
        }
      }).catch(console.error);
      api.get("/admin/requests/failed?page=0&size=5").then(res => setFailedLogs(res.data?.data?.content || [])).catch(console.error);
    }
  }, [activeTab]);

  // --- Users Data Fetch ---
  const fetchUsers = () => {
    api.get(`/admin/users?page=${usersPage}&size=10`).then(res => {
      setUsers(res.data?.data?.content || []);
      setUsersTotalPages(res.data?.data?.totalPages || 1);
    }).catch(console.error);
  };

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
  }, [activeTab, usersPage]);

  const changeUserStatus = async (userId: number, newStatus: string) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: newStatus });
      alert("상태가 변경되었습니다.");
      fetchUsers();
    } catch (err: any) {
      alert("상태 변경 실패: " + err.response?.data?.message);
    }
  };

  // --- Stocks Data Fetch ---
  const fetchStocks = () => {
    api.get(`/admin/stocks?page=${stocksPage}&size=10`).then(res => {
      setStocks(res.data?.data?.content || []);
      setStocksTotalPages(res.data?.data?.totalPages || 1);
    }).catch(console.error);
  };

  useEffect(() => {
    if (activeTab === "stocks") fetchStocks();
  }, [activeTab, stocksPage]);

  const toggleStockStatus = async (stockId: number, currentActive: boolean) => {
    try {
      await api.patch(`/admin/stocks/${stockId}/status`, { isActive: !currentActive });
      alert("종목 노출 상태가 변경되었습니다.");
      fetchStocks();
    } catch (err: any) {
      alert("종목 상태 변경 실패: " + err.response?.data?.message);
    }
  };

  // --- Action Handlers ---
  const handleBatchRun = async () => {
    if (!window.confirm("정말 모든 주식에 대해 AI 모델 예측 배치를 강제 실행하시겠습니까? (서버에 큰 부하가 발생할 수 있습니다)")) return;
    try {
      await api.post("/admin/predictions/batch/run");
      alert("AI 예측 배치 프로세스가 시작되었습니다.");
    } catch (e: any) {
      alert("배치 실행 실패: " + e.response?.data?.message);
    }
  };

  // --- Components ---
  const HealthPill = ({ label, status }: { label: string; status: string }) => (
    <div className="health-pill">
      <div className="status-dot dot-online"></div>
      <span style={{ color: "#94a3b8", marginRight: "4px" }}>{label}</span>
      <span style={{ color: "#10b981" }}>{status}</span>
    </div>
  );

  const StatCard = ({ label, value, icon, color }: any) => (
    <div className="admin-card">
      <div className="card-icon-wrap" style={{ color }}>{icon}</div>
      <div className="card-label">{label}</div>
      <div className="card-value">{value}</div>
      <svg className="mini-chart-bg" viewBox="0 0 100 40" preserveAspectRatio="none">
        <path d="M0 40 Q 25 35, 50 20 T 100 15 L 100 40 L 0 40 Z" fill={color} fillOpacity="0.1" />
        <path d="M0 40 Q 25 35, 50 20 T 100 15" fill="none" stroke={color} strokeWidth="2" />
      </svg>
    </div>
  );

  const renderPagination = (currentPage: number, totalPages: number, setPage: (p: number) => void) => {
    if (totalPages <= 1) return null;
    const pages = [];
    for (let i = 0; i < totalPages; i++) pages.push(i);
    return (
      <div className="pagination-container" style={{ marginTop: "20px" }}>
        <button className="pg-arrow" onClick={() => setPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0}>{"<"}</button>
        {pages.map(num => (
          <button key={num} onClick={() => setPage(num)} className={`pg-btn ${currentPage === num ? "active" : ""}`}>{num + 1}</button>
        ))}
        <button className="pg-arrow" onClick={() => setPage(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage === totalPages - 1}>{">"}</button>
      </div>
    );
  };

  return (
    <div className="admin-container">
      {/* 상단 시스템 상태 바 */}
      <div className="system-health-bar">
        <HealthPill label="AI MODEL" status="ONLINE" />
        <HealthPill label="NEWS PIPELINE" status="ACTIVE" />
        <HealthPill label="DB HEALTH" status="NORMAL" />
      </div>

      <SectionTitle title="관리자 관제 센터" description="시스템 운영 현황 파악, 사용자 및 종목 관리를 실시간으로 수행하세요." />

      {/* Tabs */}
      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>📊 대시보드</button>
        <button className={`admin-tab ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>👥 사용자 관리</button>
        <button className={`admin-tab ${activeTab === "stocks" ? "active" : ""}`} onClick={() => setActiveTab("stocks")}>📈 종목 관리</button>
      </div>

      {activeTab === "dashboard" && (
        <>
          <div className="admin-stat-grid" style={{ marginTop: "24px" }}>
            <StatCard label="전체 회원 수" value={`${dashboardStats.totalActiveUsers.toLocaleString()} 명`} icon="👤" color="#a855f7" />
            <StatCard label="오늘 접속 수" value={`${dashboardStats.todayAccessCount.toLocaleString()} 회`} icon="👁" color="#22d3ee" />
            <StatCard label="총 AI 예측 수행" value={`${dashboardStats.totalPredictions.toLocaleString()} 건`} icon="🧠" color="#10b981" />
            
            <div className="admin-card">
              <div className="viz-title">AI 모델 상태 및 제어</div>
              <div className="monitor-item"><span className="monitor-label">최신 적용 모델</span><span className="monitor-value">{modelInfo.modelName}</span></div>
              <div className="monitor-item"><span className="monitor-label">모델 버전</span><span className="monitor-value">{modelInfo.modelVersion}</span></div>
              <button className="btn-restart" onClick={handleBatchRun} style={{ marginTop: "16px" }}>🔄 AI 예측 배치 강제 실행</button>
            </div>
          </div>

          <div className="admin-bottom-row" style={{ marginTop: "24px" }}>
            <div className="log-terminal">
              <div className="terminal-header">
                <span style={{ fontSize: "14px", fontWeight: 900 }}>AI 예측 실패 모니터링 로그</span>
              </div>
              <div className="log-list">
                {failedLogs.length > 0 ? failedLogs.map((log, i) => (
                  <div key={i} className="log-entry">
                    <span className="log-time">{new Date(log.requestedAt).toLocaleString()}</span>
                    <span className={`log-badge badge-warn`}>{log.status}</span>
                    <span style={{ color: "#cbd5e1" }}>종목 ID: {log.stockId} - {log.failureReason || "원인 불명"}</span>
                  </div>
                )) : (
                  <div style={{ padding: "20px", color: "#64748b", textAlign: "center" }}>실패한 AI 예측 내역이 없습니다. (시스템 정상)</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "users" && (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>이메일</th>
                <th>이름</th>
                <th>역할</th>
                <th>상태</th>
                <th>상태 제어</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.usersId}>
                  <td>{user.usersId}</td>
                  <td>{user.email}</td>
                  <td>{user.name}</td>
                  <td><span className={`badge ${user.role === "ROLE_ADMIN" ? "badge-admin" : user.role === "ROLE_PREMIUM" ? "badge-premium" : "badge-user"}`}>{user.role.replace("ROLE_", "")}</span></td>
                  <td><span className={`badge ${user.status === "ACTIVE" ? "badge-success" : user.status === "BANNED" ? "badge-error" : "badge-warn"}`}>{user.status}</span></td>
                  <td>
                    <select 
                      value={user.status} 
                      onChange={(e) => changeUserStatus(user.usersId, e.target.value)}
                      className="admin-select"
                    >
                      <option value="ACTIVE">활성 (ACTIVE)</option>
                      <option value="SUSPENDED">정지 (SUSPENDED)</option>
                      <option value="WITHDRAWN">탈퇴 (WITHDRAWN)</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {renderPagination(usersPage, usersTotalPages, setUsersPage)}
        </div>
      )}

      {activeTab === "stocks" && (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>종목코드</th>
                <th>종목명</th>
                <th>시장</th>
                <th>노출 상태</th>
                <th>노출 제어</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map(stock => (
                <tr key={stock.stockId}>
                  <td>{stock.stockId}</td>
                  <td>{stock.stockCode}</td>
                  <td style={{ fontWeight: "bold" }}>{stock.name}</td>
                  <td>{stock.marketType}</td>
                  <td><span className={`badge ${stock.isActive ? "badge-success" : "badge-error"}`}>{stock.isActive ? "노출 중" : "숨김"}</span></td>
                  <td>
                    <button 
                      className={`admin-toggle-btn ${stock.isActive ? "active" : ""}`}
                      onClick={() => toggleStockStatus(stock.stockId, stock.isActive)}
                    >
                      {stock.isActive ? "ON" : "OFF"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {renderPagination(stocksPage, stocksTotalPages, setStocksPage)}
        </div>
      )}
    </div>
  );
}

export default AdminPage;