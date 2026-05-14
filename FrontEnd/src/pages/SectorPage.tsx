import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SectionTitle from "../components/common/SectionTitle";
import Card from "../components/common/Card";
import { mockSectors, type Sector } from "../data/mockSectors";

function SectorPage() {
  const navigate = useNavigate();
  const [expandedSector, setExpandedSector] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedSector(prev => prev === id ? null : id);
  };

  const handlePredictClick = (id: string) => {
    navigate(`/sector/prediction/${id}`);
  };

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <SectionTitle
        title="분야 주식 조회"
        description="섹터별 시장 흐름과 주요 테마의 대표 종목을 확인하세요."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "24px",
          marginTop: "32px"
        }}
      >
        {mockSectors.map((sector: Sector) => {
          const isExpanded = expandedSector === sector.id;
          // 대표기업 2개만 추출, 확장 시 전체 노출
          const displayStocks = isExpanded ? sector.stocks : sector.stocks.slice(0, 2);

          return (
            <Card key={sector.id} style={{ display: "flex", flexDirection: "column", minHeight: "280px", padding: "32px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ fontSize: "22px", fontWeight: 950, color: "var(--text-main)", margin: 0 }}>{sector.name}</h3>
                  <p style={{ fontSize: "13px", color: "var(--text-soft)", fontWeight: 800, marginTop: "6px" }}>
                    총 {sector.companyCount}개 기업
                  </p>
                </div>
                <span
                  style={{
                    background: sector.changeRate >= 0 ? "rgba(255, 77, 94, 0.1)" : "rgba(96, 165, 250, 0.1)",
                    color: sector.changeRate >= 0 ? "var(--red)" : "var(--blue)",
                    padding: "8px 14px",
                    borderRadius: "12px",
                    fontSize: "15px",
                    fontWeight: 950
                  }}
                >
                  {sector.changeRate >= 0 ? "+" : ""}
                  {sector.changeRate}%
                </span>
              </div>

              <p style={{ marginTop: "20px", color: "var(--text-sub)", fontSize: "15px", fontWeight: 700, lineHeight: "1.6", flex: 1 }}>
                {sector.outlook}
              </p>

              <div style={{ marginTop: "24px", borderTop: "1px solid rgba(148, 163, 184, 0.08)", paddingTop: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div style={{ flex: 1 }}>
                    <div 
                      onClick={() => toggleExpand(sector.id)}
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "6px", 
                        cursor: "pointer",
                        color: "var(--cyan)",
                        fontSize: "13px",
                        fontWeight: 900,
                        marginBottom: "10px"
                      }}
                    >
                      {isExpanded ? "리스트 접기" : "포함 기업 전체보기"}
                      <span style={{ 
                        transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", 
                        transition: "0.3s",
                        display: "inline-block"
                      }}>
                        ▼
                      </span>
                    </div>
                    <div style={{ 
                      display: "flex", 
                      flexWrap: "wrap", 
                      gap: "8px",
                      transition: "0.3s"
                    }}>
                      {displayStocks.map((stock) => (
                        <span 
                          key={stock} 
                          style={{ 
                            background: "rgba(148, 163, 184, 0.08)", 
                            padding: "6px 12px", 
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: 800,
                            color: "var(--text-main)"
                          }}
                        >
                          {stock}
                        </span>
                      ))}
                    </div>
                    {!isExpanded && sector.stocks.length > 2 && (
                      <div style={{ 
                        fontSize: "13px", 
                        color: "var(--text-soft)", 
                        fontWeight: 700, 
                        marginTop: "10px",
                        paddingLeft: "4px"
                      }}>
                        외 {sector.stocks.length - 2}개 기업 더보기...
                      </div>
                    )}
                  </div>
                  
                  {/* AI 예측 버튼 */}
                  <button 
                    onClick={() => handlePredictClick(sector.id)}
                    style={{
                      padding: "14px 24px",
                      background: "linear-gradient(135deg, var(--cyan), var(--blue))",
                      border: "none",
                      borderRadius: "14px",
                      color: "white",
                      fontSize: "14px",
                      fontWeight: 950,
                      cursor: "pointer",
                      boxShadow: "0 10px 25px rgba(34, 211, 238, 0.25)",
                      marginLeft: "20px",
                      transition: "0.2s"
                    }}
                  >
                    AI 예측 조회
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default SectorPage;