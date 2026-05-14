import React, { useState, useMemo } from "react";
import SectionTitle from "../components/common/SectionTitle";
import Card from "../components/common/Card";

import { mockStocks } from "../data/mockStocks";
import "./MyPage.css";

function MyPage() {
  // 1. 상태 관리 (섹션별 페이지)
  const [ownedPage, setOwnedPage] = useState(1);
  const [recentPage, setRecentPage] = useState(1);
  const [favoritePage, setFavoritePage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  
  const itemsPerSection = 3;
  const historyItemsPerPage = 5;

  // 2. 데이터 보강 (보유 종목 5컬럼용 데이터)
  const ownedStocksData = useMemo(() => {
    return Array(15).fill(null).map((_, i) => ({
      ...mockStocks[i % mockStocks.length],
      code: `OWNED-${i}`,
      quantity: (i + 1) * 10,
      avgPrice: mockStocks[i % mockStocks.length].price - (Math.random() * 5000)
    }));
  }, []);

  const extendedStocks = Array(20).fill(null).map((_, i) => ({
    ...mockStocks[i % mockStocks.length],
    code: `RECENT-${i}`
  }));

  const allHistory = Array(15).fill(null).map((_, i) => ({
    name: i % 2 === 0 ? "삼성전자" : "SK하이닉스",
    date: `2024.05.14 ${10 + (i % 12)}:${10 + (i % 50)}`,
    result: i % 3 === 0 ? "부정" : "긍정"
  }));

  const getPaginatedData = (data: any[], page: number, size: number) => {
    const start = (page - 1) * size;
    return data.slice(start, start + size);
  };

  // --- 통합 페이지네이션 컴포넌트 (5페이지 단위 이동) ---
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
      <SectionTitle title="마이페이지" description="관심 종목과 최근 활동을 한눈에 관리하세요." />

      {/* 1. 보유 종목 (5컬럼 구조로 개편) */}
      <section className="section-group">
        <SectionTitle title="보유 종목" />
        <Card style={{ padding: 0, overflow: "hidden", marginTop: "24px" }}>
          <table className="stock-table">
            <thead>
              <tr>
                <th>종목명</th>
                <th>보유수</th>
                <th>현재가</th>
                <th>매수평균가</th>
                <th>등락률</th>
              </tr>
            </thead>
            <tbody>
              {getPaginatedData(ownedStocksData, ownedPage, itemsPerSection).map((stock) => (
                <tr key={stock.code}>
                  <td style={{ fontWeight: 800 }}>{stock.name}</td>
                  <td style={{ color: "var(--cyan)" }}>{stock.quantity}주</td>
                  <td>{stock.price.toLocaleString()}원</td>
                  <td style={{ color: "#94a3b8" }}>{Math.round(stock.avgPrice).toLocaleString()}원</td>
                  <td className={stock.changeRate >= 0 ? "positive" : "negative"}>
                    {stock.changeRate >= 0 ? "+" : ""}{stock.changeRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: "15px", borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
            <Pagination totalItems={ownedStocksData.length} currentPage={ownedPage} size={itemsPerSection} setPage={setOwnedPage} />
          </div>
        </Card>
      </section>

      {/* 2. 관심 분야 설정 */}
      <section className="section-group">
        <SectionTitle title="🎯 관심 분야 설정" />
        <Card>
          <div className="interest-tag-container">
            {["반도체", "AI/플랫폼", "2차전지", "자율주행", "바이오"].map((tag) => (
              <span key={tag} className="interest-tag">[{tag}]</span>
            ))}
            <button className="interest-tag" style={{ borderStyle: "dashed", opacity: 0.6 }}>...</button>
          </div>
        </Card>
      </section>

      {/* 3. 최근 조회 & 관심 종목 (1:1 병렬 배치) */}
      <div className="dashboard-dual-grid">
        <section>
          <SectionTitle title="🕒 최근 조회" />
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div className="history-list">
              {getPaginatedData(extendedStocks, recentPage, itemsPerSection).map((stock) => (
                <div key={stock.code} className="history-item">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ color: "var(--cyan)" }}>↺</span>
                    <h3 className="history-info-name" style={{ margin: 0 }}>{stock.name}</h3>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className="history-info-date">방금 전</span>
                    <span style={{ color: "#475569" }}>&gt;</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "15px", borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
              <Pagination totalItems={extendedStocks.length} currentPage={recentPage} size={itemsPerSection} setPage={setRecentPage} />
            </div>
          </Card>
        </section>

        <section>
          <SectionTitle title="⭐ 관심 종목" />
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div className="history-list">
              {getPaginatedData(extendedStocks, favoritePage, itemsPerSection).map((stock) => (
                <div key={stock.code} className="history-item">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ color: "#475569" }}>☆</span>
                    <h3 className="history-info-name" style={{ margin: 0 }}>{stock.name}</h3>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className="history-info-name" style={{ fontSize: "14px" }}>{stock.price.toLocaleString()}원</span>
                    <div className={`history-badge ${stock.changeRate >= 0 ? "positive" : "negative"}`}>
                      {stock.changeRate >= 0 ? "▲" : "▼"} {Math.abs(stock.changeRate)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "15px", borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
              <Pagination totalItems={extendedStocks.length} currentPage={favoritePage} size={itemsPerSection} setPage={setFavoritePage} />
            </div>
          </Card>
        </section>
      </div>

      {/* 4. AI 예측 기록 조회 */}
      <section className="section-group" style={{ marginBottom: "60px" }}>
        <SectionTitle title="🤖 AI 예측 기록 조회" />
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div className="history-list">
            {getPaginatedData(allHistory, historyPage, historyItemsPerPage).map((history, idx) => (
              <div key={idx} className="history-item">
                <div>
                  <h4 className="history-info-name">{history.name}</h4>
                  <span className="history-info-date">조회 일시: {history.date}</span>
                </div>
                <div className={`history-badge ${history.result === "긍정" ? "positive" : "negative"}`}>
                  AI 분석: {history.result}
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: "20px", borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
            <Pagination totalItems={allHistory.length} currentPage={historyPage} size={historyItemsPerPage} setPage={setHistoryPage} />
          </div>
        </Card>
      </section>
    </div>
  );
}

export default MyPage;