import React, { useState, useMemo } from "react";
import SectionTitle from "../components/common/SectionTitle";
import Card from "../components/common/Card";

import { mockStocks } from "../data/mockStocks";
import "./MockInvestPage.css";
import "./MyPage.css"; // 페이지네이션 스타일 재사용

function MockInvestPage() {
  // 1. 상태 관리
  const [selectedMarket, setSelectedMarket] = useState<"KOSPI" | "KOSDAQ">("KOSPI");
  const [selectedStockCode, setSelectedStockCode] = useState(mockStocks[0].code);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 확장된 보유 종목 더미 데이터 (12개)
  const ownedStocks = useMemo(() => {
    return Array(12).fill(null).map((_, i) => ({
      ...mockStocks[i % mockStocks.length],
      quantity: (i + 1) * 10,
      avgPrice: mockStocks[i % mockStocks.length].price - (Math.random() * 5000)
    }));
  }, []);

  // 2단계: 시장에 따른 종목 필터링
  const filteredStocks = useMemo(() => {
    return mockStocks
      .filter(s => s.market === selectedMarket)
      .sort((a, b) => a.name.localeCompare(b.name, "ko-KR"));
  }, [selectedMarket]);

  // 페이지네이션 데이터 계산
  const totalPages = Math.ceil(ownedStocks.length / itemsPerPage);
  const paginatedOwnedStocks = ownedStocks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // --- 페이지네이션 컴포넌트 (5페이지 단위 윈도우) ---
  const Pagination = ({ totalItems, currentPage, size, setPage }: any) => {
    const totalPages = Math.ceil(totalItems / size);
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
    <div className="mock-invest-container" style={{ animation: "fadeIn 0.5s ease" }}>
      <SectionTitle title="모의투자" description="가상 자산으로 매수/매도 전략을 연습해보세요." />

      {/* 상단 자산 현황 */}
      <div className="my-page-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginTop: "32px" }}>
        <Card><div className="input-label">보유 현금</div><p style={{ fontSize: "32px", fontWeight: 950, color: "#fff", margin: "8px 0 0 0" }}>10,000,000<span style={{ fontSize: "16px", color: "#94a3b8", marginLeft: "4px" }}>원</span></p></Card>
        <Card><div className="input-label">평가 금액</div><p style={{ fontSize: "32px", fontWeight: 950, color: "#fff", margin: "8px 0 0 0" }}>3,420,000<span style={{ fontSize: "16px", color: "#94a3b8", marginLeft: "4px" }}>원</span></p></Card>
        <Card><div className="input-label">총 수익률</div><p style={{ fontSize: "32px", fontWeight: 950, color: "#ef4444", margin: "8px 0 0 0" }}>+8.4<span style={{ fontSize: "16px", marginLeft: "2px" }}>%</span></p></Card>
      </div>

      {/* 가상 매매 주문 */}
      <section style={{ marginTop: "46px" }}>
        <SectionTitle title="가상 매매 주문" />
        <Card>
          <div className="invest-form-container">
            <div className="input-group">
              <span className="input-label">1단계: 시장 선택</span>
              <div className="market-selection-tabs">
                <button className={`market-mini-tab ${selectedMarket === "KOSPI" ? "active" : ""}`} onClick={() => setSelectedMarket("KOSPI")}>KOSPI</button>
                <button className={`market-mini-tab ${selectedMarket === "KOSDAQ" ? "active" : ""}`} onClick={() => setSelectedMarket("KOSDAQ")}>KOSDAQ</button>
              </div>
            </div>
            <div className="order-grid">
              <div className="input-group">
                <span className="input-label">2단계: 종목 선택 ({filteredStocks.length}개)</span>
                <select className="invest-input" value={selectedStockCode} onChange={(e) => setSelectedStockCode(e.target.value)}>
                  {filteredStocks.map((stock) => <option key={stock.code} value={stock.code}>{stock.name} ({stock.code})</option>)}
                </select>
              </div>
              <div className="input-group">
                <span className="input-label">주문 수량</span>
                <input type="number" className="invest-input" placeholder="0" />
              </div>
              <button type="button" className="btn-order btn-buy">매수 주문</button>
              <button type="button" className="btn-order btn-sell">매도 주문</button>
            </div>
          </div>
        </Card>
      </section>

      {/* 보유 종목 테이블 (개편) */}
      <section style={{ marginTop: "46px", marginBottom: "60px" }}>
        <SectionTitle title="나의 보유 종목" />
        <div style={{ marginTop: "24px" }}>
          <Card style={{ padding: 0, overflow: "hidden" }}>
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
                {paginatedOwnedStocks.map((stock) => (
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
            <div style={{ padding: "20px", borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
              <Pagination totalItems={ownedStocks.length} currentPage={currentPage} size={itemsPerPage} setPage={setCurrentPage} />
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default MockInvestPage;