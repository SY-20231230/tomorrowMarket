import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";
import api from "../api/axios";
import "./NewsPage.css";

const COLORS = ["#22c55e", "#64748b", "#ef4444"]; // 긍정, 중립, 부정
const INDUSTRIES = ["모든 산업군", "반도체", "IT서비스", "2차전지", "바이오", "자동차", "부동산", "금융"];
const SENTIMENTS = ["모든 감성", "긍정", "부정", "중립"];

const SECTOR_MAP: Record<string, number> = {
  "반도체": 1,
  "IT서비스": 2,
  "2차전지": 3,
  "바이오": 4,
  "자동차": 5,
  "부동산": 6,
  "금융": 7
};

const SENTIMENT_MAP: Record<string, string> = {
  "긍정": "POSITIVE",
  "부정": "NEGATIVE",
  "중립": "NEUTRAL"
};

function NewsPage() {
  const navigate = useNavigate();
  // State Management
  const [selectedIndustry, setSelectedIndustry] = useState("모든 산업군");
  const [selectedSentiment, setSelectedSentiment] = useState("모든 감성");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("LATEST");
  const itemsPerPage = 4;

  const [articles, setArticles] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [statistics, setStatistics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [allSectors, setAllSectors] = useState<any[]>([]);

  // 필터 초기화 함수
  const resetFilters = () => {
    setSelectedIndustry("모든 산업군");
    setSelectedSentiment("모든 감성");
    setSearchQuery("");
    setSortOrder("LATEST");
    setCurrentPage(1);
  };

  // 태그 클릭 핸들러
  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    setCurrentPage(1);
  };

  // Fetch Sectors
  useEffect(() => {
    api.get("/sectors").then(res => setAllSectors(res.data.data || [])).catch(console.error);
  }, []);

  // Fetch Articles
  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        const params: any = {
          page: currentPage - 1,
          size: itemsPerPage,
          sort: sortOrder
        };

        if (selectedIndustry !== "모든 산업군") {
          const sector = allSectors.find(s => s.name === selectedIndustry || s.sectorName === selectedIndustry);
          if (sector) params.sectorId = sector.sectorsId || sector.sectorId;
        }
        if (selectedSentiment !== "모든 감성" && SENTIMENT_MAP[selectedSentiment]) {
          params.sentimentType = SENTIMENT_MAP[selectedSentiment];
        }
        if (searchQuery.trim() !== "") {
          params.keyword = searchQuery.trim();
        }

        const res = await api.get("/articles", { params });
        if (res.data && res.data.data) {
          setArticles(res.data.data.content);
          setTotalPages(res.data.data.totalPages || 1);
        }
      } catch (err) {
        console.error("Failed to fetch articles:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, [currentPage, selectedIndustry, selectedSentiment, searchQuery, sortOrder, allSectors]);

  // Fetch Statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/articles/sentiment/statistics");
        if (res.data && res.data.data) {
          setStatistics(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch sentiment stats:", err);
      }
    };
    fetchStats();
  }, []);

  const pieData = statistics ? [
    { name: "긍정", value: statistics.pieChart.positive },
    { name: "중립", value: statistics.pieChart.neutral },
    { name: "부정", value: statistics.pieChart.negative },
  ] : [
    { name: "긍정", value: 0 },
    { name: "중립", value: 0 },
    { name: "부정", value: 0 },
  ];

  const totalNewsCount = statistics ?
    (statistics.pieChart.positive + statistics.pieChart.neutral + statistics.pieChart.negative) : 0;

  const positivePercent = totalNewsCount > 0
    ? Math.round((pieData[0].value / totalNewsCount) * 100) : 0;

  // Format trend data for line chart
  const trendChartData = statistics?.trendData ? statistics.trendData.map((d: any) => {
    const dateObj = new Date(d.date);
    return {
      dateLabel: `${dateObj.getMonth() + 1}/${dateObj.getDate()}`,
      score: d.averageScore
    };
  }) : [];

  return (
    <div className="news-page">
      <header className="news-page-header">
        <div className="news-page-title">
          <h1>뉴스 모음</h1>
          <p>AI가 분석한 실시간 금융·주식 뉴스와 시장 인사이트를 확인하세요.</p>
        </div>
      </header>

      {/* Top Stats Row (3 Columns) */}
      <div className="news-stats-row">
        {/* Card 1: Today's Sentiment */}
        <div className="stats-card">
          <div className="card-title">오늘의 시장 감성 ℹ️</div>
          {totalNewsCount > 0 ? (
            <div className="sentiment-overview">
              <div style={{ width: "120px", height: "120px", position: "relative" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={55} paddingAngle={5} dataKey="value">
                      {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                  <div style={{ fontSize: "20px", fontWeight: 900 }}>{positivePercent}%</div>
                  <div style={{ fontSize: "10px", color: "#22c55e", fontWeight: 700 }}>긍정적</div>
                </div>
              </div>
              <div className="sentiment-pie-info">
                <div className="pie-label"><span style={{ color: "#22c55e" }}>●</span> 긍정 {pieData[0].value}건</div>
                <div className="pie-label"><span style={{ color: "#64748b" }}>●</span> 중립 {pieData[1].value}건</div>
                <div className="pie-label"><span style={{ color: "#ef4444" }}>●</span> 부정 {pieData[2].value}건</div>
              </div>
            </div>
          ) : (
            <div className="premium-empty-state">
              <div className="icon">📊</div>
              <div>감성 분석 데이터가 없습니다</div>
            </div>
          )}
        </div>

        {/* Card 2: Trend Chart */}
        <div className="stats-card">
          <div className="card-title">최근 30일 시장 감성 트렌드</div>
          <div style={{ width: "100%", height: "130px", marginTop: "10px" }}>
            {trendChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="dateLabel" stroke="var(--text-soft)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ background: "#1e293b", border: "none", borderRadius: "8px", color: "#fff" }}
                    itemStyle={{ color: "var(--cyan)" }}
                    formatter={(value: number) => [`${value.toFixed(1)}점`, "평균 감성"]}
                  />
                  <Line type="monotone" dataKey="score" stroke="var(--cyan)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="premium-empty-state">
                <div className="icon">📈</div>
                <div>트렌드 데이터가 없습니다</div>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Keyword Tag Cloud */}
        <div className="stats-card">
          <div className="card-title">핵심 키워드 태그 클라우드</div>
          <div style={{ width: "100%", height: "130px", marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "8px", alignContent: "flex-start" }}>
            {statistics?.relatedKeywords?.length > 0 ? (
              statistics.relatedKeywords.map((kw: string) => (
                <div 
                  key={kw} 
                  onClick={() => handleTagClick(kw)} 
                  style={{ 
                    cursor: "pointer", 
                    background: "rgba(56, 189, 248, 0.1)", 
                    color: "var(--cyan)", 
                    padding: "6px 12px", 
                    borderRadius: "20px", 
                    fontSize: "13px",
                    fontWeight: "bold",
                    transition: "0.2s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = "rgba(56, 189, 248, 0.2)"}
                  onMouseOut={(e) => e.currentTarget.style.background = "rgba(56, 189, 248, 0.1)"}
                >
                  #{kw}
                </div>
              ))
            ) : (
              <div className="premium-empty-state" style={{ width: "100%" }}>
                <div className="icon">🏷️</div>
                <div>키워드 데이터가 없습니다</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="news-main-layout">
        <div className="news-left-column">
          <div className="news-filter-bar">
            {/* Unified Control Panel */}
            <div className="search-container" style={{ minWidth: "260px" }}>
              <input
                type="text"
                className="search-input"
                placeholder="뉴스 검색 (키워드, 종목명)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setCurrentPage(1)}
              />
              <span className="search-icon">🔍</span>
            </div>
            
            <div className="filter-selects">
              <select className="filter-select" value={selectedIndustry} onChange={(e) => { setSelectedIndustry(e.target.value); setCurrentPage(1); }}>
                <option value="모든 산업군">모든 산업군</option>
                {allSectors.map(s => {
                  const name = s.name || s.sectorName;
                  return <option key={name} value={name}>{name}</option>;
                })}
              </select>
              <select className="filter-select" value={selectedSentiment} onChange={(e) => { setSelectedSentiment(e.target.value); setCurrentPage(1); }}>
                {SENTIMENTS.map(sent => <option key={sent} value={sent}>{sent}</option>)}
              </select>
              <select
                className="filter-select"
                style={{ minWidth: "120px" }}
                value={sortOrder}
                onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}
              >
                <option value="LATEST">최신순</option>
                <option value="OLDEST">과거순</option>
                <option value="SENTIMENT_DESC">긍정적인순</option>
                <option value="SENTIMENT_ASC">부정적인순</option>
              </select>
              <button className="filter-reset-btn" onClick={resetFilters}>🔄 필터 초기화</button>
            </div>
          </div>

          <section className="news-list">
            {isLoading ? (
              <div style={{ textAlign: "center", padding: "80px", color: "#64748b" }}>뉴스를 불러오는 중...</div>
            ) : articles.length > 0 ? (
              articles.map(news => {
                const isHot = news.sentimentScore >= 80 || news.sentimentScore <= 20;
                const sentimentLabelStr = news.sentimentLabel === "POSITIVE" ? "긍정" : news.sentimentLabel === "NEGATIVE" ? "부정" : "중립";

                return (
                  <div className="news-card" key={news.articleId} onClick={() => navigate(`/news/${news.articleId}`)}>
                    {/* Default thumbnail if not available from backend */}
                    <img src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=200" alt={news.title} className="news-thumbnail" />
                    <div className="news-content">
                      <div className="news-title">
                        {isHot && <span style={{ background: "#ef4444", color: "#fff", fontSize: "10px", padding: "2px 6px", borderRadius: "4px", marginRight: "8px" }}>HOT</span>}
                        {news.title}
                      </div>
                      <p className="news-summary">{news.summary}</p>
                      <div className="news-meta">
                        <div className="meta-left">
                          <span>{news.source || "내일장 뉴스"}</span>
                          <span>|</span>
                          <span>{new Date(news.registrationDate).toLocaleDateString()}</span>
                          <div className="news-tags">
                            {news.tags && news.tags.map((tag: string) => (
                              <span key={tag} className="news-tag" onClick={(e) => { e.stopPropagation(); handleTagClick(tag); }}>#{tag}</span>
                            ))}
                          </div>
                        </div>
                        <div className="sentiment-badge">
                          <div className="badge-score" style={{
                            background: news.sentimentLabel === "POSITIVE" ? "rgba(34, 197, 94, 0.1)" : news.sentimentLabel === "NEGATIVE" ? "rgba(239, 68, 68, 0.1)" : "rgba(100, 116, 139, 0.1)",
                            color: news.sentimentLabel === "POSITIVE" ? "#22c55e" : news.sentimentLabel === "NEGATIVE" ? "#ef4444" : "#94a3b8"
                          }}>
                            {sentimentLabelStr} 감성점수 {news.sentimentScore}
                          </div>
                          {isHot && <div className="badge-impact">영향도 HIGH</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: "center", padding: "80px", color: "#64748b" }}>검색 결과가 없습니다.</div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>{"<"}</button>

                {/* Show only up to 10 page numbers around the current page */}
                {(() => {
                  let startPage = Math.max(1, currentPage - 4);
                  let endPage = Math.min(totalPages, startPage + 9);

                  if (endPage - startPage < 9) {
                    startPage = Math.max(1, endPage - 9);
                  }

                  const pages = [];
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        className={`page-btn ${currentPage === i ? "active" : ""}`}
                        onClick={() => setCurrentPage(i)}
                      >
                        {i}
                      </button>
                    );
                  }
                  return pages;
                })()}

                <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>{">"}</button>
              </div>
            )}
          </section>
        </div>

      </div>
    </div>
  );
}

export default NewsPage;
